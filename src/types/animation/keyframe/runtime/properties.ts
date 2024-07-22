/** Properties that will be evaluated at runtime, used in linear (e.g. `dissolve`) animations. */
export type RuntimePropertiesLinear = never

/** Properties that will be evaluated at runtime, used in vec3 (e.g. `position`) animations. */
export type RuntimePropertiesVec3 =
    | 'baseHeadLocalPosition'
    | 'baseHeadLocalRotation'
    | 'baseLeftHandLocalPosition'
    | 'baseRightHandLocalPosition'
    | 'baseLeftHandLocalRotation'
    | 'baseRightHandLocalRotation'

/** Properties that will be evaluated at runtime, used in vec4 (e.g. `color`) animations. */
export type RuntimePropertiesVec4 =
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

/** Properties that will be evaluated at runtime in animations. */
export type RuntimeProperties =
    | RuntimePropertiesLinear
    | RuntimePropertiesVec3
    | RuntimePropertiesVec4
