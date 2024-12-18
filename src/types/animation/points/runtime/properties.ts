type Smoothing = `s${number}`

//#region Linear
export type BaseRuntimePropertiesLinear =
    | 'baseCombo'
    | 'baseMultipliedScore'
    | 'baseImmediateMaxPossibleMultipliedScore'
    | 'baseModifiedScore'
    | 'baseImmediateMaxPossibleModifiedScore'
    | 'baseMultiplier'
    | 'baseEnergy'
    | 'baseSongTime'
    | 'baseSongLength'
    | 'baseRelativeScore'

/** Properties that will be evaluated at runtime, used in linear (e.g. `dissolve`) animations. */
export type RuntimePropertiesLinear =
    | BaseRuntimePropertiesLinear
    | `${BaseRuntimePropertiesLinear}.${Smoothing}`

export type BaseRuntimePropertiesVec3 =
    | 'baseHeadLocalPosition'
    | 'baseHeadLocalRotation'
    | 'baseHeadPosition'
    | 'baseHeadRotation'
    | 'baseLeftHandLocalPosition'
    | 'baseRightHandLocalPosition'
    | 'baseLeftHandLocalRotation'
    | 'baseRightHandLocalRotation'
//#endregion

//#region Vec3
type Vec3Component = 'x' | 'y' | 'z'
type Vec3Swizzle = `${Vec3Component}${Vec3Component}${Vec3Component}`

/** Properties that will be evaluated at runtime, used in vec3 (e.g. `position`) animations. */
export type RuntimePropertiesVec3 =
    | BaseRuntimePropertiesVec3
    | `${BaseRuntimePropertiesVec3}.${Smoothing}`
    | `${BaseRuntimePropertiesVec3}.${Smoothing}.${Vec3Swizzle}`
    | `${BaseRuntimePropertiesVec3}.${Vec3Swizzle}`
    | `${BaseRuntimePropertiesVec3}.${Vec3Swizzle}.${Smoothing}`

export type BaseRuntimePropertiesVec4 =
    | 'baseNote0Color'
    | 'baseNote1Color'
    | 'baseSaberAColor'
    | 'baseSaberBColor'
    | 'baseEnvironmentColor0'
    | 'baseEnvironmentColor1'
    | 'baseEnvironmentColorW'
    | 'baseEnvironmentColor0Boost'
    | 'baseEnvironmentColor1Boost'
    | 'baseEnvironmentColorWBoost'
    | 'baseObstaclesColor'
//#endregion

//#region Vec4
type Vec4Component = Vec3Component | 'w'
type Vec4Swizzle = `${Vec4Component}${Vec4Component}${Vec4Component}${Vec4Component}`

/** Properties that will be evaluated at runtime, used in vec4 (e.g. `color`) animations. */
export type RuntimePropertiesVec4 =
    | BaseRuntimePropertiesVec4
    | `${BaseRuntimePropertiesVec4}.${Smoothing}`
    | `${BaseRuntimePropertiesVec4}.${Smoothing}.${Vec4Swizzle}`
    | `${BaseRuntimePropertiesVec4}.${Vec4Swizzle}`
    | `${BaseRuntimePropertiesVec4}.${Vec4Swizzle}.${Smoothing}`

/** Properties that will be evaluated at runtime in animations. */
export type RuntimeProperties =
    | RuntimePropertiesLinear
    | RuntimePropertiesVec3
    | RuntimePropertiesVec4
//#endregion
