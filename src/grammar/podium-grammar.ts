import { PODIUM_FLOOR_HEIGHT } from './mass-grammar'
import { edgeBayCenter, edgeBayCount, edgeSeamCenter, exposedEdges, place } from './placement-factory'
import type {
  BuildingSettings,
  BuildingTier,
  FacadeEdge,
  FacadeSide,
  KitModuleId,
  KitPlacement,
} from '../kit/kit-types'

const PLINTH_HEIGHT = 0.74

export function createPodiumPlacements(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide
): KitPlacement[] {
  return exposedEdges(tier, side).flatMap((edge) => createPodiumEdgePlacements(settings, tier, side, edge))
}

function createPodiumEdgePlacements(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge
): KitPlacement[] {
  const count = edgeBayCount(edge, side === 'front' || side === 'back' ? 5 : 3)
  const bay = edge.length / count
  const result: KitPlacement[] = []

  for (let index = 0; index < count; index++) {
    const center = edgeBayCenter(edge, index, count)
    result.push(place({
      id: settings.buildingArchetype === 'federal-fortress' ? 'rusticated-base-block' : 'granite-plinth',
      side,
      tier,
      center,
      y: 0,
      width: bay,
      height: settings.buildingArchetype === 'federal-fortress' ? 2.1 : PLINTH_HEIGHT,
      depth: 0.72,
      floorIndex: -1,
      bayIndex: index,
      edge,
    }))
    result.push(...podiumBayStack(settings, tier, side, edge, center, bay, index, count))
  }

  result.push(...podiumHorizontalTrim(tier, side, edge))
  result.push(...podiumColumns(settings, tier, side, edge, count))
  result.push(...frontageDetails(settings, tier, side, edge, count))
  return result
}

function podiumBayStack(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  center: number,
  bay: number,
  index: number,
  count: number
): KitPlacement[] {
  const result: KitPlacement[] = []
  for (let floor = 0; floor < tier.floors; floor++) {
    const y = floor === 0 ? PLINTH_HEIGHT : floor * PODIUM_FLOOR_HEIGHT
    const height = floor === 0 ? PODIUM_FLOOR_HEIGHT - PLINTH_HEIGHT + 0.08 : PODIUM_FLOOR_HEIGHT - 0.18
    const id = floor === 0
      ? groundModule(settings, side, index, count)
      : upperPodiumModule(side, index, count, floor)
    result.push(place({
      id,
      side,
      tier,
      center,
      y,
      width: bay,
      height,
      depth: podiumDepth(id),
      floorIndex: floor,
      bayIndex: index,
      edge,
    }))

    if (floor > 0 && settings.ornamentDensity > 0.45 && index % 3 === 1) {
      result.push(place({
        id: 'spandrel-panel',
        side,
        tier,
        center,
        y: y + 0.28,
        width: bay * 0.82,
        height: 0.82,
        depth: 0.54,
        floorIndex: floor,
        bayIndex: index,
        edge,
      }))
    }
  }
  return result
}

function groundModule(
  settings: BuildingSettings,
  side: FacadeSide,
  index: number,
  count: number
): KitModuleId {
  const center = Math.floor(count / 2)
  const edge = index === 0 || index === count - 1

  if (side === 'front') {
    if (settings.buildingArchetype === 'federal-fortress') return index % 2 === 0 ? 'bank-grille' : 'barred-window'
    if (settings.buildingArchetype === 'temple-bank-podium' && Math.abs(index - center) <= 2) return 'storefront-curtain-wall'
    if ((settings.cornerEntrance || settings.entranceType === 'corner-bank' || settings.podiumStyle === 'corner-entrance') && edge) {
      return 'corner-entrance'
    }
    if (index === center && settings.entranceType === 'center-revolving') return 'revolving-door-bay'
    if (Math.abs(index - center) === 1 || settings.entranceType === 'paired-lobby') return 'lobby-door'
    if (settings.colonnade && settings.podiumStyle === 'colonnade' && index % 2 === 0) return 'paired-column'
    return 'tall-lobby-window'
  }

  if (side === 'back') return index % 3 === 0 ? 'loading-dock-bay' : 'security-door'
  if (settings.podiumStyle === 'service-bank' && index % 2 === 0) return 'loading-dock-bay'
  if (edge) return settings.buildingArchetype === 'federal-fortress' ? 'bank-grille' : 'service-door'
  return 'tall-lobby-window'
}

function upperPodiumModule(
  side: FacadeSide,
  index: number,
  count: number,
  floor: number
): KitModuleId {
  if (index === 0 || index === count - 1) return 'corner-bay'
  if (side === 'back' && (index + floor) % 4 === 0) return 'blank-bay'
  if (floor % 2 === 0 && index % 3 === 1) return 'deep-window-well'
  return side === 'front' ? 'tall-lobby-window' : 'window-4m'
}

