import { BAY_WIDTH } from './mass-grammar'
import type { BuildingTier, FacadeEdge, FacadeSide, KitModuleId, KitPlacement } from '../kit/kit-types'

export const facadeSides: FacadeSide[] = ['front', 'back', 'left', 'right']

export function sideSpan(tier: BuildingTier, side: FacadeSide): number {
  return side === 'front' || side === 'back' ? tier.width : tier.depth
}

export function exposedEdges(tier: BuildingTier, side: FacadeSide): FacadeEdge[] {
  return tier.facadeEdges?.filter((edge) => edge.side === side) ?? [{
    id: `${tier.name}-${side}`,
    side,
    center: 0,
    length: sideSpan(tier, side),
    x: tier.x,
    z: tier.z,
    isOuterCornerStart: true,
    isOuterCornerEnd: true,
    isInnerCornerStart: false,
    isInnerCornerEnd: false,
  }]
}

export function sideBayCount(tier: BuildingTier, side: FacadeSide, minimum = 3): number {
  return Math.max(minimum, Math.round(sideSpan(tier, side) / BAY_WIDTH))
}

export function edgeBayCount(edge: FacadeEdge, minimum = 3): number {
  return Math.max(minimum, Math.round(edge.length / BAY_WIDTH))
}

export function bayCenter(tier: BuildingTier, side: FacadeSide, index: number, count: number): number {
  const width = sideSpan(tier, side) / count
  return -sideSpan(tier, side) / 2 + width * (index + 0.5)
}

export function seamCenter(tier: BuildingTier, side: FacadeSide, index: number, count: number): number {
  return -sideSpan(tier, side) / 2 + (sideSpan(tier, side) / count) * index
}

export function edgeBayCenter(edge: FacadeEdge, index: number, count: number): number {
  const width = edge.length / count
  return edge.center - edge.length / 2 + width * (index + 0.5)
}

export function edgeSeamCenter(edge: FacadeEdge, index: number, count: number): number {
  return edge.center - edge.length / 2 + (edge.length / count) * index
}

export function place(input: {
  id: KitModuleId
  side: FacadeSide
  tier: BuildingTier
  center: number
  y: number
  width: number
  height: number
  depth: number
  floorIndex: number
  bayIndex: number
  edge?: FacadeEdge
  normalOffset?: number
  moduleVariant?: string
}): KitPlacement {
  return {
    id: input.id,
    side: input.side,
    tierName: input.tier.name,
    center: input.center,
    y: input.y,
    width: input.width,
    height: input.height,
    depth: input.depth,
    floorIndex: input.floorIndex,
    bayIndex: input.bayIndex,
    edgeId: input.edge?.id,
    xOffset: input.edge?.x,
    zOffset: input.edge?.z,
    normalOffset: input.normalOffset,
    moduleVariant: input.moduleVariant,
  }
}

export function roofPlace(input: {
  id: KitModuleId
  center: number
  roofZ: number
  y: number
  width: number
  height: number
  depth: number
  bayIndex?: number
}): KitPlacement {
  return {
    id: input.id,
    side: 'roof',
    tierName: 'roof',
    center: input.center,
    roofZ: input.roofZ,
    y: input.y,
    width: input.width,
    height: input.height,
    depth: input.depth,
    floorIndex: 0,
    bayIndex: input.bayIndex ?? 0,
  }
}
