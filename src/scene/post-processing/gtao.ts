import type { Camera, PerspectiveCamera } from 'three';
import {
  HalfFloatType,
  NodeMaterial,
  QuadMesh,
  RenderTarget,
  RendererUtils,
  TempNode,
  Vector2,
} from 'three/webgpu';
import * as TSL from 'three/tsl';
import { NodeUpdateType, uniform } from 'three/tsl';
import { SCENE_DEPTH_SKY_THRESHOLD } from './depth-constants';

// TSL builds a dynamically-typed shader graph; the fluent node values are
// threaded through dozens of chained calls where the static @types/three
// overloads add noise without catching real errors. `N` is the local loose
// alias for those intermediate graph nodes — the public API below stays typed.
// The builder functions are pulled through an untyped facade so overload
// resolution never engages on `any` intermediates.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = TSL as any;
const { abs, acos, add, clamp, cos, div, dot, float, Fn, getViewPosition, If, int, interleavedGradientNoise, Loop, max, mix, mul, nodeObject, normalize, passTexture, perspectiveDepthToViewZ, PI, pow, saturate, screenCoordinate, sin, split, sqrt, sub, uv, vec2, vec3, vec4 } = t;

export type GtaoSettings = {
  enabled: boolean;
  /** World-space gather radius in metres. Larger = broader, softer contact shadows. */
  radius: number;
  /** AO darkening strength. 0 = off, 1 = physical, >1 = stylised crush. */
  intensity: number;
  /** Power curve on the final occlusion — sharpens the falloff into corners. */
  power: number;
  /** View-Z thickness in metres: how far behind a surface a sample still occludes. */
  thickness: number;
  /**
   * Strength of the bent-normal SSDO tint. The ambient is re-evaluated along the
   * average *unoccluded* direction, so a wall to one side cools the crevice it
   * shadows. 0 disables the directional term (pure scalar AO).
   */
  bentNormalStrength: number;
};

export const defaultGtaoSettings: GtaoSettings = {
  enabled: true,
  radius: 0.5,
  intensity: 1.0,
  power: 1.6,
  thickness: 0.35,
  bentNormalStrength: 0.6,
};

// 2 slices x 4 steps x 2 sides = 16 depth taps per pixel, at HALF resolution (a
// quarter of the fragments). Slice/step are compile-time loop bounds, so changing
// them rebuilds the shader — hence the "(reload)" labels in the debug UI.
const SLICES = 2;
const STEPS_PER_SLICE = 4;
// AO is low frequency; render it at half res and let the bilateral composite
// (see gtao-composite.ts) denoise and upsample it.
const RESOLUTION_SCALE = 0.5;

const _quad = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();
let _rendererState: ReturnType<typeof RendererUtils.resetRendererState>;

/**
 * Ground-Truth Ambient Occlusion with a bent-normal SSDO term, built for a hard
 * ~2 ms frame budget.
 *
 * It runs as a half-resolution screen-space horizon search (after XeGTAO /
 * Jimenez, "Practical Real-Time Strategies for Accurate Indirect Occlusion"):
 * for each of a few azimuthal slices we march left and right in screen space,
 * tracking the maximum horizon angle the surrounding depth buffer subtends. The
 * arc of sky *not* blocked by those horizons, weighted by the cosine lobe about
 * the surface normal, is the visibility. Integrating the unoccluded directions
 * additionally yields a bent normal, handed back so the compositor can re-light
 * the ambient term directionally (the SSDO tint).
 *
 * Cost controls, in order of impact:
 *  1. Half-res (RESOLUTION_SCALE) — quarters the per-tap fragment count.
 *  2. Few slices/steps with per-pixel rotation jitter — interleaved-gradient
 *     noise rotates the slice azimuths so 16 taps read as a continuous
 *     hemisphere once the bilateral pass averages neighbours back together.
 *  3. Linear screen-space march — we step the UV directly and reconstruct view
 *     position once per tap, instead of projecting every sample through the
 *     camera matrix the way the stock GTAONode's per-tap getScreenPosition does.
 *
 * Output (RGBA16F): rgb = bent normal remapped to [0,1], a = scalar visibility
 * (1 = fully lit). Only the bilateral composite ever reads this texture.
 */
class GtaoNode extends TempNode {
  static get type(): string {
    return 'GtaoNode';
  }

  depthNode: N;
  normalNode: N;
  resolutionScale = RESOLUTION_SCALE;
  updateBeforeType = NodeUpdateType.FRAME;

