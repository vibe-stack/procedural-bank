import { stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { framedWindow } from '../shared/profiles/openings'
import { rosette } from '../shared/profiles/ornaments'
import { profiledCylinder } from '../shared/profiles/round'
import { slab, solidBox } from '../shared/profiles/slabs'

export const crownWindowBayModule: KitModuleBuilder = (ctx) => {
  framedWindow({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, side: 0.42, top: 0.48, bottom: 0.56, splits: 2 })
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0: ctx.height - 0.42, y1: ctx.height, z0: -0.08, z1: 0.58 }, stone)
}

export const parapetSectionModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.42 }, stoneWarm)
  for (const x of [-ctx.width * 0.34, 0, ctx.width * 0.34]) {
    slab(ctx, 'limestone', { x0: x - 0.12, x1: x + 0.12, y0: 0.18, y1: ctx.height - 0.22, z0: 0.42, z1: 0.58 }, stoneDark)
    rosette(ctx, x, ctx.height * 0.55, 0.58, 0.72, 0.22)
  }
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.12, x1: ctx.width / 2 + 0.12, y0: ctx.height - 0.22, y1: ctx.height, z0: -0.08, z1: 0.58 }, stone)
}

export const cornerParapetModule: KitModuleBuilder = (ctx) => {
  parapetSectionModule(ctx)
  solidBox(ctx, 'limestone', [ctx.width / 2 - 0.28, 0, -ctx.depth * 0.5], [ctx.width / 2 + 0.28, ctx.height, 0.52], stone)
  for (const z of [-ctx.depth * 0.38, 0.38]) {
    profiledCylinder({ ctx, slot: 'limestone', x: ctx.width / 2, z, y0: ctx.height - 0.02, y1: ctx.height + 0.42, radius: 0.13, color: stone, segments: 20 })
  }
}
