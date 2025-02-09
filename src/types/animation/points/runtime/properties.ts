type PropertyFunction = `.${string}` | ''

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
    | `${BaseRuntimePropertiesLinear}${PropertyFunction}`
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

/** Properties that will be evaluated at runtime, used in vec3 (e.g. `position`) animations. */
export type RuntimePropertiesVec3 =
    | `${BaseRuntimePropertiesVec3}${PropertyFunction}`

//#endregion

//#region Vec4
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

/** Properties that will be evaluated at runtime, used in vec4 (e.g. `color`) animations. */
export type RuntimePropertiesVec4 =
    | `${BaseRuntimePropertiesVec4}${PropertyFunction}`
//#endregion

/** Properties that will be evaluated at runtime in animations. */
export type RuntimeProperties =
    | RuntimePropertiesLinear
    | RuntimePropertiesVec3
    | RuntimePropertiesVec4
