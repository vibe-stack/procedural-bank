import { createKitPlacements } from './facade-grammar'
import {
  assertGeneratorInvariants,
  duplicateSurfaceOwners,
  unusedModuleIds,
} from './generator-assertions'
import { BAY_WIDTH, FLOOR_HEIGHT, createMassTiers } from './mass-grammar'
import type {
  BuildingPlan,
  BuildingSettings,
  FacadeBayPlan,
  KitPlacement,
} from '../kit/kit-types'
import { missingKitModuleIds } from '../kit/module-registry'

export function createFinancialBuildingPlan(
  settings: BuildingSettings
): BuildingPlan {
  const tiers = createMassTiers(settings)
  const placements = createKitPlacements(settings, tiers)
  assertGeneratorInvariants(placements)
  return {
    settings,
    bayWidth: BAY_WIDTH,
    floorHeight: FLOOR_HEIGHT,
    tiers,
    bays: legacyBays(placements),
    placements,
    diagnostics: {
      duplicateSurfaceOwners: duplicateSurfaceOwners(placements),
      missingModuleIds: missingKitModuleIds(),
      unusedModuleIds: unusedModuleIds(placements),
    },
  }
}

function legacyBays(placements: KitPlacement[]): FacadeBayPlan[] {
  return placements
    .filter((placement) => placement.side !== 'roof')
    .map((placement) => ({
      kind: 'blank',
      side: placement.side as FacadeBayPlan['side'],
      tierName: placement.tierName,
      alongStart: placement.center - placement.width / 2,
      alongEnd: placement.center + placement.width / 2,
      y0: placement.y,
      y1: placement.y + placement.height,
      floorIndex: placement.floorIndex,
      bayIndex: placement.bayIndex,
      isCorner: placement.id.includes('corner'),
    }))
}
