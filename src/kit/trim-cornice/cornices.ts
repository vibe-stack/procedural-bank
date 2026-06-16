import { stone, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { dentils, rosette } from '../shared/profiles/ornaments'
import { slab, solidBox } from '../shared/profiles/slabs'

export const smallCorniceModule: KitModuleBuilder = (ctx) => {
  cornice(ctx, 0.55, 0.28)
}

export const largeCorniceModule: KitModuleBuilder = (ctx) => {
  cornice(ctx, 0.82, 0.42)
  dentils(ctx, -ctx.width / 2 + 0.2, ctx.width / 2 - 0.2, 0.1, 0.32, 0.62, 0.9, Math.max(5, Math.floor(ctx.width * 1.4)))
  for (const x of [-ctx.width * 0.3, 0, ctx.width * 0.3]) {
    rosette(ctx, x, ctx.height * 0.5, 0.72, 0.95, 0.22)
  }
}

export const cornerCorniceModule: KitModuleBuilder = (ctx) => {
  largeCorniceModule(ctx)
  solidBox(ctx, 'limestone', [ctx.width / 2 - 0.24, 0, -ctx.depth * 0.65], [ctx.width / 2 + 0.26, ctx.height, 0.82], stone)
  slab(ctx, 'ornament', { x0: ctx.width / 2 - 0.18, x1: ctx.width / 2 + 0.18, y0: 0.18, y1: ctx.height - 0.18, z0: -ctx.depth * 0.55, z1: -ctx.depth * 0.12 }, stoneWarm)
}

export const beltCornerJointModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -ctx.depth / 2], [ctx.width / 2, ctx.height, ctx.depth / 2], stoneWarm)
  solidBox(ctx, 'limestone', [-ctx.width / 2 - 0.08, ctx.height * 0.58, -ctx.depth / 2 - 0.08], [ctx.width / 2 + 0.08, ctx.height, ctx.depth / 2 + 0.08], stone)
}

export const corniceCornerJointModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -ctx.depth / 2], [ctx.width / 2, ctx.height * 0.34, ctx.depth / 2], stoneWarm)
  solidBox(ctx, 'limestone', [-ctx.width / 2 - 0.14, ctx.height * 0.34, -ctx.depth / 2 - 0.14], [ctx.width / 2 + 0.14, ctx.height * 0.74, ctx.depth / 2 + 0.14], stone)
  solidBox(ctx, 'limestone', [-ctx.width / 2 - 0.24, ctx.height * 0.74, -ctx.depth / 2 - 0.24], [ctx.width / 2 + 0.24, ctx.height, ctx.depth / 2 + 0.24], stone)
}

function cornice(ctx: Parameters<KitModuleBuilder>[0], projection: number, friezeDepth: number): void {
  const back = -Math.max(0.08, ctx.depth * 0.45)
  const front = Math.max(projection, ctx.depth * 0.55)
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height * 0.34, z0: back, z1: front * 0.7 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.12, x1: ctx.width / 2 + 0.12, y0: ctx.height * 0.34, y1: ctx.height * 0.72, z0: back, z1: front }, stone)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.18, x1: ctx.width / 2 + 0.18, y0: ctx.height * 0.72, y1: ctx.height, z0: back, z1: front + friezeDepth }, stone)
}
