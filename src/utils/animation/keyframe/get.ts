import {findIndexLastFirst} from "../../array/find.ts";
import {
    SPLINE
} from "../../../types/animation/keyframe/keyframe.ts";
import {EASE} from "../../../types/animation/easing.ts";
import {InnerKeyframeBoundless} from "../../../types/animation/keyframe/boundless.ts";
import {RuntimeInnerKeyframeBoundless} from "../../../types/animation/keyframe/runtime/boundless.ts";
import {DeepReadonly} from "../../../types/util/mutability.ts";

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

/** Get the values in the keyframes.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export const getKeyframeValues = (
    data: DeepReadonly<InnerKeyframeBoundless>,
) => data.slice(0, getKeyframeTimeIndex(data)) as number[]

/** Get the easing in the keyframe. Returns undefined if not found. */
export const getKeyframeEasing = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => data[getKeyframeFlagIndex(data, 'ease', false)] as EASE

/** Get the spline in the keyframe. Returns undefined if not found. */
export const getKeyframeSpline = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => data[getKeyframeFlagIndex(data, 'spline', false)] as SPLINE

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

/** Whether this keyframe has the "lerpHSV" flag. */
export const getKeyframeHSVLerp = (
    data: DeepReadonly<RuntimeInnerKeyframeBoundless>,
) => getKeyframeFlagIndex(data, 'lerpHSV') !== -1
