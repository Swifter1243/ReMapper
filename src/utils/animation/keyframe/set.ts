
import { getKeyframeFlagIndex, getKeyframeTimeIndex } from './get.ts'

import {arrayRemove} from "../../array/mutate.ts";
import {
    KeyframeFlag,
    SPLINE
} from "../../../types/animation/keyframe/components.ts";
import {EASE} from "../../../types/animation/easing.ts";
import {InnerKeyframeBoundless} from "../../../types/animation/keyframe/boundless.ts";
import {RuntimeInnerKeyframeBoundless} from "../../../types/animation/keyframe/runtime/boundless.ts";

/** Set the time value of a keyframe. */
export const setKeyframeTime = (
    data: RuntimeInnerKeyframeBoundless,
    value: number,
) => data[getKeyframeTimeIndex(data)] = value

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

/** Set easing in the keyframe. */
export const setKeyframeEasing = (
    data: RuntimeInnerKeyframeBoundless,
    value: EASE | undefined,
) => setKeyframeFlag(data, value, 'ease')
/** Set the spline in the keyframe. */

export const setKeyframeSpline = (
    data: RuntimeInnerKeyframeBoundless,
    value: SPLINE | undefined,
) => setKeyframeFlag(data, value, 'spline')
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
