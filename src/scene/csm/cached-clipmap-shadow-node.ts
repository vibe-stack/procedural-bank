/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu"
import {
  Fn,
  abs,
  float,
  max,
  reference,
  renderGroup,
  shadowPositionWorld,
  smoothstep,
  uniform,
  vec4,
} from "three/tsl"
import { BoundedShadowNode } from "./bounded-shadow-node"

/**
 * Cached clipmap shadows for directional lights.
 *
 * This is a Three.js WebGPU/TSL shadow node that renders concentric square
 * shadow-map levels around a camera in light space. Each level is a normal
 * Three.js shadow map with stable texel snapping; coarse levels can stay cached
 * across frames while near levels update continuously for dynamic casters.
 *
 * This is not a virtual-paged shadow-map implementation. It has no page table,
 * physical page cache, or page-granular caster submission.
 */

export type CachedClipmapShadowNodeOptions = {
  /** Camera that defines the clipmap origin. Defaults to the render camera. */
  camera?: THREE.Camera
  /** Optional square map size applied to every clipmap level. */
  mapSize?: number
  /**
   * Optional square map sizes per clipmap level. Missing entries fall back to
   * the light's current shadow map size.
   */
  levelMapSizes?: number[]
  /**
   * Number of clipmap levels. Default: derived so the outermost level covers
   * `maxDistance`. Each level is one shadow map texture bound in the material
   * shader - keep an eye on the device's per-stage sampled-texture limit.
   */
  levels?: number
  /** Half-width (meters) of the finest level around the camera. */
  firstRadius?: number
  /** Extent multiplier between consecutive levels. */
  scaleFactor?: number
  /** Shadow range: the outermost level reaches at least this far. */
  maxDistance?: number
  /**
   * How far (meters) the light camera is pulled toward the light beyond the
   * level's receiver volume, to catch tall off-screen casters.
   */
  lightMargin?: number
  shadowCameraNear?: number
  /**
   * Cap on the per-level depth range. Also the reference range the
   * user-tuned `light.shadow.bias` is normalized against.
   */
  shadowCameraFar?: number
  /**
   * Fraction of each level's extent reserved as a border guard band. The
   * sampled area is (1 - guardBand) of the rendered area, which lets the
   * camera drift between re-renders without sampling outside the map.
   */
  guardBand?: number
  /** Fraction of the sampled half-width over which adjacent levels cross-fade. */
  blendRatio?: number
  /**
   * Number of finest levels that re-render every frame regardless of caching,
   * intended for dynamic casters near the camera. Coarse levels beyond this
   * are cached and only re-render on snap/age/invalidate.
   */
  dynamicLevels?: number
  /**
   * Maximum number of *cached* level re-renders per frame; misses queue up.
   * Does not limit the always-on dynamic levels.
   */
  updateBudget?: number
  /**
   * Frames after which a cached level re-renders even if the camera did not
   * move, so shadows of moving casters in coarse levels refresh. 0 disables.
   * Prefer targeted `invalidate()` calls for important dynamic casters.
   */
  maxCacheAge?: number
  /**
   * Light direction change (radians) that invalidates all levels. Gates
   * continuous sun motion into occasional full refreshes instead of
   * re-rendering everything every frame.
   */
  directionEpsilon?: number
}

type ShadowNodeBuilder = {
  camera: THREE.Camera
}

type LevelState = {
  halfWidth: number
  centerX: number
  centerY: number
  centerZ: number
  valid: boolean
  forceDirty: boolean
  age: number
}

class ClipmapLight extends THREE.Object3D {
  readonly target = new THREE.Object3D()
  castShadow = true
  shadow!: THREE.LightShadow
}

const ORIGIN = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const lightDirection = new THREE.Vector3()
const lightOrientationMatrix = new THREE.Matrix4()
const cameraWorldPosition = new THREE.Vector3()
const cameraLightPosition = new THREE.Vector3()
const levelCenter = new THREE.Vector3()
const regionCenter = new THREE.Vector3()

export class CachedClipmapShadowNode extends (THREE as any).ShadowBaseNode {
  readonly light: THREE.DirectionalLight
  camera: THREE.Camera | null = null
  readonly levels: number
  readonly maxDistance: number
  readonly lightMargin: number
  readonly shadowCameraNear: number
  readonly shadowCameraFar: number
  readonly guardBand: number
  readonly blendRatio: number
  readonly dynamicLevels: number
  readonly updateBudget: number
  readonly maxCacheAge: number
  lights: ClipmapLight[] = []

