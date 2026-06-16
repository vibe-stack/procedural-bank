import type { MaterialSlot } from '../../../kit/kit-types'
import type { Color, Vec3 } from '../mesh-writer'
import type { KitModuleContext } from '../module-api'

export function slab(
  ctx: KitModuleContext,
  slot: MaterialSlot,
  rect: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number },
  color: Color
): void {
  const { x0, x1, y0, y1, z0, z1 } = rect
  quad(ctx, slot, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], color)
  quad(ctx, slot, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], color)
  quad(ctx, slot, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], color)
  quad(ctx, slot, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], color)
  quad(ctx, slot, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], color)
}

export function solidBox(
  ctx: KitModuleContext,
  slot: MaterialSlot,
  min: Vec3,
  max: Vec3,
  color: Color
): void {
  const [x0, y0, z0] = min
  const [x1, y1, z1] = max
  quad(ctx, slot, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], color)
  quad(ctx, slot, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], color)
  quad(ctx, slot, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], color)
  quad(ctx, slot, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], color)
  quad(ctx, slot, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], color)
  quad(ctx, slot, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], color)
}

export function bevelBlock(
  ctx: KitModuleContext,
  slot: MaterialSlot,
  min: Vec3,
  max: Vec3,
  bevel: number,
  color: Color
): void {
  solidBox(ctx, slot, [min[0] + bevel, min[1] + bevel, min[2]], [max[0] - bevel, max[1] - bevel, max[2]], color)
  slab(ctx, slot, { x0: min[0], x1: min[0] + bevel, y0: min[1] + bevel, y1: max[1] - bevel, z0: min[2], z1: max[2] }, color)
  slab(ctx, slot, { x0: max[0] - bevel, x1: max[0], y0: min[1] + bevel, y1: max[1] - bevel, z0: min[2], z1: max[2] }, color)
  slab(ctx, slot, { x0: min[0] + bevel, x1: max[0] - bevel, y0: min[1], y1: min[1] + bevel, z0: min[2], z1: max[2] }, color)
  slab(ctx, slot, { x0: min[0] + bevel, x1: max[0] - bevel, y0: max[1] - bevel, y1: max[1], z0: min[2], z1: max[2] }, color)
}

export function quad(
  ctx: KitModuleContext,
  slot: MaterialSlot,
  points: [Vec3, Vec3, Vec3, Vec3],
  color: Color
): void {
  ctx.writer.appendQuad(
    slot,
    points.map(ctx.transform) as [Vec3, Vec3, Vec3, Vec3],
    color
  )
}
