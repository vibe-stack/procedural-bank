import type * as THREE from 'three/webgpu';
import * as TSL from 'three/tsl';
import { uniform } from 'three/tsl';
import {
  SCENE_DEPTH_MAX_RECONSTRUCT,
  SCENE_DEPTH_SKY_THRESHOLD,
} from './depth-constants';

// TSL builds a dynamically-typed shader graph; the fluent intermediates are
// threaded through chained calls where the static @types/three overloads add
// noise without catching real errors. `N` is the local loose alias for those
// graph nodes, and the builder functions are pulled through an untyped facade so
// overload resolution never engages on `any` intermediates.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = TSL as any;
const {
  abs, add, cameraViewMatrix, clamp, div, dot, exp, float, Fn, If, min, mix, mul,
  normalize, perspectiveDepthToViewZ, pmremTexture, saturate, screenSize,
  split, sub, transformDirection, uv, vec2, vec3, vec4,
} = t;

export type GtaoCompositeUniforms = {
  /** Strongest tint the bent-normal SSDO term can apply to occluded ambient. */
  bentTintStrength: ReturnType<typeof uniform>;
  /**
   * Cool ambient colour used as fallback cavity tint when no env map is
   * active. When an env map is provided this is unused.
   */
  cavityColor: ReturnType<typeof uniform>;
  /**
   * The live PMREM node. Assign a new Three.js Texture to `.value` when the
   * active HDRI changes — PMREMNode resets its cached PMREM on assignment and
   * re-filters lazily on the next render. Only present when an env texture
   * was supplied.
   */
  envPmrem?: { value: THREE.Texture | null };
};

/**
 * Combines, in a single full-resolution pass:
 *   1. A depth-aware bilateral upsample of the half-res AO/bent-normal buffer.
 *      Uses an 8-tap 3×3 cross (skip centre) which covers the full 4-pixel
 *      IGN repeat pattern so the per-pixel slice rotation noise is fully
 *      cancelled.
 *   2. Ambient-separated AO composite: occlusion is applied only to the
 *      indirect/ambient term, not the full shaded pixel. This is the key
 *      architectural improvement over post-AO:
 *
 *        indirect ≈ albedo × envIntensity × pmremIrradiance
 *        direct   = sceneColor - indirect          (sun, shadows, specular)
 *        output   = direct + indirect × visibility × tint
 *
 *      AO never touches direct light or specular highlights. Bright sunlit
 *      road stays bright; only the ambient fill in crevices darkens.
 *
 * @param sceneColor      Full-res shaded scene colour (PassNode `output`).
 * @param albedoNode      Full-res pre-lighting albedo (diffuseColor MRT).
 * @param aoTexture       Half-res GTAO output: rgb = encoded bent normal, a = AO.
 * @param depthNode       Full-res depth texture (for the bilateral weight).
 * @param normalNode      Full-res view normal MRT (for bent-normal deviation).
 * @param near/far        Camera planes, for linearising depth.
 * @param envIntensity    scene.environmentIntensity uniform.
 * @param initialEnvTexture  Optional Three.js Texture for bent-normal irradiance.
 */
