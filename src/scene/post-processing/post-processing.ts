import * as THREE from 'three/webgpu'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { fxaa } from 'three/addons/tsl/display/FXAANode.js'
import {
  convertToTexture,
  diffuseColor,
  mix,
  mrt,
  normalView,
  output,
  pass,
  renderOutput,
  texture3D,
  uniform,
  uv,
  vec4,
} from 'three/tsl'
import { createAtmospherePass, type AtmosphereSettings } from './atmosphere-pass'
import {
  createLutTexture,
  defaultColorGradingSettings,
  getLutRecipe,
  lutUvOffset,
  lutUvScale,
  toneMappingModes,
  updateLutTexture,
  type ColorGradingSettings,
  type LutRecipe,
} from './color-grading'
import { createEyeAdaptation, type EyeAdaptation, type EyeAdaptationSettings } from './eye-adaptation'
import { applyGtaoToScene } from './gtao-composite'
import { createGtaoPass, defaultGtaoSettings, type GtaoPass, type GtaoSettings } from './gtao'
import { defaultAtmosphereSettings } from './atmosphere-pass'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodeGraphValue = any

export type BloomSettings = {
  enabled: boolean
  strength: number
  radius: number
  threshold: number
  smoothWidth: number
}

export type AntiAliasingSettings = {
  enabled: boolean
}

export type ProcBuildingsPostProcessing = {
  bloomSettings: BloomSettings
  colorSettings: ColorGradingSettings
  realDaylightLutRecipe: LutRecipe
  gtaoSettings: GtaoSettings
  atmosphereSettings: AtmosphereSettings
  antiAliasingSettings: AntiAliasingSettings
  eyeAdaptationSettings: EyeAdaptationSettings
  eyeAdaptation: EyeAdaptation
  applyBloomSettings: () => void
  applyColorSettings: () => void
  applyGtaoSettings: () => void
  applyAtmosphereSettings: () => void
  applyAntiAliasingSettings: () => void
  render: (deltaSeconds?: number) => void
}

export type PostProcessingFeatures = {
  bloom: boolean
  gtao: boolean
  atmosphere: boolean
  antiAliasing: boolean
  eyeAdaptation: boolean
  lut: boolean
}

const defaultBloomSettings: BloomSettings = {
  enabled: false,
  strength: 0,
  radius: 0.35,
  threshold: 0.72,
  smoothWidth: 0.08,
}

