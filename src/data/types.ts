// deno-lint-ignore ban-types

import { AbstractDifficulty } from '../beatmap/abstract_beatmap.ts'

export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    toJson(v3: true): TV3
    toJson(v3: false): TV2
    toJson(v3: boolean): TV2 | TV3
}

export type MapTypes<T, U, V> =
    & ExcludeTypes<T, U>
    & {
        [K in keyof T]: T[K] extends U ? V : never
    }[keyof T]

export type MapRecursiveTypes<T, U, V> =
    & ExcludeTypes<T, U>
    & {
        [K in keyof T]: T[K] extends U ? V
            : (T[K] extends object ? MapRecursiveTypes<T[K], U, V> : never)
    }[keyof T]

export type FilterTypes<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? K : never
    }[keyof T]
>
export type ExcludeTypes<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? never : K
    }[keyof T]
>

// deno-lint-ignore ban-types
type ExcludeFunctionPropertyNames<T> = ExcludeTypes<T, Function>

// https://stackoverflow.com/questions/61272153/typescript-keyof-exclude-methods
export type Fields<T> = ExcludeFunctionPropertyNames<T>

export type OnlyNumbers<T> = FilterTypes<T, number>
export type OnlyNumbersOptional<T> = FilterTypes<T, number | undefined>

/** An array with 2 numbers. */
export type Vec2 = [x: number, y: number]
/** An array with 3 numbers. */
export type Vec3 = [x: number, y: number, z: number]
/** An array with 4 numbers. */
export type Vec4 = [x: number, y: number, z: number, w: number]
/** An array with [r,g,b] or [r,g,b,a]. */
export type ColorType =
    | [number, number, number, number?]
    | [number, number, number, number]
    | [number, number, number]

export type Transform = {
    pos?: Vec3
    rot?: Vec3
    scale?: Vec3
}

export type FullTransform = {
    pos: Vec3
    rot: Vec3
    scale: Vec3
}

// export type Fields<T, K extends keyof T> = {
//     [P in K]: T[P] extends Function ? never : T[P]
// }

export type Bounds = {
    lowBound: Vec3
    highBound: Vec3
    scale: Vec3
    midPoint: Vec3
}

/** Any flag that could be in a keyframe. E.g. easings, splines */
export type KeyframeFlag = Interpolation | 'hsvLerp'

/** All mods to suggest. */
export type SUGGEST_MODS =
    | 'Chroma'
    | 'Cinema'
/** All mods to require. */

export type REQUIRE_MODS =
    | 'Chroma'
    | 'Noodle Extensions'

/** All environment names. */
export type ENV_NAMES =
    | 'BTSEnvironment'
    | 'BigMirrorEnvironment'
    | 'BillieEnvironment'
    | 'CrabRaveEnvironment'
    | 'DefaultEnvironment'
    | 'DragonsEnvironment'
    | 'FitBeatEnvironment'
    | 'GagaEnvironment'
    | 'GreenDayEnvironment'
    | 'GreenDayGrenadeEnvironment'
    | 'InterscopeEnvironment'
    | 'KDAEnvironment'
    | 'KaleidoscopeEnvironment'
    | 'LinkinParkEnvironment'
    | 'MonstercatEnvironment'
    | 'NiceEnvironment'
    | 'OriginsEnvironment'
    | 'PanicEnvironment'
    | 'RocketEnvironment'
    | 'SkrillexEnvironment'
    | 'HalloweenEnvironment'
    | 'TimbalandEnvironment'
    | 'TriangleEnvironment'
    | 'WeaveEnvironment'
    | 'PyroEnvironment'
    | 'TheSecondEnvironment'
    | 'EDMEnvironment'

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

export interface TransformKeyframe {
    pos: Vec3
    rot: Vec3
    scale: Vec3
    time: number
}

/** A type that can be used to prefer a tuple on an array of numbers. */
export type NumberTuple = number[] | []

/** Cached data saved in the ReMapper cache. */
export type CachedData = {
    processing: string
    data: unknown
    accessed?: boolean
}

// TODO: If possible, try to figure out a way to default to a string with no extension or path
export type FILENAME<T extends string = string> = T | `${T}.${string}`

export type FILEPATH<T extends string = string> =
    | FILENAME<T>
    | `${string}/${FILENAME<T>}`

type DiffNameBase<T extends string> =
    | `Easy${T}`
    | `Normal${T}`
    | `Hard${T}`
    | `Expert${T}`
    | `ExpertPlus${T}`

/** All difficulty names. */
export type DIFFS =
    | DiffNameBase<'Standard'>
    | DiffNameBase<'NoArrows'>
    | DiffNameBase<'OneSaber'>
    | DiffNameBase<'360Degree'>
    | DiffNameBase<'90Degree'>
    | DiffNameBase<'Lightshow'>
    | DiffNameBase<'Lawless'>

/** Color formats. */
export type ColorFormat =
    | 'RGB'
    | 'HSV'

/** Lookup methods for environment objects. */
export type Lookup =
    | 'Contains'
    | 'Regex'
    | 'Exact'
    | 'StartsWith'
    | 'EndsWith'

/** Geometry shape types. */
export type GeoType =
    | 'Sphere'
    | 'Capsule'
    | 'Cylinder'
    | 'Cube'
    | 'Plane'
    | 'Quad'
    | 'Triangle'

/** Shaders available for geometry materials. */
export type GeoShader =
    | 'Standard'
    | 'OpaqueLight'
    | 'TransparentLight'
    | 'BaseWater'
    | 'BillieWater'
    | 'BTSPillar'
    | 'InterscopeConcrete'
    | 'InterscopeCar'
    | 'Obstacle'
    | 'WaterfallMirror'

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

export type ObjectFields<T extends { customData: V }, V = T['customData']> =
    & Omit<Fields<T>, 'customData'>
    & {
        customData?: T['customData']
    }

/** Type for Json data. */
export type TJson = Record<string, unknown>

/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFPATH = FILEPATH<DIFFS>

/** Filename for a difficulty. Extension is optional. */
export type DIFFNAME = FILENAME<DIFFS>

export type PostProcessFn<T> = (
    object: T,
    diff: AbstractDifficulty,
    json: ReturnType<AbstractDifficulty['toJSON']>,
) => void

export type LightID = number | number[]