export function applyGtaoToScene(
  sceneColor: N,
  albedoNode: N,
  aoTexture: N,
  depthNode: N,
  normalNode: N,
  near: N,
  far: N,
  envIntensity: N,
  initialEnvTexture?: THREE.Texture | null,
): { node: N; uniforms: GtaoCompositeUniforms } {
  const bentTintStrength = uniform(0.35);
  const cavityColor = uniform(vec3(0.55, 0.62, 0.78));

  // Build a PMREMNode from the initial env texture. The caller can swap
  // `.value` later when the HDRI changes.
  const envPmrem: { value: THREE.Texture | null } | null =
    initialEnvTexture != null ? (pmremTexture(initialEnvTexture) as N) : null;

  // Clamp raw depth before linearising so sky taps don't
  // produce extreme view-Z values that collapse the bilateral weight sum.
  const linearDepthAt = (uvNode: N): N => {
    const d = clamp(
      split(depthNode.sample(uvNode), 'x'),
      float(0),
      float(SCENE_DEPTH_MAX_RECONSTRUCT),
    );
    return perspectiveDepthToViewZ(d, near, far);
  };

  const node = Fn(() => {
    const sourceUv = uv();
    const centerColor = sceneColor.sample(sourceUv).toVar();

    // Sky early-out: real branch so the 8-tap bilateral upsample + PMREM
    // lookup never execute for sky pixels.
    const rawDepth = split(depthNode.sample(sourceUv), 'x');
    const isSky = rawDepth.lessThanEqual(float(SCENE_DEPTH_SKY_THRESHOLD));

    const result = vec4(centerColor).toVar();

    If(isSky.not(), () => {
      const centerZ = linearDepthAt(sourceUv).toVar();

      // --- bilateral upsample: 8-tap 3×3 cross ---
      // The IGN noise has a 4-pixel spatial repeat. A 3×3 cross (8 neighbours,
      // centre skipped) covers both axes of the pattern at one full-res texel
      // spacing, cancelling the dithering completely. Step size = 1 full-res
      // texel; the AO buffer is half-res so adjacent UVs straddle AO texels,
      // giving the depth weight room to pull in the correct sample.
      const o = screenTexelHint();
      const aoSum = vec4(0, 0, 0, 0).toVar();
      const wSum = float(0).toVar();

      const accumulate = (offUv: N): void => {
        const z = linearDepthAt(offUv);
        const dz = abs(sub(z, centerZ));
        const w = exp(mul(dz, float(-1.0 / 0.5)));
        aoSum.addAssign(mul(aoTexture.sample(offUv), w));
        wSum.addAssign(w);
      };

      accumulate(add(sourceUv, vec2(o, float(0))));
      accumulate(add(sourceUv, vec2(o.negate(), float(0))));
      accumulate(add(sourceUv, vec2(float(0), o)));
      accumulate(add(sourceUv, vec2(float(0), o.negate())));
      accumulate(add(sourceUv, vec2(o, o)));
      accumulate(add(sourceUv, vec2(o.negate(), o)));
      accumulate(add(sourceUv, vec2(o, o.negate())));
      accumulate(add(sourceUv, vec2(o.negate(), o.negate())));

      const centerAo = aoTexture.sample(sourceUv);
      const aoSample = wSum.greaterThan(float(0.01))
        .select(div(aoSum, wSum), centerAo).toVar();
      const visibility = saturate(split(aoSample, 'w')).toVar();

      // --- ambient separation ---
      // Reconstruct the indirect/ambient term from the albedo MRT so AO is
      // applied only there — not to direct light or specular highlights.
      //
      // indirect ≈ albedo.rgb × envIntensity × irradiance(bentNormal)
      //
      // We can't recover the exact indirect term from a forward-shaded buffer,
      // but albedo × envIntensity is a faithful proxy for the ambient fill that
      // AO should modulate. Direct light = sceneColor - indirect (approximate;
      // specular leaks in but is small relative to the diffuse ambient on most
      // track surfaces).
      const albedo = split(albedoNode.sample(sourceUv), 'xyz').toVar();

      // Bent normal: decode from AO texture and rotate view→world for PMREM.
      const bentView = sub(mul(split(aoSample, 'xyz'), float(2)), float(1));
      const bentWorld = normalize(transformDirection(bentView, cameraViewMatrix));

      // Irradiance colour along the bent normal: PMREM env map at roughness=1
      // (lowest mip ≈ diffuse irradiance), or the fallback cavity colour.
      let irradianceColor: N;
      if (envPmrem != null) {
        const irradiance = (envPmrem as N).context({
          getUV: () => bentWorld,
          getTextureLevel: () => float(1),
        });
        irradianceColor = split(irradiance, 'xyz');
      } else {
        irradianceColor = cavityColor;
      }

      // Reconstruct indirect term: albedo × envIntensity × irradiance.
      // Clamp it to sceneColor so the estimate never exceeds what the forward
      // shader actually put there — if it did, direct would go negative and
      // we'd discard real shading, making darks go pale.
      const sceneRgb = split(centerColor, 'xyz').toVar();
      const indirectUnclamped = mul(albedo, mul(envIntensity, irradianceColor));
      const indirect = min(indirectUnclamped, sceneRgb).toVar();

      // Extract direct: whatever is left after removing the indirect estimate.
      // With the clamp above, direct is always ≥ 0.
      const direct = sub(sceneRgb, indirect).toVar();

      // SSDO tint: bent-normal deviation from surface normal gates the tint.
      // Applied to the indirect term only — crevice tinting never touches
      // direct light or specular highlights.
      const viewN = sub(mul(split(normalNode.sample(sourceUv), 'xyz'), float(2)), float(1));
      const deviation = saturate(sub(float(1), dot(bentView, viewN)));
      const tintAmount = mul(mul(deviation, sub(float(1), visibility)), bentTintStrength);

      // Occlude the indirect term, tint it toward the irradiance colour.
      const occludedIndirect = mul(indirect, visibility);
      const tintedIndirect = mix(occludedIndirect, mul(occludedIndirect, irradianceColor), saturate(tintAmount));

      // Recombine: direct is untouched, indirect carries the full AO + SSDO.
      result.assign(vec4(add(direct, tintedIndirect), split(centerColor, 'w')));
    });

    return result;
  })();

  return {
    node,
    uniforms: { bentTintStrength, cavityColor, ...(envPmrem ? { envPmrem } : {}) },
  };
}

// One full-res texel in UV space. The AO buffer is half-res (RESOLUTION_SCALE=0.5),
// so stepping by one full-res texel straddles two half-res AO texels — exactly
// the footprint the bilateral upsample needs to cancel the per-pixel IGN noise.
function screenTexelHint(): N {
  return div(float(1), split(screenSize, 'x'));
}
