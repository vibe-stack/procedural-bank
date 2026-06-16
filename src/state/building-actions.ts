import { buildingState } from './building-state'
import type {
  AppTab,
  BuildingArchetype,
  BuildingVariant,
  CornerTreatment,
  CrownDecorationStyle,
  CrownFinialRhythm,
  CrownStyle,
  DebugMode,
  EntranceType,
  FootprintHeightMode,
  FootprintStyle,
  HardInsetSide,
  KitModuleId,
  MassingPattern,
  MaterialVariant,
  PodiumStyle,
  RoofStyle,
  ShaftRhythm,
} from '../kit/kit-types'

export function randomizeSeed(): void {
  buildingState.seed = Math.floor(Math.random() * 99999)
}

export function setNumberSetting(
  key: 'seed' | 'widthBays' | 'depthBays' | 'floors' | 'podiumFloors' | 'setbackFloors' | 'towerScale' | 'ornamentDensity' | 'roofEquipmentDensity' | 'porticoProjection' | 'centralAxisBays' | 'crownDecorationDensity' | 'crownFinialDensity' | 'hardInsetAmount' | 'innerCourtWidth' | 'innerCourtDepth' | 'innerCourtOffsetX' | 'innerCourtOffsetZ' | 'skybridgeFloor',
  value: number
): void {
  buildingState[key] = value
}

export function setBooleanSetting(
  key: 'colonnade' | 'cornerEntrance' | 'crown' | 'skybridgeEnabled',
  value: boolean
): void {
  buildingState[key] = value
}

export function setVariant(value: BuildingVariant): void {
  buildingState.variant = value
}

export function setMaterialVariant(value: MaterialVariant): void {
  buildingState.materialVariant = value
}

export function setDebugMode(value: DebugMode): void {
  buildingState.debugMode = value
}

export function setActiveTab(value: AppTab): void {
  buildingState.activeTab = value
}

export function setSelectedModuleId(value: KitModuleId): void {
  buildingState.selectedModuleId = value
}

export function setPodiumStyle(value: PodiumStyle): void {
  buildingState.podiumStyle = value
}

export function setEntranceType(value: EntranceType): void {
  buildingState.entranceType = value
}

export function setShaftRhythm(value: ShaftRhythm): void {
  buildingState.shaftRhythm = value
}

export function setCrownStyle(value: CrownStyle): void {
  buildingState.crownStyle = value
}

export function setFootprintStyle(value: FootprintStyle): void {
  buildingState.footprintStyle = value
}

export function setSecondaryFootprintStyle(value: FootprintStyle): void {
  buildingState.secondaryFootprintStyle = value
}

export function setMassingPattern(value: MassingPattern): void {
  buildingState.massingPattern = value
}

export function setFootprintHeightMode(value: FootprintHeightMode): void {
  buildingState.footprintHeightMode = value
}

export function setHardInsetSide(value: HardInsetSide): void {
  buildingState.hardInsetSide = value
}

export function setBuildingArchetype(value: BuildingArchetype): void {
  buildingState.buildingArchetype = value
}

export function setRoofStyle(value: RoofStyle): void {
  buildingState.roofStyle = value
}

export function setCornerTreatment(value: CornerTreatment): void {
  buildingState.cornerTreatment = value
}

export function setCrownDecorationStyle(value: CrownDecorationStyle): void {
  buildingState.crownDecorationStyle = value
}

export function setCrownFinialRhythm(value: CrownFinialRhythm): void {
  buildingState.crownFinialRhythm = value
}
