// deno-lint-ignore-file
import {
    ComplexKeyframesAbstract,
    EASE,
    KeyframeFlag,
    KeyframeValuesUnsafe,
    RawKeyframesAbstract,
    SingleKeyframeAbstract,
    SingleKeyframeValuesUnsafe,
    SPLINE,
} from '../types/animation_types.ts'
import type {
    DeepReadonly,
    NumberTuple,
    RuntimeSingleKeyframeValuesUnsafe,
} from '../types/mod.ts'
import { arrayRemove } from '../utils/array_utils.ts'

/**
 * Checks if value is an array of keyframes.
 * @param array The keyframe or array of keyframes.
 */
export const areKeyframesSimple = (array: DeepReadonly<KeyframeValuesUnsafe>) =>
    typeof array[0] !== 'object'

/** Get the index of the time value of a keyframe. */
export function getKeyframeTimeIndex(
    data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>,
) {
    for (let i = data.length - 1; i >= 0; i--) {
        if (typeof data[i] !== 'string') return i
    }
    return -1
}

/** Get the time value of a keyframe. */
export const getKeyframeTime = (
    data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>,
) => data[getKeyframeTimeIndex(data)] as number

/** Set the time value of a keyframe. */
export const setKeyframeTime = (
    data: RuntimeSingleKeyframeValuesUnsafe,
    value: number,
) => data[getKeyframeTimeIndex(data)] = value

/** Get the values in the keyframes.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export const getKeyframeValues = (
    data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>,
) => data.slice(0, getKeyframeTimeIndex(data)) as number[]

/** Set the values in the keyframes.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export function setKeyframeValues(
    data: RuntimeSingleKeyframeValuesUnsafe,
    value: number[],
) {
    for (let i = 0; i < getKeyframeTimeIndex(data); i++) {
        data[i] = value[i]
    }
}

/** Get the easing in the keyframe. Returns undefined if not found. */
export const getKeyframeEasing = (data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>) =>
    data[getKeyframeFlagIndex(data, 'ease', false)] as EASE

/** Set easing in the keyframe. */
export const setKeyframeEasing = (data: RuntimeSingleKeyframeValuesUnsafe, value: EASE) =>
    setKeyframeFlag(data, value, 'ease')

/** Get the spline in the keyframe. Returns undefined if not found. */
export const getKeyframeSpline = (data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>) =>
    data[getKeyframeFlagIndex(data, 'spline', false)] as SPLINE

/** Set the spline in the keyframe. */
export const setKeyframeSpline = (data: RuntimeSingleKeyframeValuesUnsafe, value: SPLINE) =>
    setKeyframeFlag(data, value, 'spline')

/** Whether this keyframe has the "lerpHSV" flag. */
export const getKeyframeHSVLerp = (data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>) =>
    getKeyframeFlagIndex(data, 'lerpHSV') !== -1

/** Set whether this keyframe has the "lerpHSV" flag. */
export function setKeyframeHSVLerp(
    data: RuntimeSingleKeyframeValuesUnsafe,
    hasHSVLerp: boolean,
) {
    if (hasHSVLerp) setKeyframeFlag(data, 'lerpHSV')
    else {
        const flagIndex = getKeyframeFlagIndex(data, 'lerpHSV')
        if (flagIndex !== -1) arrayRemove(data as number[], flagIndex)
    }
}

/**
 * Set a flag in a keyframe.
 * @param value The flag to be set.
 * @param old An existing flag containing this will be replaced by the value.
 */
export function setKeyframeFlag(
    data: RuntimeSingleKeyframeValuesUnsafe,
    value: KeyframeFlag,
    old?: string,
) {
    let index = getKeyframeFlagIndex(data, old ? old : value, old === undefined)
    if (index === -1) index = data.length
    data[index] = value
}

/**
 * Gets the index of a flag in a keyframe.
 * @param flag The flag to look for.
 * @param exact Whether it should be an exact match, or just contain the flag argument.
 */
export function getKeyframeFlagIndex(
    data: DeepReadonly<RuntimeSingleKeyframeValuesUnsafe>,
    flag: string,
    exact = true,
) {
    if (exact) {
        return data.findIndex(
            (x) => typeof x === 'string' && x === flag,
        )
    }
    return data.findIndex(
        (x) => typeof x === 'string' && x.includes(flag),
    )
}

// idrk what this does???
export function keyframesMap<
    T extends NumberTuple,
    K extends RawKeyframesAbstract<T>,
>(
    keyframe: K,
    fn: (
        keyframe: Readonly<ComplexKeyframesAbstract<T>[0]> | undefined,
    ) => ComplexKeyframesAbstract<T>[0],
    options: {
        filter?: false // if true, will remove al
    },
): K
export function keyframesMap<
    T extends NumberTuple,
    K extends RawKeyframesAbstract<T>,
>(
    keyframe: K,
    fn: (
        keyframe: Readonly<ComplexKeyframesAbstract<T>[0]>,
    ) => ComplexKeyframesAbstract<T>[0],
    options: {
        filter: true // if true, will remove al
    },
): K

/**
 * @param keyframe keyframe to transform
 * @param fn
 * @param options if filter is true, will only retain keyframes that evaluate to truthy. Will not apply to simple keyframes
 */
export function keyframesMap<
    T extends NumberTuple,
    K extends RawKeyframesAbstract<T>,
>(
    keyframe: K,
    fn: (
        keyframe: Readonly<ComplexKeyframesAbstract<T>[0]>,
        timeIndex: number,
        keyframeIndex: number,
    ) => ComplexKeyframesAbstract<T>[0],
    options: {
        filter?: boolean // if true, will remove al
    },
): K {
    if (areKeyframesSimple(keyframe)) {
        const simpleKeyframe = [...keyframe, 0] as unknown as Readonly<
            ComplexKeyframesAbstract<T>[0]
        >

        // TODO: Redo
        return fn(
            simpleKeyframe,
            getKeyframeTime(simpleKeyframe),
            0,
        ) as unknown as K
    }

    const complexKeyframe = keyframe as ComplexKeyframesAbstract<T>

    const ret = complexKeyframe.map((x, i) => fn(x, getKeyframeTime(x), i))

    if (!options.filter) return ret as K

    // if evaluate to truthy
    return ret.filter((x) => x) as K
}