import { Vec3, Vec4 } from './data_types.ts'

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

type EaseBase<T extends string> =
    | `easeIn${T}`
    | `easeOut${T}`
    | `easeInOut${T}`

/** All easings. */
export type EASE =
    | 'easeLinear'
    | 'easeStep'
    | EaseBase<'Quad'>
    | EaseBase<'Cubic'>
    | EaseBase<'Quart'>
    | EaseBase<'Quint'>
    | EaseBase<'Sine'>
    | EaseBase<'Expo'>
    | EaseBase<'Circ'>
    | EaseBase<'Elastic'>
    | EaseBase<'Back'>
    | EaseBase<'Bounce'>

/** All splines. */
export type SPLINE = 'splineCatmullRom'

/** Easings and splines. */
export type Interpolation = EASE | SPLINE

/** Modifiers */
export type PointModifier = `op${'None' | 'Add' | 'Sub' | 'Mul' | 'Div'}`

/** Any flag that could be in a keyframe. E.g. easings, splines */
export type KeyframeFlag = Interpolation | 'lerpHSV'

/** Time value in a keyframe. */
export type TimeValue = number

//#region Helpers
/** Helper type for single keyframes. `[...]` */
export type InnerKeyframeAbstract<T extends unknown[]> =
    | [...T]
    | [...T, KeyframeFlag]
    | [...T, KeyframeFlag, KeyframeFlag]
    | [...T, KeyframeFlag, KeyframeFlag, KeyframeFlag]

/** Values for runtime keyframes.
 * [[...], [...], [...]] where [...] is [...x, time]
 * This type represents the "x".
 */
export type RuntimeKeyframeValues<
    T extends number[],
    R extends string,
> =
    | RuntimeValues<T, R>
    | [R]
    | T

/*
| [
    ...(T | [R]),
    PointModifier,
]
| [
    ...(T | [R]),
    RuntimeValues<T, R>,
    PointModifier,
],
*/
type RuntimeRecurse<
    A extends unknown[],
    G extends unknown,
> =
    | [
        ...A,
        PointModifier,
    ]
    | [
        ...A,
        G,
        PointModifier,
    ]

/** A term to be evaluated in a runtime expression.
 */
export type RuntimeValues<
    T extends number[],
    R extends string,
> = [
    ...T | [R],
    RuntimeRecurse<
        T | [R],
        RuntimeRecurse<
            T | [R],
            RuntimeRecurse<
                T | [R],
                RuntimeRecurse<
                    T | [R],
                    [
                        ...T | [R],
                        PointModifier,
                    ]
                >
            >
        >
    >,
]

/** Helper type for complex keyframes. `[[...], [...], [...]]` */
export type ComplexKeyframesAbstract<T extends number[]> =
    InnerKeyframeAbstract<[...T, TimeValue]>[]

/** Helper type for complex keyframes. `[[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesAbstract<
    T extends number[],
    R extends string,
> = InnerKeyframeAbstract<[
    ...RuntimeKeyframeValues<T, R>,
    TimeValue,
]>[]

/** Helper type for raw keyframes. `[...] | [[...], [...], [...]]` */
export type RawKeyframesAbstract<T extends number[]> =
    | ComplexKeyframesAbstract<T>
    | T

/** Helper type for raw keyframes. `[...] | [[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeComplexKeyframesAbstract<T, R>
    | RuntimeKeyframeValues<T, R>

/** Helper type for keyframe arrays. */
export type PointDefinitionAbstract<T extends number[]> =
    | RawKeyframesAbstract<T>
    | string

/** Helper type for keyframe arrays.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeRawKeyframesAbstract<T, R>
    | string

//#endregion

//#region Linear
/** Keyframe or array of keyframes with 1 value. Allows point definitions.
 * `[[x, time]...]` or `[x]` or `string`.
 */
export type PointDefinitionLinear = PointDefinitionAbstract<[number]>

/** Keyframe or array of keyframes with 1 value. Allows point definitions.
 * `[[x, time]...]` or `[x]` or `string`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionLinear = RuntimePointDefinitionAbstract<
    [number],
    RuntimePropertiesLinear
>

/** Array of keyframes with 1 value. `[[x, time]...]` */
export type ComplexKeyframesLinear = ComplexKeyframesAbstract<[number]>

