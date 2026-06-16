import type { KitModuleId } from './kit-types'
import { financialCoreModules } from './financial-core-kit'
import { baseModuleRuntimes } from './base-modules'
import { crownRoofRuntimes } from './crown-roof'
import { shaftModuleRuntimes } from './shaft-modules'
import { trimCorniceRuntimes } from './trim-cornice'
import type { KitModuleRuntime } from './shared/module-api'

const runtimes = [
  ...baseModuleRuntimes,
  ...shaftModuleRuntimes,
  ...trimCorniceRuntimes,
  ...crownRoofRuntimes,
]

export const kitModuleRuntimeById = new Map<KitModuleId, KitModuleRuntime>(
  runtimes.map((runtime) => [runtime.id, runtime])
)

export function getKitModuleRuntime(id: KitModuleId): KitModuleRuntime {
  const runtime = kitModuleRuntimeById.get(id)
  if (!runtime) throw new Error(`Missing financial core module builder: ${id}`)
  return runtime
}

export function missingKitModuleIds(): KitModuleId[] {
  return financialCoreModules
    .map((module) => module.id)
    .filter((id) => !kitModuleRuntimeById.has(id))
}

export function assertCompleteKitRegistry(): void {
  const missing = missingKitModuleIds()
  if (missing.length > 0) {
    throw new Error(`Financial core kit is missing module builders: ${missing.join(', ')}`)
  }
}
