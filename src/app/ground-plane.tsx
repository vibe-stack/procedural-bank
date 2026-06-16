import { useMemo } from 'react'
import * as THREE from 'three/webgpu'
import { float, vec3 } from 'three/tsl'

export function GroundPlane() {
  const material = useMemo(() => {
    const ground = new THREE.MeshStandardNodeMaterial()
    ground.colorNode = vec3(0.12, 0.125, 0.12)
    ground.roughnessNode = float(0.86)
    return ground
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow material={material}>
      <planeGeometry args={[90, 90, 1, 1]} />
    </mesh>
  )
}
