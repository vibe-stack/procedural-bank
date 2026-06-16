import type * as THREE from 'three/webgpu'

export type MaterialSlot =
  | 'limestone'
  | 'granite'
  | 'terra-cotta'
  | 'glass'
  | 'bronze'
  | 'black-metal'
  | 'ornament'
  | 'roof'

export type FacadeSide = 'front' | 'back' | 'left' | 'right'

export type KitGroup = 'base' | 'shaft' | 'trim' | 'crown' | 'roof'

export type KitModuleId =
  | 'round-column'
  | 'square-column'
  | 'paired-column'
  | 'tall-lobby-window'
  | 'lobby-door'
  | 'revolving-door-bay'
  | 'service-door'
  | 'loading-dock-bay'
  | 'granite-plinth'
  | 'corner-entrance'
  | 'window-3m'
  | 'window-4m'
  | 'double-window-bay'
  | 'blank-bay'
  | 'corner-bay'
  | 'vertical-pilaster-strip'
  | 'spandrel-panel'
  | 'floor-band-strip'
  | 'belt-course-small'
  | 'belt-course-large'
  | 'window-sill-strip'
  | 'lintel-strip'
  | 'small-cornice'
  | 'large-cornice'
  | 'corner-cornice'
  | 'belt-corner-joint'
  | 'cornice-corner-joint'
  | 'crown-window-bay'
  | 'parapet-section'
  | 'corner-parapet'
  | 'attic-crest-panel'
  | 'crown-pediment'
  | 'corner-finial'
  | 'crown-urn-finial'
  | 'crown-obelisk-finial'
  | 'crown-pillar-finial'
  | 'crown-cartouche-panel'
  | 'colossal-column'
  | 'square-corner-pylon'
  | 'triangular-pediment'
  | 'pediment-eagle'
  | 'acroterion-scroll'
  | 'company-frieze'
  | 'clock-medallion'
  | 'central-glass-shaft'
  | 'solid-side-pier'
  | 'buttress-pier'
  | 'pilaster-bundle'
  | 'recessed-window-slot'
  | 'arched-window-bay'
  | 'arcade-bay'
  | 'brick-window-bay'
  | 'rusticated-base-block'
  | 'bank-grille'
  | 'barred-window'
  | 'storefront-curtain-wall'
  | 'security-door'
  | 'wall-plaque'
  | 'address-plaque'
  | 'flag-mount'
  | 'bollard'
  | 'wall-camera'
  | 'wall-lamp'
  | 'sidewalk-entry'
  | 'deep-window-well'
  | 'carved-spandrel-vine'
  | 'dentil-corbel-course'
  | 'wrapped-corner-pier'
  | 'rounded-corner-pier'
  | 'structural-blank-wall'
  | 'sloped-metal-roof'
  | 'roof-statue-mast'
  | 'roof-lantern'
  | 'roof-crest'
  | 'roof-mech-box'
  | 'hvac-cluster'
  | 'roof-railing'
  | 'antenna'

export type BayKind =
  | 'lobby-door'
  | 'revolving-door'
  | 'service-door'
  | 'loading-dock'
  | 'window-3m'
  | 'window-4m'
  | 'double-window'
  | 'blank'
  | 'corner'
  | 'crown-window'

export type BuildingVariant = 'classic-bank' | 'setback-tower' | 'corner-hq'

export type MaterialVariant =
  | 'light-limestone'
  | 'dark-granite'
  | 'aged-terra-cotta'

export type DebugMode = 'beauty' | 'topology' | 'facade-ids'

export type AppTab = 'building' | 'kit-browser' | 'grammar' | 'diagnostics'

export type PodiumStyle = 'colonnade' | 'corner-entrance' | 'service-bank'

export type EntranceType = 'center-revolving' | 'paired-lobby' | 'corner-bank'

export type ShaftRhythm = 'regular' | 'paired' | 'chicago-grid'

export type CrownStyle = 'flat-parapet' | 'windowed-crown' | 'corner-parapets'

export type FootprintStyle = 'rectangle' | 'l-shape' | 't-shape' | 'u-shape' | 'courtyard-block' | 'high-rise-block'

export type MassingPattern =
  | 'single-tower'
  | 'outer-ring'
  | 'twin-towers'

export type FootprintHeightMode =
  | 'full-height'
  | 'lower-tiers-only'
  | 'podium-only'

export type HardInsetSide =
  | 'none'
  | 'front'
  | 'back'
  | 'left'
  | 'right'

