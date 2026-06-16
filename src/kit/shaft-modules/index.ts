import type { KitModuleRuntime } from '../shared/module-api'
import {
  doubleWindowBayModule,
  window3mModule,
  window4mModule,
} from './windows'
import {
  blankBayModule,
  cornerBayModule,
  floorBandStripModule,
  spandrelPanelModule,
  verticalPilasterStripModule,
} from './panels'
import {
  arcadeBayModule,
  archedWindowBayModule,
  brickWindowBayModule,
  buttressPierModule,
  carvedSpandrelVineModule,
  centralGlassShaftModule,
  deepWindowWellModule,
  pilasterBundleModule,
  recessedWindowSlotModule,
  roundedCornerPierModule,
  solidSidePierModule,
  structuralBlankWallModule,
  wrappedCornerPierModule,
} from './advanced'

export const shaftModuleRuntimes: KitModuleRuntime[] = [
  { id: 'window-3m', builder: window3mModule, slots: ['limestone', 'glass', 'bronze', 'ornament'] },
  { id: 'window-4m', builder: window4mModule, slots: ['limestone', 'glass', 'bronze', 'ornament'] },
  { id: 'double-window-bay', builder: doubleWindowBayModule, slots: ['limestone', 'glass', 'bronze', 'ornament'] },
  { id: 'blank-bay', builder: blankBayModule, slots: ['limestone'] },
  { id: 'corner-bay', builder: cornerBayModule, slots: ['limestone', 'glass', 'bronze', 'ornament'] },
  { id: 'vertical-pilaster-strip', builder: verticalPilasterStripModule, slots: ['limestone'] },
  { id: 'spandrel-panel', builder: spandrelPanelModule, slots: ['limestone', 'ornament'] },
  { id: 'floor-band-strip', builder: floorBandStripModule, slots: ['limestone', 'ornament'] },
  { id: 'central-glass-shaft', builder: centralGlassShaftModule, slots: ['limestone', 'glass', 'bronze', 'black-metal'] },
  { id: 'solid-side-pier', builder: solidSidePierModule, slots: ['limestone'] },
  { id: 'buttress-pier', builder: buttressPierModule, slots: ['limestone'] },
  { id: 'pilaster-bundle', builder: pilasterBundleModule, slots: ['limestone'] },
  { id: 'recessed-window-slot', builder: recessedWindowSlotModule, slots: ['limestone', 'glass', 'black-metal'] },
  { id: 'arched-window-bay', builder: archedWindowBayModule, slots: ['limestone', 'glass', 'bronze', 'black-metal'] },
  { id: 'arcade-bay', builder: arcadeBayModule, slots: ['limestone', 'terra-cotta', 'glass', 'bronze', 'black-metal'] },
  { id: 'brick-window-bay', builder: brickWindowBayModule, slots: ['terra-cotta', 'limestone', 'glass', 'bronze', 'ornament'] },
  { id: 'deep-window-well', builder: deepWindowWellModule, slots: ['limestone', 'glass', 'bronze', 'ornament'] },
  { id: 'carved-spandrel-vine', builder: carvedSpandrelVineModule, slots: ['limestone', 'ornament'] },
  { id: 'wrapped-corner-pier', builder: wrappedCornerPierModule, slots: ['limestone'] },
  { id: 'rounded-corner-pier', builder: roundedCornerPierModule, slots: ['limestone'] },
  { id: 'structural-blank-wall', builder: structuralBlankWallModule, slots: ['limestone'] },
]