  radius = uniform(defaultGtaoSettings.radius);
  intensity = uniform(defaultGtaoSettings.intensity);
  power = uniform(defaultGtaoSettings.power);
  thickness = uniform(defaultGtaoSettings.thickness);
  bentNormalStrength = uniform(defaultGtaoSettings.bentNormalStrength);
  resolution = uniform(new Vector2());
  // proj[0][0] (focal-length-x term). Used to convert the world-space radius to
  // a screen-space UV reach. Kept as its own float uniform, refreshed each frame
  // from the camera, because a mat4 can't be element-indexed inside TSL.
  private _projScaleX = uniform(1);

  private _camera: PerspectiveCamera;
  private _aoRenderTarget: RenderTarget;
  private _material: NodeMaterial;
  private _textureNode: N;
  private _cameraProjectionMatrixInverse: N;

  constructor(depthNode: N, normalNode: N, camera: Camera) {
    super('vec4');

    this.depthNode = depthNode;
    this.normalNode = normalNode;

    this._aoRenderTarget = new RenderTarget(1, 1, {
      depthBuffer: false,
      type: HalfFloatType,
    });
    this._aoRenderTarget.texture.name = 'GtaoNode.aoBentNormal';

    const perspective = camera as PerspectiveCamera;
    this._camera = perspective;
    this._cameraProjectionMatrixInverse = uniform(perspective.projectionMatrixInverse);
    this._projScaleX.value = perspective.projectionMatrix.elements[0];

    this._material = new NodeMaterial();
    this._material.name = 'GTAO';

    this._textureNode = passTexture(this as N, this._aoRenderTarget.texture);
  }

  getTextureNode(): N {
    return this._textureNode;
  }

  setSize(width: number, height: number): void {
    const w = Math.max(1, Math.round(this.resolutionScale * width));
    const h = Math.max(1, Math.round(this.resolutionScale * height));
    this.resolution.value.set(w, h);
    this._aoRenderTarget.setSize(w, h);
  }

  updateBefore(frame: N): boolean | undefined {
    const renderer = frame.renderer;
    _rendererState = RendererUtils.resetRendererState(renderer, _rendererState);

    const size = renderer.getDrawingBufferSize(_size);
    this.setSize(size.width, size.height);

    // Refresh proj[0][0] in case FOV/aspect changed (resize, camera tweak).
    this._projScaleX.value = this._camera.projectionMatrix.elements[0];

    _quad.material = this._material;
    _quad.name = 'GTAO';

    renderer.setRenderTarget(this._aoRenderTarget);
    _quad.render(renderer);

    RendererUtils.restoreRendererState(renderer, _rendererState);
    return undefined;
  }

