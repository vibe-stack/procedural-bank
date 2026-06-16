import { proxy } from 'valtio'
import type { PostProcessingFeatures } from '../scene/post-processing/post-processing'
import type { LutPresetName, ToneMappingModeName } from '../scene/post-processing/color-grading'

export type RenderingState = {
  dpr: number
  postProcessing: {
    enabled: boolean
  }
  environment: {
    showBackground: boolean
    environmentIntensity: number
    backgroundIntensity: number
  }
  bloom: {
    enabled: boolean
    strength: number
    radius: number
    threshold: number
  }
  color: {
    toneMapping: ToneMappingModeName
    exposure: number
    lut: LutPresetName
    lutIntensity: number
  }
  gtao: {
    enabled: boolean
    radius: number
    intensity: number
  }
  atmosphere: {
    enabled: boolean
    aerialStrength: number
    heightFogStrength: number
    sunShaftStrength: number
    lensFlareStrength: number
  }
  antiAliasing: {
    enabled: boolean
  }
  eyeAdaptation: {
    enabled: boolean
  }
}

export const renderingState = proxy<RenderingState>({
  dpr: 1,
  postProcessing: {
    enabled: true,
  },
  environment: {
    showBackground: true,
    environmentIntensity: 0.32,
    backgroundIntensity: 0.45,
  },
  bloom: {
    enabled: false,
    strength: 0,
    radius: 0.35,
    threshold: 0.72,
  },
  color: {
    toneMapping: 'ACES',
    exposure: 0.72,
    lut: 'Real Daylight',
    lutIntensity: 0,
  },
  gtao: {
    enabled: false,
    radius: 0.5,
    intensity: 0,
  },
  atmosphere: {
    enabled: false,
    aerialStrength: 0,
    heightFogStrength: 0,
    sunShaftStrength: 0,
    lensFlareStrength: 0,
  },
  antiAliasing: {
    enabled: false,
  },
  eyeAdaptation: {
    enabled: false,
  },
})

export function hasActivePostProcessing(settings: RenderingState): boolean {
  const features = getActivePostProcessingFeatures(settings)
  return Object.values(features).some(Boolean)
}

export function getActivePostProcessingFeatures(settings: RenderingState): PostProcessingFeatures {
  if (!settings.postProcessing.enabled) return noPostProcessingFeatures()

  return {
    bloom: settings.bloom.enabled && settings.bloom.strength > 0,
    gtao: settings.gtao.enabled && settings.gtao.intensity > 0,
    atmosphere:
      settings.atmosphere.enabled &&
      (
        settings.atmosphere.aerialStrength > 0 ||
        settings.atmosphere.heightFogStrength > 0 ||
        settings.atmosphere.sunShaftStrength > 0 ||
        settings.atmosphere.lensFlareStrength > 0
      ),
    antiAliasing: settings.antiAliasing.enabled,
    eyeAdaptation: settings.eyeAdaptation.enabled,
    lut: settings.color.lutIntensity > 0,
  }
}

function noPostProcessingFeatures(): PostProcessingFeatures {
  return {
    bloom: false,
    gtao: false,
    atmosphere: false,
    antiAliasing: false,
    eyeAdaptation: false,
    lut: false,
  }
}
