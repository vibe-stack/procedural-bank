import { blackMetal, bronze, roofMetal } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { fanCylinder, louverBox, railing } from '../shared/profiles/roof-props'
import { profiledCylinder } from '../shared/profiles/round'
import { solidBox } from '../shared/profiles/slabs'

export const roofMechBoxModule: KitModuleBuilder = (ctx) => {
  louverBox(ctx, ctx.width, ctx.height, ctx.depth)
}

export const hvacClusterModule: KitModuleBuilder = (ctx) => {
  solidBox(ctx, 'roof', [-ctx.width * 0.45, 0, -ctx.depth * 0.35], [-ctx.width * 0.1, ctx.height * 0.55, ctx.depth * 0.25], roofMetal)
  fanCylinder(ctx, ctx.width * 0.16, -ctx.depth * 0.2, 0.45, ctx.height * 0.62)
  fanCylinder(ctx, ctx.width * 0.36, ctx.depth * 0.18, 0.36, ctx.height * 0.48)
  solidBox(ctx, 'black-metal', [-ctx.width * 0.38, ctx.height * 0.16, ctx.depth * 0.28], [-ctx.width * 0.08, ctx.height * 0.42, ctx.depth * 0.36], blackMetal)
}

export const roofRailingModule: KitModuleBuilder = (ctx) => {
  railing(ctx, ctx.width, ctx.height)
}

export const antennaModule: KitModuleBuilder = (ctx) => {
  profiledCylinder({ ctx, slot: 'black-metal', x: 0, z: 0, y0: 0, y1: ctx.height, radius: 0.035, color: blackMetal, segments: 14 })
  for (const y of [0.7, 1.5, 2.4, 3.3]) {
    profiledCylinder({ ctx, slot: 'bronze', x: 0, z: 0, y0: y, y1: y + 0.08, radius: 0.16, color: bronze, segments: 16 })
  }
  solidBox(ctx, 'black-metal', [-0.25, 1.1, -0.025], [0.25, 1.16, 0.025], blackMetal)
  solidBox(ctx, 'black-metal', [-0.18, 2.1, -0.025], [0.18, 2.16, 0.025], blackMetal)
}
