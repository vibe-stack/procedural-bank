import * as THREE from "three/webgpu"
import {
  daylightSunDirection,
  unrealDaylightReference,
} from "./daylight-lighting"

export type Rgb = [number, number, number]

const SKY_WIDTH = 1024
const SKY_HEIGHT = 512

export type RealDaylightSkySettings = {
  zenith: Rgb
  upperSky: Rgb
  horizon: Rgb
  ground: Rgb
  horizonMixPower: number
  groundMixPower: number
  horizonGlowStrength: number
  broadHaloPower: number
  broadHaloStrength: number
  innerHaloPower: number
  innerHaloStrength: number
  sunCoreStrength: number
  sunAngularDiameterDegrees: number
}

export const defaultRealDaylightSkySettings: RealDaylightSkySettings = {
  zenith: [0.2, 0.46, 0.82],
  upperSky: [0.42, 0.64, 0.9],
  horizon: [0.78, 0.86, 0.92],
  ground: [0.6, 0.55, 0.48],
  horizonMixPower: 0.62,
  groundMixPower: 0.42,
  horizonGlowStrength: 0.05,
  broadHaloPower: 12,
  broadHaloStrength: 0.18,
  innerHaloPower: 90,
  innerHaloStrength: 0.55,
  sunCoreStrength: 1.4,
  sunAngularDiameterDegrees: unrealDaylightReference.sunAngularDiameterDegrees,
}

export function cloneRealDaylightSkySettings(
  settings: RealDaylightSkySettings = defaultRealDaylightSkySettings
): RealDaylightSkySettings {
  return {
    ...settings,
    zenith: [...settings.zenith],
    upperSky: [...settings.upperSky],
    horizon: [...settings.horizon],
    ground: [...settings.ground],
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function mixNumber(a: number, b: number, amount: number): number {
  return a + (b - a) * amount
}

function mixColor(a: Rgb, b: Rgb, amount: number): Rgb {
  return [
    mixNumber(a[0], b[0], amount),
    mixNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
  ]
}

function addColor(a: Rgb, b: Rgb, amount: number): Rgb {
  return [
    a[0] + b[0] * amount,
    a[1] + b[1] * amount,
    a[2] + b[2] * amount,
  ]
}

export function directionFromEquirect(u: number, v: number): THREE.Vector3 {
  const longitude = u * Math.PI * 2 - Math.PI
  const latitude = (0.5 - v) * Math.PI
  const cosLatitude = Math.cos(latitude)

  return new THREE.Vector3(
    Math.sin(longitude) * cosLatitude,
    Math.sin(latitude),
    Math.cos(longitude) * cosLatitude
  )
}

export function skyColorForDirection(
  direction: THREE.Vector3,
  settings: RealDaylightSkySettings
): Rgb {
  const sunDot = clamp01(direction.dot(daylightSunDirection))
  const skyAmount = clamp01(direction.y)
  const groundAmount = clamp01(-direction.y)

  let color =
    direction.y >= 0
      ? mixColor(
          settings.horizon,
          mixColor(settings.upperSky, settings.zenith, skyAmount),
          Math.pow(skyAmount, settings.horizonMixPower)
        )
      : mixColor(
          settings.horizon,
          settings.ground,
          Math.pow(groundAmount, settings.groundMixPower)
        )

  const horizonGlow =
    Math.pow(1 - Math.abs(direction.y), 5) * settings.horizonGlowStrength
  color = addColor(color, [1, 0.78, 0.48], horizonGlow)

  const sunRadiusRadians =
    THREE.MathUtils.degToRad(settings.sunAngularDiameterDegrees) * 0.5
  const broadHalo =
    Math.pow(sunDot, settings.broadHaloPower) * settings.broadHaloStrength
  const innerHalo =
    Math.pow(sunDot, settings.innerHaloPower) * settings.innerHaloStrength
  const sunCore =
    sunDot > Math.cos(sunRadiusRadians) ? settings.sunCoreStrength : 0

  color = addColor(color, [1, 0.88, 0.68], broadHalo)
  color = addColor(color, [1, 0.95, 0.82], innerHalo)
  color = addColor(color, [1, 0.98, 0.92], sunCore)

  return [clamp01(color[0]), clamp01(color[1]), clamp01(color[2])]
}

export function createRealDaylightSkyTexture(
  settings: RealDaylightSkySettings = defaultRealDaylightSkySettings
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = SKY_WIDTH
  canvas.height = SKY_HEIGHT

  const context = canvas.getContext("2d")!
  const image = context.createImageData(SKY_WIDTH, SKY_HEIGHT)
  const direction = new THREE.Vector3()
  let offset = 0

  for (let y = 0; y < SKY_HEIGHT; y++) {
    const v = (y + 0.5) / SKY_HEIGHT
    for (let x = 0; x < SKY_WIDTH; x++) {
      const u = (x + 0.5) / SKY_WIDTH
      direction.copy(directionFromEquirect(u, v))
      const color = skyColorForDirection(direction, settings)

      image.data[offset++] = Math.round(color[0] * 255)
      image.data[offset++] = Math.round(color[1] * 255)
      image.data[offset++] = Math.round(color[2] * 255)
      image.data[offset++] = 255
    }
  }

  context.putImageData(image, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.name = "Real Daylight Sky"
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  return texture
}
