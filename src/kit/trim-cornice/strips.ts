import { stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { dentils, greekKey } from '../shared/profiles/ornaments'
import { slab } from '../shared/profiles/slabs'

export const beltCourseSmallModule: KitModuleBuilder = (ctx) => {
  bead(ctx, 0, ctx.height, 0.32)
}

export const beltCourseLargeModule: KitModuleBuilder = (ctx) => {
  bead(ctx, 0, ctx.height, 0.48)
  slab(ctx, 'ornament', { x0: -ctx.width / 2 + 0.16, x1: ctx.width / 2 - 0.16, y0: ctx.height * 0.34, y1: ctx.height * 0.76, z0: 0.26, z1: 0.48 }, stoneWarm)
  dentils(ctx, -ctx.width / 2 + 0.2, ctx.width / 2 - 0.2, ctx.height * 0.08, ctx.height * 0.24, 0.42, 0.66, Math.max(6, Math.floor(ctx.width * 1.5)))
}

export const windowSillStripModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: ctx.height * 0.32, y1: ctx.height, z0: -0.08, z1: 0.46 }, stone)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.1, x1: ctx.width / 2 + 0.1, y0: 0, y1: ctx.height * 0.34, z0: -0.08, z1: 0.6 }, stoneWarm)
}

export const lintelStripModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.42 }, stone)
  for (let index = 1; index < Math.max(2, Math.floor(ctx.width)); index++) {
    const x = -ctx.width / 2 + (ctx.width / Math.floor(ctx.width)) * index
    slab(ctx, 'limestone', { x0: x - 0.025, x1: x + 0.025, y0: 0.08, y1: ctx.height - 0.08, z0: 0.42, z1: 0.5 }, stoneDark)
  }
}

export const floorBandStripModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.32 }, stone)
  greekKey(ctx, -ctx.width / 2 + 0.18, ctx.width / 2 - 0.18, ctx.height * 0.2, 0.32, 0.54, Math.max(4, Math.floor(ctx.width * 1.25)))
}

export const dentilCorbelCourseModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: ctx.height * 0.36, y1: ctx.height, z0: -0.08, z1: 0.62 }, stone)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.1, x1: ctx.width / 2 + 0.1, y0: 0, y1: ctx.height * 0.28, z0: -0.08, z1: 0.8 }, stoneWarm)
  const count = Math.max(4, Math.floor(ctx.width * 1.2))
  dentils(ctx, -ctx.width / 2 + 0.16, ctx.width / 2 - 0.16, ctx.height * 0.1, ctx.height * 0.36, 0.62, 0.92, count)
}

function bead(ctx: Parameters<KitModuleBuilder>[0], y0: number, y1: number, z: number): void {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0, y1, z0: -0.08, z1: z }, stone)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0, y1: y0 + 0.12, z0: -0.08, z1: z + 0.14 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.08, x1: ctx.width / 2 + 0.08, y0: y1 - 0.12, y1, z0: -0.08, z1: z + 0.14 }, stoneWarm)
}
