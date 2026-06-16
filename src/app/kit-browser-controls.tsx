import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { buildKitModulePreview } from '../kit/build-kit-module'
import { financialCoreModules } from '../kit/financial-core-kit'
import type { KitModuleId } from '../kit/kit-types'
import { setSelectedModuleId } from '../state/building-actions'
import { buildingState } from '../state/building-state'

export function KitBrowserControls() {
  const settings = useSnapshot(buildingState)
  const selected = financialCoreModules.find((module) => module.id === settings.selectedModuleId)
  const preview = useMemo(
    () => buildKitModulePreview(settings.selectedModuleId),
    [settings.selectedModuleId]
  )
  return (
    <>
      <select value={settings.selectedModuleId} onChange={(event) => setSelectedModuleId(event.currentTarget.value as KitModuleId)}>
        {financialCoreModules.map((module) => (
          <option key={module.id} value={module.id}>{module.label}</option>
        ))}
      </select>
      <div className="module-detail">
        <strong>{selected?.label}</strong>
        <span>{selected?.description}</span>
        <span>{Math.round(preview.triangles).toLocaleString()} triangles</span>
        <span>{selected?.defaultSize.width}m x {selected?.defaultSize.height}m x {selected?.defaultSize.depth}m</span>
      </div>
    </>
  )
}
