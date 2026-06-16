import type { KitModuleContext } from '../module-api'
import { bronze, bronzeDark, stone, stoneDark } from '../colors'
import { slab } from './slabs'

export function dentils(
  ctx: KitModuleContext,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  count: number
): void {
  const step = (x1 - x0) / count
  for (let index = 0; index < count; index += 2) {
    slab(ctx, 'ornament', {
      x0: x0 + step * index + step * 0.18,
      x1: x0 + step * (index + 1) - step * 0.18,
      y0,
      y1,
      z0,
      z1,
    }, stone)
  }
}

export function greekKey(
  ctx: KitModuleContext,
  x0: number,
  x1: number,
  y: number,
  z0: number,
  z1: number,
  count: number
): void {
  const step = (x1 - x0) / count
  for (let index = 0; index < count; index++) {
    const left = x0 + index * step
    slab(ctx, 'ornament', { x0: left + step * 0.08, x1: left + step * 0.9, y0: y, y1: y + 0.08, z0, z1 }, stoneDark)
    slab(ctx, 'ornament', { x0: left + step * 0.08, x1: left + step * 0.18, y0: y, y1: y + 0.32, z0, z1 }, stoneDark)
    slab(ctx, 'ornament', { x0: left + step * 0.18, x1: left + step * 0.72, y0: y + 0.24, y1: y + 0.32, z0, z1 }, stoneDark)
    slab(ctx, 'ornament', { x0: left + step * 0.62, x1: left + step * 0.72, y0: y + 0.12, y1: y + 0.32, z0, z1 }, stoneDark)
  }
}

export function rosette(ctx: KitModuleContext, x: number, y: number, z0: number, z1: number, radius: number): void {
  for (let index = 0; index < 12; index++) {
    const angle = (index / 12) * Math.PI * 2
    const cx = x + Math.cos(angle) * radius * 0.42
    const cy = y + Math.sin(angle) * radius * 0.42
    slab(ctx, 'ornament', { x0: cx - radius * 0.06, x1: cx + radius * 0.06, y0: cy - radius * 0.18, y1: cy + radius * 0.18, z0, z1 }, stone)
  }
  slab(ctx, 'ornament', { x0: x - radius * 0.14, x1: x + radius * 0.14, y0: y - radius * 0.14, y1: y + radius * 0.14, z0, z1 }, stoneDark)
}

export function bronzeMullions(ctx: KitModuleContext, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, splits: number): void {
  for (let index = 1; index < splits; index++) {
    const x = x0 + ((x1 - x0) / splits) * index
    slab(ctx, 'bronze', { x0: x - 0.035, x1: x + 0.035, y0, y1, z0, z1 }, bronze)
  }
  const mid = y0 + (y1 - y0) * 0.58
  slab(ctx, 'bronze', { x0, x1, y0: mid - 0.035, y1: mid + 0.035, z0, z1 }, bronzeDark)
}
