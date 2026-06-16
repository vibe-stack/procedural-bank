import type { KitModuleId } from './kit-types'
import { financialCoreModules } from './financial-core-kit'
import { getKitModuleRuntime } from './module-registry'
import { buildKitModuleGeometry } from './shared/build-module'

export function buildKitModulePreview(id: KitModuleId) {
  const module = financialCoreModules.find((candidate) => candidate.id === id)
  if (!module) throw new Error(`Unknown financial core module: ${id}`)
  const runtime = getKitModuleRuntime(id)
  return buildKitModuleGeometry(id, module.defaultSize, runtime.builder)
}