export type BuildingArchetype =
  | 'board-of-trade-tower'
  | 'temple-bank-podium'
  | 'terra-cotta-arcade'
  | 'high-rise-pyramid'
  | 'federal-fortress'

export type RoofStyle =
  | 'flat-terrace'
  | 'pyramidal-metal'
  | 'statue-tower'
  | 'service-penthouse'

export type CornerTreatment =
  | 'square-piers'
  | 'rounded-piers'

export type CrownDecorationStyle =
  | 'restrained'
  | 'classical'
  | 'skyline'

export type CrownFinialRhythm =
  | 'corners-only'
  | 'edge-sparse'
  | 'edge-regular'
  | 'edge-dense'
  | 'skyline-spikes'

export type BuildingSettings = {
  seed: number
  variant: BuildingVariant
  widthBays: number
  depthBays: number
  floors: number
  podiumFloors: number
  setbackFloors: number
  towerScale: number
  ornamentDensity: number
  colonnade: boolean
  cornerEntrance: boolean
  crown: boolean
  materialVariant: MaterialVariant
  debugMode: DebugMode
  activeTab: AppTab
  selectedModuleId: KitModuleId
  podiumStyle: PodiumStyle
  entranceType: EntranceType
  shaftRhythm: ShaftRhythm
  crownStyle: CrownStyle
  roofEquipmentDensity: number
  massingPattern: MassingPattern
  footprintStyle: FootprintStyle
  secondaryFootprintStyle: FootprintStyle
  footprintHeightMode: FootprintHeightMode
  hardInsetSide: HardInsetSide
  hardInsetAmount: number
  innerCourtWidth: number
  innerCourtDepth: number
  innerCourtOffsetX: number
  innerCourtOffsetZ: number
  skybridgeEnabled: boolean
  skybridgeFloor: number
  buildingArchetype: BuildingArchetype
  roofStyle: RoofStyle
  porticoProjection: number
  centralAxisBays: number
  cornerTreatment: CornerTreatment
  crownDecorationStyle: CrownDecorationStyle
  crownDecorationDensity: number
  crownFinialRhythm: CrownFinialRhythm
  crownFinialDensity: number
}

export type FacadeBayPlan = {
  kind: BayKind
  side: FacadeSide
  tierName: string
  alongStart: number
  alongEnd: number
  y0: number
  y1: number
  floorIndex: number
  bayIndex: number
  isCorner: boolean
}

export type BuildingTier = {
  name: string
  role: 'podium' | 'shaft' | 'crown' | 'bridge'
  width: number
  depth: number
  x: number
  z: number
  y0: number
  height: number
  floors: number
  inset: number
  facadeSides?: FacadeSide[]
  facadeEdges?: FacadeEdge[]
}

export type FacadeEdge = {
  id: string
  side: FacadeSide
  center: number
  length: number
  x: number
  z: number
  isOuterCornerStart: boolean
  isOuterCornerEnd: boolean
  isInnerCornerStart: boolean
  isInnerCornerEnd: boolean
}

export type BuildingPlan = {
  settings: BuildingSettings
  bayWidth: number
  floorHeight: number
  tiers: BuildingTier[]
  bays: FacadeBayPlan[]
  placements: KitPlacement[]
  diagnostics: GeneratorDiagnostics
}

export type GeometrySet = Record<MaterialSlot, THREE.BufferGeometry | null>

export type GeneratedBuilding = {
  geometries: GeometrySet
  triangleCount: number
  moduleCount: number
  plan: BuildingPlan
  moduleUsage: Partial<Record<KitModuleId, number>>
}

export type KitModule = {
  id: KitModuleId
  label: string
  group: KitGroup
  description: string
  implemented: boolean
  quality: 'draft' | 'kit-ready' | 'aaa-target'
  defaultSize: KitModuleSize
}

export type KitModuleSize = {
  width: number
  height: number
  depth: number
}

export type KitPlacement = {
  id: KitModuleId
  side: FacadeSide | 'roof'
  tierName: string
  center: number
  roofZ?: number
  y: number
  width: number
  height: number
  depth: number
  floorIndex: number
  bayIndex: number
  edgeId?: string
  xOffset?: number
  zOffset?: number
  normalOffset?: number
  moduleVariant?: string
}

export type GeneratorDiagnostics = {
  duplicateSurfaceOwners: string[]
  missingModuleIds: KitModuleId[]
  unusedModuleIds: KitModuleId[]
}
