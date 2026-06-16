import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { buildKitModulePreview } from '../kit/build-kit-module'
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

export function KitModulePreviewMesh() {
  const settings = useSnapshot(buildingState)
  const preview = useMemo(
    () => buildKitModulePreview(settings.selectedModuleId),
    [settings.selectedModuleId]
  )
  const materials = useFinancialMaterials(settings.materialVariant)

  return (
    <group position={[0, 0, 0]}>
      {renderOrder.map((slot) => {
        const geometry = preview.writer.toGeometries()[slot]
        if (!geometry) return null
        return <mesh key={slot} geometry={geometry} material={materials[slot]} castShadow receiveShadow />
      })}
    </group>
  )
}
