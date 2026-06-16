import { blackMetal, bronze, granite, stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { bronzeDoor } from '../shared/profiles/openings'
import { slab, solidBox } from '../shared/profiles/slabs'

export const serviceDoorModule: KitModuleBuilder = (ctx) => {
  frame(ctx, 0.42)
  bronzeDoor({ ctx, x0: -ctx.width * 0.23, x1: ctx.width * 0.23, y0: 0.35, y1: ctx.height - 0.85 })
  slab(ctx, 'black-metal', { x0: -0.42, x1: 0.42, y0: ctx.height - 0.72, y1: ctx.height - 0.46, z0: -0.08, z1: 0.12 }, blackMetal)
}

export const loadingDockBayModule: KitModuleBuilder = (ctx) => {
  frame(ctx, 0.52)
  bronzeDoor({ ctx, x0: -ctx.width * 0.34, x1: ctx.width * 0.34, y0: 0.36, y1: ctx.height - 0.7, shutter: true })
  solidBox(ctx, 'bronze', [-ctx.width * 0.46, 0, 0.12], [-ctx.width * 0.38, 0.82, 0.28], bronze)
  solidBox(ctx, 'bronze', [ctx.width * 0.38, 0, 0.12], [ctx.width * 0.46, 0.82, 0.28], bronze)
}

export const granitePlinthModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'granite', [-ctx.width / 2, 0, -ctx.depth / 2], [ctx.width / 2, ctx.height * 0.72, ctx.depth / 2], granite)
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: ctx.height * 0.72, y1: ctx.height, z0: -ctx.depth / 2, z1: ctx.depth / 2 + 0.08 }, stone)
}

function frame(ctx: Parameters<KitModuleBuilder>[0], jamb: number): void {
  const x0 = -ctx.width / 2
  const x1 = ctx.width / 2
  slab(ctx, 'limestone', { x0, x1: x0 + jamb, y0: 0, y1: ctx.height, z0: -0.1, z1: 0.64 }, stone)
  slab(ctx, 'limestone', { x0: x1 - jamb, x1, y0: 0, y1: ctx.height, z0: -0.1, z1: 0.64 }, stone)
  slab(ctx, 'limestone', { x0: x0 + jamb, x1: x1 - jamb, y0: ctx.height - 0.72, y1: ctx.height, z0: -0.1, z1: 0.64 }, stoneWarm)
  slab(ctx, 'limestone', { x0, x1, y0: 0, y1: 0.32, z0: -0.1, z1: 0.42 }, stoneDark)
}