function podiumDepth(id: KitModuleId): number {
  if (id === 'paired-column') return 1.8
  if (id === 'corner-entrance') return 1.55
  if (id === 'revolving-door-bay') return 1.5
  if (id === 'loading-dock-bay') return 1.2
  return 1.1
}

function podiumHorizontalTrim(tier: BuildingTier, side: FacadeSide, edge: FacadeEdge): KitPlacement[] {
  const span = edge.length
  const top = tier.y0 + tier.height
  const result: KitPlacement[] = [
    place({
      id: 'belt-course-large',
      side,
      tier,
      center: edge.center,
      y: PODIUM_FLOOR_HEIGHT - 0.26,
      width: span,
      height: 0.52,
      depth: 0.72,
      floorIndex: 1,
      bayIndex: -1,
      edge,
    }),
    place({
      id: 'large-cornice',
      side,
      tier,
      center: edge.center,
      y: top - 0.78,
      width: span,
      height: 0.78,
      depth: 1.0,
      floorIndex: tier.floors,
      bayIndex: -1,
      edge,
    }),
  ]

  if (tier.floors > 2) {
    result.push(place({
      id: 'small-cornice',
      side,
      tier,
      center: edge.center,
      y: PODIUM_FLOOR_HEIGHT * 2 - 0.18,
      width: span,
      height: 0.36,
      depth: 0.62,
      floorIndex: 2,
      bayIndex: -1,
      edge,
    }))
  }

  for (const edgeSign of [-1, 1]) {
    result.push(place({
      id: 'corner-cornice',
      side,
      tier,
      center: edge.center + edgeSign * (span / 2 - 0.8),
      y: top - 0.92,
      width: 1.6,
      height: 0.92,
      depth: 1.1,
      floorIndex: tier.floors,
      bayIndex: edgeSign < 0 ? 0 : 999,
      edge,
    }))
  }
  result.push(...cornerTrimJoints(tier, side, edge, PODIUM_FLOOR_HEIGHT - 0.24, 'belt-corner-joint', 0.72))
  result.push(...cornerTrimJoints(tier, side, edge, top - 0.82, 'cornice-corner-joint', 1.05))
  return result
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
    height: id === 'cornice-corner-joint' ? 0.9 : 0.46,
    depth,
    floorIndex: -9,
    bayIndex: edgeSign < 0 ? -90 : -91,
    edge,
  }))
}

function podiumColumns(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  count: number
): KitPlacement[] {
  const result: KitPlacement[] = []
  const firstFloorHeight = PODIUM_FLOOR_HEIGHT - PLINTH_HEIGHT + 0.08
  if (side === 'front' && settings.colonnade && settings.podiumStyle === 'colonnade') {
    const bedY = porticoBedY(tier)
    const columnHeight = bedY + 0.08
    const projection = settings.porticoProjection
    const bedWidth = Math.max(edge.length - 0.8, edge.length * 0.9)
    result.push(place({
      id: 'large-cornice',
      side,
      tier,
      center: edge.center,
      y: bedY - 0.08,
      width: bedWidth,
      height: 1.05,
      depth: projection + 1.45,
      floorIndex: 0,
      bayIndex: -40,
      edge,
      normalOffset: projection * 0.5,
    }))
    result.push(place({
      id: 'dentil-corbel-course',
      side,
      tier,
      center: edge.center,
      y: bedY - 0.34,
      width: bedWidth,
      height: 0.52,
      depth: projection + 1.2,
      floorIndex: 0,
      bayIndex: -41,
      edge,
      normalOffset: projection * 0.5,
    }))
    for (const seam of [0, count]) {
      result.push(place({
        id: 'square-corner-pylon',
        side,
        tier,
        center: edgeSeamCenter(edge, seam, count),
        y: 0,
        width: 1.55,
        height: columnHeight,
        depth: 1.35,
        floorIndex: 0,
        bayIndex: seam,
        edge,
        normalOffset: projection,
      }))
    }
    for (let index = 1; index < count; index++) {
      if (index % 2 === 0) continue
      result.push(place({
        id: 'colossal-column',
        side,
        tier,
        center: edgeSeamCenter(edge, index, count),
        y: 0,
        width: 1.7,
        height: columnHeight,
        depth: 1.7,
        floorIndex: 0,
        bayIndex: index,
        edge,
        normalOffset: projection,
      }))
    }
    return result
  }

  for (let index = 1; index < count; index++) {
    const center = edgeSeamCenter(edge, index, count)
    const useRound = side === 'front' && settings.colonnade && settings.podiumStyle === 'colonnade'
    const everyOtherFront = side === 'front' && index % 2 === 1
    const sidePier = side !== 'front' && index % 3 === 0
    if (!everyOtherFront && !sidePier) continue
    const id = side !== 'front' && settings.buildingArchetype === 'temple-bank-podium'
      ? 'round-column'
      : side === 'front' && index % 2 === 1 ? 'round-column' : useRound ? 'round-column' : 'square-column'
    result.push(place({
      id,
      side,
      tier,
      center,
      y: PLINTH_HEIGHT,
      width: useRound ? 1.15 : 0.92,
      height: firstFloorHeight,
      depth: useRound ? 1.35 : 0.86,
      floorIndex: 0,
      bayIndex: index,
      edge,
      normalOffset: side === 'front' ? settings.porticoProjection * 0.55 : 0,
    }))
  }
  return result
}

