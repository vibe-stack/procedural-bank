import { blackMetal, bronze, bronzeDark, glass, granite, stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { archedOpening, carvedSeal, triangularPedimentProfile } from '../shared/profiles/arches'
import { bronzeDoor, framedWindow } from '../shared/profiles/openings'
import { dentils, rosette } from '../shared/profiles/ornaments'
import { profiledCylinder, stackedColumn } from '../shared/profiles/round'
import { slab, solidBox } from '../shared/profiles/slabs'

export const colossalColumnModule: KitModuleBuilder = (ctx) => {
  const capitalScale = ctx.width * 0.44
  const capitalY = ctx.height - capitalScale * 0.28
  stackedColumn({ ctx, x: 0, z: 0.22, y0: 0, y1: capitalY, radius: ctx.width * 0.24, color: stone })
  ionicCapital(ctx, 0, capitalY, capitalScale)
  solidBox(ctx, 'limestone', [-ctx.width * 0.56, ctx.height - 0.18, -0.12], [ctx.width * 0.56, ctx.height, 0.78], stoneWarm)
  solidBox(ctx, 'granite', [-ctx.width * 0.46, 0, -0.32], [ctx.width * 0.46, 0.42, 0.72], granite)
}

export const squareCornerPylonModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -0.18], [ctx.width / 2, ctx.height, 0.72], stone)
  for (let index = 1; index < 9; index++) {
    const y = (ctx.height / 9) * index
    slab(ctx, 'limestone', { x0: -ctx.width / 2 + 0.12, x1: ctx.width / 2 - 0.12, y0: y - 0.035, y1: y + 0.035, z0: 0.72, z1: 0.86 }, stoneDark)
  }
  slab(ctx, 'limestone', { x0: -ctx.width / 2 - 0.18, x1: ctx.width / 2 + 0.18, y0: ctx.height - 0.72, y1: ctx.height, z0: -0.18, z1: 0.94 }, stoneWarm)
}

export const triangularPedimentModule: KitModuleBuilder = (ctx) => {
  triangularPedimentProfile({ ctx, width: ctx.width, height: ctx.height, depth: ctx.depth })
  dentils(ctx, -ctx.width / 2 + 0.35, ctx.width / 2 - 0.35, 0.12, 0.28, ctx.depth * 0.72, ctx.depth * 0.96, Math.max(10, Math.floor(ctx.width)))
}

export const pedimentEagleModule: KitModuleBuilder = (ctx) => {
  carvedSeal(ctx, 0, ctx.height * 0.56, 0.08, 0.34, Math.min(ctx.width, ctx.height) * 0.32)
  for (const side of [-1, 1]) {
    slab(ctx, 'ornament', { x0: side * 0.12, x1: side * ctx.width * 0.42, y0: ctx.height * 0.48, y1: ctx.height * 0.64, z0: 0.12, z1: 0.34 }, stoneWarm)
  }
}

export const acroterionScrollModule: KitModuleBuilder = (ctx) => {
  profiledCylinder({ ctx, slot: 'limestone', x: 0, z: 0.18, y0: 0.08, y1: ctx.height * 0.72, radius: ctx.width * 0.2, color: stone, segments: 24 })
  rosette(ctx, 0, ctx.height * 0.54, 0.26, 0.48, ctx.width * 0.34)
  solidBox(ctx, 'limestone', [-ctx.width * 0.32, 0, -0.08], [ctx.width * 0.32, 0.16, 0.42], stoneDark)
}

export const companyFriezeModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -ctx.depth * 0.68, z1: 0.42 }, stoneWarm)
  const letters = Math.max(8, Math.floor(ctx.width / 0.42))
  for (let index = 0; index < letters; index++) {
    const x = -ctx.width / 2 + 0.35 + index * ((ctx.width - 0.7) / letters)
    slab(ctx, 'ornament', { x0: x - 0.055, x1: x + 0.055, y0: ctx.height * 0.28, y1: ctx.height * 0.72, z0: 0.42, z1: 0.54 }, stoneDark)
  }
}

export const clockMedallionModule: KitModuleBuilder = (ctx) => {
  rosette(ctx, 0, ctx.height / 2, 0.08, 0.32, ctx.width * 0.42)
  profiledCylinder({ ctx, slot: 'bronze', x: 0, z: 0.34, y0: ctx.height * 0.46, y1: ctx.height * 0.54, radius: ctx.width * 0.38, color: bronze, segments: 48 })
  slab(ctx, 'black-metal', { x0: -0.035, x1: 0.035, y0: ctx.height * 0.5, y1: ctx.height * 0.78, z0: 0.48, z1: 0.58 }, blackMetal)
  slab(ctx, 'black-metal', { x0: 0, x1: ctx.width * 0.24, y0: ctx.height * 0.49, y1: ctx.height * 0.55, z0: 0.48, z1: 0.58 }, blackMetal)
}

export const rusticatedBaseBlockModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'limestone', [-ctx.width / 2, 0, -0.12], [ctx.width / 2, ctx.height, 0.58], stoneWarm)
  const rows = Math.max(3, Math.floor(ctx.height / 0.45))
  for (let row = 1; row < rows; row++) {
    const y = (ctx.height / rows) * row
    slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: y - 0.025, y1: y + 0.025, z0: 0.58, z1: 0.74 }, stoneDark)
  }
}

export const bankGrilleModule: KitModuleBuilder = (ctx) => {
  framedWindow({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, side: 0.42, top: 0.46, bottom: 0.42, splits: 3 })
  grilleBars(ctx, -ctx.width * 0.32, ctx.width * 0.32, 0.56, ctx.height - 0.62, 7)
}

