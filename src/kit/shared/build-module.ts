import type { KitModuleId, KitModuleSize } from '../../kit/kit-types'
import { KitMeshWriter } from './mesh-writer'
import type { AnchorMap, KitModuleBuilder } from './module-api'
import { identityTransform } from './transforms'

export function buildKitModuleGeometry(
  id: KitModuleId,
  size: KitModuleSize,
  builder: KitModuleBuilder
): { writer: KitMeshWriter; anchors: AnchorMap; triangles: number } {
  const writer = new KitMeshWriter()
  const anchors: AnchorMap = {
    center: [0, size.height / 2, 0],
    bottom: [0, 0, 0],
    top: [0, size.height, 0],
  }
  builder({
    writer,
    transform: identityTransform,
    moduleId: id,
    width: size.width,
    height: size.height,
    depth: size.depth,
    anchors,
  })
  return { writer, anchors, triangles: writer.triangleCount() }
}
