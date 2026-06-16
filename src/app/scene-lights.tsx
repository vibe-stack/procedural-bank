import { useMemo, useRef } from 'react'
import * as THREE from 'three/webgpu'
import { useFrame } from '@react-three/fiber'
import { useSnapshot } from 'valtio'
import { CachedClipmapShadowNode } from '../scene/csm'
import { daylightLighting, daylightSunDirection } from '../scene/daylight-lighting'
import { buildingState } from '../state/building-state'

const fillPosition: [number, number, number] = [-32, 28, 46]
const shadowAnchor = new THREE.Vector3(0, 30, 0)
const sunOffset = daylightSunDirection.clone().normalize().multiplyScalar(140)

export function SceneLights() {
  return (
    <>
      <hemisphereLight
        args={[
          new THREE.Color(daylightLighting.hemisphereSkyColor),
          new THREE.Color(daylightLighting.hemisphereGroundColor),
          daylightLighting.hemisphereIntensity,
        ]}
      />
      <CachedSunLight />
      <directionalLight
        position={fillPosition}
        color={new THREE.Color(daylightLighting.fillColor)}
        intensity={daylightLighting.fillIntensity}
      />
    </>
  )
}

function CachedSunLight() {
  const settings = useSnapshot(buildingState)
  const lightRef = useRef<THREE.DirectionalLight | null>(null)
  const shadowNodeRef = useRef<CachedClipmapShadowNode | null>(null)
  const lastBuildingSignature = useRef('')
  const target = useMemo(() => new THREE.Object3D(), [])
  const shadowCamera = useMemo(() => {
    const anchor = new THREE.PerspectiveCamera()
    anchor.position.copy(shadowAnchor)
    anchor.updateMatrixWorld(true)
    return anchor
  }, [])
  const buildingSignature = Object.values(settings).join('|')

  useFrame(() => {
    const light = lightRef.current
    if (!light) return

    light.target = target
    light.position.copy(shadowAnchor).add(sunOffset)
    target.position.copy(shadowAnchor)
    shadowCamera.position.copy(shadowAnchor)
    shadowCamera.updateMatrixWorld(true)
    target.updateMatrixWorld()
    light.updateMatrixWorld()

    if (!shadowNodeRef.current) {
      light.shadow.bias = -0.000025
      light.shadow.normalBias = 0.01
      light.shadow.mapSize.set(2048, 2048)

      shadowNodeRef.current = new CachedClipmapShadowNode(light, {
        camera: shadowCamera,
        firstRadius: 72,
        scaleFactor: 2.15,
        levels: 3,
        maxDistance: 240,
        levelMapSizes: [2048, 1024, 512],
        lightMargin: 70,
        shadowCameraNear: 1,
        shadowCameraFar: 520,
        guardBand: 0.16,
        blendRatio: 0.12,
        dynamicLevels: 1,
        updateBudget: 1,
        maxCacheAge: 120,
      }).attach()
    } else {
      shadowNodeRef.current.setCamera(shadowCamera)
    }

    if (lastBuildingSignature.current !== buildingSignature) {
      shadowNodeRef.current.invalidate()
      lastBuildingSignature.current = buildingSignature
    }
  })

  return (
    <>
      <directionalLight
        ref={lightRef}
        castShadow
        color={new THREE.Color(daylightLighting.sunColor)}
        intensity={daylightLighting.sunIntensity}
      />
      <primitive object={target} />
      <primitive object={shadowCamera} />
    </>
  )
}
