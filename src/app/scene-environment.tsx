import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSnapshot } from 'valtio'
import { createSceneEnvironment, type SceneEnvironment as SceneEnvironmentApi } from '../scene/scene-environment'
import { renderingState } from '../state/rendering-state'

export function SceneEnvironment() {
  const scene = useThree((state) => state.scene)
  const environmentRef = useRef<SceneEnvironmentApi | null>(null)
  if (environmentRef.current == null) {
    environmentRef.current = createSceneEnvironment(scene)
  }
  const settings = useSnapshot(renderingState)
  const signature = [
    settings.environment.showBackground,
    settings.environment.environmentIntensity,
    settings.environment.backgroundIntensity,
  ].join('|')
  const lastSignature = useRef('')

  useFrame(() => {
    const environment = environmentRef.current
    if (!environment || lastSignature.current === signature) return

    environment.settings.showBackground = settings.environment.showBackground
    environment.settings.environmentIntensity = settings.environment.environmentIntensity
    environment.settings.backgroundIntensity = settings.environment.backgroundIntensity
    environment.applySettings()
    lastSignature.current = signature
  })

  return null
}