  private readonly _levelMapSizes: number[] | null
  private readonly _halfWidths: number[] = []
  private readonly _levelStates: LevelState[] = []
  private readonly _levelData: THREE.Vector4[] = []
  private readonly _shadowNodes: any[] = []
  private readonly _worldToLight = new THREE.Matrix4()
  private readonly _lastDirection = new THREE.Vector3()
  private readonly _directionCos: number
  private _baseBias = 0
  private _baseNormalBias = 0
  private _firstUpdate = true
  private _initialized = false

  constructor(
    light: THREE.DirectionalLight,
    options: CachedClipmapShadowNodeOptions = {}
  ) {
    super(light)
    this.light = light
    this.camera = options.camera ?? null

    if (options.mapSize !== undefined) {
      light.shadow.mapSize.set(options.mapSize, options.mapSize)
    }
    this._levelMapSizes = options.levelMapSizes ?? null

    const firstRadius = Math.max(options.firstRadius ?? 12, 1)
    const scaleFactor = Math.max(options.scaleFactor ?? 2.5, 1.5)
    this.maxDistance = options.maxDistance ?? 2_000
    this.levels =
      options.levels ??
      Math.max(
        1,
        Math.ceil(
          Math.log(this.maxDistance / firstRadius) / Math.log(scaleFactor)
        ) + 1
      )

    for (let i = 0; i < this.levels; i++) {
      const halfWidth = Math.min(
        firstRadius * scaleFactor ** i,
        this.maxDistance
      )
      this._halfWidths.push(i === this.levels - 1 ? this.maxDistance : halfWidth)
    }

    this.lightMargin = options.lightMargin ?? 100
    this.shadowCameraNear = options.shadowCameraNear ?? 1
    this.shadowCameraFar = options.shadowCameraFar ?? 3_000
    this.guardBand = THREE.MathUtils.clamp(options.guardBand ?? 0.15, 0.02, 0.5)
    this.blendRatio = THREE.MathUtils.clamp(
      options.blendRatio ?? 0.15,
      0.01,
      0.9
    )
    this.dynamicLevels = THREE.MathUtils.clamp(
      options.dynamicLevels ?? 2,
      0,
      this.levels
    )
    this.updateBudget = Math.max(options.updateBudget ?? 2, 1)
    this.maxCacheAge = Math.max(options.maxCacheAge ?? 64, 0)
    this._directionCos = Math.cos(options.directionEpsilon ?? 0.002)
  }

  attach(): this {
    ;(
      this.light.shadow as unknown as { shadowNode?: CachedClipmapShadowNode }
    ).shadowNode = this
    return this
  }

  detach(): this {
    const shadow = this.light.shadow as unknown as {
      shadowNode?: CachedClipmapShadowNode
    }
    if (shadow.shadowNode === this) delete shadow.shadowNode
    return this
  }

  setCamera(camera: THREE.Camera): this {
    this.camera = camera
    return this
  }

  setup(builder: ShadowNodeBuilder): unknown {
    if (!this._initialized) this.init(this.camera ?? builder.camera)

    const levelData = (reference("_levelData", "vec4", this) as any)
      .setGroup(renderGroup)
      .setName("clipmapLevels")
    const worldToLight = (uniform(this._worldToLight) as any)
      .setGroup(renderGroup)
      .setName("clipmapWorldToLight")

    return Fn((fnBuilder: unknown) => {
      ;(this as any).setupShadowPosition(fnBuilder)

      const lightPos = worldToLight
        .mul(vec4(shadowPositionWorld as any, 1))
        .xy.toVar("clipmapPosition")
      const accumulated = vec4(0, 0, 0, 0).toVar("clipmapShadow")
      const remaining = float(1).toVar("clipmapRemaining")

      for (let i = 0; i < this.levels; i++) {
        const level = vec4().toVar(`clipmapLevel${i}`)
        level.assign(levelData.element(i))
        // Chebyshev distance from this level's *rendered* center; level.z is
        // its sampled half-width, so containment stays correct even while
        // the level waits in the update queue.
        const levelDistance = max(
          abs(lightPos.x.sub(level.x)) as any,
          abs(lightPos.y.sub(level.y)) as any
        )
        const fade = float(1).sub(
          smoothstep(level.z.mul(1 - this.blendRatio), level.z, levelDistance)
        )
        const weight = fade.mul(remaining)
        // The shadow node samples a depth-comparison texture and must be
        // evaluated in *uniform* control flow: putting the sample behind a
        // per-pixel If() yields undefined results / mip derivatives on many
        // GPUs, which showed up as shadows flickering on and off with view
        // angle and position. Evaluate unconditionally, then weight. Levels
        // that aren't selected get weight 0 and contribute nothing.
        accumulated.addAssign(this._shadowNodes[i].mul(weight))
        remaining.mulAssign(float(1).sub(fade))
      }

      // Weights are a partition of unity; leftover weight means "outside all
      // levels" and resolves to unshadowed, giving a smooth distance fade.
      return accumulated.add(vec4(remaining))
    })()
  }

