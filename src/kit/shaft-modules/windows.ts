import { stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { framedWindow } from '../shared/profiles/openings'
import { rosette } from '../shared/profiles/ornaments'
import { slab } from '../shared/profiles/slabs'

export const window3mModule: KitModuleBuilder = (ctx) => {
  shaftFrame(ctx, 0.32)
  framedWindow({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, side: 0.32, top: 0.32, bottom: 0.74, splits: 2, spandrel: true })
}

export const window4mModule: KitModuleBuilder = (ctx) => {
  shaftFrame(ctx, 0.34)
  framedWindow({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, side: 0.3, top: 0.32, bottom: 0.76, splits: 3, spandrel: true })
}

export const doubleWindowBayModule: KitModuleBuilder = (ctx) => {
  shaftFrame(ctx, 0.3)
  const gap = 0.18
  framedWindow({ ctx, x0: -ctx.width / 2, x1: -gap, y0: 0, y1: ctx.height, side: 0.24, top: 0.32, bottom: 0.78, splits: 2, spandrel: false })
  framedWindow({ ctx, x0: gap, x1: ctx.width / 2, y0: 0, y1: ctx.height, side: 0.24, top: 0.32, bottom: 0.78, splits: 2, spandrel: false })
  slab(ctx, 'limestone', { x0: -gap, x1: gap, y0: 0.16, y1: ctx.height - 0.16, z0: -0.08, z1: 0.3 }, stone)
  for (const x of [-ctx.width * 0.23, ctx.width * 0.23]) {
    rosette(ctx, x, 0.46, 0.16, 0.3, 0.32)
  }
}

export const crownWindowBayModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: 0.28, z0: -0.08, z1: 0.42 }, stoneWarm)
  framedWindow({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0.18, y1: ctx.height - 0.32, side: 0.38, top: 0.44, bottom: 0.5, splits: 2, spandrel: false })
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0: ctx.height - 0.36, y1: ctx.height, z0: -0.1, z1: 0.58 }, stone)
}

function shaftFrame(ctx: Parameters<KitModuleBuilder>[0], pier: number): void {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: -ctx.width / 2 + pier, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.28 }, stoneDark)
  slab(ctx, 'limestone', { x0: ctx.width / 2 - pier, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.28 }, stoneDark)
}
