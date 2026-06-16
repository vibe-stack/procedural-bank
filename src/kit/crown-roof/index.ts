import type { KitModuleRuntime } from '../shared/module-api'
import { cornerParapetModule, crownWindowBayModule, parapetSectionModule } from './crown'
import { antennaModule, hvacClusterModule, roofMechBoxModule, roofRailingModule } from './roof-props'
import { roofCrestModule, roofLanternModule, roofStatueMastModule, slopedMetalRoofModule } from './roof-architecture'
import {
  atticCrestPanelModule,
  cornerFinialModule,
  crownCartouchePanelModule,
  crownObeliskFinialModule,
  crownPillarFinialModule,
  crownPedimentModule,
  crownUrnFinialModule,
} from './top-ornaments'

export const crownRoofRuntimes: KitModuleRuntime[] = [
  { id: 'crown-window-bay', builder: crownWindowBayModule, slots: ['limestone', 'glass', 'bronze'] },
  { id: 'parapet-section', builder: parapetSectionModule, slots: ['limestone', 'ornament'] },
  { id: 'corner-parapet', builder: cornerParapetModule, slots: ['limestone', 'ornament'] },
  { id: 'attic-crest-panel', builder: atticCrestPanelModule, slots: ['limestone', 'ornament'] },
  { id: 'crown-pediment', builder: crownPedimentModule, slots: ['limestone', 'ornament'] },
  { id: 'corner-finial', builder: cornerFinialModule, slots: ['limestone'] },
  { id: 'crown-urn-finial', builder: crownUrnFinialModule, slots: ['limestone'] },
  { id: 'crown-obelisk-finial', builder: crownObeliskFinialModule, slots: ['limestone'] },
  { id: 'crown-pillar-finial', builder: crownPillarFinialModule, slots: ['limestone'] },
  { id: 'crown-cartouche-panel', builder: crownCartouchePanelModule, slots: ['limestone', 'ornament'] },
  { id: 'sloped-metal-roof', builder: slopedMetalRoofModule, slots: ['roof'] },
  { id: 'roof-statue-mast', builder: roofStatueMastModule, slots: ['limestone', 'bronze'] },
  { id: 'roof-lantern', builder: roofLanternModule, slots: ['black-metal'] },
  { id: 'roof-crest', builder: roofCrestModule, slots: ['limestone', 'bronze', 'ornament'] },
  { id: 'roof-mech-box', builder: roofMechBoxModule, slots: ['roof', 'black-metal'] },
  { id: 'hvac-cluster', builder: hvacClusterModule, slots: ['roof', 'black-metal'] },
  { id: 'roof-railing', builder: roofRailingModule, slots: ['bronze'] },
  { id: 'antenna', builder: antennaModule, slots: ['black-metal', 'bronze'] },
]
