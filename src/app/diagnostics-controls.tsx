import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { generateFinancialBuilding } from '../kit/building/building-generator'
import type { DebugMode } from '../kit/kit-types'
import { setDebugMode } from '../state/building-actions'
import { buildingState } from '../state/building-state'

export function DiagnosticsControls() {
  const settings = useSnapshot(buildingState)
  const generated = useMemo(() => generateFinancialBuilding({ ...settings }), [settings])
  return (
    <>
      <select value={settings.debugMode} onChange={(event) => setDebugMode(event.currentTarget.value as DebugMode)}>
        <option value="beauty">Beauty</option>
        <option value="topology">Topology blocks</option>
        <option value="facade-ids">Facade IDs</option>
      </select>
      <div className="diagnostic-list">
        <span>{generated.plan.placements.length} placements</span>
        <span>{generated.plan.diagnostics.missingModuleIds.length} missing builders</span>
        <span>{generated.plan.diagnostics.duplicateSurfaceOwners.length} duplicate owner regions</span>
        <span>{Object.values(generated.moduleUsage).filter((count) => count && count > 0).length} kit items used</span>
        <span>{generated.plan.diagnostics.unusedModuleIds.length} unused kit items</span>
      </div>
      {generated.plan.diagnostics.unusedModuleIds.length > 0 && (
        <div className="module-detail">
          <strong>Unused in current grammar</strong>
          <p>{generated.plan.diagnostics.unusedModuleIds.join(', ')}</p>
        </div>
      )}
    </>
  )
}
