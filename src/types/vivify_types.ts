import { RawKeyframesVec4, RuntimePointDefinitionLinear, RuntimePointDefinitionVec4 } from './animation_types.ts'
import { RuntimeRawKeyframesVec4 } from './animation_types.ts'
import { RuntimeRawKeyframesAbstract } from './animation_types.ts'
import { RuntimeRawKeyframesLinear } from './animation_types.ts'
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

/** Property type mostly used for Vivify custom events. */
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
    | RuntimePointDefinitionLinear
    | RuntimePointDefinitionVec4

/** A valid value for animator properties. */
export type AnimatorPropertyValue = boolean | RuntimePointDefinitionLinear | number

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

/** Color format types for textures. */
export type COLOR_FORMAT =
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
export type TEX_FILTER_MODE =
    | 'Point'
    | 'Bilinear'
    | 'Trilinear'

/** Depth texture output modes for the camera. */
export type DEPTH_TEX_MODE =
    | 'Depth'
    | 'DepthNormals'
    | 'MotionVectors'

/** https://docs.unity3d.com/ScriptReference/RenderSettings.html */
export enum AMBIENT_MODE {
    Skybox = 0,
    Trilight = 1,
    Flat = 3,
    Custom = 4,
}

/** https://docs.unity3d.com/ScriptReference/RenderSettings.html */
export enum DEFAULT_REFLECTION_MODE {
    Skybox,
    Custom,
}

/** How attenuation builds up in Beat Saber's fog. */
export enum FOG_MODE {
    Linear = 1,
    Exponential,
    ExponentialSquared,
}

/** Changeable render settings with SetRenderSetting events. 
 * https://docs.unity3d.com/ScriptReference/RenderSettings.html
 */
export type RENDER_SETTING = {
    'ambientEquatorColor': RuntimeRawKeyframesVec4 | ColorVec
    'ambientGroundColor': RuntimeRawKeyframesVec4 | ColorVec
    'ambientIntensity': RuntimeRawKeyframesLinear
    'ambientLight': RuntimeRawKeyframesVec4 | ColorVec
    'ambientMode': RuntimeRawKeyframesAbstract<[AMBIENT_MODE], never>
    'ambientSkyColor': RuntimeRawKeyframesVec4 | ColorVec
    'defaultReflectionMode': RuntimeRawKeyframesAbstract<
        [DEFAULT_REFLECTION_MODE],
        never
    >
    'defaultReflectionResolution': RuntimeRawKeyframesLinear
    'flareFadeSpeed': RuntimeRawKeyframesLinear
    'flareStrength': RuntimeRawKeyframesLinear
    'fog': boolean | RuntimeRawKeyframesLinear
    'fogColor': RuntimeRawKeyframesVec4 | ColorVec
    'fogDensity': RuntimeRawKeyframesLinear
    'fogEndDistance': RuntimeRawKeyframesLinear
    'fogMode': RuntimeRawKeyframesAbstract<[FOG_MODE], never>
    'haloStrength': RuntimeRawKeyframesLinear
    'reflectionBounces': RuntimeRawKeyframesLinear
    'reflectionIntensity': RuntimeRawKeyframesLinear
    'subtractiveShadowColor': RuntimeRawKeyframesVec4 | ColorVec
}
