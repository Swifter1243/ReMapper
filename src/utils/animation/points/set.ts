
import { getPointFlagIndex, getPointTimeIndex } from './get.ts'

import {arrayRemove} from "../../array/mutate.ts";
import {
    PointFlag,
    SPLINE
} from "../../../types/animation/points/components.ts";
import {EASE} from "../../../types/animation/easing.ts";
import {InnerPointBoundless} from "../../../types/animation/points/boundless.ts";
import {RuntimeInnerPointBoundless} from "../../../types/animation/points/runtime/boundless.ts";

/** Set the time value of a points. */
export function setPointTime(
    data: RuntimeInnerPointBoundless,
    value: number,
) {
    return data[getPointTimeIndex(data)] = value
}

/** Set the values in the point.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export function setPointValues(
    data: InnerPointBoundless,
    value: number[],
) {
    for (let i = 0; i < getPointTimeIndex(data); i++) {
        data[i] = value[i]
    }
}

/** Set easing in the points. */
export function setPointEasing(
    data: RuntimeInnerPointBoundless,
    value: EASE | undefined,
) {
    setPointFlag(data, value, 'ease')
}

/** Set the spline in the points. */
export function setPointSpline(
    data: RuntimeInnerPointBoundless,
    value: SPLINE | undefined,
) {
    setPointFlag(data, value, 'spline')
}

/** Set whether this points has the "lerpHSV" flag. */
export function setPointHSVLerp(
    data: RuntimeInnerPointBoundless,
    hasHSVLerp: boolean,
) {
    setPointFlag(data, hasHSVLerp ? 'lerpHSV' : undefined, 'lerpHSV', true)
}

/**
 * Set a flag in a points.
 */
export function setPointFlag(
    data: RuntimeInnerPointBoundless,
    value: PointFlag,
    old?: undefined,
    exact?: boolean,
): void
export function setPointFlag(
    data: RuntimeInnerPointBoundless,
    value: PointFlag | undefined,
    old: string,
    exact?: boolean,
): void
export function setPointFlag(
    data: RuntimeInnerPointBoundless,
    value: PointFlag | undefined,
    old?: string,
    exact?: boolean,
): void {
    exact ??= old === undefined

    if (!old && !value) {
        throw 'Old value cannot be inferenced when both "old" and "value" are undefined.'
    }

    let index = getPointFlagIndex(
        data,
        old ? old : value!,
        exact,
    )
    if (index === -1) index = data.length

    if (!value) arrayRemove(data, index)
    else data[index] = value
}