/** Array of keyframes with 1 value. `[[x, time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesLinear = RuntimeComplexKeyframesAbstract<
    [number],
    RuntimePropertiesLinear
>

/** Single keyframe with 1 value. `[x, time]` */
export type InnerKeyframeLinear = ComplexKeyframesLinear[0]

/** Single keyframe with 1 value. `[x, time]` 
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeLinear = RuntimeComplexKeyframesLinear[0]

/** Keyframe or array of keyframes with 1 value.
 * `[[x,time]...]` or `[x]`
 */
export type RawKeyframesLinear = RawKeyframesAbstract<[number]>

/** Keyframe or array of keyframes with 1 value.
 * `[[x,time]...]` or `[x]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesLinear = RuntimeRawKeyframesAbstract<
    [number],
    RuntimePropertiesLinear
>
//#endregion

//#region Vec3
/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 */
export type PointDefinitionVec3 = PointDefinitionAbstract<Vec3>

/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionVec3 = RuntimePointDefinitionAbstract<
    Vec3,
    RuntimePropertiesVec3
>

/** Array of keyframes with 3 values. `[[x,y,z,time]...]` */
export type ComplexKeyframesVec3 = ComplexKeyframesAbstract<Vec3>

/** Array of keyframes with 3 values. `[[x,y,z,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesVec3 = RuntimeComplexKeyframesAbstract<
    Vec3,
    RuntimePropertiesVec3
>

/** Single keyframe with 3 values. `[x,y,z,time]` */
export type InnerKeyframeVec3 = ComplexKeyframesVec3[0]

/** Single keyframe with 3 values. `[x,y,z,time]` 
 * Includes runtime properties.
*/
export type RuntimeInnerKeyframeVec3 = RuntimeComplexKeyframesVec3[0]

/** Keyframe or array of keyframes with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 */
export type RawKeyframesVec3 = RawKeyframesAbstract<Vec3>

/** Keyframe or array of keyframes with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesVec3 = RuntimeRawKeyframesAbstract<
    Vec3,
    RuntimePropertiesVec3
>
//#endregion

//#region Vec4
/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`
 */
export type PointDefinitionVec4 = PointDefinitionAbstract<Vec4>

/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionVec4 = RuntimePointDefinitionAbstract<
    Vec4,
    RuntimePropertiesVec4
>

/** Array of keyframes with 4 values. `[[x,y,z,w,time]...]` */
export type ComplexKeyframesVec4 = ComplexKeyframesAbstract<Vec4>

/** Array of keyframes with 4 values. `[[x,y,z,w,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesVec4 = RuntimeComplexKeyframesAbstract<
    Vec4,
    RuntimePropertiesVec4
>

/** Single keyframe with 4 values. `[x,y,z,w,time]` */
export type InnerKeyframeVec4 = ComplexKeyframesVec4[0]

/** Single keyframe with 4 values. `[x,y,z,w,time]` 
 * Includes runtime properties.
*/
export type RuntimeInnerKeyframeVec4 = RuntimeComplexKeyframesVec4[0]

/** Keyframe or array of keyframes with 4 values.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`
 */
export type RawKeyframesVec4 = RawKeyframesAbstract<Vec4>

/** Keyframe or array of keyframes with 4 values.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesVec4 = RuntimeRawKeyframesAbstract<
    Vec4,
    RuntimePropertiesVec4
>
//#endregion

//#region Any

/** A single keyframe from an array of keyframes.
 * `[..., 0, 'easeInOutExpo']`
 */
export type InnerKeyframeAny =
    | InnerKeyframeLinear
    | InnerKeyframeVec3
    | InnerKeyframeVec4

/** A single keyframe from an array of keyframes.
 * `[..., 0, 'easeInOutExpo']`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeAny =
    | RuntimeInnerKeyframeLinear
    | RuntimeInnerKeyframeVec3
    | RuntimeInnerKeyframeVec4

/** Array of keyframes which have any amount of values.
 * `[[..., 0, 'easeInOutExpo']]`
 */
