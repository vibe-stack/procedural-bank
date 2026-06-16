import { stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { dentils, rosette } from '../shared/profiles/ornaments'
import { profiledCylinder } from '../shared/profiles/round'
import { slab, solidBox } from '../shared/profiles/slabs'

export const atticCrestPanelModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height * 0.48, z0: -0.08, z1: 0.42 }, stoneWarm)
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.12, x1: ctx.width / 2 + 0.12, y0: ctx.height * 0.48, y1: ctx.height, z0: -0.08, z1: 0.62 }, stone)
  dentils(ctx, -ctx.width / 2 + 0.2, ctx.width / 2 - 0.2, ctx.height * 0.12, ctx.height * 0.28, 0.42, 0.62, Math.max(5, Math.floor(ctx.width * 1.2)))
  for (const x of [-ctx.width * 0.28, 0, ctx.width * 0.28]) {
    rosette(ctx, x, ctx.height * 0.64, 0.62, 0.78, 0.18)
  }
}

export const crownPedimentModule: KitModuleBuilder = (ctx) => {
  const w = ctx.width / 2
  solidBox(ctx, 'limestone', [-w, 0, -0.08], [w, ctx.height * 0.42, 0.62], stoneWarm)
  solidBox(ctx, 'limestone', [-w * 0.72, ctx.height * 0.42, -0.08], [w * 0.72, ctx.height * 0.72, 0.72], stone)
  solidBox(ctx, 'limestone', [-w * 0.42, ctx.height * 0.72, -0.08], [w * 0.42, ctx.height, 0.86], stone)
  slab(ctx, 'ornament', { x0: -w * 0.46, x1: w * 0.46, y0: ctx.height * 0.14, y1: ctx.height * 0.36, z0: 0.62, z1: 0.82 }, stoneDark)
  rosette(ctx, 0, ctx.height * 0.56, 0.72, 0.94, 0.28)
}

export const cornerFinialModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-0.28, 0, -0.28], [0.28, ctx.height * 0.18, 0.28], stoneDark)
  profiledCylinder({ ctx, slot: 'limestone', x: 0, z: 0, y0: ctx.height * 0.18, y1: ctx.height * 0.72, radius: 0.22, color: stone, segments: 28, flutes: 8 })
  profiledCylinder({ ctx, slot: 'limestone', x: 0, z: 0, y0: ctx.height * 0.72, y1: ctx.height, radius: 0.11, color: stoneWarm, segments: 24 })
}

export const crownUrnFinialModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width * 0.28, 0, -ctx.depth * 0.28], [ctx.width * 0.28, ctx.height * 0.18, ctx.depth * 0.28], stoneDark)
  profiledCylinder({ ctx, slot: 'limestone', x: 0, z: 0, y0: ctx.height * 0.18, y1: ctx.height * 0.62, radius: ctx.width * 0.25, color: stone, segments: 28 })
  profiledCylinder({ ctx, slot: 'limestone', x: 0, z: 0, y0: ctx.height * 0.62, y1: ctx.height * 0.84, radius: ctx.width * 0.16, color: stoneWarm, segments: 24 })
  solidBox(ctx, 'limestone', [-ctx.width * 0.2, ctx.height * 0.84, -ctx.depth * 0.2], [ctx.width * 0.2, ctx.height, ctx.depth * 0.2], stoneWarm)
}

export const crownObeliskFinialModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width * 0.34, 0, -ctx.depth * 0.34], [ctx.width * 0.34, ctx.height * 0.18, ctx.depth * 0.34], stoneDark)
  solidBox(ctx, 'limestone', [-ctx.width * 0.22, ctx.height * 0.18, -ctx.depth * 0.22], [ctx.width * 0.22, ctx.height * 0.74, ctx.depth * 0.22], stone)
  solidBox(ctx, 'limestone', [-ctx.width * 0.1, ctx.height * 0.74, -ctx.depth * 0.1], [ctx.width * 0.1, ctx.height, ctx.depth * 0.1], stoneWarm)
}

export const crownPillarFinialModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width * 0.32, 0, -ctx.depth * 0.32], [ctx.width * 0.32, ctx.height * 0.18, ctx.depth * 0.32], stoneDark)
  solidBox(ctx, 'limestone', [-ctx.width * 0.22, ctx.height * 0.18, -ctx.depth * 0.22], [ctx.width * 0.22, ctx.height * 0.76, ctx.depth * 0.22], stone)
  solidBox(ctx, 'limestone', [-ctx.width * 0.36, ctx.height * 0.76, -ctx.depth * 0.3], [ctx.width * 0.36, ctx.height * 0.9, ctx.depth * 0.3], stoneWarm)
  solidBox(ctx, 'limestone', [-ctx.width * 0.18, ctx.height * 0.9, -ctx.depth * 0.18], [ctx.width * 0.18, ctx.height, ctx.depth * 0.18], stoneWarm)
}

export const crownCartouchePanelModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.46 }, stoneWarm)
  slab(ctx, 'ornament', { x0: -ctx.width * 0.34, x1: ctx.width * 0.34, y0: ctx.height * 0.2, y1: ctx.height * 0.78, z0: 0.46, z1: 0.66 }, stoneDark)
  rosette(ctx, 0, ctx.height * 0.52, 0.66, 0.86, Math.min(ctx.width, ctx.height) * 0.2)
}
