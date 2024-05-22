// deno-lint-ignore-file
import { hashString } from '../mod.ts'
import { InnerKeyframeAny } from '../types/animation_types.ts'
import { RawKeyframesAny } from '../types/animation_types.ts'
import { RuntimePointDefinitionBoundless } from '../types/animation_types.ts'
import { RuntimeInnerKeyframeAny } from '../types/animation_types.ts'
import {
    ComplexKeyframesAbstract,
    EASE,
    InnerKeyframeAbstract,
    KeyframeFlag,
    RawKeyframesAbstract,
    SPLINE,
} from '../types/animation_types.ts'
import type {
    DeepReadonly,
    InnerKeyframeBoundless,
    NumberTuple,
    RuntimeInnerKeyframeBoundless,
} from '../types/mod.ts'
import { arrayRemove } from '../utils/array_utils.ts'

/**
 * Checks if value is an array of keyframes.
 * @param array The keyframe or array of keyframes.
 */
export const areKeyframesSimple = (
    array: DeepReadonly<RuntimePointDefinitionBoundless>,
) => typeof array[0] !== 'object'

/** Get the index of the time value of a keyframe. */
export function getKeyframeTimeIndex(
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) {
    for (let i = data.length - 1; i >= 0; i--) {
        if (typeof data[i] !== 'string') return i
    }
    return -1
}

/** Get the time value of a keyframe. */
export const getKeyframeTime = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => data[getKeyframeTimeIndex(data)] as number

/** Set the time value of a keyframe. */
export const setKeyframeTime = (
    data: RuntimeInnerKeyframeBoundless,
    value: number,
) => data[getKeyframeTimeIndex(data)] = value

/** Get the values in the keyframes.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export const getKeyframeValues = (
    data: DeepReadonly<InnerKeyframeBoundless>,
) => data.slice(0, getKeyframeTimeIndex(data)) as number[]

/** Set the values in the keyframes.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export function setKeyframeValues(
    data: InnerKeyframeBoundless,
    value: number[],
) {
    for (let i = 0; i < getKeyframeTimeIndex(data); i++) {
        data[i] = value[i]
    }
}

/** Get the easing in the keyframe. Returns undefined if not found. */
export const getKeyframeEasing = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => data[getKeyframeFlagIndex(data, 'ease', false)] as EASE

/** Set easing in the keyframe. */
export const setKeyframeEasing = (
    data: RuntimeInnerKeyframeBoundless,
    value: EASE | undefined,
) => setKeyframeFlag(data, value, 'ease')

/** Get the spline in the keyframe. Returns undefined if not found. */
export const getKeyframeSpline = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => data[getKeyframeFlagIndex(data, 'spline', false)] as SPLINE

/** Set the spline in the keyframe. */
export const setKeyframeSpline = (
    data: RuntimeInnerKeyframeBoundless,
    value: SPLINE | undefined,
) => setKeyframeFlag(data, value, 'spline')

/** Whether this keyframe has the "lerpHSV" flag. */
export const getKeyframeHSVLerp = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => getKeyframeFlagIndex(data, 'lerpHSV') !== -1

/** Set whether this keyframe has the "lerpHSV" flag. */
export const setKeyframeHSVLerp = (
    data: RuntimeInnerKeyframeBoundless,
    hasHSVLerp: boolean,
) => setKeyframeFlag(data, hasHSVLerp ? 'lerpHSV' : undefined, 'lerpHSV', true)

/**
 * Set a flag in a keyframe.
 */
export function setKeyframeFlag(
    data: RuntimeInnerKeyframeBoundless,
    value: KeyframeFlag,
    old?: undefined,
    exact?: boolean,
): void
export function setKeyframeFlag(
    data: RuntimeInnerKeyframeBoundless,
    value: KeyframeFlag | undefined,
    old: string,
    exact?: boolean,
): void
export function setKeyframeFlag(
    data: RuntimeInnerKeyframeBoundless,
    value: KeyframeFlag | undefined,
    old?: string,
    exact?: boolean,
): void {
    exact ??= old === undefined

    if (!old && !value) {
        throw 'Old value cannot be inferenced when both "old" and "value" are undefined.'
    }

    let index = getKeyframeFlagIndex(
        data,
        old ? old : value!,
        exact,
    )
    if (index === -1) index = data.length

    if (!value) arrayRemove(data, index)
    else data[index] = value
}

function findIndexLastFirst<T extends unknown>(
    arr: readonly T[],
    predicate: (obj: T) => boolean,
) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) return i
    }

    return -1
}

/**
 * Gets the index of a flag in a keyframe.
 * @param flag The flag to look for.
 * @param exact Whether it should be an exact match, or just contain the flag argument.
 */
export function getKeyframeFlagIndex(
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
    flag: string,
    exact = true,
) {
    if (exact) {
        return findIndexLastFirst(
            data,
            (x) => typeof x === 'string' && x === flag,
        )
    }
    return findIndexLastFirst(
        data,
        (x) => typeof x === 'string' && x.includes(flag),
    )
}
