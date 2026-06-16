import type { BuildingPlan, BuildingTier, GeneratedBuilding, KitPlacement, MaterialSlot } from '../kit-types'
import { getKitModuleRuntime, assertCompleteKitRegistry } from '../module-registry'
import { KitMeshWriter } from '../shared/mesh-writer'
import { facadeTransform, roofTransform } from '../shared/transforms'
import { financialCoreModules } from '../financial-core-kit'
import { appendMassCaps } from './mass-caps'

const topologyColors: Record<BuildingTier['role'], [number, number, number]> = {
  podium: [0.46, 0.56, 0.68],
  shaft: [0.58, 0.62, 0.54],
  crown: [0.66, 0.55, 0.42],
  bridge: [0.5, 0.64, 0.66],
}

export function compileFinancialBuilding(plan: BuildingPlan): GeneratedBuilding {
  assertCompleteKitRegistry()
  const writer = new KitMeshWriter()
  if (plan.settings.debugMode === 'topology') {
    for (const tier of plan.tiers) appendTopologyBlock(writer, tier)
  } else {
    appendMassCaps(writer, plan.tiers)
    for (const placement of plan.placements) appendPlacement(writer, plan, placement)
  }

  const moduleUsage = moduleUsageFrom(plan.placements)
  return {
    geometries: writer.toGeometries(),
    triangleCount: writer.triangleCount(),
    moduleCount: plan.placements.length,
    plan,
    moduleUsage,
  }
}

function appendPlacement(
  writer: KitMeshWriter,
  plan: BuildingPlan,
  placement: KitPlacement
): void {
  const runtime = getKitModuleRuntime(placement.id)
  const tier = plan.tiers.find((candidate) => candidate.name === placement.tierName)
  const transform = placement.side === 'roof'
    ? roofTransform({ x: placement.center, y: placement.y, z: placement.roofZ ?? 0 })
    : facadeTransform({
      side: placement.side,
      buildingWidth: tier?.width ?? plan.tiers[0].width,
      buildingDepth: tier?.depth ?? plan.tiers[0].depth,
      center: placement.center,
      y: placement.y,
      offsetX: placement.xOffset ?? tier?.x ?? 0,
      offsetZ: placement.zOffset ?? tier?.z ?? 0,
      normalOffset: placement.normalOffset ?? 0,
    })
  runtime.builder({
    writer,
    transform,
    moduleId: placement.id,
    width: placement.width,
    height: placement.height,
    depth: placement.depth,
    anchors: {},
    moduleVariant: placement.moduleVariant,
  })
}

function appendTopologyBlock(writer: KitMeshWriter, tier: BuildingTier): void {
  writer.appendBox(
    'limestone',
    [tier.x - tier.width / 2, tier.y0, tier.z - tier.depth / 2],
    [tier.x + tier.width / 2, tier.y0 + tier.height, tier.z + tier.depth / 2],
    topologyColors[tier.role]
  )
}

function moduleUsageFrom(placements: KitPlacement[]): Partial<Record<KitPlacement['id'], number>> {
  const usage: Partial<Record<KitPlacement['id'], number>> = {}
  for (const module of financialCoreModules) usage[module.id] = 0
  for (const placement of placements) usage[placement.id] = (usage[placement.id] ?? 0) + 1
  return usage
}

export function materialSlotCount(geometries: GeneratedBuilding['geometries']): number {
  return (Object.keys(geometries) as MaterialSlot[]).filter((slot) => geometries[slot]).length
}
