// deno-lint-ignore ban-types

import {Vec3, Vec4} from "./data_types.ts";

// export type Fields<T, K extends keyof T> = {
//     [P in K]: T[P] extends Function ? never : T[P]
// }

/** Any flag that could be in a keyframe. E.g. easings, splines */
export type KeyframeFlag = Interpolation | 'hsvLerp'

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

/** Time value in a keyframe. */
export type TimeValue = number

/** Helper type for single keyframes. */
export type SingleKeyframeAbstract<T extends number[]> = [
    ...T,
    TimeValue,
    KeyframeFlag?,
    KeyframeFlag?,
    KeyframeFlag?,
]

/** Helper type for complex keyframes. */
export type ComplexKeyframesAbstract<T extends number[]> =
    SingleKeyframeAbstract<T>[]

/** Helper type for raw keyframes. */
export type RawKeyframesAbstract<T extends number[]> =
    | ComplexKeyframesAbstract<T>
    | T

/** Helper type for keyframe arrays. */
export type KeyframesAbstract<T extends number[]> =
    | RawKeyframesAbstract<T>
    | T
    | string

/** Keyframe or array of keyframes with 1 value. [[x, time]...] or [x] */
export type KeyframesLinear = KeyframesAbstract<[number]>

/** Array of keyframes with 1 value. [[x, time]...] */
export type ComplexKeyframesLinear = ComplexKeyframesAbstract<[number]>

/** Keyframe or array of keyframes with 1 value.
 * [[x,time]...] or [x]
 */
export type RawKeyframesLinear = RawKeyframesAbstract<[number]>

/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type KeyframesVec3 = KeyframesAbstract<Vec3>

/** Array of keyframes with 3 values. [[x,y,z,time]...] */
export type ComplexKeyframesVec3 = ComplexKeyframesAbstract<Vec3>

/** Keyframe or array of keyframes with 3 values.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type RawKeyframesVec3 = RawKeyframesAbstract<Vec3>

/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type KeyframesVec4 = KeyframesAbstract<Vec4>

/** Array of keyframes with 4 values. [[x,y,z,w,time]...] */
export type ComplexKeyframesVec4 = ComplexKeyframesAbstract<Vec4>

/** Keyframe or array of keyframes with 4 values.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type RawKeyframesVec4 = RawKeyframesAbstract<Vec4>

/** Keyframe which isn't in an array with other keyframes, has any amount of values. */
export type SingleKeyframe = SingleKeyframeAbstract<number[]>

/** Keyframe which is in an array with other keyframes, has any amount of values. */
export type KeyframeValues = (number | (KeyframeFlag | undefined))[]

/** Array of keyframes which have any amount of values. */
export type ComplexKeyframesAny = ComplexKeyframesAbstract<number[]>

/** Keyframe or array of keyframes with any amount of values. Allows point definitions. */
export type KeyframesAny = SingleKeyframe | ComplexKeyframesAny | string

/** Keyframe or array of keyframes with any amount of values. */
export type RawKeyframesAny = SingleKeyframe | ComplexKeyframesAny

/** A track or multiple tracks. */
export type TrackValue = string | string[]

/** Color formats. */
export type ColorFormat =
    | 'RGB'
    | 'HSV'

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

