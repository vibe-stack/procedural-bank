import { createCrownPlacements } from './crown-grammar'
import { createPodiumPlacements } from './podium-grammar'
import { createRoofPlacements } from './roof-grammar'
import { createShaftPlacements } from './shaft-grammar'
import { facadeSides } from './placement-factory'
import type { BuildingSettings, BuildingTier, KitPlacement } from '../kit/kit-types'

export function createKitPlacements(
  settings: BuildingSettings,
  tiers: BuildingTier[]
): KitPlacement[] {
  const placements = tiers.flatMap((tier) =>
    facadeSides.flatMap((side) => {
      if (tier.role === 'podium') return createPodiumPlacements(settings, tier, side)
      if (tier.role === 'crown') return createCrownPlacements(settings, tier, side)
      return createShaftPlacements(settings, tier, side)
    })
  )
  for (const tier of roofHostTiers(tiers)) placements.push(...createRoofPlacements(settings, tier))
  return placements
}

function roofHostTiers(tiers: BuildingTier[]): BuildingTier[] {
  const crowns = topTiers(tiers.filter((tier) => tier.role === 'crown'))
  if (crowns.length > 0) return crowns
  return topTiers(tiers.filter((tier) => tier.role === 'shaft' || tier.role === 'bridge'))
}

function topTiers(tiers: BuildingTier[]): BuildingTier[] {
  if (tiers.length === 0) return []
  const maxTop = Math.max(...tiers.map((tier) => tier.y0 + tier.height))
  return tiers.filter((tier) => Math.abs(tier.y0 + tier.height - maxTop) < 0.001)
}
