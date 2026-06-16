import { stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { greekKey, rosette } from '../shared/profiles/ornaments'
import { slab } from '../shared/profiles/slabs'
import { window3mModule } from './windows'

export const blankBayModule: KitModuleBuilder = (ctx) => {
  panelGrid(ctx, -ctx.width / 2, ctx.width / 2, 0, ctx.height)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 + 0.34, x1: ctx.width / 2 - 0.34, y0: 0.38, y1: ctx.height - 0.38, z0: -0.06, z1: 0.18 }, stoneWarm)
}

export const cornerBayModule: KitModuleBuilder = (ctx) => {
  window3mModule(ctx)
  slab(ctx, 'limestone', { x0: ctx.width / 2 - 0.22, x1: ctx.width / 2 + 0.22, y0: 0, y1: ctx.height, z0: -ctx.depth * 0.5, z1: 0.42 }, stone)
}

export const verticalPilasterStripModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.42 }, stone)
  for (const x of [-0.18, 0, 0.18]) {
    slab(ctx, 'limestone', { x0: x - 0.025, x1: x + 0.025, y0: 0.34, y1: ctx.height - 0.34, z0: 0.42, z1: 0.54 }, stoneDark)
  }
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0: 0, y1: 0.26, z0: -0.1, z1: 0.5 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0: ctx.height - 0.34, y1: ctx.height, z0: -0.1, z1: 0.5 }, stoneWarm)
}

export const spandrelPanelModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.2 }, stoneWarm)
  slab(ctx, 'ornament', { x0: -ctx.width / 2 + 0.25, x1: ctx.width / 2 - 0.25, y0: 0.16, y1: ctx.height - 0.16, z0: 0.2, z1: 0.36 }, stone)
  rosette(ctx, 0, ctx.height / 2, 0.36, 0.5, Math.min(ctx.width, ctx.height) * 0.32)
}

export const floorBandStripModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.26 }, stone)
  greekKey(ctx, -ctx.width / 2 + 0.15, ctx.width / 2 - 0.15, ctx.height * 0.22, 0.26, 0.44, Math.max(3, Math.floor(ctx.width)))
}

function panelGrid(ctx: Parameters<KitModuleBuilder>[0], x0: number, x1: number, y0: number, y1: number): void {
  slab(ctx, 'limestone', { x0, x1, y0, y1, z0: -0.08, z1: 0.12 }, stone)
  const midX = (x0 + x1) / 2
  const midY = (y0 + y1) / 2
  slab(ctx, 'limestone', { x0: midX - 0.025, x1: midX + 0.025, y0: y0 + 0.18, y1: y1 - 0.18, z0: 0.12, z1: 0.22 }, stoneDark)
  slab(ctx, 'limestone', { x0: x0 + 0.18, x1: x1 - 0.18, y0: midY - 0.025, y1: midY + 0.025, z0: 0.12, z1: 0.22 }, stoneDark)
}
