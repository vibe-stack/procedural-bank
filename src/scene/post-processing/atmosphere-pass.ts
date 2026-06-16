import * as THREE from "three/webgpu"
import * as TSL from "three/tsl"
import { daylightSunDirection } from "../daylight-lighting"
import {
  SCENE_DEPTH_MAX_RECONSTRUCT,
  SCENE_DEPTH_SKY_THRESHOLD,
} from "./depth-constants"

/* eslint-disable @typescript-eslint/no-explicit-any */
type N = any
const t = TSL as any
const {
  abs,
  cameraProjectionMatrixInverse,
  cameraWorldMatrix,
  clamp,
  dot,
  exp,
  float,
  Fn,
  getViewPosition,
  length,
  luminance,
  max,
  mix,
  normalize,
  perspectiveDepthToViewZ,
  pow,
  screenUV,
  sin,
  split,
  smoothstep,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} = t

export type AtmosphereSettings = {
  enabled: boolean
  aerialDensity: number
  aerialStart: number
  aerialStrength: number
  aerialColor: [number, number, number]
  heightFogDensity: number
  heightFogHeight: number
  heightFogFalloff: number
  heightFogStrength: number
  heightFogColor: [number, number, number]
  sunShaftStrength: number
  sunShaftRadius: number
  sunShaftPower: number
  sunShaftSkyOnly: number
  sunShaftColor: [number, number, number]
  sunDiscStrength: number
  sunAngularDiameterDegrees: number
  sunDiscColor: [number, number, number]
  lensFlareStrength: number
  lensFlareColor: [number, number, number]
  sunAzimuthDegrees: number
  sunElevationDegrees: number
  cloudShadowStrength: number
  cloudShadowScale: number
  cloudShadowSoftness: number
  cloudShadowSpeed: number
  cloudShadowDirectionX: number
  cloudShadowDirectionZ: number
  distanceGradeStrength: number
  distanceGradeStart: number
  distanceGradeRange: number
  distanceGradeColor: [number, number, number]
  distanceGradeWarmth: number
}

export type AtmospherePass = {
  settings: AtmosphereSettings
  outputNode: N
  applySettings: () => void
  update: () => void
}

export const defaultAtmosphereSettings: AtmosphereSettings = {
  enabled: true,
  aerialDensity: 0.00033,
  aerialStart: 120,
  aerialStrength: 0.72,
  aerialColor: [0.62, 0.74, 0.88],
  heightFogDensity: 0.0012,
  heightFogHeight: 72,
  heightFogFalloff: 46,
  heightFogStrength: 0.38,
  heightFogColor: [0.72, 0.78, 0.82],
  sunShaftStrength: 0.12,
  sunShaftRadius: 0.42,
  sunShaftPower: 2.7,
  sunShaftSkyOnly: 0.25,
  sunShaftColor: [1, 0.86, 0.56],
  sunDiscStrength: 12,
  sunAngularDiameterDegrees: 0.545,
  sunDiscColor: [1, 0.94, 0.78],
  lensFlareStrength: 0.18,
  lensFlareColor: [1, 0.72, 0.42],
  sunAzimuthDegrees: THREE.MathUtils.radToDeg(Math.atan2(daylightSunDirection.x, daylightSunDirection.z)),
  sunElevationDegrees: THREE.MathUtils.radToDeg(Math.asin(daylightSunDirection.y)),
  cloudShadowStrength: 0.28,
  cloudShadowScale: 0.045,
  cloudShadowSoftness: 0.12,
  cloudShadowSpeed: 12,
  cloudShadowDirectionX: 0.85,
  cloudShadowDirectionZ: 0.32,
  distanceGradeStrength: 0.24,
  distanceGradeStart: 260,
  distanceGradeRange: 1700,
  distanceGradeColor: [0.7, 0.82, 0.94],
  distanceGradeWarmth: 0.16,
}

const sunScreenPosition = new THREE.Vector2(0.5, 0.5)
const projectedSun = new THREE.Vector3()
const sunWorldPosition = new THREE.Vector3()
const cameraForward = new THREE.Vector3()
const sunViewDirection = new THREE.Vector3()
const CLOUD_SHADOW_POST_PROCESSING_ENABLED = false

