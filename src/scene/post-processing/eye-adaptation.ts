import {
  NodeMaterial,
  QuadMesh,
  RendererUtils,
  RenderTarget,
  UnsignedByteType,
  type WebGPURenderer,
} from 'three/webgpu';
import { Fn, float, luminance, max, uv, vec4 } from 'three/tsl';
import { uniform } from 'three/tsl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any;

export type EyeAdaptationSettings = {
  enabled: boolean;
  minExposure: number;
  maxExposure: number;
  exposureCompensation: number;
  middleGray: number;
  speedUp: number;
  speedDown: number;
  readbackInterval: number;
};

export type EyeAdaptation = {
  settings: EyeAdaptationSettings;
  exposureNode: ReturnType<typeof uniform>;
  currentExposure: number;
  targetExposure: number;
  update: (deltaSeconds: number) => void;
  capture: (renderer: WebGPURenderer) => void;
};

const meterWidth = 64;
const meterHeight = 36;
const defaultSettings: EyeAdaptationSettings = {
  enabled: true,
  minExposure: 0.45,
  maxExposure: 1.85,
  exposureCompensation: 0,
  middleGray: 0.18,
  speedUp: 3.2,
  speedDown: 1.1,
  readbackInterval: 12,
};

const quad = new QuadMesh();
let rendererState: ReturnType<typeof RendererUtils.resetRendererState>;

export function createEyeAdaptation(sourceColor: N): EyeAdaptation {
  const settings = { ...defaultSettings };
  const exposureNode = uniform(1);
  const target = new RenderTarget(meterWidth, meterHeight, {
    depthBuffer: false,
    type: UnsignedByteType,
  });
  target.texture.name = 'EyeAdaptation.luminance';

  const material = new NodeMaterial();
  material.name = 'Eye Adaptation Meter';
  material.fragmentNode = Fn(() => {
    const source = sourceColor.sample(uv()).rgb;
    const y = max(luminance(source), float(0));
    const encoded = y.div(y.add(1));
    return vec4(encoded, encoded, encoded, 1);
  })();
  material.needsUpdate = true;

  let currentExposure = 1;
  let targetExposure = 1;
  let framesSinceReadback = Number.POSITIVE_INFINITY;
  let readbackPending = false;

  const api: EyeAdaptation = {
    settings,
    exposureNode,
    get currentExposure() {
      return currentExposure;
    },
    get targetExposure() {
      return targetExposure;
    },
    update(deltaSeconds: number) {
      if (!settings.enabled) {
        currentExposure = 1;
        targetExposure = 1;
        exposureNode.value = 1;
        return;
      }

      const speed = targetExposure > currentExposure ? settings.speedUp : settings.speedDown;
      const amount = 1 - Math.exp(-Math.max(0, deltaSeconds) * speed);
      currentExposure += (targetExposure - currentExposure) * amount;
      exposureNode.value = currentExposure;
    },
    capture(renderer: WebGPURenderer) {
      if (!settings.enabled || readbackPending) return;

      framesSinceReadback++;
      if (framesSinceReadback < Math.max(1, Math.floor(settings.readbackInterval))) return;
      framesSinceReadback = 0;

      rendererState = RendererUtils.resetRendererState(renderer, rendererState);
      quad.material = material;
      quad.name = 'Eye Adaptation Meter';
      renderer.setRenderTarget(target);
      quad.render(renderer);
      RendererUtils.restoreRendererState(renderer, rendererState);

      readbackPending = true;
      void renderer
        .readRenderTargetPixelsAsync(target, 0, 0, meterWidth, meterHeight)
        .then((data) => {
          targetExposure = computeTargetExposure(data, settings);
        })
        .catch(() => {
          targetExposure = 1;
        })
        .finally(() => {
          readbackPending = false;
        });
    },
  };

  return api;
}

function computeTargetExposure(
  data: ArrayBufferView,
  settings: EyeAdaptationSettings
): number {
  const bytes = data as Uint8Array;
  let logSum = 0;
  let weightSum = 0;

  for (let i = 0; i < meterWidth * meterHeight; i++) {
    const encoded = bytes[i * 4] / 255;
    const luminanceValue = encoded / Math.max(0.0001, 1 - encoded);
    const weight = luminanceValue > 0.002 ? 1 : 0.15;
    logSum += Math.log(Math.max(0.0001, luminanceValue)) * weight;
    weightSum += weight;
  }

  const averageLuminance = Math.exp(logSum / Math.max(0.0001, weightSum));
  const compensation = 2 ** settings.exposureCompensation;
  const targetExposure =
    (settings.middleGray / Math.max(0.0001, averageLuminance)) * compensation;

  return Math.min(settings.maxExposure, Math.max(settings.minExposure, targetExposure));
}
