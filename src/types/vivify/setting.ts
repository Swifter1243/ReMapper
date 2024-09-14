import { ColorVec } from '../math/vector.ts'

import { RuntimeRawKeyframesAbstract } from '../animation/keyframe/runtime/abstract.ts'
import { RuntimeRawKeyframesLinear } from '../animation/keyframe/runtime/linear.ts'
import { RuntimeRawKeyframesVec4 } from '../animation/keyframe/runtime/vec4.ts'

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

/** Determines what to clear when rendering a camera. */
export type CAMERA_CLEAR_FLAGS =
    | 'Skybox'
    | 'SolidColor'
    | 'Depth'
    | 'Nothing'

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
    "skybox": string
    'subtractiveShadowColor': RuntimeRawKeyframesVec4 | ColorVec
    "sun": string
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum ANISOTROPIC_FILTERING {
    Disable,
    Enable,
    ForceEnable,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOW_MASK_MODE {
    Shadowmask,
    DistanceShadowmask,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOW_PROJECTION {
    CloseFit,
    StableFit,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOW_RESOLUTION {
    Low,
    Medium,
    High,
    VeryHigh,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOWS {
    Disable,
    HardOnly,
    All,
}

/** Load mode for AssignObjectPrefab events */
export type LOAD_MODE =
    | 'Additive'
    | 'Single'
