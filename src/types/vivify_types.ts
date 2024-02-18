import { RawKeyframesVec4 } from './animation_types.ts'
import { RawKeyframesLinear } from './animation_types.ts'
import { FILEPATH } from './beatmap_types.ts'
import { ColorVec } from './data_types.ts'

/** Types allowed for material properties. */
export type MATERIAL_PROP_TYPE =
    | 'Texture'
    | 'Float'
    | 'Color'
    | 'Vector'

/** Types allowed for animator properties. */
export type ANIMATOR_PROP_TYPE =
    | 'Bool'
    | 'Float'
    | 'Trigger'

export type Property<T, V> = {
    /** Name of the property. */
    id: string
    /** Type of the property. */
    type: T
    /** Value to set the property to. */
    value: V
}

/** A valid value for material properties. */
export type MaterialPropertyValue =
    | FILEPATH
    | RawKeyframesLinear
    | RawKeyframesVec4

/** A valid value for animator properties. */
export type AnimatorPropertyValue = boolean | RawKeyframesLinear | number

/** A property for a material. */
export type MaterialProperty = Property<
    MATERIAL_PROP_TYPE,
    MaterialPropertyValue
>

/** A property for an animator. */
export type AnimatorProperty = Property<
    ANIMATOR_PROP_TYPE,
    AnimatorPropertyValue
>

/** Color format types for render textures. */
export type RENDER_TEX =
    | 'ARGB32'
    | 'Depth'
    | 'ARGBHalf'
    | 'Shadowmap'
    | 'RGB565'
    | 'ARGB4444'
    | 'ARGB1555'
    | 'Default'
    | 'ARGB2101010'
    | 'DefaultHDR'
    | 'ARGB64'
    | 'ARGBFloat'
    | 'RGFloat'
    | 'RGHalf'
    | 'RFloat'
    | 'RHalf'
    | 'R8'
    | 'ARGBInt'
    | 'RGInt'
    | 'RInt'
    | 'BGRA32'
    | 'RGB111110Float'
    | 'RG32'
    | 'RGBAUShort'
    | 'RG16'
    | 'BGRA101010_XR'
    | 'BGR101010_XR'
    | 'R16'

/** Filter modes for textures. */
export type TEX_FILTER =
    | 'Point'
    | 'Bilinear'
    | 'Trilinear'

export type DEPTH_TEX_MODE = 
    | 'Depth'
    | 'DepthNormals'
    | 'MotionVectors'

export enum AMBIENT_MODE {
    Skybox = 0,
    Trilight = 1,
    Flat = 3,
    Custom = 4,
}

export enum DEFAULT_REFLECTION_MODE {
    Skybox,
    Custom,
}

export enum FOG_MODE {
    Linear = 1,
    Exponential,
    ExponentialSquared,
}

export type RENDER_SETTING = {
    'ambientEquatorColor': ColorVec
    'ambientGroundColor': ColorVec
    'ambientIntensity': number
    'ambientLight': ColorVec
    'ambientMode': AMBIENT_MODE
    'ambientSkyColor': ColorVec
    'defaultReflectionMode': DEFAULT_REFLECTION_MODE
    'flareFadeSpeed': number
    'flareStrength': number
    'fog': boolean
    'fogColor': ColorVec
    'fogDensity': number
    'fogEndDistance': number
    'fogMode': FOG_MODE
    'haloStrength': number
    'reflectionBounces': number
    'reflectionIntensity': number
    'subtractiveShadowColor': ColorVec
}
