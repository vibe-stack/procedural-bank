import type { FacadeSide } from '../../kit/kit-types'
import type { Vec3 } from './mesh-writer'

export function identityTransform(point: Vec3): Vec3 {
  return point
}

export function facadeTransform(input: {
  side: FacadeSide
  buildingWidth: number
  buildingDepth: number
  center: number
  y: number
  offsetX?: number
  offsetZ?: number
  normalOffset?: number
}): (point: Vec3) => Vec3 {
  const offsetX = input.offsetX ?? 0
  const offsetZ = input.offsetZ ?? 0
  const normalOffset = input.normalOffset ?? 0
  return ([x, y, z]) => {
    if (input.side === 'front') return [offsetX + input.center + x, input.y + y, offsetZ + input.buildingDepth / 2 + normalOffset + z]
    if (input.side === 'back') return [offsetX + input.center - x, input.y + y, offsetZ - input.buildingDepth / 2 - normalOffset - z]
    if (input.side === 'right') return [offsetX + input.buildingWidth / 2 + normalOffset + z, input.y + y, offsetZ - input.center - x]
    return [offsetX - input.buildingWidth / 2 - normalOffset - z, input.y + y, offsetZ + input.center + x]
  }
}

export function roofTransform(input: {
  x: number
  y: number
  z: number
}): (point: Vec3) => Vec3 {
  return ([x, y, z]) => [input.x + x, input.y + y, input.z + z]
}
