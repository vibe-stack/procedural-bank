import type { KitModuleContext } from '../module-api'
import { blackMetal, bronze, roofMetal } from '../colors'
import { profiledCylinder } from './round'
import { solidBox, slab } from './slabs'

export function louverBox(ctx: KitModuleContext, width: number, height: number, depth: number): void {
  solidBox(ctx, 'roof', [-width / 2, 0, -depth / 2], [width / 2, height, depth / 2], roofMetal)
  for (let index = 0; index < 7; index++) {
    const y = 0.35 + index * 0.18
    slab(ctx, 'black-metal', { x0: -width / 2 - 0.02, x1: width / 2 + 0.02, y0: y, y1: y + 0.045, z0: depth / 2 + 0.02, z1: depth / 2 + 0.08 }, blackMetal)
  }
}

export function fanCylinder(ctx: KitModuleContext, x: number, z: number, radius: number, height: number): void {
  profiledCylinder({ ctx, slot: 'black-metal', x, z, y0: 0, y1: height, radius, color: blackMetal, segments: 28 })
  profiledCylinder({ ctx, slot: 'roof', x, z, y0: height, y1: height + 0.16, radius: radius * 1.12, color: roofMetal, segments: 28 })
}

export function railing(ctx: KitModuleContext, width: number, height: number): void {
  for (let index = 0; index <= 6; index++) {
    const x = -width / 2 + (width / 6) * index
    solidBox(ctx, 'bronze', [x - 0.035, 0, -0.035], [x + 0.035, height, 0.035], bronze)
  }
  for (const y of [height * 0.46, height * 0.9]) {
    solidBox(ctx, 'bronze', [-width / 2, y - 0.03, -0.035], [width / 2, y + 0.03, 0.035], bronze)
  }
}
