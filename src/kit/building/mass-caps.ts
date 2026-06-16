import type { BuildingTier } from '../kit-types'
import { roofMetal, stoneDark } from '../shared/colors'
import type { KitMeshWriter } from '../shared/mesh-writer'

export function appendMassCaps(writer: KitMeshWriter, tiers: BuildingTier[]): void {
  for (const tier of tiers) appendTierSoffit(writer, tier)
  for (const tier of tiers) {
    if (tier.role === 'shaft') continue
    appendTierDeck(writer, tier, tier.role === 'crown')
  }
  appendSameLevelConnectors(writer, tiers)
}

function appendTierSoffit(writer: KitMeshWriter, tier: BuildingTier): void {
  if (tier.y0 <= 0.001) return
  const y0 = tier.y0 - 0.16
  const y1 = tier.y0
  const x0 = tier.x - tier.width / 2
  const x1 = tier.x + tier.width / 2
  const z0 = tier.z - tier.depth / 2
  const z1 = tier.z + tier.depth / 2
  writer.appendBox('limestone', [x0, y0, z0], [x1, y1, z1], stoneDark)
  writer.appendBox('limestone', [x0, y0 - 0.16, z1 - 0.22], [x1, y1, z1 + 0.08], stoneDark)
  writer.appendBox('limestone', [x0, y0 - 0.16, z0 - 0.08], [x1, y1, z0 + 0.22], stoneDark)
  writer.appendBox('limestone', [x1 - 0.22, y0 - 0.16, z0], [x1 + 0.08, y1, z1], stoneDark)
  writer.appendBox('limestone', [x0 - 0.08, y0 - 0.16, z0], [x0 + 0.22, y1, z1], stoneDark)
}

function appendTierDeck(
  writer: KitMeshWriter,
  tier: BuildingTier,
  roof: boolean
): void {
  const y = tier.y0 + tier.height
  const deckTop = y - 0.035
  writer.appendBox(
    roof ? 'roof' : 'limestone',
    [tier.x - tier.width / 2, y - 0.14, tier.z - tier.depth / 2],
    [tier.x + tier.width / 2, deckTop, tier.z + tier.depth / 2],
    roof ? roofMetal : stoneDark
  )
  appendDeckEdges(writer, tier, deckTop, roof)
}

function appendSameLevelConnectors(writer: KitMeshWriter, tiers: BuildingTier[]): void {
  const levels = new Map<string, BuildingTier[]>()
  for (const tier of tiers) {
    const key = `${tier.role}:${tier.y0}:${tier.height}`
    levels.set(key, [...(levels.get(key) ?? []), tier])
  }

  for (const group of levels.values()) {
    if (group.length < 2) continue
    for (let a = 0; a < group.length; a++) {
      for (let b = a + 1; b < group.length; b++) appendConnector(writer, group[a], group[b])
    }
  }
}

function appendConnector(writer: KitMeshWriter, a: BuildingTier, b: BuildingTier): void {
  const y = a.y0 + a.height
  const slabY0 = y - 0.16
  const slabY1 = y - 0.035
  const ax0 = a.x - a.width / 2
  const ax1 = a.x + a.width / 2
  const az0 = a.z - a.depth / 2
  const az1 = a.z + a.depth / 2
  const bx0 = b.x - b.width / 2
  const bx1 = b.x + b.width / 2
  const bz0 = b.z - b.depth / 2
  const bz1 = b.z + b.depth / 2

  if (almostEqual(az0, bz1) || almostEqual(az1, bz0)) {
    const x0 = Math.max(ax0, bx0)
    const x1 = Math.min(ax1, bx1)
    if (x1 <= x0) return
    const z = almostEqual(az0, bz1) ? az0 : az1
    writer.appendBox('limestone', [x0, slabY0, z - 0.18], [x1, slabY1, z + 0.18], stoneDark)
  }

  if (almostEqual(ax0, bx1) || almostEqual(ax1, bx0)) {
    const z0 = Math.max(az0, bz0)
    const z1 = Math.min(az1, bz1)
    if (z1 <= z0) return
    const x = almostEqual(ax0, bx1) ? ax0 : ax1
    writer.appendBox('limestone', [x - 0.18, slabY0, z0], [x + 0.18, slabY1, z1], stoneDark)
  }
}

function almostEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001
}

function appendDeckEdges(writer: KitMeshWriter, tier: BuildingTier, y: number, roof: boolean): void {
  const slot = roof ? 'roof' : 'limestone'
  const color = roof ? roofMetal : stoneDark
  const x0 = tier.x - tier.width / 2
  const x1 = tier.x + tier.width / 2
  const z0 = tier.z - tier.depth / 2
  const z1 = tier.z + tier.depth / 2
  writer.appendBox(slot, [x0, y, z1 - 0.18], [x1, y + 0.34, z1 + 0.12], color)
  writer.appendBox(slot, [x0, y, z0 - 0.12], [x1, y + 0.34, z0 + 0.18], color)
  writer.appendBox(slot, [x1 - 0.18, y, z0], [x1 + 0.12, y + 0.34, z1], color)
  writer.appendBox(slot, [x0 - 0.12, y, z0], [x0 + 0.18, y + 0.34, z1], color)
  writer.appendBox('granite', [x0 + 0.3, y + 0.02, z1 - 0.08], [x1 - 0.3, y + 0.08, z1 + 0.02], stoneDark)
}
