import type { KitModuleId, KitPlacement } from '../kit/kit-types'
import { financialCoreModules } from '../kit/financial-core-kit'
import { missingKitModuleIds } from '../kit/module-registry'

export function assertGeneratorInvariants(placements: KitPlacement[]): void {
  const missing = missingKitModuleIds()
  if (missing.length > 0) {
    throw new Error(`Financial core kit is missing module builders: ${missing.join(', ')}`)
  }

  const duplicates = duplicateSurfaceOwners(placements)
  if (duplicates.length > 0) {
    throw new Error(`Duplicate facade surface owner regions: ${duplicates.join(', ')}`)
  }
}

export function duplicateSurfaceOwners(placements: KitPlacement[]): string[] {
  const owners = new Set<string>()
  const duplicates = new Set<string>()
  for (const placement of placements) {
    if (placement.side === 'roof') continue
    const key = surfaceKey(placement)
    if (owners.has(key)) duplicates.add(key)
    owners.add(key)
  }
  return [...duplicates]
}

export function unusedModuleIds(placements: KitPlacement[]): KitModuleId[] {
  const used = new Set(placements.map((placement) => placement.id))
  return financialCoreModules
    .map((module) => module.id)
    .filter((id) => !used.has(id))
}

function surfaceKey(placement: KitPlacement): string {
  return [
    placement.side,
    placement.tierName,
    placement.edgeId ?? 'whole-side',
    rounded(placement.xOffset ?? 0),
    rounded(placement.zOffset ?? 0),
    rounded(placement.center - placement.width / 2),
    rounded(placement.center + placement.width / 2),
    rounded(placement.y),
    rounded(placement.y + placement.height),
    rounded(placement.normalOffset ?? 0),
  ].join(':')
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100
}
