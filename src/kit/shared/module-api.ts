import type { KitModuleId, MaterialSlot } from '../../kit/kit-types'
import type { KitMeshWriter, Vec3 } from './mesh-writer'

export type AnchorMap = Record<string, Vec3>

export type KitModuleContext = {
  writer: KitMeshWriter
  transform: (point: Vec3) => Vec3
  moduleId: KitModuleId
  width: number
  height: number
  depth: number
  anchors: AnchorMap
  moduleVariant?: string
}

export type KitModuleBuilder = (context: KitModuleContext) => void

export type KitModuleRuntime = {
  id: KitModuleId
  builder: KitModuleBuilder
  slots: MaterialSlot[]
}