export function createAtmospherePass(
  colorNode: N,
  depthNode: N,
  camera: THREE.Camera
): AtmospherePass {
  const settings = { ...defaultAtmosphereSettings }
  const uniforms = {
    enabled: uniform(1),
    time: uniform(0),
    near: uniform((camera as { near?: number }).near ?? 0.1),
    far: uniform((camera as { far?: number }).far ?? 2000),
    aerialDensity: uniform(settings.aerialDensity),
    aerialStart: uniform(settings.aerialStart),
    aerialStrength: uniform(settings.aerialStrength),
    aerialColor: uniform(new THREE.Color()),
    heightFogDensity: uniform(settings.heightFogDensity),
    heightFogHeight: uniform(settings.heightFogHeight),
    heightFogFalloff: uniform(settings.heightFogFalloff),
    heightFogStrength: uniform(settings.heightFogStrength),
    heightFogColor: uniform(new THREE.Color()),
    sunScreenPosition: uniform(sunScreenPosition),
    sunVisible: uniform(1),
    sunShaftStrength: uniform(settings.sunShaftStrength),
    sunShaftRadius: uniform(settings.sunShaftRadius),
    sunShaftPower: uniform(settings.sunShaftPower),
    sunShaftSkyOnly: uniform(settings.sunShaftSkyOnly),
    sunShaftColor: uniform(new THREE.Color()),
    sunDiscStrength: uniform(settings.sunDiscStrength),
    sunDiscRadius: uniform(0.004),
    sunDiscInnerCos: uniform(0.99999),
    sunDiscOuterCos: uniform(0.99995),
    sunDiscColor: uniform(new THREE.Color()),
    lensFlareStrength: uniform(settings.lensFlareStrength),
    lensFlareColor: uniform(new THREE.Color()),
    sunWorldDirection: uniform(daylightSunDirection.clone().normalize()),
    sunViewDirection: uniform(new THREE.Vector3(0, 0, -1)),
    cloudShadowStrength: uniform(settings.cloudShadowStrength),
    cloudShadowScale: uniform(settings.cloudShadowScale),
    cloudShadowSoftness: uniform(settings.cloudShadowSoftness),
    cloudShadowSpeed: uniform(settings.cloudShadowSpeed),
    cloudShadowDirection: uniform(new THREE.Vector2(1, 0)),
    distanceGradeStrength: uniform(settings.distanceGradeStrength),
    distanceGradeStart: uniform(settings.distanceGradeStart),
    distanceGradeRange: uniform(settings.distanceGradeRange),
    distanceGradeColor: uniform(new THREE.Color()),
    distanceGradeWarmth: uniform(settings.distanceGradeWarmth),
  }

  const outputNode = buildAtmosphereNode(colorNode, depthNode, uniforms)

  const applySettings = (): void => {
    const wind = new THREE.Vector2(
      settings.cloudShadowDirectionX,
      settings.cloudShadowDirectionZ
    )
    if (wind.lengthSq() < 0.0001) wind.set(1, 0)
    wind.normalize()

    uniforms.enabled.value = settings.enabled ? 1 : 0
    uniforms.aerialDensity.value = settings.aerialDensity
    uniforms.aerialStart.value = settings.aerialStart
    uniforms.aerialStrength.value = settings.aerialStrength
    uniforms.aerialColor.value.setRGB(...settings.aerialColor)
    uniforms.heightFogDensity.value = settings.heightFogDensity
    uniforms.heightFogHeight.value = settings.heightFogHeight
    uniforms.heightFogFalloff.value = settings.heightFogFalloff
    uniforms.heightFogStrength.value = settings.heightFogStrength
    uniforms.heightFogColor.value.setRGB(...settings.heightFogColor)
    uniforms.sunShaftStrength.value = settings.sunShaftStrength
    uniforms.sunShaftRadius.value = settings.sunShaftRadius
    uniforms.sunShaftPower.value = settings.sunShaftPower
    uniforms.sunShaftSkyOnly.value = settings.sunShaftSkyOnly
    uniforms.sunShaftColor.value.setRGB(...settings.sunShaftColor)
    uniforms.sunDiscStrength.value = settings.sunDiscStrength
    uniforms.sunDiscColor.value.setRGB(...settings.sunDiscColor)
    uniforms.lensFlareStrength.value = settings.lensFlareStrength
    uniforms.lensFlareColor.value.setRGB(...settings.lensFlareColor)
    uniforms.sunWorldDirection.value.copy(directionFromSunAngles(settings))
    uniforms.cloudShadowStrength.value = settings.cloudShadowStrength
    uniforms.cloudShadowScale.value = settings.cloudShadowScale
    uniforms.cloudShadowSoftness.value = settings.cloudShadowSoftness
    uniforms.cloudShadowSpeed.value = settings.cloudShadowSpeed
    uniforms.cloudShadowDirection.value.copy(wind)
    uniforms.distanceGradeStrength.value = settings.distanceGradeStrength
    uniforms.distanceGradeStart.value = settings.distanceGradeStart
    uniforms.distanceGradeRange.value = settings.distanceGradeRange
    uniforms.distanceGradeColor.value.setRGB(...settings.distanceGradeColor)
    uniforms.distanceGradeWarmth.value = settings.distanceGradeWarmth
    uniforms.near.value = (camera as { near?: number }).near ?? uniforms.near.value
    uniforms.far.value = (camera as { far?: number }).far ?? uniforms.far.value
    uniforms.sunDiscRadius.value = sunDiscUvRadius(camera, settings.sunAngularDiameterDegrees)
    setSunDiscCosines(uniforms, settings.sunAngularDiameterDegrees)
  }

  const update = (): void => {
    uniforms.time.value = performance.now() * 0.001
    uniforms.near.value = (camera as { near?: number }).near ?? uniforms.near.value
    uniforms.far.value = (camera as { far?: number }).far ?? uniforms.far.value
    uniforms.sunDiscRadius.value = sunDiscUvRadius(camera, settings.sunAngularDiameterDegrees)
    setSunDiscCosines(uniforms, settings.sunAngularDiameterDegrees)
    camera.updateMatrixWorld(true)

    sunWorldPosition
      .copy(camera.position)
      .addScaledVector(uniforms.sunWorldDirection.value, uniforms.far.value * 0.75)
    projectedSun.copy(sunWorldPosition).project(camera)
    camera.getWorldDirection(cameraForward)
    uniforms.sunVisible.value = Math.min(
      1,
      Math.max(0, cameraForward.dot(uniforms.sunWorldDirection.value) * 1.6 + 0.35)
    )
    sunViewDirection
      .copy(uniforms.sunWorldDirection.value)
      .transformDirection(camera.matrixWorldInverse)
      .normalize()
    uniforms.sunViewDirection.value.copy(sunViewDirection)
    sunScreenPosition.set(
      projectedSun.x * 0.5 + 0.5,
      projectedSun.y * 0.5 + 0.5
    )
    uniforms.sunScreenPosition.value.copy(sunScreenPosition)
  }

  applySettings()

  return {
    settings,
    outputNode,
    applySettings,
    update,
  }
}