function frontageDetails(
  settings: BuildingSettings,
  tier: BuildingTier,
  side: FacadeSide,
  edge: FacadeEdge,
  count: number
): KitPlacement[] {
  if (side !== 'front') return []
  const y = Math.max(0.8, tier.height - 3.2)
  const result: KitPlacement[] = []
  const projection = settings.podiumStyle === 'colonnade' ? settings.porticoProjection : 0
  const ceremonialSpan = settings.podiumStyle === 'colonnade'
    ? Math.max(edge.length - 0.8, edge.length * 0.9)
    : Math.min(edge.length * 0.82, 14)
  if (settings.buildingArchetype === 'temple-bank-podium' || settings.buildingArchetype === 'board-of-trade-tower') {
    result.push(place({ id: 'triangular-pediment', side, tier, center: edge.center, y: tier.height - 0.2, width: ceremonialSpan, height: 3.0, depth: projection + 1.55, floorIndex: 10, bayIndex: -10, edge, normalOffset: projection * 0.5 }))
    result.push(place({ id: 'company-frieze', side, tier, center: edge.center, y: tier.height - 1.0, width: ceremonialSpan * 0.96, height: 0.9, depth: projection + 0.9, floorIndex: 10, bayIndex: -11, edge, normalOffset: projection * 0.5 }))
    result.push(place({ id: 'pediment-eagle', side, tier, center: edge.center, y: tier.height + 0.75, width: 2.4, height: 1.2, depth: 0.45, floorIndex: 10, bayIndex: -12, edge, normalOffset: projection + 0.12 }))
    for (const sideSign of [-1, 1]) {
      result.push(place({ id: 'acroterion-scroll', side, tier, center: edge.center + sideSign * Math.min(edge.length * 0.36, 6), y: tier.height + 1.35, width: 0.9, height: 1.0, depth: 0.5, floorIndex: 10, bayIndex: -13 + sideSign, edge, normalOffset: projection + 0.18 }))
    }
    result.push(place({ id: 'clock-medallion', side, tier, center: edge.center, y, width: 1.8, height: 1.8, depth: 0.5, floorIndex: 9, bayIndex: -20, edge, normalOffset: 0.12 }))
  }
  result.push(place({ id: 'wall-plaque', side, tier, center: edgeBayCenter(edge, Math.max(0, count - 2), count), y: 1.65, width: 1.15, height: 1.4, depth: 0.28, floorIndex: 0, bayIndex: -21, edge }))
  result.push(place({ id: 'address-plaque', side, tier, center: edgeBayCenter(edge, 1, count), y: 1.3, width: 0.85, height: 0.55, depth: 0.2, floorIndex: 0, bayIndex: -22, edge }))
  result.push(place({ id: 'flag-mount', side, tier, center: edge.center - edge.length * 0.32, y: 3.1, width: 1.35, height: 1.6, depth: 0.7, floorIndex: 0, bayIndex: -23, edge }))
  result.push(place({ id: 'wall-lamp', side, tier, center: edge.center + edge.length * 0.28, y: 2.25, width: 0.55, height: 1.4, depth: 0.65, floorIndex: 0, bayIndex: -24, edge }))
  if (settings.buildingArchetype === 'federal-fortress') {
    result.push(place({ id: 'wall-camera', side, tier, center: edge.center + edge.length * 0.36, y: 3.9, width: 0.55, height: 0.45, depth: 0.7, floorIndex: 0, bayIndex: -25, edge }))
  }
  result.push(place({ id: 'sidewalk-entry', side, tier, center: edge.center, y: -0.02, width: Math.min(5.2, edge.length * 0.38), height: 0.45, depth: 1.4, floorIndex: -2, bayIndex: -26, edge, normalOffset: projection + 0.45 }))
  for (let index = 1; index < count; index += 3) {
    result.push(place({ id: 'bollard', side, tier, center: edgeSeamCenter(edge, index, count), y: -0.02, width: 0.45, height: 1.1, depth: 0.45, floorIndex: -2, bayIndex: -30 - index, edge }))
  }
  return result
}

function porticoBedY(tier: BuildingTier): number {
  return Math.min(tier.height - 3.2, PODIUM_FLOOR_HEIGHT * 2 - 0.08)
}
