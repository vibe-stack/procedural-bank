import * as THREE from 'three/webgpu'
import {
  cloneRealDaylightSkySettings,
  createRealDaylightSkyTexture,
  type RealDaylightSkySettings,
} from './daylight-sky'
import {
  createCloudyDaylightSkyTexture,
  createCloudySky,
  type CloudySkyRuntime,
} from './cloudy-sky'

export type SceneEnvironmentSettings = {
  showBackground: boolean
  environmentIntensity: number
  backgroundIntensity: number
  backgroundBlurriness: number
}

export type SceneEnvironment = {
  settings: SceneEnvironmentSettings
  realDaylightSkySettings: RealDaylightSkySettings
  cloudySky: CloudySkyRuntime
  applySettings: () => void
}

const defaultSceneEnvironmentSettings: SceneEnvironmentSettings = {
  showBackground: false,
  environmentIntensity: 0,
  backgroundIntensity: 0,
  backgroundBlurriness: 0,
}

export function createSceneEnvironment(scene: THREE.Scene): SceneEnvironment {
  const settings = { ...defaultSceneEnvironmentSettings }
  const realDaylightSkySettings = cloneRealDaylightSkySettings()
  const cloudySky = createCloudySky()
  const fallbackBackground = scene.background
  let activeTexture: THREE.Texture | null = null

  const applySettings = (): void => {
    scene.environmentIntensity = settings.environmentIntensity
    scene.backgroundIntensity = settings.backgroundIntensity
    scene.backgroundBlurriness = settings.backgroundBlurriness

    if (!settings.showBackground && settings.environmentIntensity <= 0) {
      scene.environment = null
      scene.background = fallbackBackground
      activeTexture?.dispose()
      activeTexture = null
      return
    }

    const texture = cloudySky.settings.enabled
      ? createCloudyDaylightSkyTexture(realDaylightSkySettings, cloudySky.settings)
      : createRealDaylightSkyTexture(realDaylightSkySettings)

    scene.environment = texture
    scene.background = settings.showBackground ? texture : fallbackBackground
    activeTexture?.dispose()
    activeTexture = texture
  }

  applySettings()

  return {
    settings,
    realDaylightSkySettings,
    cloudySky,
    applySettings,
  }
}
