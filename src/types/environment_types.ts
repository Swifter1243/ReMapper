import { PointDefinitionLinear } from './animation_types.ts'
import { ColorVec } from './data_types.ts'

/** The "BloomFogEnvironment" environment component.
 * Allows both animated and non animated variants. */
export type BloomFogEnvironment<T extends number | PointDefinitionLinear> = {
    attenuation?: T
    offset?: T
    startY?: T
    height?: T
}
/** The "TubeBloomPrePassLight" environment component.
 * Allows both animated and non animated variants. */
export type TubeBloomPrePassLight<T extends number | PointDefinitionLinear> = {
    colorAlphaMultiplier?: T
    bloomFogIntensityMultiplier?: T
}

/** A material used on a geometry object. Allows difficulty material references. */
export type GeometryMaterial = RawGeometryMaterial | string
/** Lookup methods for environment objects. */
export type Lookup =
    | 'Contains'
    | 'Regex'
    | 'Exact'
    | 'StartsWith'
    | 'EndsWith'
/** Geometry shape types. */
export type GeoType =
    | 'Sphere'
    | 'Capsule'
    | 'Cylinder'
    | 'Cube'
    | 'Plane'
    | 'Quad'
    | 'Triangle'
/** Shaders available for geometry materials. */
export type GeoShader =
    | 'Standard'
    | 'OpaqueLight'
    | 'TransparentLight'
    | 'BaseWater'
    | 'BillieWater'
    | 'BTSPillar'
    | 'InterscopeConcrete'
    | 'InterscopeCar'
    | 'Obstacle'
    | 'WaterfallMirror'
export type LightID = number | number[]
/** All properties allowed for a material used on a geometry object. */
export type RawGeometryMaterial = {
    shader: GeoShader
    color?: ColorVec
    track?: string
    shaderKeywords?: string[]
}
/** All components on environment objects. */
export type Components<N extends number | PointDefinitionLinear = number> = {
    ILightWithId?: ILightWithId<N>
    BloomFogEnvironment?: BloomFogEnvironment<N>
    TubeBloomPrePassLight?: TubeBloomPrePassLight<N>
}
/** The "ILightWithId" environment component.
 * Allows both animated and non animated variants. */
export type ILightWithId<T extends number | PointDefinitionLinear> = {
    lightID?: T
    type?: T
}
