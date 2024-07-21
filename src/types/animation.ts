import { bsmap } from '../deps.ts'
import {Vec3, Vec4} from './data.ts'

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

// type RuntimePropertyMap<T extends number[]> = T extends [number]
//     ? RuntimePropertiesLinear
//     : T extends Vec3 ? RuntimePropertiesVec3
//     : T extends Vec4 ? RuntimePropertiesVec4
//     : never

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

//#region Boundless
/** Keyframe or array of keyframes with any number of values. Allows point definitions.
 * `[[..., time]...]` or `[...]`
 */
export type PointDefinitionBoundless = PointDefinitionAbstract<number[]>

/** Keyframe or array of keyframes with any number of values. Allows point definitions.
 * `[[..., time]...]` or `[...]`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionBoundless =
    | RuntimePointDefinitionAny
    | RuntimePointDefinitionAbstract<number[], RuntimeProperties>

/** Array of keyframes with any number of values. `[[... ,time]...]` */
export type ComplexKeyframesBoundless = ComplexKeyframesAbstract<number[]>

/** Array of keyframes with any number of values. `[[... ,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesBoundless =
    | RuntimeComplexKeyframesAny
    | RuntimeComplexKeyframesAbstract<number[], RuntimeProperties>

/** Single keyframe with any number of values. `[..., time]` */
export type InnerKeyframeBoundless = ComplexKeyframesBoundless[0]

/** Single keyframe with any number of values. `[..., time]`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeBoundless = RuntimeComplexKeyframesBoundless[0]

/** Keyframe or array of keyframes with any number of values.
 * `[[..., time]...]` or `[...]`
 */
export type RawKeyframesBoundless = RawKeyframesAbstract<number[]>

/** Keyframe or array of keyframes with any number of values.
 * `[[..., time]...]` or `[...]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesBoundless =
    | RuntimeRawKeyframesAny
    | RuntimeRawKeyframesAbstract<number[], RuntimeProperties>
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
/** All animatable properties for V2. */
export type AnimationPropertiesV2 = {
    _color?: RuntimePointDefinitionVec4
    _position?: RuntimePointDefinitionVec3
    _rotation?: RuntimePointDefinitionVec3
    _localRotation?: RuntimePointDefinitionVec3
    _scale?: RuntimePointDefinitionVec3
    _dissolve?: RuntimePointDefinitionLinear
    _dissolveArrow?: RuntimePointDefinitionLinear
    _interactable?: RuntimePointDefinitionLinear
    _definitePosition?: RuntimePointDefinitionVec3
    _time?: RuntimePointDefinitionLinear
    _localPosition?: RuntimePointDefinitionVec3
    [key: string]: RuntimePointDefinitionAny | undefined
}
/** All animatable properties for V3. */
export type AnimationPropertiesV3 = {
    offsetPosition?: RuntimePointDefinitionVec3
    offsetWorldRotation?: RuntimePointDefinitionVec3
    localRotation?: RuntimePointDefinitionVec3
    scale?: RuntimePointDefinitionVec3
    dissolve?: RuntimePointDefinitionLinear
    dissolveArrow?: RuntimePointDefinitionLinear
    interactable?: RuntimePointDefinitionLinear
    definitePosition?: RuntimePointDefinitionVec3
    time?: RuntimePointDefinitionLinear
    color?: RuntimePointDefinitionVec4
    position?: RuntimePointDefinitionVec3
    rotation?: RuntimePointDefinitionVec3
    localPosition?: RuntimePointDefinitionVec3
    [key: string]: RuntimePointDefinitionAny | undefined
}

/** Animation data for beatmap objects. */
export interface ObjectAnimationData {
    /** Describes the position offset of an object. It will continue any normal movement and have this stacked on top of it. */
    offsetPosition?: RuntimePointDefinitionVec3
    /** Describes the definite position of an object.
     * Will completely overwrite the object's default movement.
     * However, this does take into account lineIndex/lineLayer and world rotation.
     * Only available on AssignPathAnimation. */
    definitePosition?: RuntimePointDefinitionVec3
    /** This property describes the world rotation offset of an object. This means it is rotated with the world as the origin. Uses euler values. Think of 360 mode. */
    offsetWorldRotation?: RuntimePointDefinitionVec3
    /** This property describes the local rotation offset of an object. This means it is rotated with itself as the origin. Uses euler values. Do note that the note spawn effect will be rotated accordlingly. Notes attempting to look towards the player may look strange, you can disable their look by setting noteLook to false. */
    localRotation?: RuntimePointDefinitionVec3
    /** Decribes the scale of an object. This will be based off their initial size. A scale of 1 is equal to normal size, anything under is smaller, over is larger. */
    scale?: RuntimePointDefinitionVec3
    /** This property controls the dissolve effect on both notes and walls. It's the effect that happens when things go away upon failing a song. Keep in mind that notes and the arrows on notes have seperate dissolve properties, see dissolveArrow. */
    dissolve?: RuntimePointDefinitionLinear
    /** This property controls whether or not the player can interact with the note/wall.
     * "interactable" either is or isn't, there is no inbetween. When great than or equal to 1, the object can fully be interacted with. When less than 1, the object cannot be interacted with at all. */
    interactable?: RuntimePointDefinitionLinear
    /** "time" is relatively advanced so make sure to have a solid understanding of Heck animations before delving into time. time can only be used in AnimateTrack as it lets you control what point in the note's "lifespan" it is at a given time. */
    time?: RuntimePointDefinitionLinear
    /** Describes the color of an object. Will override any other color the object may have had. */
    color?: RuntimePointDefinitionVec4

    [key: string]: RuntimePointDefinitionAny | undefined
}

/** Animation data for note objects. */
export interface NoteAnimationData extends ObjectAnimationData {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow?: RuntimePointDefinitionLinear
}

export type GameplayObjectAnimationData =
    | ObjectAnimationData
    | NoteAnimationData

export interface EnvironmentAnimationData {
    /** The position of the object in world space. */
    position?: RuntimePointDefinitionVec3
    /** The position of the object relative to it's parent. */
    localPosition?: RuntimePointDefinitionVec3
    /** The rotation of the object in world space. */
    rotation?: RuntimePointDefinitionVec3
    /** The rotation of the object relative to it's parent. */
    localRotation?: RuntimePointDefinitionVec3
    /** The scale of the object. */
    scale?: RuntimePointDefinitionVec3
}