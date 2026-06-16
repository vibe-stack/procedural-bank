/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu"
import { float } from "three/tsl"

export class BoundedShadowNode extends (THREE as any).ShadowNode {
  constructor(light: THREE.Object3D, shadow: THREE.LightShadow) {
    super(light, shadow)
  }

  setupShadowFilter(_builder: unknown, args: any): unknown {
    const { filterFn, depthTexture, shadowCoord, shadow, depthLayer } = args
    const inShadowProjection = shadowCoord.x
      .greaterThanEqual(0)
      .and(shadowCoord.x.lessThanEqual(1))
      .and(shadowCoord.y.greaterThanEqual(0))
      .and(shadowCoord.y.lessThanEqual(1))
      .and(shadowCoord.z.greaterThanEqual(0))
      .and(shadowCoord.z.lessThanEqual(1))
    const shadowValue = filterFn({
      depthTexture,
      shadowCoord,
      shadow,
      depthLayer,
    })
    return inShadowProjection.select(shadowValue, float(1))
  }
}
