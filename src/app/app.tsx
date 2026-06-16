import { Leva, LevaPanel, useCreateStore } from 'leva'
import { BuildingLevaControls } from './building-leva-controls'
import { BuildingCanvas } from './building-canvas'
import { RenderingControls } from './rendering-controls'

export function App() {
  const buildingStore = useCreateStore()

  return (
    <main className="app-shell">
      <BuildingCanvas />
      <BuildingLevaControls store={buildingStore} />
      <RenderingControls />
      <aside className="leva-left-panel">
        <LevaPanel
          store={buildingStore}
          fill
          flat
          oneLineLabels
          titleBar={{ title: 'Building Kit', drag: false, filter: false }}
        />
      </aside>
      <Leva collapsed titleBar={{ title: 'Rendering', drag: true, filter: false }} />
    </main>
  )
}
