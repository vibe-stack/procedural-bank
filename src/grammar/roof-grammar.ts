import { roofPlace } from './placement-factory'
import type { BuildingSettings, BuildingTier, KitPlacement } from '../kit/kit-types'

export function createRoofPlacements(
  settings: BuildingSettings,
  tier: BuildingTier
): KitPlacement[] {
  const y = tier.y0 + tier.height + 0.12
  if (settings.roofStyle === 'pyramidal-metal' || settings.roofStyle === 'statue-tower') {
    return [
      roofPlace({ id: 'sloped-metal-roof', center: tier.x, roofZ: tier.z, y, width: tier.width * 0.92, height: Math.min(6.2, tier.depth * 0.32), depth: tier.depth * 0.92, bayIndex: 0 }),
      ...(settings.roofStyle === 'statue-tower'
        ? [
          roofPlace({ id: 'roof-lantern', center: tier.x, roofZ: tier.z, y: y + Math.min(6.2, tier.depth * 0.32), width: 2.4, height: 1.8, depth: 2.4, bayIndex: 1 }),
          roofPlace({ id: 'roof-statue-mast', center: tier.x, roofZ: tier.z, y: y + Math.min(8.0, tier.depth * 0.32 + 1.5), width: 1.7, height: 5.8, depth: 1.7, bayIndex: 2 }),
        ]
        : [
          roofPlace({ id: 'roof-crest', center: tier.x, roofZ: tier.z, y: y + Math.min(6.2, tier.depth * 0.32), width: 1.4, height: 2.4, depth: 1.4, bayIndex: 2 }),
        ]),
    ]
  }

  const result: KitPlacement[] = [
    ...terraceRailings(tier, y, 0),
  ]

  if (settings.roofEquipmentDensity > 0.12) {
    result.push(roofPlace({
      id: 'roof-mech-box',
      center: tier.x - tier.width * 0.22,
      roofZ: tier.z - tier.depth * 0.04,
      y,
      width: 3.6,
      height: 2.0,
      depth: 2.8,
      bayIndex: 2,
    }))
  }
  if (settings.roofEquipmentDensity > 0.32) {
    result.push(roofPlace({
      id: 'hvac-cluster',
      center: tier.x + tier.width * 0.2,
      roofZ: tier.z - tier.depth * 0.12,
      y,
      width: 4.3,
      height: 2.2,
      depth: 3.0,
      bayIndex: 3,
    }))
  }
  if (settings.roofEquipmentDensity > 0.58) {
    result.push(roofPlace({
      id: 'roof-mech-box',
      center: tier.x,
      roofZ: tier.z + tier.depth * 0.22,
      y,
      width: 2.6,
      height: 1.55,
      depth: 2.2,
      bayIndex: 4,
    }))
  }
  if (settings.roofEquipmentDensity > 0.66) {
    result.push(roofPlace({
      id: 'antenna',
      center: tier.x + tier.width * 0.36,
      roofZ: tier.z + tier.depth * 0.28,
      y,
      width: 0.8,
      height: 4.6,
      depth: 0.8,
      bayIndex: 5,
    }))
  }
  return result
}

function terraceRailings(tier: BuildingTier, y: number, offset: number): KitPlacement[] {
  return [
    roofPlace({
      id: 'roof-railing',
      center: tier.x - tier.width * 0.18,
      roofZ: tier.z - tier.depth * 0.44,
      y,
      width: tier.width * 0.58,
      height: 1.1,
      depth: 0.4,
      bayIndex: offset,
    }),
    roofPlace({
      id: 'roof-railing',
      center: tier.x + tier.width * 0.18,
      roofZ: tier.z + tier.depth * 0.44,
      y,
      width: tier.width * 0.58,
      height: 1.1,
      depth: 0.4,
      bayIndex: offset + 1,
    }),
  ]
}
