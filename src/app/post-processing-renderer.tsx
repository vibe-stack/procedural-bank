import { useRef } from 'react'
import * as THREE from 'three/webgpu'
import { useFrame, useThree } from '@react-three/fiber'
import { useSnapshot } from 'valtio'
import {
  createProcBuildingsPostProcessing,
  type PostProcessingFeatures,
  type ProcBuildingsPostProcessing,
} from '../scene/post-processing/post-processing'
import { renderingState } from '../state/rendering-state'

type PostProcessingRendererProps = {
  features: PostProcessingFeatures
}

export function PostProcessingRenderer({ features }: PostProcessingRendererProps) {
  const gl = useThree((state) => state.gl as unknown as THREE.WebGPURenderer)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const postProcessingRef = useRef<ProcBuildingsPostProcessing | null>(null)
  if (postProcessingRef.current == null) {
    postProcessingRef.current = createProcBuildingsPostProcessing(gl, scene, camera, features)
  }
  const settings = useSnapshot(renderingState)
  const signature = [
    settings.bloom.enabled,
    settings.bloom.strength,
    settings.bloom.radius,
    settings.bloom.threshold,
    settings.color.toneMapping,
    settings.color.exposure,
    settings.color.lut,
    settings.color.lutIntensity,
    settings.gtao.enabled,
    settings.gtao.radius,
    settings.gtao.intensity,
    settings.atmosphere.enabled,
    settings.atmosphere.aerialStrength,
    settings.atmosphere.heightFogStrength,
    settings.atmosphere.sunShaftStrength,
    settings.atmosphere.lensFlareStrength,
    settings.antiAliasing.enabled,
    settings.eyeAdaptation.enabled,
  ].join('|')
  const lastSignature = useRef('')

  useFrame((_, deltaSeconds) => {
    const postProcessing = postProcessingRef.current
    if (!postProcessing) return

    if (lastSignature.current !== signature) {
      postProcessing.bloomSettings.enabled = settings.bloom.enabled
      postProcessing.bloomSettings.strength = settings.bloom.strength
      postProcessing.bloomSettings.radius = settings.bloom.radius
      postProcessing.bloomSettings.threshold = settings.bloom.threshold
      postProcessing.colorSettings.toneMapping = settings.color.toneMapping
      postProcessing.colorSettings.exposure = settings.color.exposure
      postProcessing.colorSettings.lut = settings.color.lut
      postProcessing.colorSettings.lutIntensity = settings.color.lutIntensity
      postProcessing.gtaoSettings.enabled = settings.gtao.enabled
      postProcessing.gtaoSettings.radius = settings.gtao.radius
      postProcessing.gtaoSettings.intensity = settings.gtao.intensity
      postProcessing.atmosphereSettings.enabled = settings.atmosphere.enabled
      postProcessing.atmosphereSettings.aerialStrength = settings.atmosphere.aerialStrength
      postProcessing.atmosphereSettings.heightFogStrength = settings.atmosphere.heightFogStrength
      postProcessing.atmosphereSettings.sunShaftStrength = settings.atmosphere.sunShaftStrength
      postProcessing.atmosphereSettings.lensFlareStrength = settings.atmosphere.lensFlareStrength
      postProcessing.antiAliasingSettings.enabled = settings.antiAliasing.enabled
      postProcessing.eyeAdaptationSettings.enabled = settings.eyeAdaptation.enabled
      postProcessing.applyBloomSettings()
      postProcessing.applyColorSettings()
      postProcessing.applyGtaoSettings()
      postProcessing.applyAtmosphereSettings()
      postProcessing.applyAntiAliasingSettings()
      lastSignature.current = signature
    }

    postProcessing.render(deltaSeconds)
  }, 1)

  return null
}
