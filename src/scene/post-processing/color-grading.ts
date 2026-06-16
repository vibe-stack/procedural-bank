import type { ToneMapping } from 'three';
import * as THREE from 'three/webgpu';

export const toneMappingModes = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACES: THREE.ACESFilmicToneMapping,
  AgX: THREE.AgXToneMapping,
  Neutral: THREE.NeutralToneMapping,
} as const satisfies Record<string, ToneMapping>;

export type ToneMappingModeName = keyof typeof toneMappingModes;
export const toneMappingModeNames = Object.keys(toneMappingModes) as ToneMappingModeName[];

export const lutPresetNames = [
  'Neutral',
  'Velocity Chrome',
  'Real Daylight',
  'Sunlit Asphalt',
  'Neon Overdrive',
  'Storm Runner',
  'Desert Heat',
  'Moonlit Rally',
] as const;

export type LutPresetName = (typeof lutPresetNames)[number];

export type ColorGradingSettings = {
  toneMapping: ToneMappingModeName;
  exposure: number;
  lut: LutPresetName;
  lutIntensity: number;
};

export const defaultColorGradingSettings: ColorGradingSettings = {
  toneMapping: 'ACES',
  exposure: 0.72,
  lut: 'Real Daylight',
  lutIntensity: 1,
};

const lutSize = 32;
export const lutUvScale = (lutSize - 1) / lutSize;
export const lutUvOffset = 0.5 / lutSize;

export type ColorTuple = [number, number, number];

export type LutRecipe = {
  contrast: number;
  saturation: number;
  vibrance: number;
  blackPoint: number;
  whitePoint: number;
  gamma: ColorTuple;
  shadows: ColorTuple;
  midtones: ColorTuple;
  highlights: ColorTuple;
  shadowStrength: number;
  midtoneStrength: number;
  highlightStrength: number;
};

const lutRecipes = {
  'Velocity Chrome': {
    contrast: 1.28,
    saturation: 1.1,
    vibrance: 0.24,
    blackPoint: 0.025,
    whitePoint: 0.98,
    gamma: [0.98, 1, 1.03],
    shadows: [0.78, 0.9, 1.24],
    midtones: [0.96, 1.02, 1.08],
    highlights: [1.15, 1.08, 0.95],
    shadowStrength: 0.38,
    midtoneStrength: 0.16,
    highlightStrength: 0.26,
  },
  'Real Daylight': {
    contrast: 1.12,
    saturation: 1.06,
    vibrance: 0.08,
    blackPoint: 0.012,
    whitePoint: 1,
    gamma: [1, 1, 1],
    shadows: [0.96, 0.98, 1.02],
    midtones: [1.02, 1, 0.98],
    highlights: [1.06, 1.03, 0.98],
    shadowStrength: 0.08,
    midtoneStrength: 0.06,
    highlightStrength: 0.12,
  },
  'Sunlit Asphalt': {
    contrast: 1.2,
    saturation: 1.12,
    vibrance: 0.18,
    blackPoint: 0.018,
    whitePoint: 1,
    gamma: [0.97, 1, 1.04],
    shadows: [0.84, 0.94, 1.18],
    midtones: [1.04, 1, 0.94],
    highlights: [1.25, 1.1, 0.82],
    shadowStrength: 0.24,
    midtoneStrength: 0.12,
    highlightStrength: 0.36,
  },
  'Neon Overdrive': {
    contrast: 1.34,
    saturation: 1.24,
    vibrance: 0.36,
    blackPoint: 0.035,
    whitePoint: 0.96,
    gamma: [0.98, 1.02, 1],
    shadows: [0.72, 1.08, 1.36],
    midtones: [1.08, 0.96, 1.14],
    highlights: [1.34, 0.96, 1.16],
    shadowStrength: 0.44,
    midtoneStrength: 0.22,
    highlightStrength: 0.28,
  },
  'Storm Runner': {
    contrast: 1.32,
    saturation: 0.98,
    vibrance: 0.2,
    blackPoint: 0.045,
    whitePoint: 0.94,
    gamma: [1, 1.01, 1.05],
    shadows: [0.74, 0.88, 1.28],
    midtones: [0.9, 1, 1.12],
    highlights: [1.05, 1.1, 1.04],
    shadowStrength: 0.48,
    midtoneStrength: 0.18,
    highlightStrength: 0.18,
  },
  'Desert Heat': {
    contrast: 1.18,
    saturation: 1.16,
    vibrance: 0.24,
    blackPoint: 0.02,
    whitePoint: 0.98,
    gamma: [0.95, 1, 1.08],
    shadows: [0.95, 0.86, 1.06],
    midtones: [1.14, 1, 0.82],
    highlights: [1.34, 1.1, 0.72],
    shadowStrength: 0.2,
    midtoneStrength: 0.22,
    highlightStrength: 0.42,
  },
  'Moonlit Rally': {
    contrast: 1.24,
    saturation: 1.04,
    vibrance: 0.3,
    blackPoint: 0.03,
    whitePoint: 0.92,
    gamma: [1.04, 1.02, 0.96],
    shadows: [0.62, 0.82, 1.48],
    midtones: [0.82, 0.96, 1.22],
    highlights: [1.06, 1.22, 1.28],
    shadowStrength: 0.56,
    midtoneStrength: 0.24,
    highlightStrength: 0.2,
  },
} as const satisfies Record<Exclude<LutPresetName, 'Neutral'>, LutRecipe>;

export function cloneLutRecipe(recipe: LutRecipe): LutRecipe {
  return {
    ...recipe,
    gamma: [...recipe.gamma],
    shadows: [...recipe.shadows],
    midtones: [...recipe.midtones],
    highlights: [...recipe.highlights],
  };
}