function directionFromSunAngles(settings: AtmosphereSettings): THREE.Vector3 {
  const azimuth = THREE.MathUtils.degToRad(settings.sunAzimuthDegrees)
  const elevation = THREE.MathUtils.degToRad(settings.sunElevationDegrees)
  const cosElevation = Math.cos(elevation)
  return new THREE.Vector3(
    Math.sin(azimuth) * cosElevation,
    Math.sin(elevation),
    Math.cos(azimuth) * cosElevation
  ).normalize()
}

function sunDiscUvRadius(camera: THREE.Camera, angularDiameterDegrees: number): number {
  const perspective = camera as THREE.PerspectiveCamera
  if (!Number.isFinite(perspective.fov) || perspective.fov <= 0) return 0.004

  const angularRadius = THREE.MathUtils.degToRad(angularDiameterDegrees) * 0.5
  const fovRadius = THREE.MathUtils.degToRad(perspective.fov) * 0.5
  return Math.max(0.001, Math.tan(angularRadius) / Math.tan(fovRadius) * 0.5)
}

function setSunDiscCosines(uniforms: Record<string, N>, angularDiameterDegrees: number): void {
  const angularRadius = THREE.MathUtils.degToRad(angularDiameterDegrees) * 0.5
  uniforms.sunDiscInnerCos.value = Math.cos(angularRadius)
  uniforms.sunDiscOuterCos.value = Math.cos(angularRadius * 2.35)
}

