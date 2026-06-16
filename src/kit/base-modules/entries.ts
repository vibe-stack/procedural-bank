import { bronze, stone, stoneDark, stoneWarm } from '../shared/colors'
import type { KitModuleBuilder } from '../shared/module-api'
import { bronzeDoor, framedWindow } from '../shared/profiles/openings'
import { dentils } from '../shared/profiles/ornaments'
import { profiledCylinder } from '../shared/profiles/round'
import { slab, solidBox } from '../shared/profiles/slabs'

export const tallLobbyWindowModule: KitModuleBuilder = (ctx) => {
  portal(ctx, 0.46, 0.72)
  framedWindow({ ctx, x0: -ctx.width / 2 + 0.34, x1: ctx.width / 2 - 0.34, y0: 0.34, y1: ctx.height - 0.48, side: 0.22, top: 0.28, bottom: 0.58, splits: 3, spandrel: true })
}

export const lobbyDoorModule: KitModuleBuilder = (ctx) => {
  portal(ctx, 0.52, 0.86)
  bronzeDoor({ ctx, x0: -ctx.width / 2 + 0.64, x1: ctx.width / 2 - 0.64, y0: 0.34, y1: ctx.height - 1.0 })
  slab(ctx, 'bronze', { x0: -0.55, x1: 0.55, y0: ctx.height - 0.88, y1: ctx.height - 0.72, z0: 0.04, z1: 0.18 }, bronze)
}

export const revolvingDoorBayModule: KitModuleBuilder = (ctx) => {
  portal(ctx, 0.46, 0.94)
  for (const x of [-ctx.width * 0.34, ctx.width * 0.34]) {
    profiledCylinder({ ctx, slot: 'limestone', x, z: 0.38, y0: 0.2, y1: ctx.height - 0.52, radius: 0.22, color: stone, segments: 32, flutes: 14 })
  }
  bronzeDoor({ ctx, x0: -ctx.width * 0.22, x1: ctx.width * 0.22, y0: 0.28, y1: ctx.height - 0.92, revolving: true })
  profiledCylinder({ ctx, slot: 'bronze', x: 0, z: 0.14, y0: 0.24, y1: ctx.height - 0.92, radius: ctx.width * 0.22, color: bronze, segments: 32 })
}

export const cornerEntranceModule: KitModuleBuilder = (ctx) => {
  lobbyDoorModule(ctx)
  solidBox(ctx, 'limestone', [ctx.width / 2 - 0.24, 0, -ctx.depth * 0.42], [ctx.width / 2 + 0.22, ctx.height, 0.44], stone)
  bronzeDoor({ ctx, x0: ctx.width / 2 - 0.18, x1: ctx.width / 2 + 0.1, y0: 0.4, y1: ctx.height - 1.2 })
}

function portal(ctx: Parameters<KitModuleBuilder>[0], jamb: number, projection: number): void {
  const x0 = -ctx.width / 2
  const x1 = ctx.width / 2
  slab(ctx, 'limestone', { x0, x1: x0 + jamb, y0: 0, y1: ctx.height, z0: -0.12, z1: projection }, stone)
  slab(ctx, 'limestone', { x0: x1 - jamb, x1, y0: 0, y1: ctx.height, z0: -0.12, z1: projection }, stone)
  slab(ctx, 'limestone', { x0: x0 + jamb, x1: x1 - jamb, y0: ctx.height - 0.72, y1: ctx.height, z0: -0.12, z1: projection }, stoneWarm)
  slab(ctx, 'limestone', { x0, x1, y0: 0, y1: 0.34, z0: -0.1, z1: projection * 0.72 }, stoneDark)
  dentils(ctx, x0 + 0.22, x1 - 0.22, ctx.height - 0.56, ctx.height - 0.38, projection, projection + 0.18, 11)
}
