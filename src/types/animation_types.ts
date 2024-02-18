import { Vec3, Vec4 } from './data_types.ts'
import { DeepReadonly } from './util_types.ts'

// export type Fields<T, K extends keyof T> = {
//     [P in K]: T[P] extends Function ? never : T[P]
// }

// All runtime properties
export type RuntimePropertiesLinear = never

export type RuntimePropertiesVec3 =
    | 'baseHeadLocalPosition'
    | 'baseHeadLocalRotation'
    | 'baseLeftHandLocalPosition'
    | 'baseRightHandLocalPosition'
    | 'baseLeftHandLocalRotation'
    | 'baseRightHandLocalRotation'

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
/** Helper type for single keyframes. [...] */
export type SingleKeyframeAbstract<T extends number[]> =
    | [...T]
    | [...T, KeyframeFlag]
    | [...T, KeyframeFlag, KeyframeFlag]
    | [...T, KeyframeFlag, KeyframeFlag, KeyframeFlag]

export type RuntimeSingleKeyframeAbstract<
    T extends number[],
    R extends string,
> =
    | [
        R,
        | [...T, PointModifier]
        | [R, PointModifier]
        | [
            RuntimeSingleKeyframeAbstract<T, R>,
            PointModifier,
        ],
    ]
    | [
        ...T,
        | [...T, PointModifier]
        | [R, PointModifier]
        | [
            RuntimeSingleKeyframeAbstract<T, R>,
            PointModifier,
        ],
    ]
    | T

export type ReadonlyRuntimeSingleKeyframeAbstract<
    T extends readonly number[],
    R extends string,
> =
    | readonly [
        R,
        | readonly [...T, PointModifier]
        | readonly [R, PointModifier]
        | readonly [
            ReadonlyRuntimeSingleKeyframeAbstract<T, R>,
            PointModifier,
        ],
    ]
    | readonly [
        ...T,
        | readonly [...T, PointModifier]
        | readonly [R, PointModifier]
        | readonly [
            ReadonlyRuntimeSingleKeyframeAbstract<T, R>,
            PointModifier,
        ],
    ]
    | T

/** Helper type for complex keyframes. [[...], [...], [...]] */
export type ComplexKeyframesAbstract<T extends number[]> =
    SingleKeyframeAbstract<[...T, TimeValue]>[]

export type RuntimeComplexKeyframesAbstract<
    T extends number[],
    R extends string,
> = (
    | [
        ...RuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
    ]
    | [
        ...RuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
        KeyframeFlag,
    ]
    | [
        ...RuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
        KeyframeFlag,
        KeyframeFlag,
    ]
    | [
        ...RuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
        KeyframeFlag,
        KeyframeFlag,
        KeyframeFlag,
    ]
    | SingleKeyframeAbstract<[...T, TimeValue]>
)[]

export type ReadonlyRuntimeComplexKeyframesAbstract<
    T extends readonly number[],
    R extends string,
> = (
    | readonly [
        ...ReadonlyRuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
    ]
    | readonly [
        ...ReadonlyRuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
        KeyframeFlag,
    ]
    | readonly [
        ...ReadonlyRuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
        KeyframeFlag,
        KeyframeFlag,
    ]
    | readonly [
        ...ReadonlyRuntimeSingleKeyframeAbstract<T, R>,
        TimeValue,
        KeyframeFlag,
        KeyframeFlag,
        KeyframeFlag,
    ]
    | DeepReadonly<SingleKeyframeAbstract<[...T, TimeValue]>>
)[]

/** Helper type for raw keyframes. [...] | [[...], [...], [...]] */
export type RawKeyframesAbstract<T extends number[]> =
    | ComplexKeyframesAbstract<T>
    | SingleKeyframeAbstract<T>

export type RuntimeRawKeyframesAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeComplexKeyframesAbstract<T, R>
    | RuntimeSingleKeyframeAbstract<T, R>
    | [R]

export type ReadonlyRuntimeRawKeyframesAbstract<
    T extends readonly number[],
    R extends string,
> =
    | ReadonlyRuntimeComplexKeyframesAbstract<T, R>
    | ReadonlyRuntimeSingleKeyframeAbstract<T, R>
    | readonly [R]

