import {BaseEnvironmentEnhancement} from "../../../internals/beatmap/object/environment/base_environment.ts";
import {Replace} from "../../util/object.ts";
import {bsmap} from '../../../deps.ts'
import {Track} from "../../../utils/animation/track.ts";
import {ColorVec} from "../../math/vector.ts";

import {DifficultyPointsLinear} from "../../animation/points/linear.ts";
import {TrackValue} from "../../animation/track.ts";
import {Fields} from "../../util/class.ts";

/** The "BloomFogEnvironment" environment component.
 * Allows both animated and non animated variants. */
export type BloomFogEnvironment<T extends number | DifficultyPointsLinear> = {
    attenuation?: T
    offset?: T
    startY?: T
    height?: T
}

/** The "TubeBloomPrePassLight" environment component.
 * Allows both animated and non animated variants. */
export type TubeBloomPrePassLight<T extends number | DifficultyPointsLinear> = {
    colorAlphaMultiplier?: T
    bloomFogIntensityMultiplier?: T
}

/** A material used on a geometry object. Allows difficulty material references. */
export type GeometryMaterial = RawGeometryMaterial | string

/** Lookup methods for environment objects. */
export type LookupMethod =
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

/** LightID used on lights and other lighting_v3 events. `ID | [ID, ID, ID]` */
export type LightID = number | number[]

/** All properties allowed for a material used on a geometry object. */
export type RawGeometryMaterial = {
    shader: GeoShader
    color?: ColorVec
    track?: string
    shaderKeywords?: string[]
}

/** All components on environment objects. */
export type Components<N extends number | DifficultyPointsLinear = number> = {
    ILightWithId?: ILightWithId<N>
    TubeBloomPrePassLight?: TubeBloomPrePassLight<N>
}

/** The "ILightWithId" environment component.
 * Allows both animated and non animated variants. */
export type ILightWithId<T extends number | DifficultyPointsLinear> = {
    lightID?: T
    type?: T
}

/** Environment enhancement which can be either Geometry or a regular Environment statement. */
export type AbstractEnvironment = BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentBase,
    bsmap.v3.IChromaEnvironmentBase
>

type EnvironmentReplacements = {
    track?: TrackValue | Track
}

/** Fields for environment enhancement constructor object. */
export type ExcludedEnvironmentFields<
    Class,
    Replacement = EnvironmentReplacements,
> = Replace<
    Partial<Fields<Class>>,
    Replacement
>

