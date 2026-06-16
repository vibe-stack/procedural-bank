import { edgeBayCenter, edgeBayCount, exposedEdges, place } from './placement-factory'
import type {
  BuildingSettings,
  BuildingTier,
  FacadeEdge,
  FacadeSide,
  KitModuleId,
  KitPlacement,
} from '../kit/kit-types'

export function createCrownPlacements(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide
): KitPlacement[] {
  return exposedEdges(tier, side).flatMap((edge) => createCrownEdgePlacements(settings, tier, side, edge))
}

function createCrownEdgePlacements(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge
): KitPlacement[] {
  const count = edgeBayCount(edge, 3)
  const bay = edge.length / count
  const result: KitPlacement[] = []

  for (let index = 0; index < count; index++) {
    const id = crownModule(settings, side, index, count)
    result.push(place({
      id,
      side,
      tier,
      center: edgeBayCenter(edge, index, count),
      y: tier.y0,
      width: bay,
      height: tier.height,
      depth: id === 'corner-parapet' ? 1.16 : 0.92,
      floorIndex: 0,
      bayIndex: index,
      edge,
    }))
  }

  result.push(...crownTrim(tier, side, edge))
  result.push(...crownTopOrnaments(settings, tier, side, edge))
  return result
}

function crownModule(
  settings: BuildingSettings,
  side: FacadeSide,
  index: number,
  count: number
): KitModuleId {
  const edge = index === 0 || index === count - 1
  if (edge && settings.crownStyle !== 'flat-parapet') return 'corner-parapet'
  if (settings.crownStyle === 'flat-parapet') return edge ? 'corner-parapet' : 'parapet-section'
  if (settings.crownStyle === 'corner-parapets' && index % 2 === 0) return 'parapet-section'
  if (side === 'back' && index % 3 === 1) return 'parapet-section'
  return 'crown-window-bay'
}

function crownTrim(tier: BuildingTier, side: FacadeSide, edge: FacadeEdge): KitPlacement[] {
  const span = edge.length
  return [
    place({
      id: 'small-cornice',
      side,
      tier,
      center: edge.center,
      y: tier.y0 - 0.26,
      width: span,
      height: 0.36,
      depth: 0.62,
      floorIndex: -1,
      bayIndex: -1,
      edge,
    }),
    place({
      id: 'large-cornice',
      side,
      tier,
      center: edge.center,
      y: tier.y0 + tier.height - 0.74,
      width: span,
      height: 0.8,
      depth: 1.06,
      floorIndex: 0,
      bayIndex: -2,
      edge,
    }),
    place({
      id: 'corner-cornice',
      side,
      tier,
      center: edge.center - span / 2 + 0.72,
      y: tier.y0 + tier.height - 0.82,
      width: 1.44,
      height: 0.86,
      depth: 1.14,
      floorIndex: 0,
      bayIndex: -3,
      edge,
    }),
    place({
      id: 'corner-cornice',
      side,
      tier,
      center: edge.center + span / 2 - 0.72,
      y: tier.y0 + tier.height - 0.82,
      width: 1.44,
      height: 0.86,
      depth: 1.14,
      floorIndex: 0,
      bayIndex: -4,
      edge,
    }),
    ...cornerTrimJoints(tier, side, edge, tier.y0 - 0.24, 'belt-corner-joint', 0.62),
    ...cornerTrimJoints(tier, side, edge, tier.y0 + tier.height - 0.78, 'cornice-corner-joint', 1.0),
  ]
}

