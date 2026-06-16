import { FLOOR_HEIGHT } from './mass-grammar'
import { edgeBayCenter, edgeBayCount, edgeSeamCenter, exposedEdges, place } from './placement-factory'
import type {
  BuildingSettings,
  BuildingTier,
  FacadeEdge,
  FacadeSide,
  KitModuleId,
  KitPlacement,
} from '../kit/kit-types'

export function createShaftPlacements(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide
): KitPlacement[] {
  return exposedEdges(tier, side).flatMap((edge) => createShaftEdgePlacements(settings, tier, side, edge))
}

function createShaftEdgePlacements(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge
): KitPlacement[] {
  const count = edgeBayCount(edge, 4)
  const bay = edge.length / count
  const result: KitPlacement[] = []
  result.push(...verticalZones(settings, tier, side, edge, count))

  for (let floor = 0; floor < tier.floors; floor++) {
    for (let index = 0; index < count; index++) {
      if (isReservedVerticalZone(settings, side, index, count)) continue
      const center = edgeBayCenter(edge, index, count)
      result.push(...shaftBay(settings, tier, side, edge, center, bay, index, count, floor))
    }
    result.push(...floorTrim(tier, side, edge, floor))
  }

  result.push(...verticalPilasters(settings, tier, side, edge, count))
  result.push(...tierTrim(tier, side, edge))
  return result
}

function shaftBay(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  center: number,
  bay: number,
  index: number,
  count: number,
  floor: number
): KitPlacement[] {
  const id = shaftModule(settings, side, index, count, floor)
  const y = tier.y0 + floor * FLOOR_HEIGHT
  const ornamental = id !== 'corner-bay'
    && id !== 'blank-bay'
    && settings.ornamentDensity > 0.52
    && (floor + index) % 5 === 2

  if (!ornamental) {
    return [place({
      id,
      side,
      tier,
      center,
      y,
      width: bay,
      height: FLOOR_HEIGHT,
      depth: id === 'corner-bay' ? 1.08 : 0.84,
      floorIndex: floor,
      bayIndex: index,
      edge,
    })]
  }

  const upperId: KitModuleId = id === 'double-window-bay' ? 'double-window-bay' : 'window-3m'
  return [
    place({
      id: (floor + index) % 2 === 0 ? 'carved-spandrel-vine' : 'spandrel-panel',
      side,
      tier,
      center,
      y: y + 0.18,
      width: bay * 0.84,
      height: 0.82,
      depth: 0.56,
      floorIndex: floor,
      bayIndex: index,
      edge,
    }),
    place({
      id: upperId,
      side,
      tier,
      center,
      y: y + 0.92,
      width: bay,
      height: FLOOR_HEIGHT - 0.96,
      depth: 0.78,
      floorIndex: floor,
      bayIndex: index,
      edge,
    }),
  ]
}

function shaftModule(
  settings: BuildingSettings,
  side: FacadeSide,
  index: number,
  count: number,
  floor: number
): KitModuleId {
  const edge = index === 0 || index === count - 1
  if (edge) return cornerPierId(settings)
  if (side === 'back' && floor % 5 === 0 && index % 3 === 1) return 'structural-blank-wall'
  if (side !== 'front' && index === Math.floor(count / 2)) return 'recessed-window-slot'
  if (settings.buildingArchetype === 'terra-cotta-arcade') return floor % 4 === 0 ? 'arcade-bay' : floor % 2 === 0 ? 'arched-window-bay' : 'brick-window-bay'
  if (settings.buildingArchetype === 'federal-fortress') return floor % 4 === 0 ? 'deep-window-well' : 'window-3m'
  if (floor % 5 === 0 && index % 4 === 1) return 'double-window-bay'
  if (settings.shaftRhythm === 'paired') return index % 2 === 0 ? 'double-window-bay' : 'window-3m'
  if (settings.shaftRhythm === 'chicago-grid') return index % 3 === 1 ? 'window-4m' : 'window-3m'
  return floor % 4 === 0 && index % 3 === 0 ? 'double-window-bay' : 'window-4m'
}

function floorTrim(tier: BuildingTier, side: FacadeSide, edge: FacadeEdge, floor: number): KitPlacement[] {
  const y = tier.y0 + floor * FLOOR_HEIGHT
  const span = edge.length
  return [
    place({
      id: 'floor-band-strip',
      side,
      tier,
      center: edge.center,
      y: y - 0.16,
      width: span,
      height: 0.36,
      depth: 0.54,
      floorIndex: floor,
      bayIndex: -1,
      edge,
    }),
    place({
      id: 'window-sill-strip',
      side,
      tier,
      center: edge.center,
      y: y + 0.56,
      width: span,
      height: 0.24,
      depth: 0.58,
      floorIndex: floor,
      bayIndex: -2,
      edge,
    }),
    place({
      id: 'lintel-strip',
      side,
      tier,
      center: edge.center,
      y: y + FLOOR_HEIGHT - 0.48,
      width: span,
      height: 0.26,
      depth: 0.54,
      floorIndex: floor,
      bayIndex: -3,
      edge,
    }),
    ...cornerTrimJoints(tier, side, edge, y - 0.16, 'belt-corner-joint', 0.58),
  ]
}

function verticalPilasters(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  count: number
): KitPlacement[] {
  const result: KitPlacement[] = []
  const cadence = settings.shaftRhythm === 'paired' ? 2 : 3
  for (let index = 1; index < count; index++) {
    if (index % cadence !== 0) continue
    result.push(place({
      id: tier.floors > 4 ? 'pilaster-bundle' : 'vertical-pilaster-strip',
      side,
      tier,
      center: edgeSeamCenter(edge, index, count),
      y: tier.y0,
      width: 0.58,
      height: tier.height,
      depth: 0.72,
      floorIndex: -1,
      bayIndex: index,
      edge,
    }))
  }
  return result
}

