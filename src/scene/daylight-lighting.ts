import * as THREE from "three/webgpu"

export const daylightSunDirection = new THREE.Vector3(
  0.45,
  0.78,
  0.55
).normalize()

export const unrealDaylightReference = {
  sunLux: 120_000,
  sunAngularDiameterDegrees: 0.545,
} as const

export const daylightLighting = {
  sunColor: 0xfff7e8,
  sunIntensity: unrealDaylightReference.sunLux / 30_000,
  hemisphereSkyColor: 0xd7e4ee,
  hemisphereGroundColor: 0x8a806f,
  hemisphereIntensity: 0.28,
  fillColor: 0xffffff,
  fillIntensity: 0.06,
  rimColor: 0xffffff,
  rimIntensity: 0.04,
} as const
