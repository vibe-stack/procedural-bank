import { bronze, stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { stackedColumn } from '../shared/profiles/round'
import { bevelBlock, slab, solidBox } from '../shared/profiles/slabs'

export const roundColumnModule: KitModuleBuilder = (ctx) => {
  stackedColumn({
    ctx,
    x: 0,
    z: 0.18,
    y0: 0,
    y1: ctx.height,
    radius: Math.min(ctx.width, ctx.depth) * 0.28,
    color: stone,
  })
  ctx.anchors.capital = [0, ctx.height * 0.92, 0.18]
}

export const squareColumnModule: KitModuleBuilder = (ctx) => {
  const w = ctx.width / 2
  bevelBlock(ctx, 'limestone', [-w, 0, -0.1], [w, ctx.height, 0.42], 0.08, stone)
  for (let index = 1; index < 6; index++) {
    const y = (ctx.height / 6) * index
    slab(ctx, 'limestone', { x0: -w + 0.08, x1: w - 0.08, y0: y - 0.025, y1: y + 0.025, z0: 0.43, z1: 0.5 }, stoneDark)
  }
  slab(ctx, 'limestone', { x0: -w - 0.12, x1: w + 0.12, y0: 0, y1: 0.34, z0: -0.16, z1: 0.58 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -w - 0.14, x1: w + 0.14, y0: ctx.height - 0.48, y1: ctx.height, z0: -0.16, z1: 0.6 }, stoneWarm)
}

export const pairedColumnModule: KitModuleBuilder = (ctx) => {
  const columnY0 = 0.15
  const columnY1 = ctx.height - 0.62
  for (const x of [-ctx.width * 0.28, ctx.width * 0.28]) {
    stackedColumn({ ctx, x, z: 0.22, y0: columnY0, y1: columnY1, radius: 0.3, color: stone })
    solidBox(ctx, 'granite', [x - 0.48, 0, -0.22], [x + 0.48, 0.24, 0.68], stoneDark)
  }
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: ctx.height - 0.72, y1: ctx.height - 0.28, z0: -0.12, z1: 0.72 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.12, x1: ctx.width / 2 + 0.12, y0: ctx.height - 0.28, y1: ctx.height, z0: -0.18, z1: 0.84 }, stone)
  solidBox(ctx, 'bronze', [-0.08, 0.35, 0.0], [0.08, ctx.height - 0.95, 0.08], bronze)
}
