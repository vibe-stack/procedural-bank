import { createRandom, type RandomSource } from './random'
import { exposedEdgesFor, type FootprintRect } from './footprint-edge-graph'
import type { BuildingSettings, BuildingTier, FootprintStyle } from '../kit/kit-types'

export const BAY_WIDTH = 3.2
export const FLOOR_HEIGHT = 3.35
export const PODIUM_FLOOR_HEIGHT = 4.45

export function createMassTiers(settings: BuildingSettings): BuildingTier[] {
  const random = createRandom(settings.seed)
  const podiumHeight = settings.podiumFloors * PODIUM_FLOOR_HEIGHT
  const crownFloors = settings.crown ? Math.max(1, settings.setbackFloors) : 0
  const shaftFloors = Math.max(1, settings.floors - settings.podiumFloors - crownFloors)
  const fullWidth = settings.widthBays * BAY_WIDTH
  const fullDepth = settings.depthBays * BAY_WIDTH
  const towerScale = clamp(settings.towerScale + random.range(-0.05, 0.04), 0.62, 0.96)
  const setbackInset = BAY_WIDTH * (1 - towerScale) * random.range(0.86, 1.08)

  if (settings.massingPattern === 'twin-towers') {
    return createTwinTowerTiers(settings, random, {
      podiumHeight,
      crownFloors,
      shaftFloors,
      fullWidth,
      fullDepth,
      setbackInset,
    })
  }

  const tiers: BuildingTier[] = createFootprintTiers({
    name: 'podium',
    role: 'podium',
    style: podiumFootprintStyle(settings),
    width: fullWidth,
    depth: fullDepth,
    y0: 0,
    height: podiumHeight,
    floors: settings.podiumFloors,
    inset: 0,
    settings,
  })

  const shaftSlices = splitShaftFloors(settings.variant, shaftFloors, random)
  let y = podiumHeight
  for (let index = 0; index < shaftSlices.length; index++) {
    const floors = shaftSlices[index]
    const inset = shaftInset(settings.variant, setbackInset, index, random)
    const shaftStyle = tierFootprintStyle(settings, 'shaft', index)
    const adjusted = directionalInset(settings, clampedSpan(fullWidth, inset), clampedSpan(fullDepth, inset), index)
    tiers.push(...createFootprintTiers({
      name: `shaft-${index + 1}`,
      role: 'shaft',
      style: shaftStyle,
      width: adjusted.width,
      depth: adjusted.depth,
      baseX: adjusted.x,
      baseZ: adjusted.z,
      y0: y,
      height: floors * FLOOR_HEIGHT,
      floors,
      inset,
      settings,
    }))
    y += floors * FLOOR_HEIGHT
  }

  if (settings.crown) {
    const crownInset = (tiers[tiers.length - 1]?.inset ?? setbackInset) + BAY_WIDTH * random.range(0.42, 0.68)
    const adjusted = directionalInset(settings, clampedSpan(fullWidth, crownInset), clampedSpan(fullDepth, crownInset), shaftSlices.length)
    tiers.push(...createFootprintTiers({
      name: 'crown',
      role: 'crown',
      style: tierFootprintStyle(settings, 'crown', shaftSlices.length),
      width: adjusted.width,
      depth: adjusted.depth,
      baseX: adjusted.x,
      baseZ: adjusted.z,
      y0: y,
      height: crownFloors * FLOOR_HEIGHT,
      floors: crownFloors,
      inset: crownInset,
      settings,
    }))
  }

  return tiers
}

type InternalFootprintStyle = FootprintStyle | 'free-court'