function tierTrim(tier: BuildingTier, side: FacadeSide, edge: FacadeEdge): KitPlacement[] {
  const span = edge.length
  return [
    place({
      id: 'belt-course-large',
      side,
      tier,
      center: edge.center,
      y: tier.y0 - 0.34,
      width: span,
      height: 0.54,
      depth: 0.74,
      floorIndex: -1,
      bayIndex: -4,
      edge,
    }),
    place({
      id: 'dentil-corbel-course',
      side,
      tier,
      center: edge.center,
      y: tier.y0 + tier.height - 0.3,
      width: span,
      height: 0.36,
      depth: 0.58,
      floorIndex: tier.floors,
      bayIndex: -5,
      edge,
    }),
    place({
      id: 'belt-course-small',
      side,
      tier,
      center: edge.center,
      y: tier.y0 + Math.max(FLOOR_HEIGHT, tier.height * 0.5),
      width: span,
      height: 0.32,
      depth: 0.52,
      floorIndex: Math.floor(tier.floors / 2),
      bayIndex: -6,
      edge,
    }),
    ...cornerTrimJoints(tier, side, edge, tier.y0 - 0.34, 'belt-corner-joint', 0.74),
    ...cornerTrimJoints(tier, side, edge, tier.y0 + tier.height - 0.3, 'cornice-corner-joint', 0.88),
  ]
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
    height: id === 'cornice-corner-joint' ? 0.88 : 0.42,
    depth,
    floorIndex: -9,
    bayIndex: edgeSign < 0 ? -90 : -91,
    edge,
  }))
}

function verticalZones(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  count: number
): KitPlacement[] {
  const result: KitPlacement[] = []
  const center = Math.floor(count / 2)
  const bay = edge.length / count
  if (side === 'front' && (settings.buildingArchetype === 'board-of-trade-tower' || settings.buildingArchetype === 'high-rise-pyramid')) {
    const axisBays = clampedOddAxisBays(settings.centralAxisBays, count)
    const halfAxis = Math.floor(axisBays / 2)
    result.push(place({ id: 'central-glass-shaft', side, tier, center: edgeBayCenter(edge, center, count), y: tier.y0, width: bay * axisBays, height: tier.height, depth: 1.02, floorIndex: -1, bayIndex: center, edge }))
    for (const pierIndex of [center - halfAxis - 1, center + halfAxis + 1]) {
      if (pierIndex <= 0 || pierIndex >= count - 1) continue
      result.push(place({ id: 'solid-side-pier', side, tier, center: edgeBayCenter(edge, pierIndex, count), y: tier.y0, width: bay, height: tier.height, depth: 0.86, floorIndex: -1, bayIndex: pierIndex, edge }))
    }
  }
  if (side !== 'front') {
    const serviceIndex = side === 'back' ? center : Math.max(1, Math.floor(count * 0.35))
    const slotIndex = Math.min(count - 2, serviceIndex + 1)
    result.push(place({ id: 'structural-blank-wall', side, tier, center: edgeBayCenter(edge, serviceIndex, count), y: tier.y0, width: bay, height: tier.height, depth: 0.62, floorIndex: -1, bayIndex: serviceIndex, edge }))
    if (slotIndex !== serviceIndex) {
      result.push(place({ id: 'recessed-window-slot', side, tier, center: edgeBayCenter(edge, slotIndex, count), y: tier.y0, width: bay, height: tier.height, depth: 0.95, floorIndex: -1, bayIndex: slotIndex, edge }))
    }
  }
  for (const cornerIndex of [0, count - 1]) {
    result.push(place({
      id: cornerPierId(settings),
      side,
      tier,
      center: edgeBayCenter(edge, cornerIndex, count),
      y: tier.y0,
      width: bay,
      height: tier.height,
      depth: 1.1,
      floorIndex: -1,
      bayIndex: cornerIndex,
      edge,
      moduleVariant: cornerIndex === 0 ? 'start' : 'end',
    }))
  }
  return result
}

function isReservedVerticalZone(settings: BuildingSettings, side: FacadeSide, index: number, count: number): boolean {
  const center = Math.floor(count / 2)
  if (side === 'front' && (settings.buildingArchetype === 'board-of-trade-tower' || settings.buildingArchetype === 'high-rise-pyramid')) {
    const axisBays = clampedOddAxisBays(settings.centralAxisBays, count)
    const halfAxis = Math.floor(axisBays / 2)
    return Math.abs(index - center) <= halfAxis
      || index === center - halfAxis - 1
      || index === center + halfAxis + 1
      || index === 0
      || index === count - 1
  }
  if (side !== 'front') {
    const serviceIndex = side === 'back' ? center : Math.max(1, Math.floor(count * 0.35))
    const slotIndex = Math.min(count - 2, serviceIndex + 1)
    return index === serviceIndex || (slotIndex !== serviceIndex && index === slotIndex) || index === 0 || index === count - 1
  }
  return index === 0 || index === count - 1
}

function cornerPierId(settings: BuildingSettings): KitModuleId {
  return settings.cornerTreatment === 'rounded-piers' ? 'rounded-corner-pier' : 'wrapped-corner-pier'
}

function clampedOddAxisBays(value: number, count: number): number {
  const max = Math.max(1, Math.min(5, count - 4))
  const oddMax = max % 2 === 0 ? max - 1 : max
  const requested = Math.max(1, Math.round(value))
  const oddRequested = requested % 2 === 0 ? requested + 1 : requested
  return Math.max(1, Math.min(oddRequested, Math.max(1, oddMax)))
}
