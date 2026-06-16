import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { BuildingControls } from './building-controls'
import { DiagnosticsControls } from './diagnostics-controls'
import { GrammarControls } from './grammar-controls'
import { KitBrowserControls } from './kit-browser-controls'
import { TabBar } from './tab-bar'
import { generateFinancialBuilding } from '../kit/building/building-generator'
import type { BuildingVariant, MaterialVariant } from '../kit/kit-types'
import { setMaterialVariant, setVariant } from '../state/building-actions'
import { buildingState } from '../state/building-state'

export function InspectorPanel() {
  const settings = useSnapshot(buildingState)
  const metrics = useMemo(() => generateFinancialBuilding({ ...settings }), [settings])

  return (
    <aside className="panel inspector-panel">
      <div className="panel-header">
        <div>
          <p>Financial Core Kit</p>
          <h1>Procedural Building Lab</h1>
        </div>
      </div>
      <TabBar />
      <div className="stats-grid">
        <span>{metrics.moduleCount} placements</span>
        <span>{Math.round(metrics.triangleCount).toLocaleString()} tris</span>
        <span>{metrics.plan.tiers.length} mass tiers</span>
      </div>
      <select value={settings.variant} onChange={(event) => setVariant(event.currentTarget.value as BuildingVariant)}>
        <option value="classic-bank">Classic bank</option>
        <option value="setback-tower">Setback tower</option>
        <option value="corner-hq">Corner HQ</option>
      </select>
      <select value={settings.materialVariant} onChange={(event) => setMaterialVariant(event.currentTarget.value as MaterialVariant)}>
        <option value="light-limestone">Light limestone</option>
        <option value="dark-granite">Dark granite</option>
        <option value="aged-terra-cotta">Aged terra-cotta</option>
      </select>
      {settings.activeTab === 'building' && <BuildingControls />}
      {settings.activeTab === 'kit-browser' && <KitBrowserControls />}
      {settings.activeTab === 'grammar' && <GrammarControls />}
      {settings.activeTab === 'diagnostics' && <DiagnosticsControls />}
    </aside>
  )
}