export type ComplexKeyframesAny =
    | ComplexKeyframesLinear
    | ComplexKeyframesVec3
    | ComplexKeyframesVec4

/** Array of keyframes which have any amount of values.
 * `[[..., 0, 'easeInOutExpo']]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesAny =
    | RuntimeComplexKeyframesLinear
    | RuntimeComplexKeyframesVec3
    | RuntimeComplexKeyframesVec4

/** Keyframe or array of keyframes with any amount of values.
 * `[...] | [[..., 0, 'easeInOutExpo']]`
 */
export type RawKeyframesAny =
    | RawKeyframesLinear
    | RawKeyframesVec3
    | RawKeyframesVec4

/** Keyframe or array of keyframes with any amount of values.
 * `[...] | [[..., 0, 'easeInOutExpo']]`
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesAny =
    | RuntimeRawKeyframesLinear
    | RuntimeRawKeyframesVec3
    | RuntimeRawKeyframesVec4

/** Keyframe or array of keyframes with any amount of values. Allows point definitions.
 * `[...] | [[..., 0, 'easeInOutExpo']] | string`
 */
export type PointDefinitionAny =
    | PointDefinitionLinear
    | PointDefinitionVec3
    | PointDefinitionVec4

/** Keyframe or array of keyframes with any amount of values. Allows point definitions.
 * `[...] | [[..., 0, 'easeInOutExpo']] | string`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionAny =
    | RuntimePointDefinitionLinear
    | RuntimePointDefinitionVec3
    | RuntimePointDefinitionVec4

//#endregion

//#region Unsafe

// Regular
/** Keyframes or array of keyframes.
 * `[...] | [[...], [...]]`.
 * Does not ensure that keyframe flags (e.g. `easeLinear`) are at the end, or that each keyframe has the same size.
 */
export type KeyframeValuesUnsafe =
    | ComplexKeyframeValuesUnsafe
    | InnerKeyframeValuesUnsafe

/** Array of keyframes.
 * `[[...], [...]]`.
 * Does not ensure that keyframe flags (e.g. `easeLinear`) are at the end, or that each keyframe has the same size.
 */
export type ComplexKeyframeValuesUnsafe = InnerKeyframeValuesUnsafe[]

/** A single keyframe.
 * `[...]`. (e.g. `[0,0,0,'easeLinear']`).
 * Does not ensure that keyframe flags (e.g. `easeLinear`) are at the end.
 */
export type InnerKeyframeValuesUnsafe = number[] | (number | KeyframeFlag)[]

// Runtime
/** Keyframes or array of keyframes.
 * `[...] | [[...], [...]]`.
 * Does not ensure that keyframe flags (e.g. `easeLinear`) are at the end, or that each keyframe has the same size.
 * Includes runtime properties.
 */
export type RuntimeKeyframeValuesUnsafe =
    | RuntimeComplexKeyframeValuesUnsafe
    | RuntimeSingleKeyframeValuesUnsafe

/** Array of keyframes.
 * `[[...], [...]]`.
 * Does not ensure that keyframe flags (e.g. `easeLinear`) are at the end, or that each keyframe has the same size.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframeValuesUnsafe =
    RuntimeSingleKeyframeValuesUnsafe[]

/** A single keyframe.
 * `[...]`. (e.g. `[0,0,0,'easeLinear']`).
 * Does not ensure that keyframe flags (e.g. `easeLinear`) are at the end.
 * Includes runtime properties.
 */
export type RuntimeSingleKeyframeValuesUnsafe =
    | RuntimeKeyframeValues<
        number[],
        RuntimeProperties
    >
    | InnerKeyframeValuesUnsafe
//#endregion

/** A track or multiple tracks. */
export type TrackValue = string | string[]

/** Animation properties. */
export type AnimationKeys =
    | 'position'
    | 'offsetPosition'
    | 'definitePosition'
    | 'localPosition'
    | 'rotation'
    | 'offsetWorldRotation'
    | 'localRotation'
    | 'scale'
    | 'dissolve'
    | 'dissolveArrow'
    | 'color'
    | 'uninteractable'
    | 'attenuation'
    | 'offset'
    | 'startY'
    | 'height'
    | 'time'
