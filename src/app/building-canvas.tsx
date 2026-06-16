import * as THREE from 'three/webgpu'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, extend, type ThreeToJSXElements } from '@react-three/fiber'
import { useSnapshot } from 'valtio'
import { GeneratedBuildingMesh } from './generated-building-mesh'
import { GroundPlane } from './ground-plane'
import { PostProcessingRenderer } from './post-processing-renderer'
import { SceneLights } from './scene-lights'
import { SceneEnvironment } from './scene-environment'
import { getActivePostProcessingFeatures, hasActivePostProcessing, renderingState } from '../state/rendering-state'

declare module '@react-three/fiber' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

extend(THREE as never)

export function BuildingCanvas() {
  const { dpr } = useSnapshot(renderingState)
  return (
    <Canvas
      dpr={dpr}
      shadows
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer({
          canvas: props.canvas as HTMLCanvasElement,
          antialias: true,
        })
        renderer.shadowMap.enabled = true
        await renderer.init()
        return renderer
      }}>
      <PerspectiveCamera makeDefault position={[70, 48, 128]} fov={46} />
      <SceneEnvironment />
      <SceneLights />
      <GeneratedBuildingMesh />
      <GroundPlane />
      <OrbitControls makeDefault target={[0, 29, 0]} enableDamping />
      <OptionalPostProcessingRenderer />
    </Canvas>
  )
}

function OptionalPostProcessingRenderer() {
  const settings = useSnapshot(renderingState)
  const features = getActivePostProcessingFeatures(settings)
  const key = Object.entries(features)
    .filter(([, active]) => active)
    .map(([name]) => name)
    .join('|')

  return hasActivePostProcessing(settings) ? (
    <PostProcessingRenderer key={key} features={features} />
  ) : null
}