function createFootprintTiers(input: {
  name: string
  role: BuildingTier['role']
  style: InternalFootprintStyle
  width: number
  depth: number
  baseX?: number
  baseZ?: number
  y0: number
  height: number
  floors: number
  inset: number
  settings: BuildingSettings
}): BuildingTier[] {
  const pieces = footprintPieces(input.style, input.width, input.depth, input.settings)
  const baseX = input.baseX ?? 0
  const baseZ = input.baseZ ?? 0
  return pieces.map((piece) => ({
    name: piece.suffix === 'main' ? input.name : `${input.name}-${piece.suffix}`,
    role: input.role,
    width: piece.width,
    depth: piece.depth,
    x: baseX + piece.x,
    z: baseZ + piece.z,
    y0: input.y0,
    height: input.height,
    floors: input.floors,
    inset: input.inset,
    facadeEdges: exposedEdgesFor(piece, pieces).map((edge) => ({
      ...edge,
      x: baseX + edge.x,
      z: baseZ + edge.z,
    })),
  }))
}

function footprintPieces(
  style: InternalFootprintStyle,
  width: number,
  depth: number,
  settings: BuildingSettings
): FootprintRect[] {
  if (style === 'free-court') return freeCourtPieces(width, depth, settings)

  if (style === 'l-shape') {
    const frontDepth = depth * 0.58
    const rearDepth = depth - frontDepth
    const wingWidth = width * 0.44
    return [
      {
        suffix: 'front-bar',
        width,
        depth: frontDepth,
        x: 0,
        z: depth / 2 - frontDepth / 2,
      },
      {
        suffix: 'rear-wing',
        width: wingWidth,
        depth: rearDepth,
        x: -width / 2 + wingWidth / 2,
        z: -depth / 2 + rearDepth / 2,
      },
    ]
  }

  if (style === 't-shape') {
    const crossDepth = depth * 0.36
    const stemDepth = depth - crossDepth
    const stemWidth = width * 0.46
    return [
      {
        suffix: 'cross-bar',
        width,
        depth: crossDepth,
        x: 0,
        z: depth / 2 - crossDepth / 2,
      },
      {
        suffix: 'stem',
        width: stemWidth,
        depth: stemDepth,
        x: 0,
        z: -depth / 2 + stemDepth / 2,
      },
    ]
  }

  if (style === 'u-shape') {
    const frontDepth = depth * 0.34
    const wingDepth = depth - frontDepth
    const wingWidth = width * 0.26
    return [
      {
        suffix: 'front-bar',
        width,
        depth: frontDepth,
        x: 0,
        z: depth / 2 - frontDepth / 2,
      },
      {
        suffix: 'left-wing',
        width: wingWidth,
        depth: wingDepth,
        x: -width / 2 + wingWidth / 2,
        z: -depth / 2 + wingDepth / 2,
      },
      {
        suffix: 'right-wing',
        width: wingWidth,
        depth: wingDepth,
        x: width / 2 - wingWidth / 2,
        z: -depth / 2 + wingDepth / 2,
      },
    ]
  }

  if (style === 'courtyard-block') {
    const bar = Math.max(BAY_WIDTH * 2, Math.min(width, depth) * 0.24)
    return [
      { suffix: 'front-bar', width, depth: bar, x: 0, z: depth / 2 - bar / 2 },
      { suffix: 'back-bar', width, depth: bar, x: 0, z: -depth / 2 + bar / 2 },
      { suffix: 'left-bar', width: bar, depth: depth - bar * 2, x: -width / 2 + bar / 2, z: 0 },
      { suffix: 'right-bar', width: bar, depth: depth - bar * 2, x: width / 2 - bar / 2, z: 0 },
    ]
  }

  const blockScale = style === 'high-rise-block' ? 0.86 : 1
  return [{
    suffix: 'main',
    width: width * blockScale,
    depth: depth * blockScale,
    x: 0,
    z: 0,
  }]
}

