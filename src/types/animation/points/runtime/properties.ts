type Smoothing = `s${number}` | `s${number}-${number}`
type PropertyFunction<T extends string> = `.${T}` | ''
type PropertyFunctions = `${PropertyFunction<Smoothing>}`

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

type Vec3NarrowedToLinear = `${BaseRuntimePropertiesVec3}.${Vec3Component}`
type Vec4NarrowedToLinear = `${BaseRuntimePropertiesVec4}.${Vec4Component}`

/** Properties that will be evaluated at runtime, used in linear (e.g. `dissolve`) animations. */
export type RuntimePropertiesLinear =
    | `${BaseRuntimePropertiesLinear}${PropertyFunctions}`
    | `${Vec3NarrowedToLinear}${PropertyFunctions}`
    | `${Vec4NarrowedToLinear}${PropertyFunctions}`
//#endregion

//#region Vec2
type Vec3NarrowedToVec2 = `${BaseRuntimePropertiesVec3}.${Vec3Component}${Vec3Component}`
type Vec4NarrowedToVec2 = `${BaseRuntimePropertiesVec4}.${Vec4Component}${Vec4Component}`

export type RuntimePropertiesVec2 =
    | `${Vec3NarrowedToVec2}${PropertyFunctions}`
    | `${Vec4NarrowedToVec2}${PropertyFunctions}`
//#endregion

//#region Vec3
export type BaseRuntimePropertiesVec3 =
    | 'baseHeadLocalPosition'
    | 'baseHeadLocalRotation'
    | 'baseHeadPosition'
    | 'baseHeadRotation'
    | 'baseLeftHandLocalPosition'
    | 'baseRightHandLocalPosition'
    | 'baseLeftHandLocalRotation'
    | 'baseRightHandLocalRotation'

type Vec3Component = 'x' | 'y' | 'z'
type Vec3Swizzle = `${BaseRuntimePropertiesVec3}.${Vec3Component}${Vec3Component}${Vec3Component}`
type Vec4NarrowedToVec3 = `${BaseRuntimePropertiesVec4}.${Vec4Component}${Vec4Component}${Vec4Component}`

/** Properties that will be evaluated at runtime, used in vec3 (e.g. `position`) animations. */
export type RuntimePropertiesVec3 =
    | `${BaseRuntimePropertiesVec3}${PropertyFunctions}`
    | `${Vec3Swizzle}${PropertyFunctions}`
    | `${Vec4NarrowedToVec3}${PropertyFunctions}`
//#endregion

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

//#region Vec4
type Vec4Component = Vec3Component | 'w'
type Vec4Swizzle = `${BaseRuntimePropertiesVec4}.${Vec4Component}${Vec4Component}${Vec4Component}${Vec4Component}`

/** Properties that will be evaluated at runtime, used in vec4 (e.g. `color`) animations. */
export type RuntimePropertiesVec4 =
    | `${BaseRuntimePropertiesVec4}${PropertyFunctions}`
    | `${Vec4Swizzle}${PropertyFunctions}`

/** Properties that will be evaluated at runtime in animations. */
export type RuntimeProperties =
    | RuntimePropertiesLinear
    | RuntimePropertiesVec3
    | RuntimePropertiesVec4
//#endregion
