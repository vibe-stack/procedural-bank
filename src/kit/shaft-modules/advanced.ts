import { blackMetal, bronze, glass, stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { archedOpening } from '../shared/profiles/arches'
import { framedWindow } from '../shared/profiles/openings'
import { greekKey, rosette } from '../shared/profiles/ornaments'
import { slab, solidBox } from '../shared/profiles/slabs'

export const centralGlassShaftModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: -ctx.width * 0.36, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.5 }, stoneDark)
  slab(ctx, 'limestone', { x0: ctx.width * 0.36, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.5 }, stoneDark)
  slab(ctx, 'black-metal', { x0: -ctx.width * 0.34, x1: ctx.width * 0.34, y0: 0.12, y1: ctx.height - 0.12, z0: -0.04, z1: 0.12 }, blackMetal)
  const floors = Math.max(3, Math.floor(ctx.height / 3.35))
  for (let floor = 0; floor < floors; floor++) {
    const y0 = floor * (ctx.height / floors) + 0.18
    const y1 = (floor + 1) * (ctx.height / floors) - 0.18
    slab(ctx, 'glass', { x0: -ctx.width * 0.28, x1: ctx.width * 0.28, y0, y1, z0: 0.12, z1: 0.2 }, glass)
    slab(ctx, 'bronze', { x0: -ctx.width * 0.28, x1: ctx.width * 0.28, y0: y1 - 0.035, y1: y1 + 0.035, z0: 0.2, z1: 0.32 }, bronze)
  }
}

export const solidSidePierModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -0.1], [ctx.width / 2, ctx.height, 0.56], stone)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 + 0.14, x1: ctx.width / 2 - 0.14, y0: 0.3, y1: ctx.height - 0.3, z0: 0.56, z1: 0.7 }, stoneDark)
}

export const buttressPierModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -0.1], [ctx.width / 2, ctx.height, 0.72], stone)
  for (let index = 0; index < 4; index++) {
    const y = (ctx.height / 4) * index
    slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0: y, y1: y + 0.26, z0: -0.1, z1: 0.9 }, stoneWarm)
  }
}

export const pilasterBundleModule: KitModuleBuilder = (ctx) => {
  for (const x of [-0.32, 0, 0.32]) {
    slab(ctx, 'limestone', { x0: x - 0.12, x1: x + 0.12, y0: 0, y1: ctx.height, z0: -0.06, z1: 0.58 }, stone)
    slab(ctx, 'limestone', { x0: x - 0.035, x1: x + 0.035, y0: 0.42, y1: ctx.height - 0.42, z0: 0.58, z1: 0.72 }, stoneDark)
  }
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: ctx.height - 0.45, y1: ctx.height, z0: -0.08, z1: 0.78 }, stoneWarm)
}

export const recessedWindowSlotModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.12, z1: 0.68 }, stoneDark)
  slab(ctx, 'black-metal', { x0: -ctx.width * 0.28, x1: ctx.width * 0.28, y0: 0.25, y1: ctx.height - 0.25, z0: -0.04, z1: 0.08 }, blackMetal)
  const panes = Math.max(3, Math.floor(ctx.height / 1.65))
  for (let index = 0; index < panes; index++) {
    const y0 = 0.35 + index * ((ctx.height - 0.7) / panes)
    const y1 = 0.35 + (index + 0.72) * ((ctx.height - 0.7) / panes)
    slab(ctx, 'glass', { x0: -ctx.width * 0.2, x1: ctx.width * 0.2, y0, y1, z0: 0.08, z1: 0.18 }, glass)
  }
}

export const archedWindowBayModule: KitModuleBuilder = (ctx) => {
  archedOpening({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, depth: 0.72 })
}

export const arcadeBayModule: KitModuleBuilder = (ctx) => {
  archedOpening({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, depth: 0.94 })
  for (const x of [-ctx.width * 0.42, ctx.width * 0.42]) {
    slab(ctx, 'terra-cotta', { x0: x - 0.12, x1: x + 0.12, y0: 0, y1: ctx.height, z0: 0.66, z1: 0.94 }, stoneWarm)
  }
}

export const brickWindowBayModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'terra-cotta', [-ctx.width / 2, 0, -0.08], [ctx.width / 2, ctx.height, 0.32], [1, 1, 1])
  brickCourses(ctx)
  framedWindow({ ctx, x0: -ctx.width * 0.32, x1: ctx.width * 0.32, y0: 0.32, y1: ctx.height - 0.28, side: 0.18, top: 0.24, bottom: 0.42, splits: 2 })
}

