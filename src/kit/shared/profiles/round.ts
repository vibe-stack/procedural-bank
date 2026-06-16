import type { MaterialSlot } from '../../../kit/kit-types'
import type { Color, Vec3 } from '../mesh-writer'
import type { KitModuleContext } from '../module-api'

export function profiledCylinder(input: {
  ctx: KitModuleContext
  slot: MaterialSlot
  x: number
  z: number
  y0: number
  y1: number
  radius: number
  color: Color
  segments?: number
  flutes?: number
}): void {
  const segments = input.segments ?? 40
  for (let index = 0; index < segments; index++) {
    const a0 = (index / segments) * Math.PI * 2
    const a1 = ((index + 1) / segments) * Math.PI * 2
    const r0 = fluteRadius(a0, input.radius, input.flutes)
    const r1 = fluteRadius(a1, input.radius, input.flutes)
    quad(input.ctx, input.slot, [
      point(input, a1, r1, input.y0),
      point(input, a0, r0, input.y0),
      point(input, a0, r0, input.y1),
      point(input, a1, r1, input.y1),
    ], input.color)
  }
}

export function stackedColumn(input: {
  ctx: KitModuleContext
  x: number
  z: number
  y0: number
  y1: number
  radius: number
  color: Color
}): void {
  const h = input.y1 - input.y0
  const bands = [
    [0, 0.06, input.radius * 1.38],
    [0.06, 0.12, input.radius * 1.22],
    [0.12, 0.18, input.radius * 1.02],
    [0.18, 0.84, input.radius],
    [0.84, 0.9, input.radius * 1.06],
    [0.9, 0.95, input.radius * 1.24],
    [0.95, 1, input.radius * 1.42],
  ] as const
  for (const [a, b, radius] of bands) {
    profiledCylinder({
      ctx: input.ctx,
      slot: 'limestone',
      x: input.x,
      z: input.z,
      y0: input.y0 + h * a,
      y1: input.y0 + h * b,
      radius,
      color: input.color,
      segments: radius === input.radius ? 56 : 44,
      flutes: radius === input.radius ? 18 : undefined,
    })
  }
}

function point(
  input: { ctx: KitModuleContext; x: number; z: number },
  angle: number,
  radius: number,
  y: number
): Vec3 {
  return [
    input.x + Math.cos(angle) * radius,
    y,
    input.z + Math.sin(angle) * radius,
  ]
}

function quad(
  ctx: KitModuleContext,
  slot: MaterialSlot,
  points: [Vec3, Vec3, Vec3, Vec3],
  color: Color
): void {
  ctx.writer.appendQuad(slot, points.map(ctx.transform) as [Vec3, Vec3, Vec3, Vec3], color)
}

function fluteRadius(angle: number, radius: number, flutes?: number): number {
  if (!flutes) return radius
  return radius * (0.93 + Math.max(0, Math.sin(angle * flutes)) * 0.07)
}
