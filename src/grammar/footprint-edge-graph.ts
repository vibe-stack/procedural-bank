import type { FacadeEdge, FacadeSide } from '../kit/kit-types'

export type FootprintRect = {
  suffix: string
  width: number
  depth: number
  x: number
  z: number
}

type Segment = {
  a: number
  b: number
}

export function exposedEdgesFor(rect: FootprintRect, allRects: FootprintRect[]): FacadeEdge[] {
  return (['front', 'back', 'left', 'right'] as FacadeSide[])
    .flatMap((side) => exposedSegments(rect, allRects, side).map((segment, index) => toEdge(rect, side, segment, index)))
}

function exposedSegments(rect: FootprintRect, allRects: FootprintRect[], side: FacadeSide): Segment[] {
  const base = side === 'front' || side === 'back'
    ? { a: rect.x - rect.width / 2, b: rect.x + rect.width / 2 }
    : { a: rect.z - rect.depth / 2, b: rect.z + rect.depth / 2 }
  const blockers = allRects
    .filter((candidate) => candidate !== rect)
    .flatMap((candidate) => blockerSegment(rect, candidate, side))
  return subtractSegments([base], blockers)
}

function blockerSegment(rect: FootprintRect, other: FootprintRect, side: FacadeSide): Segment[] {
  const epsilon = 0.001
  if (side === 'front') {
    const touches = Math.abs((rect.z + rect.depth / 2) - (other.z - other.depth / 2)) < epsilon
    return touches ? overlap(rect.x - rect.width / 2, rect.x + rect.width / 2, other.x - other.width / 2, other.x + other.width / 2) : []
  }
  if (side === 'back') {
    const touches = Math.abs((rect.z - rect.depth / 2) - (other.z + other.depth / 2)) < epsilon
    return touches ? overlap(rect.x - rect.width / 2, rect.x + rect.width / 2, other.x - other.width / 2, other.x + other.width / 2) : []
  }
  if (side === 'right') {
    const touches = Math.abs((rect.x + rect.width / 2) - (other.x - other.width / 2)) < epsilon
    return touches ? overlap(rect.z - rect.depth / 2, rect.z + rect.depth / 2, other.z - other.depth / 2, other.z + other.depth / 2) : []
  }
  const touches = Math.abs((rect.x - rect.width / 2) - (other.x + other.width / 2)) < epsilon
  return touches ? overlap(rect.z - rect.depth / 2, rect.z + rect.depth / 2, other.z - other.depth / 2, other.z + other.depth / 2) : []
}

function overlap(a0: number, a1: number, b0: number, b1: number): Segment[] {
  const a = Math.max(a0, b0)
  const b = Math.min(a1, b1)
  return b - a > 0.01 ? [{ a, b }] : []
}

function subtractSegments(source: Segment[], blockers: Segment[]): Segment[] {
  let result = source
  for (const blocker of blockers) {
    result = result.flatMap((segment) => subtractSegment(segment, blocker))
  }
  return result.filter((segment) => segment.b - segment.a > 0.25)
}

function subtractSegment(segment: Segment, blocker: Segment): Segment[] {
  if (blocker.b <= segment.a || blocker.a >= segment.b) return [segment]
  const result: Segment[] = []
  if (blocker.a > segment.a) result.push({ a: segment.a, b: blocker.a })
  if (blocker.b < segment.b) result.push({ a: blocker.b, b: segment.b })
  return result
}

function toEdge(rect: FootprintRect, side: FacadeSide, segment: Segment, index: number): FacadeEdge {
  const length = segment.b - segment.a
  const axisCenter = (segment.a + segment.b) / 2
  const localCenter = side === 'front' || side === 'back' ? axisCenter - rect.x : axisCenter - rect.z
  return {
    id: `${rect.suffix}-${side}-${index}`,
    side,
    center: localCenter,
    length,
    x: rect.x,
    z: rect.z,
    isOuterCornerStart: true,
    isOuterCornerEnd: true,
    isInnerCornerStart: length < (side === 'front' || side === 'back' ? rect.width : rect.depth) - 0.01,
    isInnerCornerEnd: length < (side === 'front' || side === 'back' ? rect.width : rect.depth) - 0.01,
  }
}
