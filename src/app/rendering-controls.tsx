import { useControls } from 'leva'
import { lutPresetNames, toneMappingModeNames } from '../scene/post-processing/color-grading'
import { renderingState } from '../state/rendering-state'

export function RenderingControls() {
  useControls('Rendering', {
    dpr: {
      value: renderingState.dpr,
      min: 0.5,
      max: 2,
      step: 0.5,
      label: 'DPR',
      onChange: (value: number) => {
        renderingState.dpr = value
      },
    },
    postProcessing: {
      value: renderingState.postProcessing.enabled,
      label: 'Post',
      onChange: (value: boolean) => {
        renderingState.postProcessing.enabled = value
      },
    },
    background: {
      value: renderingState.environment.showBackground,
      label: 'Sky',
      onChange: (value: boolean) => {
        renderingState.environment.showBackground = value
      },
    },
    environment: {
      value: renderingState.environment.environmentIntensity,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Environment',
      onChange: (value: number) => {
        renderingState.environment.environmentIntensity = value
      },
    },
    backgroundIntensity: {
      value: renderingState.environment.backgroundIntensity,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Sky Light',
      onChange: (value: number) => {
        renderingState.environment.backgroundIntensity = value
      },
    },
    toneMapping: {
      value: renderingState.color.toneMapping,
      options: toneMappingModeNames,
      label: 'Tone',
      onChange: (value: typeof renderingState.color.toneMapping) => {
        renderingState.color.toneMapping = value
      },
    },
    exposure: {
      value: renderingState.color.exposure,
      min: 0.1,
      max: 2.5,
      step: 0.01,
      onChange: (value: number) => {
        renderingState.color.exposure = value
      },
    },
    lut: {
      value: renderingState.color.lut,
      options: lutPresetNames,
      label: 'LUT',
      onChange: (value: typeof renderingState.color.lut) => {
        renderingState.color.lut = value
      },
    },
    lutIntensity: {
      value: renderingState.color.lutIntensity,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'LUT Amount',
      onChange: (value: number) => {
        renderingState.color.lutIntensity = value
      },
    },
    bloom: {
      value: renderingState.bloom.enabled,
      onChange: (value: boolean) => {
        renderingState.bloom.enabled = value
      },
    },
    bloomStrength: {
      value: renderingState.bloom.strength,
      min: 0,
      max: 1.5,
      step: 0.01,
      label: 'Bloom',
      onChange: (value: number) => {
        renderingState.bloom.strength = value
      },
    },
    gtao: {
      value: renderingState.gtao.enabled,
      label: 'GTAO',
      onChange: (value: boolean) => {
        renderingState.gtao.enabled = value
      },
    },
    gtaoRadius: {
      value: renderingState.gtao.radius,
      min: 0.1,
      max: 2,
      step: 0.01,
      label: 'AO Radius',
      onChange: (value: number) => {
        renderingState.gtao.radius = value
      },
    },
    gtaoIntensity: {
      value: renderingState.gtao.intensity,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'AO Amount',
      onChange: (value: number) => {
        renderingState.gtao.intensity = value
      },
    },
    atmosphere: {
      value: renderingState.atmosphere.enabled,
      onChange: (value: boolean) => {
        renderingState.atmosphere.enabled = value
      },
    },
    haze: {
      value: renderingState.atmosphere.aerialStrength,
      min: 0,
      max: 1.5,
      step: 0.01,
      onChange: (value: number) => {
        renderingState.atmosphere.aerialStrength = value
      },
    },
    groundFog: {
      value: renderingState.atmosphere.heightFogStrength,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Fog',
      onChange: (value: number) => {
        renderingState.atmosphere.heightFogStrength = value
      },
    },
    sunShafts: {
      value: renderingState.atmosphere.sunShaftStrength,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Shafts',
      onChange: (value: number) => {
        renderingState.atmosphere.sunShaftStrength = value
      },
    },
    lensFlare: {
      value: renderingState.atmosphere.lensFlareStrength,
      min: 0,
      max: 0.8,
      step: 0.01,
      label: 'Flare',
      onChange: (value: number) => {
        renderingState.atmosphere.lensFlareStrength = value
      },
    },
    fxaa: {
      value: renderingState.antiAliasing.enabled,
      label: 'FXAA',
      onChange: (value: boolean) => {
        renderingState.antiAliasing.enabled = value
      },
    },
    eyeAdaptation: {
      value: renderingState.eyeAdaptation.enabled,
      label: 'Eye Adapt',
      onChange: (value: boolean) => {
        renderingState.eyeAdaptation.enabled = value
      },
    },
  })

  return null
}