  setup(): N {
    const depth = this.depthNode;
    const normals = this.normalNode;
    const projectionInverse = this._cameraProjectionMatrixInverse;
    const projScaleX = this._projScaleX;

    const sampleViewPosition = (uvNode: N): N => {
      const rawDepth = split(depth.sample(uvNode), 'x');
      return split(getViewPosition(uvNode, rawDepth, projectionInverse), 'xyz');
    };

    const fragment = Fn(() => {
      const sourceUv = uv();

      const rawDepth = split(depth.sample(sourceUv), 'x');
      const viewNormal = normalize(
        sub(mul(split(normals.sample(sourceUv), 'xyz'), float(2)), float(1)),
      ).toVar();

      // Sky early-out: real branch so the 16-tap march never executes for sky
      // pixels, which are a large fraction of a racing frame.
      const isSky = rawDepth.lessThanEqual(float(SCENE_DEPTH_SKY_THRESHOLD));
      const visOut = float(1).toVar();
      const bentOut = add(mul(viewNormal, float(0.5)), float(0.5)).toVar();

      If(isSky.not(), () => {
        const viewPos = sampleViewPosition(sourceUv).toVar();
        const viewDir = normalize(viewPos.negate()).toVar();

        // Per-pixel rotation so slice azimuths differ between neighbours; the
        // bilateral denoise averages them into a smooth field.
        const noise = interleavedGradientNoise(screenCoordinate);

        // World radius -> screen-space UV reach. At this view depth, `radius`
        // metres subtends radius * proj[0][0] / -viewZ in NDC; half that in UV.
        const invViewZ = div(float(1), max(viewPos.z.negate(), float(0.0001)));
        const radiusUv = mul(mul(this.radius, projScaleX), mul(invViewZ, float(0.5))).toVar();
        // Clamp the reach so a near surface doesn't march half the screen (cost)
        // and a far one still searches a useful neighbourhood.
        radiusUv.assign(clamp(radiusUv, float(0.004), float(0.08)));

        const visibilityAccum = float(0).toVar();
        const bentDir = vec3(0, 0, 0).toVar();

        Loop({ start: int(0), end: int(SLICES), type: 'int', condition: '<' }, ({ i }: N) => {
          const sliceAngle = mul(add(div(float(i), float(SLICES)), noise), PI);
          const sliceDir = vec2(cos(sliceAngle), sin(sliceAngle)).toVar();

          // Max horizon cosine on each side; -1 = fully open (nothing blocking).
          const horizonCos = vec2(-1, -1).toVar();

          Loop(
            { start: int(0), end: int(STEPS_PER_SLICE), type: 'int', condition: '<', name: 'j' },
            ({ j }: N) => {
              // Jittered, denser-near-centre step spacing; t in (0,1].
              const t = div(add(float(j), add(noise, float(0.5))), float(STEPS_PER_SLICE));
              const stepUv = mul(mul(sliceDir, radiusUv), t).toVar();

              // positive side. The raw horizon cosine is dot(viewDir, dirToSample);
              // a larger value = a higher occluding horizon. Distance falloff is
              // applied by lerping that cosine back toward fully-open (-1), so a
              // far occluder raises a weaker horizon WITHOUT distorting the angle of
              // a near one (folding falloff straight into the cosine would).
              const deltaP = sub(sampleViewPosition(add(sourceUv, stepUv)), viewPos).toVar();
              const distP = max(length3(deltaP), float(0.0001));
              const fallP = saturate(sub(float(1), div(distP, max(this.radius, float(0.0001)))));
              If(abs(deltaP.z).lessThan(this.thickness), () => {
                const cosP = div(dot(deltaP, viewDir), distP);
                const horizonP = mix(float(-1), cosP, fallP);
                horizonCos.x.assign(max(horizonCos.x, horizonP));
                bentDir.addAssign(mul(normalize(deltaP), saturate(mul(cosP, fallP))));
              });

              // negative side
              const deltaN = sub(sampleViewPosition(sub(sourceUv, stepUv)), viewPos).toVar();
              const distN = max(length3(deltaN), float(0.0001));
              const fallN = saturate(sub(float(1), div(distN, max(this.radius, float(0.0001)))));
              If(abs(deltaN.z).lessThan(this.thickness), () => {
                const cosN = div(dot(deltaN, viewDir), distN);
                const horizonN = mix(float(-1), cosN, fallN);
                horizonCos.y.assign(max(horizonCos.y, horizonN));
                bentDir.addAssign(mul(normalize(deltaN), saturate(mul(cosN, fallN))));
              });
            },
          );

          // Unoccluded arc between the two horizons, normalised by PI.
          const hP = acos(clamp(horizonCos.x, float(-1), float(1)));
          const hN = acos(clamp(horizonCos.y, float(-1), float(1)));
          visibilityAccum.addAssign(saturate(div(add(hP, hN), PI)));
        });

        const visibility = saturate(div(visibilityAccum, float(SLICES))).toVar();
        visibility.assign(pow(visibility, this.power));
        visibility.assign(saturate(mix(float(1), visibility, this.intensity)));

        // Bent normal: average unoccluded direction, blended toward the geometric
        // normal so flat surfaces stay neutral. Remap to [0,1] for the target.
        const bent = normalize(
          mix(viewNormal, normalize(add(viewDir, bentDir)), this.bentNormalStrength),
        );

        visOut.assign(visibility);
        bentOut.assign(add(mul(bent, float(0.5)), float(0.5)));
      });

      return vec4(bentOut, visOut);
    });

    this._material.fragmentNode = fragment();
    this._material.needsUpdate = true;

    return this._textureNode;
  }

  dispose(): void {
    this._aoRenderTarget.dispose();
    this._material.dispose();
  }
}

// Linear view-Z helper exported for callers that want depth directly.
export function viewZFromDepth(depthNode: N, uvNode: N, near: N, far: N): N {
  return perspectiveDepthToViewZ(split(depthNode.sample(uvNode), 'x'), near, far);
}

function length3(v: N): N {
  return sqrt(dot(v, v));
}

export type GtaoPass = {
  node: GtaoNode;
  settings: GtaoSettings;
  /** Full-frame node: rgb = bent-normal tint (encoded), a = scalar AO (1 = lit). */
  getTextureNode: () => N;
  applySettings: () => void;
};

/**
 * Builds the GTAO pass and a live-settings shim matching the codebase's other
 * post-processing passes (bloom, motion blur).
 */
export function createGtaoPass(depthNode: N, normalNode: N, camera: Camera): GtaoPass {
  const node = new GtaoNode(nodeObject(depthNode), nodeObject(normalNode), camera);
  const settings = { ...defaultGtaoSettings };

  const applySettings = (): void => {
    node.radius.value = settings.radius;
    node.intensity.value = settings.enabled ? settings.intensity : 0;
    node.power.value = settings.power;
    node.thickness.value = settings.thickness;
    node.bentNormalStrength.value = settings.bentNormalStrength;
  };

  applySettings();

  return {
    node,
    settings,
    getTextureNode: () => node.getTextureNode(),
    applySettings,
  };
}