/** Helper type for keyframe arrays. */
export type PointDefinitionAbstract<T extends number[]> =
    | RawKeyframesAbstract<T>
    | string

export type RuntimePointDefinitionAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeRawKeyframesAbstract<T, R>
    | string

export type ReadonlyRuntimePointDefinitionAbstract<
    T extends readonly number[],
    R extends string,
> =
    | ReadonlyRuntimeRawKeyframesAbstract<T, R>
    | string

//#endregion

//#region Linear
/** Keyframe or array of keyframes with 1 value. [[x, time]...] or [x] */
export type PointDefinitionLinear = PointDefinitionAbstract<[number]>
export type RuntimePointDefinitionLinear = RuntimePointDefinitionAbstract<
    [number],
    RuntimePropertiesLinear
>
export type ReadonlyRuntimePointDefinitionLinear =
    ReadonlyRuntimePointDefinitionAbstract<
        readonly [number],
        RuntimePropertiesLinear
    >

/** Array of keyframes with 1 value. [[x, time]...] */
export type ComplexKeyframesLinear = ComplexKeyframesAbstract<[number]>
export type RuntimeComplexKeyframesLinear = RuntimeComplexKeyframesAbstract<
    [number],
    RuntimePropertiesLinear
>
export type ReadonlyRuntimeComplexKeyframesLinear =
    ReadonlyRuntimeComplexKeyframesAbstract<
        readonly [number],
        RuntimePropertiesLinear
    >

/** Keyframe or array of keyframes with 1 value.
 * [[x,time]...] or [x]
 */
export type RawKeyframesLinear = RawKeyframesAbstract<[number]>
export type RuntimeRawKeyframesLinear = RuntimeRawKeyframesAbstract<
    [number],
    RuntimePropertiesLinear
>
export type ReadonlyRuntimeRawKeyframesLinear =
    ReadonlyRuntimeRawKeyframesAbstract<
        readonly [number],
        RuntimePropertiesLinear
    >
//#endregion

//#region Vec3
/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type PointDefinitionVec3 = PointDefinitionAbstract<Vec3>
export type RuntimePointDefinitionVec3 = RuntimePointDefinitionAbstract<
    Vec3,
    RuntimePropertiesVec3
>
export type ReadonlyRuntimePointDefinitionVec3 =
    ReadonlyRuntimePointDefinitionAbstract<
        Readonly<Vec3>,
        RuntimePropertiesVec3
    >

/** Array of keyframes with 3 values. [[x,y,z,time]...] */
export type ComplexKeyframesVec3 = ComplexKeyframesAbstract<Vec3>
export type RuntimeComplexKeyframesVec3 = RuntimeComplexKeyframesAbstract<
    Vec3,
    RuntimePropertiesVec3
>

export type ReadonlyRuntimeComplexKeyframesVec3 =
    ReadonlyRuntimeComplexKeyframesAbstract<
        Readonly<Vec3>,
        RuntimePropertiesVec3
    >

/** Keyframe or array of keyframes with 3 values.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type RawKeyframesVec3 = RawKeyframesAbstract<Vec3>
export type RuntimeRawKeyframesVec3 = RuntimeRawKeyframesAbstract<
    Vec3,
    RuntimePropertiesVec3
>
export type ReadonlyRuntimeRawKeyframesVec3 =
    ReadonlyRuntimeRawKeyframesAbstract<
        Readonly<Vec3>,
        RuntimePropertiesVec3
    >
//#endregion

//#region Vec4
/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type PointDefinitionVec4 = PointDefinitionAbstract<Vec4>
export type RuntimePointDefinitionVec4 = RuntimePointDefinitionAbstract<
    Vec4,
    RuntimePropertiesVec4
>
export type ReadonlyRuntimePointDefinitionVec4 =
    ReadonlyRuntimePointDefinitionAbstract<
        Readonly<Vec4>,
        RuntimePropertiesVec4
    >

/** Array of keyframes with 4 values. [[x,y,z,w,time]...] */
export type ComplexKeyframesVec4 = ComplexKeyframesAbstract<Vec4>
export type RuntimeComplexKeyframesVec4 = RuntimeComplexKeyframesAbstract<
    Vec4,
    RuntimePropertiesVec4