export function createProcBuildingsPostProcessing(
  renderer: THREE.WebGPURenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  features: PostProcessingFeatures
): ProcBuildingsPostProcessing {
  const renderPipeline = new THREE.RenderPipeline(renderer)
  renderPipeline.outputColorTransform = false

  const scenePass = pass(scene, camera)
  if (features.gtao) {
    scenePass.setMRT(mrt({ output, normal: normalView, albedo: diffuseColor }))
  }

  const sceneColor = scenePass.getTextureNode('output')
  const depthColor = scenePass.getTextureNode('depth')
  const nearNode = uniform((camera as { near?: number }).near ?? 0.1)
  const farNode = uniform((camera as { far?: number }).far ?? 2000)
  const envIntensityNode = uniform((scene as { environmentIntensity?: number }).environmentIntensity ?? 1)

  let gtaoPass: GtaoPass | null = null
  let gtaoCompositeUniforms: ReturnType<typeof applyGtaoToScene>['uniforms'] | null = null
  let colorTexture = sceneColor

  if (features.gtao) {
    const normalColor = scenePass.getTextureNode('normal')
    const albedoColor = scenePass.getTextureNode('albedo')
    gtaoPass = createGtaoPass(depthColor, normalColor, camera)
    const gtaoTexture = gtaoPass.getTextureNode()
    const composite = applyGtaoToScene(
      sceneColor,
      albedoColor,
      gtaoTexture,
      depthColor,
      normalColor,
      nearNode,
      farNode,
      envIntensityNode,
      scene.environment
    )
    gtaoCompositeUniforms = composite.uniforms
    colorTexture = convertToTexture(composite.node)
  }

  const atmospherePass = features.atmosphere
    ? createAtmospherePass(colorTexture, depthColor, camera)
    : null
  if (atmospherePass) {
    atmospherePass.settings.enabled = false
    atmospherePass.settings.aerialStrength = 0
    atmospherePass.settings.heightFogStrength = 0
    atmospherePass.settings.sunShaftStrength = 0
    atmospherePass.settings.lensFlareStrength = 0
    colorTexture = convertToTexture(atmospherePass.outputNode)
  }

  const bloomPass = features.bloom
    ? bloom(
        colorTexture,
        defaultBloomSettings.strength,
        defaultBloomSettings.radius,
        defaultBloomSettings.threshold
      )
    : null

  const colorSettings = { ...defaultColorGradingSettings }
  colorSettings.lutIntensity = 0
  const realDaylightLutRecipe = getLutRecipe('Real Daylight')
  const lutTexture = createLutTexture(colorSettings.lut, realDaylightLutRecipe)
  const lutIntensityNode = uniform(colorSettings.lutIntensity)
  let currentLut = colorSettings.lut

  const eyeAdaptation = createEyeAdaptation(colorTexture)
  eyeAdaptation.settings.enabled = false
  const sampledColor = (colorTexture as NodeGraphValue).sample(uv())
  const hdrColor = bloomPass ? sampledColor.add(bloomPass) : sampledColor
  const displayColor = renderOutput((hdrColor as NodeGraphValue).mul(eyeAdaptation.exposureNode), null, null)
  const ldrColor = features.lut
    ? (() => {
        const lutUv = displayColor.rgb.saturate().mul(lutUvScale).add(lutUvOffset)
        const lutColor = texture3D(lutTexture, lutUv).rgb
        return vec4(mix(displayColor.rgb, lutColor, lutIntensityNode), displayColor.a)
      })()
    : displayColor

  const aaEnabled = uniform(1)
  if (features.antiAliasing) {
    const fxaaColor = fxaa(ldrColor) as unknown as { rgb: typeof ldrColor.rgb }
    renderPipeline.outputNode = vec4(mix(ldrColor.rgb, fxaaColor.rgb, aaEnabled), ldrColor.a)
  } else {
    renderPipeline.outputNode = ldrColor
  }

  const bloomSettings = { ...defaultBloomSettings }
  const gtaoSettings = { ...defaultGtaoSettings, enabled: false, intensity: 0 }
  const atmosphereSettings = {
    ...defaultAtmosphereSettings,
    enabled: false,
    aerialColor: [...defaultAtmosphereSettings.aerialColor],
    heightFogColor: [...defaultAtmosphereSettings.heightFogColor],
    sunShaftColor: [...defaultAtmosphereSettings.sunShaftColor],
    sunDiscColor: [...defaultAtmosphereSettings.sunDiscColor],
    lensFlareColor: [...defaultAtmosphereSettings.lensFlareColor],
    distanceGradeColor: [...defaultAtmosphereSettings.distanceGradeColor],
    aerialStrength: 0,
    heightFogStrength: 0,
    sunShaftStrength: 0,
    lensFlareStrength: 0,
  } as AtmosphereSettings

  const applyBloomSettings = (): void => {
    if (!bloomPass) return
    bloomPass.strength.value = bloomSettings.enabled ? bloomSettings.strength : 0
    bloomPass.radius.value = bloomSettings.radius
    bloomPass.threshold.value = bloomSettings.threshold
    bloomPass.smoothWidth.value = bloomSettings.smoothWidth
  }

  const applyColorSettings = (): void => {
    renderer.toneMapping = toneMappingModes[colorSettings.toneMapping]
    renderer.toneMappingExposure = colorSettings.exposure
    lutIntensityNode.value = colorSettings.lutIntensity
    if (currentLut !== colorSettings.lut) {
      updateLutTexture(lutTexture, colorSettings.lut, realDaylightLutRecipe)
      currentLut = colorSettings.lut
    } else if (colorSettings.lut === 'Real Daylight') {
      updateLutTexture(lutTexture, colorSettings.lut, realDaylightLutRecipe)
    }
  }

  const applyGtaoSettings = (): void => {
    nearNode.value = (camera as { near?: number }).near ?? nearNode.value
    farNode.value = (camera as { far?: number }).far ?? farNode.value
    if (!gtaoPass) return
    if (gtaoCompositeUniforms?.envPmrem != null) {
      gtaoCompositeUniforms.envPmrem.value = scene.environment ?? null
    }
    envIntensityNode.value = (scene as { environmentIntensity?: number }).environmentIntensity ?? 1
    gtaoPass.settings.enabled = gtaoSettings.enabled
    gtaoPass.settings.radius = gtaoSettings.radius
    gtaoPass.settings.intensity = gtaoSettings.intensity
    gtaoPass.settings.power = gtaoSettings.power
    gtaoPass.settings.thickness = gtaoSettings.thickness
    gtaoPass.settings.bentNormalStrength = gtaoSettings.bentNormalStrength
    gtaoPass.applySettings()
  }

  const antiAliasingSettings: AntiAliasingSettings = { enabled: false }
  const applyAntiAliasingSettings = (): void => {
    aaEnabled.value = antiAliasingSettings.enabled ? 1 : 0
  }

  applyBloomSettings()
  applyColorSettings()
  applyGtaoSettings()
  if (atmospherePass) atmospherePass.applySettings()
  applyAntiAliasingSettings()

  return {
    bloomSettings,
    colorSettings,
    realDaylightLutRecipe,
    gtaoSettings,
    atmosphereSettings,
    antiAliasingSettings,
    eyeAdaptationSettings: eyeAdaptation.settings,
    eyeAdaptation,
    applyBloomSettings,
    applyColorSettings,
    applyGtaoSettings,
    applyAtmosphereSettings: () => {
      if (!atmospherePass) return
      Object.assign(atmospherePass.settings, atmosphereSettings)
      atmospherePass.applySettings()
    },
    applyAntiAliasingSettings,
    render: (deltaSeconds = 1 / 60) => {
      atmospherePass?.update()
      eyeAdaptation.update(deltaSeconds)
      renderPipeline.render()
      if (features.eyeAdaptation) eyeAdaptation.capture(renderer)
    },
  }
}