function createTwinTowerTiers(
  settings: BuildingSettings,
  random: RandomSource,
  input: {
    podiumHeight: number
    crownFloors: number
    shaftFloors: number
    fullWidth: number
    fullDepth: number
    setbackInset: number
  }
): BuildingTier[] {
  const tiers = createFootprintTiers({
    name: 'podium',
    role: 'podium',
    style: 'rectangle',
    width: input.fullWidth,
    depth: input.fullDepth,
    y0: 0,
    height: input.podiumHeight,
    floors: settings.podiumFloors,
    inset: 0,
    settings,
  })
  const gap = Math.max(BAY_WIDTH * 2.2, input.fullWidth * 0.18)
  const towerWidth = Math.max(BAY_WIDTH * 4, (input.fullWidth - gap) * 0.46)
  const towerDepth = input.fullDepth * 0.82
  const towerOffset = gap / 2 + towerWidth / 2
  const shaftSlices = splitShaftFloors(settings.variant, input.shaftFloors, random)
  let y = input.podiumHeight

  for (let index = 0; index < shaftSlices.length; index++) {
    const floors = shaftSlices[index]
    const inset = shaftInset(settings.variant, input.setbackInset * 0.72, index, random)
    const towerSpan = {
      width: clampedSpan(towerWidth, inset * 0.55),
      depth: clampedSpan(towerDepth, inset * 0.55),
    }
    tiers.push(...createFootprintTiers({
      name: `shaft-${index + 1}-west-tower`,
      role: 'shaft',
      style: tierFootprintStyle(settings, 'shaft', index),
      width: towerSpan.width,
      depth: towerSpan.depth,
      baseX: -towerOffset + inset * 0.18,
      y0: y,
      height: floors * FLOOR_HEIGHT,
      floors,
      inset,
      settings,
    }))
    tiers.push(...createFootprintTiers({
      name: `shaft-${index + 1}-east-tower`,
      role: 'shaft',
      style: settings.secondaryFootprintStyle,
      width: towerSpan.width,
      depth: towerSpan.depth,
      baseX: towerOffset - inset * 0.18,
      y0: y,
      height: floors * FLOOR_HEIGHT,
      floors,
      inset,
      settings,
    }))
    y += floors * FLOOR_HEIGHT
  }

  if (settings.skybridgeEnabled) {
    const bridgeY = input.podiumHeight + clamp(settings.skybridgeFloor, 1, input.shaftFloors) * FLOOR_HEIGHT
    tiers.push(...createFootprintTiers({
      name: 'skybridge',
      role: 'bridge',
      style: 'rectangle',
      width: gap + towerWidth * 0.42,
      depth: Math.max(BAY_WIDTH * 1.2, input.fullDepth * 0.18),
      y0: bridgeY,
      height: FLOOR_HEIGHT * 1.15,
      floors: 1,
      inset: 0,
      settings,
    }))
  }

  if (settings.crown) {
    const crownInset = input.setbackInset + BAY_WIDTH * random.range(0.42, 0.68)
    const crownSpan = {
      width: clampedSpan(towerWidth, crownInset * 0.55),
      depth: clampedSpan(towerDepth, crownInset * 0.55),
    }
    for (const [name, baseX, style] of [
      ['crown-west-tower', -towerOffset + crownInset * 0.18, settings.footprintStyle],
      ['crown-east-tower', towerOffset - crownInset * 0.18, settings.secondaryFootprintStyle],
    ] as const) {
      tiers.push(...createFootprintTiers({
        name,
        role: 'crown',
        style,
        width: crownSpan.width,
        depth: crownSpan.depth,
        baseX,
        y0: y,
        height: input.crownFloors * FLOOR_HEIGHT,
        floors: input.crownFloors,
        inset: crownInset,
        settings,
      }))
    }
  }
  return tiers
}