function crownTopOrnaments(settings: BuildingSettings, tier: BuildingTier, side: FacadeSide, edge: FacadeEdge): KitPlacement[] {
  const span = edge.length
  const count = Math.max(1, Math.round((span / 4) * settings.crownDecorationDensity))
  const panelWidth = span / count
  const y = tier.y0 + tier.height - 0.02
  const result: KitPlacement[] = []

  for (let index = 0; index < count; index++) {
    const id = crownDecorationPanel(settings, index)
    result.push(place({
      id,
      side,
      tier,
      center: edge.center - span / 2 + panelWidth * (index + 0.5),
      y,
      width: panelWidth,
      height: id === 'crown-cartouche-panel' ? 1.25 : 1.0,
      depth: 0.84,
      floorIndex: 1,
      bayIndex: index,
      edge,
    }))
  }

  if ((side === 'front' || side === 'back') && settings.crownStyle !== 'flat-parapet') {
    result.push(place({
      id: 'crown-pediment',
      side,
      tier,
      center: edge.center,
      y: y + 0.82,
      width: Math.min(5.4, span * 0.36),
      height: 1.45,
      depth: 1.0,
      floorIndex: 2,
      bayIndex: -5,
      edge,
    }))
  }

  for (const edgeSign of [-1, 1]) {
    const id = crownFinial(settings)
    result.push(place({
      id,
      side,
      tier,
      center: edge.center + edgeSign * (span / 2 - 0.5),
      y: y + 0.86,
      width: 0.8,
      height: id === 'crown-obelisk-finial' ? 2.2 : 1.6,
      depth: 0.8,
      floorIndex: 2,
      bayIndex: edgeSign < 0 ? -6 : -7,
      edge,
    }))
  }

  result.push(...edgeFinials(settings, tier, side, edge, y + 0.78))
  return result
}

function crownDecorationPanel(settings: BuildingSettings, index: number): KitModuleId {
  if (settings.crownDecorationStyle === 'restrained') return 'attic-crest-panel'
  if (settings.crownDecorationStyle === 'skyline') return index % 2 === 0 ? 'crown-cartouche-panel' : 'attic-crest-panel'
  return index % 3 === 1 ? 'crown-cartouche-panel' : 'attic-crest-panel'
}

function crownFinial(settings: BuildingSettings): KitModuleId {
  if (settings.crownDecorationStyle === 'restrained') return 'corner-finial'
  if (settings.crownDecorationStyle === 'skyline') return 'crown-obelisk-finial'
  return 'crown-urn-finial'
}

function edgeFinials(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  y: number
): KitPlacement[] {
  if (settings.crownFinialRhythm === 'corners-only' || settings.crownFinialDensity <= 0.01) return []
  const spacing = finialSpacing(settings)
  const usableSpan = Math.max(0, edge.length - 2.2)
  const count = Math.max(0, Math.floor((usableSpan / spacing) * densityMultiplier(settings.crownFinialDensity)))
  if (count <= 0) return []
  const step = usableSpan / (count + 1)
  const id = edgeFinialId(settings)
  const result: KitPlacement[] = []

  for (let index = 0; index < count; index++) {
    const center = edge.center - usableSpan / 2 + step * (index + 1)
    result.push(place({
      id,
      side,
      tier,
      center,
      y,
      width: id === 'crown-obelisk-finial' ? 0.8 : 0.68,
      height: id === 'crown-obelisk-finial' ? 2.0 : 1.16,
      depth: id === 'crown-obelisk-finial' ? 0.8 : 0.68,
      floorIndex: 3,
      bayIndex: 100 + index,
      edge,
    }))
  }
  return result
}

function finialSpacing(settings: BuildingSettings): number {
  if (settings.crownFinialRhythm === 'edge-sparse') return 5.2
  if (settings.crownFinialRhythm === 'edge-dense') return 2.1
  if (settings.crownFinialRhythm === 'skyline-spikes') return 3.4
  return 3.2
}

function densityMultiplier(value: number): number {
  return 0.35 + value * 1.35
}

function edgeFinialId(settings: BuildingSettings): KitModuleId {
  if (settings.crownFinialRhythm === 'skyline-spikes') return 'crown-obelisk-finial'
  if (settings.crownDecorationStyle === 'classical') return 'crown-pillar-finial'
  if (settings.crownDecorationStyle === 'skyline') return 'crown-obelisk-finial'
  return 'corner-finial'
}

function cornerTrimJoints(
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  y: number,
  id: KitModuleId,
  depth: number
): KitPlacement[] {
  return [-1, 1].map((edgeSign) => place({
    id,
    side,
    tier,
    center: edge.center + edgeSign * (edge.length / 2 - 0.32),
    y,
    width: 0.86,
    height: id === 'cornice-corner-joint' ? 0.92 : 0.46,
    depth,
    floorIndex: -9,
    bayIndex: edgeSign < 0 ? -90 : -91,
    edge,
  }))
}