export const deepWindowWellModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.18, z1: 0.82 }, stone)
  framedWindow({ ctx, x0: -ctx.width * 0.34, x1: ctx.width * 0.34, y0: 0.28, y1: ctx.height - 0.26, side: 0.22, top: 0.28, bottom: 0.54, splits: 2 })
  slab(ctx, 'limestone', { x0: -ctx.width * 0.44, x1: ctx.width * 0.44, y0: 0.02, y1: 0.34, z0: 0.82, z1: 1.06 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -ctx.width * 0.44, x1: ctx.width * 0.44, y0: ctx.height - 0.42, y1: ctx.height, z0: 0.82, z1: 1.08 }, stoneWarm)
}

export const carvedSpandrelVineModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.06, z1: 0.24 }, stoneWarm)
  greekKey(ctx, -ctx.width / 2 + 0.15, ctx.width / 2 - 0.15, ctx.height * 0.16, 0.24, 0.42, Math.max(4, Math.floor(ctx.width)))
  for (const x of [-ctx.width * 0.25, 0, ctx.width * 0.25]) {
    rosette(ctx, x, ctx.height * 0.58, 0.42, 0.6, 0.22)
  }
}

export const wrappedCornerPierModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -ctx.depth / 2], [ctx.width / 2, ctx.height, 0.62], stone)
  solidBox(ctx, 'limestone', [ctx.width / 2 - 0.28, 0, -ctx.depth / 2], [ctx.width / 2 + 0.32, ctx.height, ctx.depth / 2], stone)
}

export const roundedCornerPierModule: KitModuleBuilder = (ctx) => {
  const x0 = -ctx.width / 2
  const x1 = ctx.width / 2
  const chamfer = Math.min(ctx.width * 0.28, 0.62)
  const variant = ctx.moduleVariant ?? 'both'
  const bevelStart = variant === 'start' || variant === 'both'
  const bevelEnd = variant === 'end' || variant === 'both'
  const flatX0 = bevelStart ? x0 + chamfer : x0
  const flatX1 = bevelEnd ? x1 - chamfer : x1
  solidBox(ctx, 'limestone', [flatX0, 0, -0.34], [flatX1, ctx.height, 0.48], stone)
  if (bevelStart) {
    solidBox(ctx, 'limestone', [x0, 0, -0.34], [x0 + chamfer * 0.25, ctx.height, 0.1], stone)
    chamferFace(ctx, x0 + chamfer * 0.25, x0 + chamfer, 0.1, 0.48)
  }
  if (bevelEnd) {
    solidBox(ctx, 'limestone', [x1 - chamfer * 0.25, 0, -0.34], [x1, ctx.height, 0.1], stone)
    chamferFace(ctx, x1 - chamfer, x1 - chamfer * 0.25, 0.48, 0.1)
  }
  for (let index = 0; index < 5; index++) {
    const y = (ctx.height / 5) * index
    slab(ctx, 'limestone', { x0: flatX0 - 0.04, x1: flatX1 + 0.04, y0: y, y1: y + 0.18, z0: -0.34, z1: 0.6 }, stoneWarm)
  }
}

export const structuralBlankWallModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -0.08], [ctx.width / 2, ctx.height, 0.34], stoneWarm)
  const rows = Math.max(5, Math.floor(ctx.height / 1.2))
  for (let index = 1; index < rows; index++) {
    const y = (ctx.height / rows) * index
    slab(ctx, 'limestone', { x0: -ctx.width / 2 + 0.08, x1: ctx.width / 2 - 0.08, y0: y - 0.02, y1: y + 0.02, z0: 0.34, z1: 0.44 }, stoneDark)
  }
}

function chamferFace(
  ctx: Parameters<KitModuleBuilder>[0],
  x0: number,
  x1: number,
  z0: number,
  z1: number
): void {
  ctx.writer.appendQuad('limestone', [
    ctx.transform([x0, 0, z0]),
    ctx.transform([x1, 0, z1]),
    ctx.transform([x1, ctx.height, z1]),
    ctx.transform([x0, ctx.height, z0]),
  ], stone)
}

function brickCourses(ctx: Parameters<KitModuleBuilder>[0]): void {
  const rows = Math.max(8, Math.floor(ctx.height / 0.28))
  for (let row = 1; row < rows; row++) {
    const y = (ctx.height / rows) * row
    slab(ctx, 'terra-cotta', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: y - 0.01, y1: y + 0.01, z0: 0.32, z1: 0.42 }, stoneDark)
  }
}
