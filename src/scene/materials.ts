import { useMemo } from 'react'
import * as THREE from 'three/webgpu'
import { attribute, float, texture, vec3 } from 'three/tsl'
import type { MaterialSlot, MaterialVariant } from '../kit/kit-types'

const base = import.meta.env.BASE_URL
const textureUrls = {
  limestone: `${base}assets/financial-core/limestone-albedo.png`,
  limestoneNormal: `${base}assets/financial-core/limestone-normal.png`,
  ornaments: `${base}assets/financial-core/ornaments-albedo.png`,
  ornamentsNormal: `${base}assets/financial-core/ornaments-normal.png`,
}

export type MaterialMap = Record<MaterialSlot, THREE.Material>

export function useFinancialMaterials(variant: MaterialVariant): MaterialMap {
  return useMemo(() => {
    const loader = new THREE.TextureLoader()
    const limestoneMap = configureColorTexture(loader.load(textureUrls.limestone))
    const limestoneNormal = configureDataTexture(loader.load(textureUrls.limestoneNormal))
    const ornamentNormal = configureDataTexture(loader.load(textureUrls.ornamentsNormal))

    return {
      limestone: texturedStone(limestoneMap, limestoneNormal, tintForVariant(variant), 0.78),
      granite: flatMaterial([0.28, 0.27, 0.25], 0.82, 0.02),
      'terra-cotta': texturedStone(limestoneMap, limestoneNormal, [0.88, 0.32, 0.18], 0.8),
      glass: flatMaterial([0.018, 0.028, 0.035], 0.08, 0.72),
      bronze: flatMaterial([0.62, 0.42, 0.2], 0.32, 0.86),
      'black-metal': flatMaterial([0.02, 0.02, 0.018], 0.42, 0.55),
      ornament: texturedStone(limestoneMap, ornamentNormal, tintForVariant(variant), 0.86),
      roof: flatMaterial([0.2, 0.2, 0.19], 0.76, 0.08),
    }
  }, [variant])
}

function texturedStone(
  colorMap: THREE.Texture,
  normalMap: THREE.Texture,
  tint: [number, number, number],
  roughness: number
): THREE.MeshStandardNodeMaterial {
  const material = new THREE.MeshStandardNodeMaterial()
  material.colorNode = texture(colorMap).rgb.mul(attribute<'vec3'>('color', 'vec3')).mul(vec3(...tint))
  material.roughnessNode = float(roughness)
  material.metalnessNode = float(0.02)
  material.normalMap = normalMap
  material.normalScale = new THREE.Vector2(0.22, 0.22)
  return material
}

function flatMaterial(
  color: [number, number, number],
  roughness: number,
  metalness: number
): THREE.MeshStandardNodeMaterial {
  const material = new THREE.MeshStandardNodeMaterial()
  material.colorNode = attribute<'vec3'>('color', 'vec3').mul(vec3(...color))
  material.roughnessNode = float(roughness)
  material.metalnessNode = float(metalness)
  return material
}

function configureColorTexture(textureMap: THREE.Texture): THREE.Texture {
  textureMap.colorSpace = THREE.SRGBColorSpace
  textureMap.wrapS = THREE.RepeatWrapping
  textureMap.wrapT = THREE.RepeatWrapping
  textureMap.anisotropy = 8
  return textureMap
}

function configureDataTexture(textureMap: THREE.Texture): THREE.Texture {
  textureMap.colorSpace = THREE.NoColorSpace
  textureMap.wrapS = THREE.RepeatWrapping
  textureMap.wrapT = THREE.RepeatWrapping
  textureMap.anisotropy = 8
  return textureMap
}

function tintForVariant(variant: MaterialVariant): [number, number, number] {
  if (variant === 'dark-granite') return [0.58, 0.57, 0.54]
  if (variant === 'aged-terra-cotta') return [1.04, 0.72, 0.52]
  return [0.98, 0.96, 0.9]
}
