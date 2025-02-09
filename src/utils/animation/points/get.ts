import {
    SPLINE
} from "../../../types/animation/points/components.ts";
import {EASE} from "../../../types/animation/easing.ts";
import {InnerPointBoundless} from "../../../types/animation/points/boundless.ts";
import {RuntimeInnerPointBoundless} from "../../../types/animation/points/runtime/boundless.ts";
import {DeepReadonly} from "../../../types/util/mutability.ts";

/** Get the index of the time value of a points. */
export function getPointTimeIndex(
    data: DeepReadonly<RuntimeInnerPointBoundless>,
) {
    for (let i = data.length - 1; i >= 0; i--) {
        if (typeof data[i] !== 'string') return i
    }
    return -1
}

/** Get the time value of a points. */
export function getPointTime(
    data: DeepReadonly<RuntimeInnerPointBoundless>,
) {
    return data[getPointTimeIndex(data)] as number
}

/** Get the values of a point.
 * For example [x,y,z,time] would have [x,y,z] as values.
 */
export function getPointValues(
    data: DeepReadonly<InnerPointBoundless>,
) {
    return data.slice(0, getPointTimeIndex(data)) as number[]
}

/** Get the easing in a point. Returns undefined if not found. */
export function getPointEasing(
    data: DeepReadonly<RuntimeInnerPointBoundless>,
) {
    return data[getPointFlagIndex(data, 'ease', false)] as EASE
}

/** Get the spline in a point. Returns undefined if not found. */
export function getPointSpline(
    data: DeepReadonly<RuntimeInnerPointBoundless>,
) {
    return data[getPointFlagIndex(data, 'spline', false)] as SPLINE
}

/**
 * Gets the index of a flag in a points.
 * @param data The points data.
 * @param flag The flag to look for.
 * @param exact Whether it should be an exact match, or just contain the flag argument.
 */
export function getPointFlagIndex(
    data: DeepReadonly<RuntimeInnerPointBoundless>,
    flag: string,
    exact = true,
) {
    if (exact) {
        return data.findLastIndex((x) => typeof x === 'string' && x === flag)
    }
    else {
        return data.findLastIndex((x) => typeof x === 'string' && x.includes(flag))
    }
}

/** Whether this points has the "lerpHSV" flag. */
export function getPointHSVLerp(
    data: DeepReadonly<RuntimeInnerPointBoundless>,
) {
    return getPointFlagIndex(data, 'lerpHSV') !== -1
}
