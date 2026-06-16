import { useSnapshot } from 'valtio'
import type { AppTab } from '../kit/kit-types'
import { setActiveTab } from '../state/building-actions'
import { buildingState } from '../state/building-state'

const tabs: { id: AppTab; label: string }[] = [
  { id: 'building', label: 'Building' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'diagnostics', label: 'Diagnostics' },
]

export function TabBar() {
  const settings = useSnapshot(buildingState)
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={settings.activeTab === tab.id ? 'active' : ''}
          type="button"
          onClick={() => setActiveTab(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