export const barredWindowModule: KitModuleBuilder = (ctx) => {
  framedWindow({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, side: 0.34, top: 0.38, bottom: 0.42, splits: 2 })
  grilleBars(ctx, -ctx.width * 0.26, ctx.width * 0.26, 0.48, ctx.height - 0.44, 5)
}

export const storefrontCurtainWallModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'black-metal', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.06, z1: 0.12 }, blackMetal)
  slab(ctx, 'glass', { x0: -ctx.width / 2 + 0.12, x1: ctx.width / 2 - 0.12, y0: 0.18, y1: ctx.height - 0.18, z0: 0.0, z1: 0.08 }, glass)
  grilleBars(ctx, -ctx.width / 2 + 0.2, ctx.width / 2 - 0.2, 0.28, ctx.height - 0.28, 4)
}

export const securityDoorModule: KitModuleBuilder = (ctx) => {
  bronzeDoor({ ctx, x0: -ctx.width * 0.28, x1: ctx.width * 0.28, y0: 0.32, y1: ctx.height - 0.52, shutter: true })
  slab(ctx, 'limestone', { x0: -ctx.width / 2, x1: -ctx.width * 0.32, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.55 }, stone)
  slab(ctx, 'limestone', { x0: ctx.width * 0.32, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: -0.08, z1: 0.55 }, stone)
  slab(ctx, 'black-metal', { x0: -ctx.width * 0.24, x1: ctx.width * 0.24, y0: ctx.height - 0.82, y1: ctx.height - 0.46, z0: 0.08, z1: 0.24 }, blackMetal)
}

export const wallPlaqueModule: KitModuleBuilder = (ctx) => {
  slab(ctx, 'bronze', { x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, z0: 0.04, z1: 0.18 }, bronzeDark)
  slab(ctx, 'bronze', { x0: -ctx.width / 2 + 0.08, x1: ctx.width / 2 - 0.08, y0: 0.08, y1: ctx.height - 0.08, z0: 0.18, z1: 0.26 }, bronze)
}

export const addressPlaqueModule: KitModuleBuilder = (ctx) => {
  wallPlaqueModule(ctx)
  for (const x of [-0.18, 0, 0.18]) {
    slab(ctx, 'black-metal', { x0: x - 0.035, x1: x + 0.035, y0: ctx.height * 0.25, y1: ctx.height * 0.75, z0: 0.28, z1: 0.36 }, blackMetal)
  }
}

export const flagMountModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'bronze', [-0.08, 0.1, 0.0], [0.08, 0.36, 0.22], bronze)
  solidBox(ctx, 'bronze', [0, 0.24, 0.16], [ctx.width * 0.5, 0.32, ctx.depth], bronze)
  slab(ctx, 'ornament', { x0: ctx.width * 0.2, x1: ctx.width * 0.5, y0: 0.32, y1: ctx.height, z0: ctx.depth * 0.72, z1: ctx.depth }, stoneWarm)
}

export const bollardModule: KitModuleBuilder = (ctx) => {
  profiledCylinder({ ctx, slot: 'black-metal', x: 0, z: 0, y0: 0, y1: ctx.height, radius: ctx.width * 0.22, color: blackMetal, segments: 24 })
  profiledCylinder({ ctx, slot: 'bronze', x: 0, z: 0, y0: ctx.height * 0.78, y1: ctx.height, radius: ctx.width * 0.26, color: bronze, segments: 24 })
}

export const wallCameraModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'black-metal', [-0.08, 0.1, 0.0], [0.08, ctx.height * 0.7, 0.24], blackMetal)
  solidBox(ctx, 'black-metal', [-ctx.width * 0.35, ctx.height * 0.34, 0.18], [ctx.width * 0.35, ctx.height * 0.62, ctx.depth], blackMetal)
}

export const wallLampModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'bronze', [-0.05, 0, 0], [0.05, ctx.height * 0.68, 0.18], bronze)
  profiledCylinder({ ctx, slot: 'glass', x: 0, z: ctx.depth * 0.55, y0: ctx.height * 0.45, y1: ctx.height, radius: ctx.width * 0.22, color: glass, segments: 20 })
}

export const sidewalkEntryModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'granite', [-ctx.width / 2, 0, -ctx.depth / 2], [ctx.width / 2, ctx.height * 0.45, ctx.depth / 2], granite)
  solidBox(ctx, 'limestone', [-ctx.width * 0.42, ctx.height * 0.45, -ctx.depth * 0.28], [ctx.width * 0.42, ctx.height, ctx.depth * 0.48], stone)
}

export const arcadeBayModule: KitModuleBuilder = (ctx) => {
  archedOpening({ ctx, x0: -ctx.width / 2, x1: ctx.width / 2, y0: 0, y1: ctx.height, depth: 0.84 })
}

function ionicCapital(ctx: Parameters<KitModuleBuilder>[0], x: number, y: number, scale: number): void {
  slab(ctx, 'limestone', { x0: x - scale, x1: x + scale, y0: y, y1: y + scale * 0.26, z0: -0.16, z1: 0.8 }, stoneWarm)
  for (const side of [-1, 1]) {
    rosette(ctx, x + side * scale * 0.55, y + scale * 0.28, 0.62, 0.88, scale * 0.32)
  }
}

function grilleBars(ctx: Parameters<KitModuleBuilder>[0], x0: number, x1: number, y0: number, y1: number, count: number): void {
  for (let index = 0; index < count; index++) {
    const x = x0 + ((x1 - x0) / Math.max(1, count - 1)) * index
    slab(ctx, 'black-metal', { x0: x - 0.035, x1: x + 0.035, y0, y1, z0: 0.18, z1: 0.3 }, blackMetal)
  }
}
