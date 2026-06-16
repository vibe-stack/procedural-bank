import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { buildKitModulePreview } from '../kit/build-kit-module'
import { financialCoreModules, kitGroups } from '../kit/financial-core-kit'
import { setActiveTab, setSelectedModuleId } from '../state/building-actions'
import { buildingState } from '../state/building-state'

export function KitLibraryPanel() {
  const settings = useSnapshot(buildingState)
  const triangles = useMemo(
    () => Object.fromEntries(
      financialCoreModules.map((module) => [
        module.id,
        buildKitModulePreview(module.id).triangles,
      ])
    ),
    []
  )
  return (
    <aside className="panel kit-panel">
      <h2>Kit Modules</h2>
      {kitGroups.map((group) => (
        <section key={group}>
          <h3>{group}</h3>
          <div className="module-list">
            {financialCoreModules
              .filter((module) => module.group === group)
              .map((module) => (
                <button
                  key={module.id}
                  className={module.id === settings.selectedModuleId ? 'module-item selected' : 'module-item'}
                  type="button"
                  onClick={() => {
                    setSelectedModuleId(module.id)
                    setActiveTab('kit-browser')
                  }}>
                  <strong>{module.label}</strong>
                  <span>{module.quality}</span>
                  <span>{Math.round(Number(triangles[module.id])).toLocaleString()} tris</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </aside>
  )
}
