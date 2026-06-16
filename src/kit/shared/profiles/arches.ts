import { glass, stone, stoneDark, stoneWarm } from '../colors'
import type { KitModuleContext } from '../module-api'
import type { Vec3 } from '../mesh-writer'
import { bronzeMullions, dentils, rosette } from './ornaments'
import { slab, solidBox } from './slabs'

export function archedOpening(input: {
  ctx: KitModuleContext
  x0: number
  x1: number
  y0: number
  y1: number
  depth: number
  bars?: boolean
}): void {
  const { ctx, x0, x1, y0, y1, depth } = input
  const width = x1 - x0
  const spring = y0 + (y1 - y0) * 0.58
  const radius = width * 0.5
  slab(ctx, 'limestone', { x0, x1, y0, y1, z0: -0.18, z1: -0.04 }, stoneWarm)
  slab(ctx, 'black-metal', { x0: x0 + 0.34, x1: x1 - 0.34, y0: y0 + 0.22, y1: spring + radius * 0.88, z0: -0.04, z1: 0.06 }, stoneDark)
  slab(ctx, 'limestone', { x0, x1: x0 + 0.34, y0, y1, z0: -0.1, z1: depth }, stone)
  slab(ctx, 'limestone', { x0: x1 - 0.34, x1, y0, y1, z0: -0.1, z1: depth }, stone)
  slab(ctx, 'limestone', { x0: x0 + 0.34, x1: x1 - 0.34, y0: y1 - 0.34, y1, z0: -0.1, z1: depth * 0.72 }, stoneWarm)
  archRing(ctx, x0 + width / 2, spring, radius, 0.34, -0.1, depth)
  slab(ctx, 'glass', { x0: x0 + 0.42, x1: x1 - 0.42, y0: y0 + 0.3, y1: spring + radius * 0.72, z0: 0.06, z1: 0.12 }, glass)
  bronzeMullions(ctx, x0 + 0.36, x1 - 0.36, y0 + 0.3, spring + radius * 0.72, 0.06, 0.18, 2)
  if (input.bars) {
    const count = 5
    for (let index = 0; index < count; index++) {
      const x = x0 + 0.5 + ((width - 1) / (count - 1)) * index
      slab(ctx, 'black-metal', { x0: x - 0.035, x1: x + 0.035, y0: y0 + 0.2, y1: spring + radius * 0.65, z0: 0.18, z1: 0.26 }, stoneDark)
    }
  }
}

export function triangularPedimentProfile(input: {
  ctx: KitModuleContext
  width: number
  height: number
  depth: number
}): void {
  const { ctx, width, height, depth } = input
  const w = width / 2
  const zBack = -depth * 0.62
  solidBox(ctx, 'limestone', [-w, 0, zBack], [w, height * 0.28, depth * 0.62], stoneWarm)
  triangleFace(ctx, [-w, height * 0.28, depth * 0.55], [0, height, depth * 0.72], [w, height * 0.28, depth * 0.55], stone)
  triangleFace(ctx, [-w, height * 0.28, zBack], [0, height, zBack], [w, height * 0.28, zBack], stone)
  triangleFace(ctx, [-w * 0.82, height * 0.34, depth * 0.74], [0, height * 0.82, depth * 0.92], [w * 0.82, height * 0.34, depth * 0.74], stoneWarm)
  dentils(ctx, -w + 0.35, w - 0.35, height * 0.16, height * 0.26, depth * 0.62, depth * 0.84, Math.max(8, Math.floor(width * 1.1)))
}

export function carvedSeal(ctx: KitModuleContext, x: number, y: number, z0: number, z1: number, radius: number): void {
  rosette(ctx, x, y, z0, z1, radius)
  slab(ctx, 'ornament', { x0: x - radius * 0.5, x1: x + radius * 0.5, y0: y - radius * 0.08, y1: y + radius * 0.08, z0, z1 }, stoneDark)
  slab(ctx, 'ornament', { x0: x - radius * 0.08, x1: x + radius * 0.08, y0: y - radius * 0.46, y1: y + radius * 0.46, z0, z1 }, stoneDark)
}

function archRing(
  ctx: KitModuleContext,
  cx: number,
  cy: number,
  radius: number,
  thickness: number,
  z0: number,
  z1: number
): void {
  const segments = 18
  for (let index = 0; index < segments; index++) {
    const a0 = Math.PI - (Math.PI * index) / segments
    const a1 = Math.PI - (Math.PI * (index + 1)) / segments
    const outer0 = point(cx, cy, radius, a0, z1)
    const outer1 = point(cx, cy, radius, a1, z1)
    const inner1 = point(cx, cy, radius - thickness, a1, z1)
    const inner0 = point(cx, cy, radius - thickness, a0, z1)
    const outerBack0 = point(cx, cy, radius, a0, z0)
    const outerBack1 = point(cx, cy, radius, a1, z0)
    const innerBack1 = point(cx, cy, radius - thickness, a1, z0)
    const innerBack0 = point(cx, cy, radius - thickness, a0, z0)
    ctx.writer.appendQuad('limestone', [
      ctx.transform(outer0),
      ctx.transform(inner0),
      ctx.transform(inner1),
      ctx.transform(outer1),
    ], stone)
    ctx.writer.appendQuad('limestone', [
      ctx.transform(outerBack1),
      ctx.transform(innerBack1),
      ctx.transform(innerBack0),
      ctx.transform(outerBack0),
    ], stone)
    ctx.writer.appendQuad('limestone', [
      ctx.transform(outerBack0),
      ctx.transform(outer0),
      ctx.transform(outer1),
      ctx.transform(outerBack1),
    ], stone)
    ctx.writer.appendQuad('limestone', [
      ctx.transform(inner0),
      ctx.transform(innerBack0),
      ctx.transform(innerBack1),
      ctx.transform(inner1),
    ], stone)
  }
}

function triangleFace(ctx: KitModuleContext, a: Vec3, b: Vec3, c: Vec3, color: [number, number, number]): void {
  ctx.writer.appendQuad('limestone', [
    ctx.transform(a),
    ctx.transform(b),
    ctx.transform(c),
    ctx.transform(c),
  ], color)
}

function point(cx: number, cy: number, radius: number, angle: number, z: number): Vec3 {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, z]
}
