import * as THREE from "three/webgpu"
import {
  type Rgb,
  type RealDaylightSkySettings,
} from "./daylight-sky"
import { directionFromEquirect, skyColorForDirection } from "./daylight-sky"
import { daylightSunDirection } from "./daylight-lighting"

export type CloudySkySettings = {
  enabled: boolean
  coverage: number
  density: number
  softness: number
  scale: number
  detailScale: number
  erosion: number
  altitude: number
  thickness: number
  windSpeed: number
  windDirectionX: number
  windDirectionZ: number
  shadowStrength: number
  sunStrength: number
  ambientStrength: number
  powderStrength: number
  forwardScattering: number
  horizonFade: number
  sunColor: Rgb
  shadowColor: Rgb
}

export type CloudySkyRuntime = {
  settings: CloudySkySettings
}

const SKY_WIDTH = 2048
const SKY_HEIGHT = 1024

export const defaultCloudySkySettings: CloudySkySettings = {
  enabled: false,
  coverage: 0.52,
  density: 0.86,
  softness: 0.16,
  scale: 0.00042,
  detailScale: 4.8,
  erosion: 0.34,
  altitude: 1800,
  thickness: 850,
  windSpeed: 14,
  windDirectionX: 0.85,
  windDirectionZ: 0.32,
  shadowStrength: 1.35,
  sunStrength: 0.88,
  ambientStrength: 0.58,
  powderStrength: 0.62,
  forwardScattering: 8.5,
  horizonFade: 0.055,
  sunColor: [1, 0.93, 0.78],
  shadowColor: [0.48, 0.55, 0.66],
}

export function createCloudySky(
  settings: CloudySkySettings = cloneCloudySkySettings()
): CloudySkyRuntime {
  return { settings }
}

export function cloneCloudySkySettings(
  settings: CloudySkySettings = defaultCloudySkySettings
): CloudySkySettings {
  return {
    ...settings,
    sunColor: [...settings.sunColor],
    shadowColor: [...settings.shadowColor],
  }
}