  updateBefore(frame: any): void {
    if (!this.camera || !this.light.parent) return

    for (const levelLight of this.lights) {
      if (levelLight.parent === null) {
        this.light.parent.add(levelLight.target)
        this.light.parent.add(levelLight)
      }
    }

    lightDirection
      .subVectors(this.light.target.position, this.light.position)
      .normalize()
    lightOrientationMatrix.lookAt(ORIGIN, lightDirection, up)
    this._worldToLight.copy(lightOrientationMatrix).invert()

    const directionChanged =
      lightDirection.dot(this._lastDirection) < this._directionCos
    if (directionChanged) this._lastDirection.copy(lightDirection)

    cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld)
    cameraLightPosition
      .copy(cameraWorldPosition)
      .applyMatrix4(this._worldToLight)

    let budget =
      this._firstUpdate || directionChanged ? this.levels : this.updateBudget
    this._firstUpdate = false

    let baseTexelWidth = 0

    for (let i = 0; i < this.levels; i++) {
      const state = this._levelStates[i]
      const levelLight = this.lights[i]
      const shadow = levelLight.shadow
      const shadowCamera = shadow.camera as THREE.OrthographicCamera
      const texelWidth =
        (shadowCamera.right - shadowCamera.left) / shadow.mapSize.width
      if (i === 0) baseTexelWidth = texelWidth

      // Per-level bias: coarser levels have larger texels and need more
      // world-space normal bias. Keep the depth bias as-is and scale only
      // normalBias by texel footprint.
      const texelScale = baseTexelWidth > 0 ? texelWidth / baseTexelWidth : 1
      shadow.bias = this._baseBias
      shadow.normalBias = this._baseNormalBias * texelScale

      state.age++

      // Snap the level center to a whole number of *texels*. This is the
      // standard CSM/clipmap stabilization: the ortho projection then slides
      // in exact one-texel increments, so every level's texel grid is fixed in
      // world space and shadows never lurch as the camera moves - the cause of
      // the visible snapping at coarse levels (previously the quantum was a
      // fraction of the level extent, tens of meters wide).
      const desiredX = Math.round(cameraLightPosition.x / texelWidth) * texelWidth
      const desiredY = Math.round(cameraLightPosition.y / texelWidth) * texelWidth
      // Z only controls re-render cadence (depth has no texel grid to shimmer),
      // so a coarse quantum is fine and keeps coarse levels cheap.
      const quantumZ = state.halfWidth * 0.5
      const desiredZ = Math.round(cameraLightPosition.z / quantumZ) * quantumZ

      // Near levels hold moving casters. A cached map freezes them at their
      // last-rendered spot, so these levels refresh every frame while coarse
      // levels stay cached.
      const isDynamic = i < this.dynamicLevels
      const moved =
        desiredX !== state.centerX ||
        desiredY !== state.centerY ||
        desiredZ !== state.centerZ
      const expired = this.maxCacheAge > 0 && state.age >= this.maxCacheAge
      const dirty =
        isDynamic ||
        !state.valid ||
        state.forceDirty ||
        moved ||
        expired ||
        directionChanged

      // Cached levels share a per-frame re-render budget; dynamic levels are
      // exempt (they must always refresh) and explicit invalidations bypass the
      // budget. Streamed props/terrain can otherwise stay missing forever while
      // moving cameras spend the budget on nearer cache snaps every frame.
      const canRender = isDynamic || state.forceDirty || budget > 0
      if (dirty && canRender) {
        if (!isDynamic && !state.forceDirty) budget--

        state.centerX = desiredX
        state.centerY = desiredY
        state.centerZ = desiredZ
        state.valid = true
        state.forceDirty = false
        state.age = 0

        // The light sits lightMargin above the level's receiver volume; the
        // far plane (set in init) reaches exactly to its bottom.
        levelCenter.set(
          desiredX,
          desiredY,
          desiredZ + state.halfWidth + this.lightMargin
        )
        levelCenter.applyMatrix4(lightOrientationMatrix)
        levelLight.position.copy(levelCenter)
        levelLight.target.position.copy(levelCenter).add(lightDirection)
        // Force matrices current before the per-level ShadowNode renders the
        // depth map this frame.
        levelLight.updateMatrixWorld(true)
        levelLight.target.updateMatrixWorld(true)

        // Render this level's depth map immediately from the committed light
        // matrix, in deterministic order.
        shadow.needsUpdate = true
        const shadowNode = this._shadowNodes[i]
        if (shadowNode.shadowMap) {
          shadowNode.updateShadow(frame)
          shadow.needsUpdate = false
        }
        // If the map isn't built yet (very first frames, before the node's own
        // setup has allocated it), leave needsUpdate set so the node renders it
        // itself via its updateBefore this frame.
      }

      // Publish the level's *committed* center to the shader every frame, not
      // only on re-render. The shader's containment test must always match the
      // actual map content; writing it only on render frames left a stale box
      // on the others, so receivers near a level boundary fell through to the
      // next level (or to "lit") on alternating frames - a rhythmic flicker.
      // Until a level has rendered once, keep it parked far away (set in init)
      // so it never wins selection.
      if (state.valid) {
        this._levelData[i].set(
          state.centerX,
          state.centerY,
          state.halfWidth * (1 - this.guardBand),
          0
        )
      }

    }
  }

  /**
   * Force levels to re-render (rate-limited by updateBudget). With a sphere,
   * only levels whose coverage intersects it are dirtied - call this when an
   * important shadow caster moves so coarse cached levels pick it up.
   */
  invalidate(worldBounds?: THREE.Sphere): void {
    if (!worldBounds) {
      for (const state of this._levelStates) state.forceDirty = true
      return
    }

    regionCenter.copy(worldBounds.center).applyMatrix4(this._worldToLight)
    for (const state of this._levelStates) {
      const reach = state.halfWidth + worldBounds.radius
      if (
        Math.abs(regionCenter.x - state.centerX) < reach &&
        Math.abs(regionCenter.y - state.centerY) < reach
      ) {
        state.forceDirty = true
      }
    }
  }

  dispose(): void {
    this.detach()
    for (const shadowNode of this._shadowNodes) shadowNode.dispose?.()
    for (const levelLight of this.lights) {
      levelLight.shadow?.dispose()
      levelLight.parent?.remove(levelLight)
      levelLight.target.parent?.remove(levelLight.target)
    }
    super.dispose?.()
  }

  private init(camera: THREE.Camera): void {
    this.camera = camera
    this._initialized = true

    this._baseBias = this.light.shadow.bias
    this._baseNormalBias = this.light.shadow.normalBias

    for (let i = 0; i < this.levels; i++) {
      const halfWidth = this._halfWidths[i]
      const levelLight = new ClipmapLight()
      const levelShadow = this.light.shadow.clone()
      const levelMapSize =
        this._levelMapSizes?.[i] ?? this.light.shadow.mapSize.width
      levelShadow.mapSize.set(levelMapSize, levelMapSize)

      levelShadow.camera.left = -halfWidth
      levelShadow.camera.right = halfWidth
      levelShadow.camera.top = halfWidth
      levelShadow.camera.bottom = -halfWidth
      levelShadow.camera.near = this.shadowCameraNear
      levelShadow.camera.far = Math.max(
        this.shadowCameraNear + 1,
        Math.min(this.shadowCameraFar, this.lightMargin + halfWidth * 2)
      )
      levelShadow.camera.updateProjectionMatrix()
      // All levels are driven manually after repositioning their light, so each
      // cached map is rendered from the matrix it will be sampled with.
      levelShadow.autoUpdate = false
      levelShadow.needsUpdate = false

      levelLight.shadow = levelShadow
      this.lights.push(levelLight)
      this._shadowNodes.push(new BoundedShadowNode(levelLight, levelShadow))
      // Center far away with a tiny extent so an unrendered level never wins
      // selection (and never divides by a zero-width fade band).
      this._levelData.push(new THREE.Vector4(1e9, 1e9, 1e-6, 0))
      this._levelStates.push({
        halfWidth,
        centerX: Number.NaN,
        centerY: Number.NaN,
        centerZ: Number.NaN,
        valid: false,
        forceDirty: false,
        // Stagger periodic refreshes so levels never expire on the same frame.
        age: Math.floor(-(i * this.maxCacheAge) / Math.max(this.levels, 1)),
      })
    }
  }
}
