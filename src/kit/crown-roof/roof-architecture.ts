import { blackMetal, bronze, roofMetal, stone, stoneDark } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import type { Vec3 } from '../shared/mesh-writer'
import { profiledCylinder } from '../shared/profiles/round'
import { slab, solidBox } from '../shared/profiles/slabs'

export const slopedMetalRoofModule: KitModuleBuilder = (ctx) => {
  const x0 = -ctx.width / 2
  const x1 = ctx.width / 2
  const z0 = -ctx.depth / 2
  const z1 = ctx.depth / 2
  const ridge: Vec3 = [0, ctx.height, 0]
  roofTriangle(ctx, [x0, 0, z1], [x1, 0, z1], ridge)
  roofTriangle(ctx, [x1, 0, z0], [x0, 0, z0], ridge)
  roofTriangle(ctx, [x1, 0, z1], [x1, 0, z0], ridge)
  roofTriangle(ctx, [x0, 0, z0], [x0, 0, z1], ridge)
  for (let index = -5; index <= 5; index++) {
    if (index === 0) continue
    const x = (ctx.width / 12) * index
    roofSeam(ctx, [x, 0.04, z1], ridge, 0.035)
    roofSeam(ctx, [x, 0.04, z0], ridge, 0.035)
  }
  for (let index = -3; index <= 3; index++) {
    if (index === 0) continue
    const z = (ctx.depth / 8) * index
    roofSeam(ctx, [x1, 0.04, z], ridge, 0.035)
    roofSeam(ctx, [x0, 0.04, z], ridge, 0.035)
  }
  solidBox(ctx, 'roof', [-0.08, ctx.height * 0.95, -0.18], [0.08, ctx.height + 0.12, 0.18], roofMetal)
}

export const roofLanternModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'black-metal', [-ctx.width / 2, 0, -ctx.depth / 2], [ctx.width / 2, 0.12, ctx.depth / 2], blackMetal)
  for (const x of [-ctx.width * 0.42, ctx.width * 0.42]) {
    for (const z of [-ctx.depth * 0.42, ctx.depth * 0.42]) {
      solidBox(ctx, 'black-metal', [x - 0.05, 0, z - 0.05], [x + 0.05, ctx.height, z + 0.05], blackMetal)
    }
  }
  solidBox(ctx, 'black-metal', [-ctx.width / 2, ctx.height - 0.12, -ctx.depth / 2], [ctx.width / 2, ctx.height, ctx.depth / 2], blackMetal)
}

export const roofStatueMastModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width * 0.32, 0, -ctx.depth * 0.32], [ctx.width * 0.32, ctx.height * 0.14, ctx.depth * 0.32], stoneDark)
  profiledCylinder({ ctx, slot: 'limestone', x: 0, z: 0, y0: ctx.height * 0.14, y1: ctx.height * 0.88, radius: ctx.width * 0.12, color: stone, segments: 32, flutes: 8 })
  for (const x of [-ctx.width * 0.18, ctx.width * 0.18]) {
    solidBox(ctx, 'limestone', [x - 0.08, ctx.height * 0.28, -0.05], [x + 0.08, ctx.height * 0.86, 0.05], stone)
  }
  profiledCylinder({ ctx, slot: 'bronze', x: 0, z: 0, y0: ctx.height * 0.88, y1: ctx.height, radius: ctx.width * 0.16, color: bronze, segments: 24 })
}

export const roofCrestModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width * 0.35, 0, -ctx.depth * 0.3], [ctx.width * 0.35, ctx.height * 0.2, ctx.depth * 0.3], stoneDark)
  profiledCylinder({ ctx, slot: 'bronze', x: 0, z: 0, y0: ctx.height * 0.2, y1: ctx.height, radius: 0.04, color: bronze, segments: 12 })
  slab(ctx, 'ornament', { x0: 0.04, x1: ctx.width * 0.48, y0: ctx.height * 0.56, y1: ctx.height * 0.82, z0: 0.0, z1: ctx.depth * 0.18 }, stone)
}

function roofTriangle(ctx: Parameters<KitModuleBuilder>[0], a: Vec3, b: Vec3, c: Vec3): void {
  ctx.writer.appendQuad('roof', [
    ctx.transform(a),
    ctx.transform(b),
    ctx.transform(c),
    ctx.transform(c),
  ], roofMetal)
}

function roofSeam(ctx: Parameters<KitModuleBuilder>[0], a: Vec3, b: Vec3, halfWidth: number): void {
  const dx = b[0] - a[0]
  const dz = b[2] - a[2]
  const length = Math.hypot(dx, dz) || 1
  const nx = -dz / length * halfWidth
  const nz = dx / length * halfWidth
  ctx.writer.appendQuad('roof', [
    ctx.transform([a[0] - nx, a[1], a[2] - nz]),
    ctx.transform([a[0] + nx, a[1], a[2] + nz]),
    ctx.transform([b[0] + nx * 0.18, b[1] + 0.04, b[2] + nz * 0.18]),
    ctx.transform([b[0] - nx * 0.18, b[1] + 0.04, b[2] - nz * 0.18]),
  ], roofMetal)
}
