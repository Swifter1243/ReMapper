import { ColorVec } from '../math/vector.ts'
import { RuntimeRawPointsLinear } from '../animation/points/runtime/linear.ts'
import { RuntimeRawPointsVec4 } from '../animation/points/runtime/vec4.ts'
import { RawPointsAbstract } from '../animation/points/abstract.ts'

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

/** How attenuation builds up in Unity's fog. */
export enum FOG_MODE {
    Linear = 1,
    Exponential,
    ExponentialSquared,
}

/** What level of antialiasing to use for the camera. */
export enum ANTI_ALIASING {
    None = 0,
    MSAA2 = 2,
    MSAA4 = 4,
    MSAA8 = 8,
}

/** An integer representation of a boolean. */
export enum BOOLEAN {
    False = 0,
    True = 1,
}

/** https://docs.unity3d.com/ScriptReference/RenderSettings.html */
export enum SHADOW_CASCADES {
    ZERO = 0,
    TWO = 2,
    FOUR = 4,
}

/** Changeable render settings with SetRenderingSettings events.
 * All of these settings relate to Unity.
 * https://docs.unity3d.com/ScriptReference/RenderSettings.html
 */
export type RENDERING_SETTINGS = {
    'ambientEquatorColor': RuntimeRawPointsVec4 | ColorVec
    'ambientGroundColor': RuntimeRawPointsVec4 | ColorVec
    'ambientIntensity': RuntimeRawPointsLinear | number
    'ambientLight': RuntimeRawPointsVec4 | ColorVec
    'ambientMode': RawPointsAbstract<[AMBIENT_MODE]> | AMBIENT_MODE
    'ambientSkyColor': RuntimeRawPointsVec4 | ColorVec
    'defaultReflectionMode': RawPointsAbstract<[DEFAULT_REFLECTION_MODE]> | DEFAULT_REFLECTION_MODE
    'defaultReflectionResolution': RuntimeRawPointsLinear | number
    'flareFadeSpeed': RuntimeRawPointsLinear | number
    'flareStrength': RuntimeRawPointsLinear | number
    'fog': RawPointsAbstract<[BOOLEAN]> | BOOLEAN
    'fogColor': RuntimeRawPointsVec4 | ColorVec
    'fogDensity': RuntimeRawPointsLinear | number
    'fogEndDistance': RuntimeRawPointsLinear | number
    'fogMode': RawPointsAbstract<[FOG_MODE]> | FOG_MODE
    'haloStrength': RuntimeRawPointsLinear | number
    'reflectionBounces': RuntimeRawPointsLinear | number
    'reflectionIntensity': RuntimeRawPointsLinear | number
    'skybox': string
    'subtractiveShadowColor': RuntimeRawPointsVec4 | ColorVec
    'sun': string
}

/** Changeable quality settings with SetRenderingSettings events.
 * https://docs.unity3d.com/ScriptReference/QualitySettings.html
 */
export type QUALITY_SETTINGS = {
    anisotropicFiltering?: RawPointsAbstract<[ANISOTROPIC_FILTERING]> | ANISOTROPIC_FILTERING
    antiAliasing?: RawPointsAbstract<[ANTI_ALIASING]> | ANTI_ALIASING
    pixelLightCount?: RuntimeRawPointsLinear | number
    realtimeReflectionProbes?: RawPointsAbstract<[BOOLEAN]> | BOOLEAN
    shadowCascades?: RawPointsAbstract<[SHADOW_CASCADES]> | SHADOW_CASCADES
    shadowDistance?: RuntimeRawPointsLinear | number
    shadowMaskMode?: RawPointsAbstract<[SHADOW_MASK_MODE]> | SHADOW_MASK_MODE
    shadowNearPlaneOffset?: RuntimeRawPointsLinear | number
    shadowProjection?: RawPointsAbstract<[SHADOW_PROJECTION]> | SHADOW_PROJECTION
    shadowResolution?: RawPointsAbstract<[SHADOW_RESOLUTION]> | SHADOW_RESOLUTION
    shadows?: RawPointsAbstract<[SHADOWS]> | SHADOWS
    softParticles?: RawPointsAbstract<[BOOLEAN]> | BOOLEAN
}

/** Changeable XR settings with SetRenderingSettings events.
 * https://docs.unity3d.com/ScriptReference/XR.XRSettings.html
 */
export type XR_SETTINGS = {
    useOcclusionMesh?: RawPointsAbstract<[BOOLEAN]> | BOOLEAN
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

/** Whether to activate before the main bloom effect or after in a blit event. Defaults fo AfterMainEffect. */
export type BLIT_ORDER =
    | 'BeforeMainEffect'
    | 'AfterMainEffect'