import { createFinancialBuildingPlan } from '../../grammar/building-grammar'
import type { BuildingSettings, GeneratedBuilding } from '../kit-types'
import { compileFinancialBuilding } from './compile-building'

export function generateFinancialBuilding(
  settings: BuildingSettings
): GeneratedBuilding {
  return compileFinancialBuilding(createFinancialBuildingPlan(settings))
}