export function getLutRecipe(preset: Exclude<LutPresetName, 'Neutral'>): LutRecipe {
  return cloneLutRecipe(lutRecipes[preset]);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function mixNumber(a: number, b: number, amount: number): number {
  return a + (b - a) * amount;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function luminance(color: ColorTuple): number {
  return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}

function mixColor(a: ColorTuple, b: ColorTuple, amount: number): ColorTuple {
  return [
    mixNumber(a[0], b[0], amount),
    mixNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
  ];
}

function tintColor(color: ColorTuple, tint: ColorTuple, amount: number): ColorTuple {
  return [
    color[0] * mixNumber(1, tint[0], amount),
    color[1] * mixNumber(1, tint[1], amount),
    color[2] * mixNumber(1, tint[2], amount),
  ];
}

function applyContrast(color: ColorTuple, contrast: number): ColorTuple {
  return [
    (color[0] - 0.5) * contrast + 0.5,
    (color[1] - 0.5) * contrast + 0.5,
    (color[2] - 0.5) * contrast + 0.5,
  ];
}

function applyCurve(color: ColorTuple, amount: number): ColorTuple {
  const curve = (channel: number): number => {
    const x = clamp01(channel);
    const sCurve = x * x * (3 - 2 * x);
    return mixNumber(x, sCurve, amount);
  };

  return [curve(color[0]), curve(color[1]), curve(color[2])];
}

function adjustSaturation(color: ColorTuple, saturation: number): ColorTuple {
  const luma = luminance(color);
  return [
    mixNumber(luma, color[0], saturation),
    mixNumber(luma, color[1], saturation),
    mixNumber(luma, color[2], saturation),
  ];
}

function applyVibrance(color: ColorTuple, vibrance: number): ColorTuple {
  const maxChannel = Math.max(color[0], color[1], color[2]);
  const average = (color[0] + color[1] + color[2]) / 3;
  const colorfulness = maxChannel - average;
  return adjustSaturation(color, 1 + vibrance * (1 - clamp01(colorfulness * 2.4)));
}

function normalizeRange(color: ColorTuple, blackPoint: number, whitePoint: number): ColorTuple {
  const span = Math.max(0.001, whitePoint - blackPoint);
  return [
    (color[0] - blackPoint) / span,
    (color[1] - blackPoint) / span,
    (color[2] - blackPoint) / span,
  ];
}

function applyGamma(color: ColorTuple, gamma: ColorTuple): ColorTuple {
  return [
    Math.pow(clamp01(color[0]), gamma[0]),
    Math.pow(clamp01(color[1]), gamma[1]),
    Math.pow(clamp01(color[2]), gamma[2]),
  ];
}

function applyRecipe(color: ColorTuple, recipe: LutRecipe): ColorTuple {
  const baseLuma = luminance(color);
  const shadowWeight = 1 - smoothstep(0.12, 0.54, baseLuma);
  const highlightWeight = smoothstep(0.48, 0.92, baseLuma);
  const midtoneWeight = Math.max(0, 1 - Math.abs(baseLuma - 0.5) * 2);

  let graded = normalizeRange(color, recipe.blackPoint, recipe.whitePoint);
  graded = applyCurve(graded, 0.44);
  graded = applyContrast(graded, recipe.contrast);
  graded = tintColor(graded, recipe.shadows, shadowWeight * recipe.shadowStrength);
  graded = tintColor(graded, recipe.midtones, midtoneWeight * recipe.midtoneStrength);
  graded = tintColor(graded, recipe.highlights, highlightWeight * recipe.highlightStrength);
  graded = applyGamma(graded, recipe.gamma);
  graded = adjustSaturation(graded, recipe.saturation);
  graded = applyVibrance(graded, recipe.vibrance);

  const glowBias = highlightWeight * recipe.highlightStrength * 0.06;
  graded = mixColor(graded, [graded[0] + glowBias, graded[1] + glowBias, graded[2] + glowBias], 0.55);

  return [clamp01(graded[0]), clamp01(graded[1]), clamp01(graded[2])];
}

function applyLutPreset(color: ColorTuple, preset: LutPresetName, realDaylightRecipe?: LutRecipe): ColorTuple {
  if (preset === 'Neutral') return color;
  if (preset === 'Real Daylight' && realDaylightRecipe) return applyRecipe(color, realDaylightRecipe);
  return applyRecipe(color, lutRecipes[preset]);
}

export function createLutTexture(initialPreset: LutPresetName, realDaylightRecipe?: LutRecipe): THREE.Data3DTexture {
  const data = new Uint8Array(lutSize * lutSize * lutSize * 4);
  const texture = new THREE.Data3DTexture(data, lutSize, lutSize, lutSize);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.wrapR = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.unpackAlignment = 1;
  updateLutTexture(texture, initialPreset, realDaylightRecipe);
  return texture;
}

export function updateLutTexture(texture: THREE.Data3DTexture, preset: LutPresetName, realDaylightRecipe?: LutRecipe): void {
  const data = texture.image.data as Uint8Array;
  let offset = 0;

  for (let b = 0; b < lutSize; b++) {
    for (let g = 0; g < lutSize; g++) {
      for (let r = 0; r < lutSize; r++) {
        const graded = applyLutPreset(
          [r / (lutSize - 1), g / (lutSize - 1), b / (lutSize - 1)],
          preset,
          realDaylightRecipe,
        );
        data[offset++] = Math.round(graded[0] * 255);
        data[offset++] = Math.round(graded[1] * 255);
        data[offset++] = Math.round(graded[2] * 255);
        data[offset++] = 255;
      }
    }
  }

  texture.needsUpdate = true;
}