export function createCloudyDaylightSkyTexture(
  skySettings: RealDaylightSkySettings,
  cloudSettings: CloudySkySettings,
  elapsedSeconds = performance.now() * 0.001
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = SKY_WIDTH
  canvas.height = SKY_HEIGHT

  const context = canvas.getContext("2d")
  if (!context) throw new Error("Unable to create cloudy sky texture")

  const image = context.createImageData(SKY_WIDTH, SKY_HEIGHT)
  const direction = new THREE.Vector3()
  let offset = 0

  for (let y = 0; y < SKY_HEIGHT; y++) {
    const v = (y + 0.5) / SKY_HEIGHT
    for (let x = 0; x < SKY_WIDTH; x++) {
      const u = (x + 0.5) / SKY_WIDTH
      direction.copy(directionFromEquirect(u, v))
      const sky = skyColorForDirection(direction, skySettings)
      const density = cloudSettings.enabled
        ? cloudDensityForDirection(direction, cloudSettings, elapsedSeconds)
        : 0
      const alpha = cloudAlphaForDirection(direction, cloudSettings, density)
      const color = cloudSettings.enabled
        ? mixColor(
            sky,
            cloudColorForDirection(
              direction,
              cloudSettings,
              elapsedSeconds,
              density
            ),
            alpha
          )
        : sky

      image.data[offset++] = Math.round(clamp01(color[0]) * 255)
      image.data[offset++] = Math.round(clamp01(color[1]) * 255)
      image.data[offset++] = Math.round(clamp01(color[2]) * 255)
      image.data[offset++] = 255
    }
  }

  context.putImageData(image, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.name = "Cloudy Real Daylight Sky"
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function cloudColorForDirection(
  direction: THREE.Vector3,
  settings: CloudySkySettings,
  elapsedSeconds: number,
  density: number
): Rgb {
  const lightOffset = new THREE.Vector2(
    daylightSunDirection.x,
    daylightSunDirection.z
  ).multiplyScalar(settings.thickness * settings.scale * 0.34)
  const baseUv = cloudUvForDirection(direction, settings, elapsedSeconds)
  const lightDensity = cloudDensityAt(baseUv.add(lightOffset), 0.72, settings)
  const selfShadow = Math.exp(-lightDensity * settings.shadowStrength)
  const sunFacing = clamp01(direction.dot(daylightSunDirection))
  const forward =
    Math.pow(sunFacing, settings.forwardScattering) * settings.sunStrength
  const powder =
    (1 - Math.exp(-density * settings.powderStrength * 2.2)) * 0.38
  const litAmount = clamp01(
    (settings.ambientStrength + forward + powder) * selfShadow
  )
  return mixColor(settings.shadowColor, settings.sunColor, litAmount).map(
    (channel) => channel * (0.92 + density * 0.16)
  ) as Rgb
}

function cloudAlphaForDirection(
  direction: THREE.Vector3,
  settings: CloudySkySettings,
  density: number
): number {
  const horizonMask = smoothstep(
    settings.horizonFade,
    settings.horizonFade + 0.11,
    direction.y
  )
  return clamp01(density * settings.density * horizonMask)
}

function cloudDensityForDirection(
  direction: THREE.Vector3,
  settings: CloudySkySettings,
  elapsedSeconds: number
): number {
  const dirY = Math.max(direction.y, 0.035)
  const uv = cloudUvForDirection(direction, settings, elapsedSeconds)
  const parallax = new THREE.Vector2(direction.x, direction.z).multiplyScalar(
    (settings.thickness * settings.scale * 0.18) / dirY
  )
  const lower = cloudDensityAt(uv.clone().sub(parallax), 0.22, settings)
  const middle = cloudDensityAt(uv, 0.5, settings)
  const upper = cloudDensityAt(uv.clone().add(parallax), 0.78, settings)
  return lower * 0.25 + middle * 0.48 + upper * 0.27
}

function cloudUvForDirection(
  direction: THREE.Vector3,
  settings: CloudySkySettings,
  elapsedSeconds: number
): THREE.Vector2 {
  const dirY = Math.max(direction.y, 0.035)
  const wind = new THREE.Vector2(settings.windDirectionX, settings.windDirectionZ)
  if (wind.lengthSq() < 0.0001) wind.set(1, 0)
  wind.normalize().multiplyScalar(settings.windSpeed * elapsedSeconds)
  return new THREE.Vector2(direction.x, direction.z)
    .multiplyScalar(settings.altitude / dirY)
    .add(wind)
    .multiplyScalar(settings.scale)
}

function cloudDensityAt(
  uv: THREE.Vector2,
  height: number,
  settings: CloudySkySettings
): number {
  const base = fbm(uv.x, uv.y, height, 3)
  const detail = fbm(
    uv.x * settings.detailScale + 17.1,
    uv.y * settings.detailScale + 29.4,
    height + 3.7,
    2
  )
  const fine = fbm(
    uv.x * settings.detailScale * 2.7 + 63.2,
    uv.y * settings.detailScale * 2.7 + 8.9,
    height + 11.4,
    1
  )
  const billow = 1 - Math.abs(detail * 2 - 1)
  const heightShape =
    smoothstep(0, 0.22, height) * (1 - smoothstep(0.66, 1, height))
  const field =
    base * 0.74 + billow * 0.24 + heightShape * 0.28 - fine * settings.erosion
  return smoothstep(settings.coverage, settings.coverage + settings.softness, field)
}

function fbm(x: number, y: number, z: number, octaves: number): number {
  let frequency = 1
  let amplitude = 0.56
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise3(x * frequency, y * frequency, z * frequency) * amplitude
    norm += amplitude
    frequency *= 2.13
    amplitude *= 0.52
  }
  return norm > 0 ? sum / norm : 0
}

function valueNoise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = x - ix
  const fy = y - iy
  const fz = z - iz
  const ux = fade(fx)
  const uy = fade(fy)
  const uz = fade(fz)

  const x00 = mixNumber(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), ux)
  const x10 = mixNumber(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), ux)
  const x01 = mixNumber(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), ux)
  const x11 = mixNumber(
    hash3(ix, iy + 1, iz + 1),
    hash3(ix + 1, iy + 1, iz + 1),
    ux
  )
  return mixNumber(mixNumber(x00, x10, uy), mixNumber(x01, x11, uy), uz)
}

function hash3(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393)
  h = Math.imul(h + y, 668265263)
  h = Math.imul(h + z, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 3266489917)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

function fade(value: number): number {
  return value * value * (3 - 2 * value)
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
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
