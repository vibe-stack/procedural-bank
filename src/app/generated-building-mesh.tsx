import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { generateFinancialBuilding } from '../kit/building/building-generator'
import type { MaterialSlot } from '../kit/kit-types'
import { useFinancialMaterials } from '../scene/materials'
import { buildingState } from '../state/building-state'

const renderOrder: MaterialSlot[] = [
  'limestone',
  'granite',
  'ornament',
  'glass',
  'bronze',
  'black-metal',
  'roof',
]

export function GeneratedBuildingMesh() {
  const settings = useSnapshot(buildingState)
  const generated = useMemo(
    () => generateFinancialBuilding({ ...settings }),
    [settings]
  )
  const materials = useFinancialMaterials(settings.materialVariant)

  return (
    <group position={[0, 0, 0]}>
      {renderOrder.map((slot) => {
        const geometry = generated.geometries[slot]
        if (!geometry) return null
        return <mesh key={slot} geometry={geometry} material={materials[slot]} castShadow receiveShadow />
      })}
    </group>
  )
}
