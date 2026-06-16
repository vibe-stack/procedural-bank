import * as THREE from 'three/webgpu'
import type { GeometrySet, MaterialSlot } from '../../kit/kit-types'
import { materialSlots } from './material-slots'

export type Vec3 = [number, number, number]
export type Vec2 = [number, number]
export type Color = [number, number, number]

type SlotBuffer = {
  positions: number[]
  normals: number[]
  uvs: number[]
  colors: number[]
  indices: number[]
}

const STONE_TILE_METERS = 1.45
const STONE_ATLAS_COLUMNS = 3
const STONE_ATLAS_ROWS = 2
const ATLAS_PADDING = 0.004
const COHERENT_STONE_CELL = 4

export class KitMeshWriter {
  private readonly buffers = Object.fromEntries(
    materialSlots.map((slot) => [slot, emptyBuffer()])
  ) as Record<MaterialSlot, SlotBuffer>

  appendQuad(
    slot: MaterialSlot,
    corners: [Vec3, Vec3, Vec3, Vec3],
    color: Color,
    uvScale = 0.35
  ): void {
    if (slot === 'limestone' || slot === 'ornament') {
      this.appendAtlasQuad(slot, corners, color)
      return
    }
    const width = distance(corners[0], corners[1]) * uvScale
    const height = distance(corners[1], corners[2]) * uvScale
    this.appendQuadRaw(slot, corners, color, [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ])
  }

  private appendAtlasQuad(
    slot: MaterialSlot,
    corners: [Vec3, Vec3, Vec3, Vec3],
    color: Color
  ): void {
    const width = distance(corners[0], corners[1])
    const height = distance(corners[1], corners[2])
    const uCuts = segmentCuts(width)
    const vCuts = segmentCuts(height)
    const atlasCell = chooseStoneAtlasCell(slot)

    for (let u = 0; u < uCuts.length - 1; u++) {
      for (let v = 0; v < vCuts.length - 1; v++) {
        const u0 = uCuts[u]
        const u1 = uCuts[u + 1]
        const v0 = vCuts[v]
        const v1 = vCuts[v + 1]
        const subCorners: [Vec3, Vec3, Vec3, Vec3] = [
          bilerp(corners, u0, v0),
          bilerp(corners, u1, v0),
          bilerp(corners, u1, v1),
          bilerp(corners, u0, v1),
        ]
        const uSpan = Math.min(1, (width * (u1 - u0)) / STONE_TILE_METERS)
        const vSpan = Math.min(1, (height * (v1 - v0)) / STONE_TILE_METERS)
        this.appendQuadRaw(slot, subCorners, color, atlasUvs(atlasCell, uSpan, vSpan))
      }
    }
  }

  private appendQuadRaw(
    slot: MaterialSlot,
    corners: [Vec3, Vec3, Vec3, Vec3],
    color: Color,
    uvs: [Vec2, Vec2, Vec2, Vec2]
  ): void {
    const buffer = this.buffers[slot]
    const base = buffer.positions.length / 3
    const normal = faceNormal(corners)

    for (let index = 0; index < 4; index++) {
      buffer.positions.push(...corners[index])
      buffer.normals.push(...normal)
      buffer.uvs.push(...uvs[index])
      buffer.colors.push(...color)
    }
    buffer.indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }

  appendBox(
    slot: MaterialSlot,
    min: Vec3,
    max: Vec3,
    color: Color,
    faces: Partial<Record<'front' | 'back' | 'left' | 'right' | 'top' | 'bottom', boolean>> = {}
  ): void {
    const add = (face: keyof typeof faces) => faces[face] !== false
    const [x0, y0, z0] = min
    const [x1, y1, z1] = max
    if (add('front')) this.appendQuad(slot, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], color)
    if (add('back')) this.appendQuad(slot, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], color)
    if (add('right')) this.appendQuad(slot, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], color)
    if (add('left')) this.appendQuad(slot, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], color)
    if (add('top')) this.appendQuad(slot, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], color)
    if (add('bottom')) this.appendQuad(slot, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], color)
  }

  appendFrom(other: KitMeshWriter): void {
    for (const slot of materialSlots) {
      const target = this.buffers[slot]
      const source = other.buffers[slot]
      const offset = target.positions.length / 3
      target.positions.push(...source.positions)
      target.normals.push(...source.normals)
      target.uvs.push(...source.uvs)
      target.colors.push(...source.colors)
      target.indices.push(...source.indices.map((index) => index + offset))
    }
  }

  toGeometries(): GeometrySet {
    return Object.fromEntries(
      materialSlots.map((slot) => [slot, toGeometry(this.buffers[slot])])
    ) as GeometrySet
  }

  triangleCount(): number {
    return materialSlots.reduce(
      (sum, slot) => sum + this.buffers[slot].indices.length / 3,
      0
    )
  }
}

function emptyBuffer(): SlotBuffer {
  return { positions: [], normals: [], uvs: [], colors: [], indices: [] }
}

function segmentCuts(length: number): number[] {
  if (length <= 0.001) return [0, 1]
  const count = Math.max(1, Math.ceil(length / STONE_TILE_METERS))
  return Array.from({ length: count + 1 }, (_, index) => Math.min(1, (index * STONE_TILE_METERS) / length))
}

function chooseStoneAtlasCell(slot: MaterialSlot): number {
  if (slot === 'ornament') return COHERENT_STONE_CELL
  return COHERENT_STONE_CELL
}

function atlasUvs(
  cell: number,
  uSpan: number,
  vSpan: number
): [Vec2, Vec2, Vec2, Vec2] {
  const column = cell % STONE_ATLAS_COLUMNS
  const rowFromTop = Math.floor(cell / STONE_ATLAS_COLUMNS)
  const cellWidth = 1 / STONE_ATLAS_COLUMNS
  const cellHeight = 1 / STONE_ATLAS_ROWS
  const u0 = column * cellWidth + ATLAS_PADDING
  const v0 = 1 - (rowFromTop + 1) * cellHeight + ATLAS_PADDING
  const u1 = u0 + (cellWidth - ATLAS_PADDING * 2) * uSpan
  const v1 = v0 + (cellHeight - ATLAS_PADDING * 2) * vSpan
  return [
    [u0, v0],
    [u1, v0],
    [u1, v1],
    [u0, v1],
  ]
}

function toGeometry(buffer: SlotBuffer): THREE.BufferGeometry | null {
  if (buffer.positions.length === 0) return null
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(buffer.positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(buffer.normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(buffer.uvs, 2))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(buffer.colors, 3))
  geometry.setIndex(buffer.indices)
  geometry.computeBoundingSphere()
  return geometry
}

function faceNormal(corners: [Vec3, Vec3, Vec3, Vec3]): Vec3 {
  const a = subtract(corners[1], corners[0])
  const b = subtract(corners[2], corners[0])
  const n = cross(a, b)
  const length = Math.hypot(...n) || 1
  return [n[0] / length, n[1] / length, n[2] / length]
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function bilerp(corners: [Vec3, Vec3, Vec3, Vec3], u: number, v: number): Vec3 {
  const bottom = lerp(corners[0], corners[1], u)
  const top = lerp(corners[3], corners[2], u)
  return lerp(bottom, top, v)
}

function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}