function buildAtmosphereNode(
  colorNode: N,
  depthNode: N,
  uniforms: Record<string, N>
): N {
  const sampleViewPosition = (uvNode: N): N => {
    const rawDepth = split(depthNode.sample(uvNode), "x")
    const safeDepth = clamp(
      rawDepth,
      float(0),
      float(SCENE_DEPTH_MAX_RECONSTRUCT)
    )
    return split(getViewPosition(uvNode, safeDepth, cameraProjectionMatrixInverse), "xyz")
  }

  return Fn(() => {
    const sourceUv = uv()
    const baseColor = colorNode.sample(sourceUv)
    const sceneRgb = split(baseColor, "xyz").toVar()
    const rawDepth = split(depthNode.sample(sourceUv), "x")
    const isSky = rawDepth.lessThanEqual(float(SCENE_DEPTH_SKY_THRESHOLD))
    const safeDepth = clamp(
      rawDepth,
      float(0),
      float(SCENE_DEPTH_MAX_RECONSTRUCT)
    )
    const viewZ = perspectiveDepthToViewZ(safeDepth, uniforms.near, uniforms.far)
    const distance = max(viewZ.negate(), float(0))
    const viewPos = sampleViewPosition(sourceUv).toVar()
    const viewDir = normalize(viewPos).toVar()
    const worldPos = split(cameraWorldMatrix.mul(vec4(viewPos, 1)), "xyz").toVar()
    const worldViewDir = normalize(split(cameraWorldMatrix.mul(vec4(viewDir, 0)), "xyz")).toVar()
    const nonSky = isSky.select(float(0), float(1))

    const aerialDistance = max(distance.sub(uniforms.aerialStart), float(0))
    const aerialAmount = float(1)
      .sub(exp(aerialDistance.mul(uniforms.aerialDensity).negate()))
      .mul(uniforms.aerialStrength)
      .mul(nonSky)
      .mul(uniforms.enabled)
      .clamp(0, 1)
    const color = mix(sceneRgb, uniforms.aerialColor, aerialAmount).toVar()

    const heightMask = smoothstep(
      uniforms.heightFogHeight.add(uniforms.heightFogFalloff),
      uniforms.heightFogHeight.sub(uniforms.heightFogFalloff),
      worldPos.y
    )
    const heightFog = float(1)
      .sub(exp(distance.mul(uniforms.heightFogDensity).negate()))
      .mul(heightMask)
      .mul(uniforms.heightFogStrength)
      .mul(nonSky)
      .mul(uniforms.enabled)
      .clamp(0, 1)
    color.assign(mix(color, uniforms.heightFogColor, heightFog))

    if (CLOUD_SHADOW_POST_PROCESSING_ENABLED) {
      const cloudUv = worldPos.xz
        .mul(uniforms.cloudShadowScale)
        .add(uniforms.cloudShadowDirection.mul(uniforms.time.mul(uniforms.cloudShadowSpeed).mul(uniforms.cloudShadowScale)))
      const macroA = sin(cloudUv.x).mul(sin(cloudUv.y.mul(1.31).add(1.7))).mul(0.5).add(0.5)
      const macroB = sin(cloudUv.x.mul(0.74).add(cloudUv.y.mul(0.57)).add(2.9)).mul(0.5).add(0.5)
      const cloudWave = macroA.mul(0.68).add(macroB.mul(0.32)).clamp(0, 1)
      const breakupWave = sin(cloudUv.x.mul(3.1).sub(cloudUv.y.mul(2.4)).add(8.6))
        .mul(0.5)
        .add(0.5)
      const patchMask = smoothstep(
        float(0.54).sub(uniforms.cloudShadowSoftness.mul(0.45)),
        float(0.54).add(uniforms.cloudShadowSoftness.mul(0.45)),
        cloudWave
      )
      const breakupMask = smoothstep(float(0.08), float(0.72), breakupWave)
      const shadowMask = patchMask.mul(breakupMask)
      const cloudShadow = shadowMask
        .mul(uniforms.cloudShadowStrength)
        .mul(nonSky)
        .mul(uniforms.enabled)
        .clamp(0, 0.5)
      color.assign(color.mul(float(1).sub(cloudShadow)))
    }

    const gradeAmount = smoothstep(
      uniforms.distanceGradeStart,
      uniforms.distanceGradeStart.add(uniforms.distanceGradeRange),
      distance
    )
      .mul(uniforms.distanceGradeStrength)
      .mul(nonSky)
      .mul(uniforms.enabled)
      .clamp(0, 1)
    const desaturated = vec3(luminance(color))
    const cooled = mix(color, uniforms.distanceGradeColor, gradeAmount)
    color.assign(mix(cooled, desaturated, gradeAmount.mul(0.28)))

    const sunFacing = max(dot(worldViewDir, uniforms.sunWorldDirection), float(0))
    const warm = pow(sunFacing, float(6))
      .mul(uniforms.distanceGradeWarmth)
      .mul(uniforms.enabled)
    color.assign(color.add(uniforms.sunShaftColor.mul(warm).mul(gradeAmount.add(0.08))))

    const sunDelta = screenUV.sub(uniforms.sunScreenPosition)
    const sunDistance = length(sunDelta)
    const skyPixel = isSky.select(float(1), float(0))
    const sunDisc = smoothstep(
      uniforms.sunDiscOuterCos,
      uniforms.sunDiscInnerCos,
      sunFacing
    )
      .mul(skyPixel)
      .mul(uniforms.sunDiscStrength)
      .mul(uniforms.enabled)
    color.assign(color.add(uniforms.sunDiscColor.mul(sunDisc)))

    const sunGate = smoothstep(uniforms.sunShaftRadius, float(0), sunDistance)
    const sunForward = pow(sunFacing, uniforms.sunShaftPower)
    const skyGate = mix(float(1), isSky.select(float(1), float(0.32)), uniforms.sunShaftSkyOnly)
    const shaftAmount = max(pow(sunGate, uniforms.sunShaftPower), sunForward.mul(0.7))
      .mul(uniforms.sunShaftStrength)
      .mul(uniforms.sunVisible)
      .mul(skyGate)
      .mul(uniforms.enabled)
      .clamp(0, 1)
    const streak = smoothstep(
      float(0.28),
      float(0),
      abs(sunDelta.x.mul(0.55).add(sunDelta.y.mul(0.18)))
    ).mul(smoothstep(float(0.62), float(0), sunDistance))
    color.assign(color.add(uniforms.sunShaftColor.mul(shaftAmount.add(streak.mul(shaftAmount).mul(0.6)))))

    const center = vec2(0.5, 0.5)
    const flareRay = center.sub(uniforms.sunScreenPosition)
    const flareAxis = screenUV.sub(uniforms.sunScreenPosition)
    const flareLineDistance = abs(flareAxis.y.mul(0.92).sub(flareAxis.x.mul(0.08)))
    const flareWindow = float(1).sub(smoothstep(float(0.72), float(1.18), length(flareRay)))
    const sunGlare = pow(smoothstep(float(0.16), float(0), sunDistance), float(5.5)).mul(1.15)
      .add(pow(smoothstep(float(0.34), float(0.02), sunDistance), float(2.4)).mul(0.16))
    const anamorphicStreak = pow(smoothstep(float(0.022), float(0), abs(screenUV.y.sub(uniforms.sunScreenPosition.y))), float(2.1))
      .mul(pow(smoothstep(float(0.78), float(0.02), abs(screenUV.x.sub(uniforms.sunScreenPosition.x))), float(1.7)))
      .mul(0.24)
    const axisStreak = pow(smoothstep(float(0.018), float(0), flareLineDistance), float(1.7))
      .mul(pow(smoothstep(float(0.82), float(0), length(flareAxis)), float(2.2)))
      .mul(0.14)
    const ghostA = center.add(flareRay.mul(0.38))
    const ghostB = center.add(flareRay.mul(0.72))
    const ghostC = center.add(flareRay.mul(1.08))
    const ghostD = center.add(flareRay.mul(1.46))
    const ghostAAmount = pow(smoothstep(float(0.045), float(0), length(screenUV.sub(ghostA))), float(3.2)).mul(0.72)
    const ghostBAmount = pow(smoothstep(float(0.034), float(0), length(screenUV.sub(ghostB))), float(2.8)).mul(0.58)
    const ghostCAmount = pow(smoothstep(float(0.026), float(0), length(screenUV.sub(ghostC))), float(2.4)).mul(0.46)
    const ghostDCore = pow(smoothstep(float(0.019), float(0), length(screenUV.sub(ghostD))), float(2.2)).mul(0.4)
    const ringDistance = abs(length(screenUV.sub(ghostB)).sub(0.074))
    const glassRing = pow(smoothstep(float(0.018), float(0), ringDistance), float(2.5)).mul(0.2)
    const flare = sunGlare
      .add(anamorphicStreak)
      .add(axisStreak)
      .add(glassRing)
      .mul(uniforms.lensFlareStrength)
      .mul(uniforms.sunVisible)
      .mul(flareWindow)
      .mul(uniforms.enabled)
    color.assign(color.add(uniforms.lensFlareColor.mul(flare)))
    color.assign(color.add(vec3(1, 0.48, 0.18).mul(ghostAAmount.mul(uniforms.lensFlareStrength).mul(uniforms.sunVisible).mul(flareWindow).mul(uniforms.enabled))))
    color.assign(color.add(vec3(0.25, 0.72, 1).mul(ghostBAmount.mul(uniforms.lensFlareStrength).mul(uniforms.sunVisible).mul(flareWindow).mul(uniforms.enabled))))
    color.assign(color.add(vec3(0.72, 0.28, 1).mul(ghostCAmount.mul(uniforms.lensFlareStrength).mul(uniforms.sunVisible).mul(flareWindow).mul(uniforms.enabled))))
    color.assign(color.add(vec3(0.42, 1, 0.52).mul(ghostDCore.mul(uniforms.lensFlareStrength).mul(uniforms.sunVisible).mul(flareWindow).mul(uniforms.enabled))))

    return vec4(color, split(baseColor, "w"))
  })()
}