function freeCourtPieces(width: number, depth: number, settings: BuildingSettings): FootprintRect[] {
  const minBar = BAY_WIDTH * 1.8
  const innerWidth = clamp(width * settings.innerCourtWidth, BAY_WIDTH * 2, width - minBar * 2)
  const innerDepth = clamp(depth * settings.innerCourtDepth, BAY_WIDTH * 2, depth - minBar * 2)
  const cxLimit = Math.max(0, (width - innerWidth) / 2 - minBar)
  const czLimit = Math.max(0, (depth - innerDepth) / 2 - minBar)
  const cx = clamp(settings.innerCourtOffsetX * width * 0.5, -cxLimit, cxLimit)
  const cz = clamp(settings.innerCourtOffsetZ * depth * 0.5, -czLimit, czLimit)
  const outerX0 = -width / 2
  const outerX1 = width / 2
  const outerZ0 = -depth / 2
  const outerZ1 = depth / 2
  const courtX0 = cx - innerWidth / 2
  const courtX1 = cx + innerWidth / 2
  const courtZ0 = cz - innerDepth / 2
  const courtZ1 = cz + innerDepth / 2

  return [
    { suffix: 'front-bar', width, depth: outerZ1 - courtZ1, x: 0, z: (outerZ1 + courtZ1) / 2 },
    { suffix: 'back-bar', width, depth: courtZ0 - outerZ0, x: 0, z: (outerZ0 + courtZ0) / 2 },
    { suffix: 'left-bar', width: courtX0 - outerX0, depth: innerDepth, x: (outerX0 + courtX0) / 2, z: cz },
    { suffix: 'right-bar', width: outerX1 - courtX1, depth: innerDepth, x: (courtX1 + outerX1) / 2, z: cz },
  ].filter((piece) => piece.width > 0.25 && piece.depth > 0.25)
}

function splitShaftFloors(
  variant: BuildingSettings['variant'],
  floors: number,
  random: RandomSource
): number[] {
  if (floors <= 4) return [floors]
  if (variant === 'classic-bank') return [floors]
  if (variant === 'corner-hq') {
    const lower = Math.max(3, Math.ceil(floors * random.range(0.56, 0.72)))
    return [lower, floors - lower].filter(Boolean)
  }
  const lower = Math.max(3, Math.floor(floors * random.range(0.36, 0.5)))
  const middle = Math.max(3, Math.floor(floors * random.range(0.26, 0.38)))
  const upper = floors - lower - middle
  return [lower, middle, Math.max(1, upper)].filter(Boolean)
}

function shaftInset(
  variant: BuildingSettings['variant'],
  baseInset: number,
  step: number,
  random: RandomSource
): number {
  if (variant === 'classic-bank') return baseInset
  const jitter = random.range(-0.08, 0.12)
  if (variant === 'corner-hq') return baseInset * (0.65 + step * 0.95 + jitter)
  return baseInset * (0.75 + step * 1.15 + jitter)
}

function tierFootprintStyle(
  settings: BuildingSettings,
  role: 'shaft' | 'crown',
  index: number
): InternalFootprintStyle {
  if (settings.massingPattern === 'outer-ring') return 'free-court'
  if (settings.footprintStyle === 'high-rise-block') return 'high-rise-block'
  if (settings.footprintHeightMode === 'full-height') return settings.footprintStyle
  if (settings.footprintHeightMode === 'lower-tiers-only') return role === 'shaft' && index === 0 ? settings.footprintStyle : 'rectangle'
  return 'rectangle'
}

function podiumFootprintStyle(settings: BuildingSettings): InternalFootprintStyle {
  if (settings.massingPattern === 'outer-ring') return 'free-court'
  return settings.footprintStyle
}

function directionalInset(
  settings: BuildingSettings,
  width: number,
  depth: number,
  step: number
): { width: number; depth: number; x: number; z: number } {
  const amount = Math.min(BAY_WIDTH * settings.hardInsetAmount * (step + 1) * 0.42, Math.min(width, depth) * 0.38)
  if (settings.hardInsetSide === 'none' || amount <= 0.001) return { width, depth, x: 0, z: 0 }
  if (settings.hardInsetSide === 'front') return { width, depth: Math.max(BAY_WIDTH * 4, depth - amount), x: 0, z: -amount / 2 }
  if (settings.hardInsetSide === 'back') return { width, depth: Math.max(BAY_WIDTH * 4, depth - amount), x: 0, z: amount / 2 }
  if (settings.hardInsetSide === 'left') return { width: Math.max(BAY_WIDTH * 4, width - amount), depth, x: amount / 2, z: 0 }
  return { width: Math.max(BAY_WIDTH * 4, width - amount), depth, x: -amount / 2, z: 0 }
}

function clampedSpan(span: number, inset: number): number {
  return Math.max(BAY_WIDTH * 4, span - inset * 2)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