>
export type ReadonlyRuntimeComplexKeyframesVec4 =
    ReadonlyRuntimeComplexKeyframesAbstract<
        Readonly<Vec4>,
        RuntimePropertiesVec4
    >

/** Keyframe or array of keyframes with 4 values.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type RawKeyframesVec4 = RawKeyframesAbstract<Vec4>
export type RuntimeRawKeyframesVec4 = RuntimeRawKeyframesAbstract<
    Vec4,
    RuntimePropertiesVec4
>
export type ReadonlyRuntimeRawKeyframesVec4 =
    ReadonlyRuntimeRawKeyframesAbstract<
        Readonly<Vec4>,
        RuntimePropertiesVec4
    >
//#endregion

//#region Any

export type SimpleKeyframesAny =
    | SingleKeyframeAbstract<[number]>
    | SingleKeyframeAbstract<Vec3>
    | SingleKeyframeAbstract<Vec4>

/** Array of keyframes which have any amount of values. */
export type ComplexKeyframesAny =
    | ComplexKeyframesLinear
    | ComplexKeyframesVec3
    | ComplexKeyframesVec4
export type RuntimeComplexKeyframesAny =
    | RuntimeComplexKeyframesLinear
    | RuntimeComplexKeyframesVec3
    | RuntimeComplexKeyframesVec4
export type ReadonlyRuntimeComplexKeyframesAny =
    | ReadonlyRuntimeComplexKeyframesLinear
    | ReadonlyRuntimeComplexKeyframesVec3
    | ReadonlyRuntimeComplexKeyframesVec4

/** Keyframe or array of keyframes with any amount of values. */
export type RawKeyframesAny =
    | RawKeyframesLinear
    | RawKeyframesVec3
    | RawKeyframesVec4
export type RuntimeRawKeyframesAny =
    | RuntimeRawKeyframesLinear
    | RuntimeRawKeyframesVec3
    | RuntimeRawKeyframesVec4
export type ReadonlyRuntimeRawKeyframesAny =
    | ReadonlyRuntimeRawKeyframesLinear
    | ReadonlyRuntimeRawKeyframesVec3
    | ReadonlyRuntimeRawKeyframesVec4

/** Keyframe or array of keyframes with any amount of values. Allows point definitions. */
export type PointDefinitionAny =
    | PointDefinitionLinear
    | PointDefinitionVec3
    | PointDefinitionVec4
export type RuntimePointDefinitionAny =
    | RuntimePointDefinitionLinear
    | RuntimePointDefinitionVec3
    | RuntimePointDefinitionVec4
export type ReadonlyRuntimePointDefinitionAny =
    | ReadonlyRuntimePointDefinitionLinear
    | ReadonlyRuntimePointDefinitionVec3
    | ReadonlyRuntimePointDefinitionVec4

//#endregion

/** Keyframe which is in an array with other keyframes, has any amount of values. */
export type KeyframeValuesUnsafe =
    | ComplexKeyframeValuesUnsafe
    | SingleKeyframeValuesUnsafe
export type ComplexKeyframeValuesUnsafe = SingleKeyframeValuesUnsafe[]
export type SingleKeyframeValuesUnsafe = number[] | (number | KeyframeFlag)[]

export type RuntimeKeyframeValuesUnsafe =
    | RuntimeComplexKeyframeValuesUnsafe
    | RuntimeSingleKeyframeValuesUnsafe
export type RuntimeComplexKeyframeValuesUnsafe =
    RuntimeSingleKeyframeValuesUnsafe[]
export type RuntimeSingleKeyframeValuesUnsafe = RuntimeSingleKeyframeAbstract<
    number[],
    RuntimeProperties
> | SingleKeyframeValuesUnsafe

export type ReadonlyRuntimeKeyframeValuesUnsafe =
    | ReadonlyRuntimeComplexKeyframeValuesUnsafe
    | ReadonlyRuntimeSingleKeyframeValuesUnsafe
export type ReadonlyRuntimeComplexKeyframeValuesUnsafe =
    ReadonlyRuntimeSingleKeyframeValuesUnsafe[]
export type ReadonlyRuntimeSingleKeyframeValuesUnsafe =
    ReadonlyRuntimeSingleKeyframeAbstract<
        readonly number[],
        RuntimeProperties
    >
    | DeepReadonly<SingleKeyframeValuesUnsafe>

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
