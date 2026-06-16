import type { KitModuleContext } from '../module-api'
import { blackMetal, bronze, glass, stone, stoneWarm } from '../colors'
import { rosette, bronzeMullions } from './ornaments'
import { slab } from './slabs'

export function framedWindow(input: {
  ctx: KitModuleContext
  x0: number
  x1: number
  y0: number
  y1: number
  side: number
  top: number
  bottom: number
  splits: number
  spandrel?: boolean
}): void {
  const { ctx, x0, x1, y0, y1, side, top, bottom } = input
  slab(ctx, 'limestone', { x0, x1: x0 + side, y0, y1, z0: -0.08, z1: 0.28 }, stone)
  slab(ctx, 'limestone', { x0: x1 - side, x1, y0, y1, z0: -0.08, z1: 0.28 }, stone)
  slab(ctx, 'limestone', { x0: x0 + side, x1: x1 - side, y0: y1 - top, y1, z0: -0.08, z1: 0.26 }, stone)
  slab(ctx, 'limestone', { x0: x0 + side, x1: x1 - side, y0, y1: y0 + bottom, z0: -0.08, z1: 0.22 }, stoneWarm)
  const apertureX0 = x0 + side
  const apertureX1 = x1 - side
  const apertureY0 = y0 + bottom
  const apertureY1 = y1 - top
  slab(ctx, 'black-metal', { x0: apertureX0 - 0.04, x1: apertureX1 + 0.04, y0: apertureY0 - 0.04, y1: apertureY1 + 0.04, z0: -0.1, z1: 0.04 }, blackMetal)
  slab(ctx, 'glass', { x0: apertureX0 - 0.01, x1: apertureX1 + 0.01, y0: apertureY0 - 0.01, y1: apertureY1 + 0.01, z0: 0.02, z1: 0.08 }, glass)
  bronzeMullions(ctx, apertureX0 + 0.04, apertureX1 - 0.04, apertureY0 + 0.04, apertureY1 - 0.04, 0.08, 0.18, input.splits)
  if (input.spandrel) {
    const sy0 = y0 + 0.12
    const sy1 = y0 + bottom - 0.14
    slab(ctx, 'ornament', { x0: apertureX0, x1: apertureX1, y0: sy0, y1: sy1, z0: 0.1, z1: 0.22 }, stone)
    rosette(ctx, (apertureX0 + apertureX1) / 2, (sy0 + sy1) / 2, 0.22, 0.34, Math.min(apertureX1 - apertureX0, sy1 - sy0) * 0.32)
  }
}

export function bronzeDoor(input: {
  ctx: KitModuleContext
  x0: number
  x1: number
  y0: number
  y1: number
  revolving?: boolean
  shutter?: boolean
}): void {
  const { ctx, x0, x1, y0, y1 } = input
  slab(ctx, 'black-metal', { x0: x0 - 0.03, x1: x1 + 0.03, y0: y0 - 0.03, y1: y1 + 0.03, z0: -0.1, z1: 0.02 }, blackMetal)
  slab(ctx, input.shutter ? 'black-metal' : 'glass', { x0, x1, y0, y1, z0: 0.02, z1: 0.08 }, input.shutter ? blackMetal : glass)
  if (input.shutter) {
    for (let index = 1; index < 8; index++) {
      const y = y0 + ((y1 - y0) / 8) * index
      slab(ctx, 'bronze', { x0: x0 + 0.1, x1: x1 - 0.1, y0: y - 0.02, y1: y + 0.02, z0: -0.1, z1: 0.02 }, bronze)
    }
    return
  }
  bronzeMullions(ctx, x0, x1, y0, y1, 0.02, 0.16, input.revolving ? 3 : 2)
  slab(ctx, 'bronze', { x0, x1, y0: y0 + 0.14, y1: y0 + 0.28, z0: -0.12, z1: 0.08 }, bronze)
}
