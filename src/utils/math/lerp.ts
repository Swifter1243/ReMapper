import { three } from '../../deps.ts'
import {eulerFromQuaternion} from "./three_conversion.ts";
import {toRadians} from "./degrees_radians.ts";
import {applyEasing} from "../animation/interpolate.ts";
import {Vec3} from "../../types/math/vector.ts";

import {EASE} from "../../types/animation/easing.ts";

/**
 * Interpolates between a start and end value to get a value in between.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerp(
    start: number,
    end: number,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)
    return start + (end - start) * fraction
}

/**
 * Interpolates between a start and end value to get a value in between. Will wrap around 0-1.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpWrap(
    start: number,
    end: number,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)
    const distance = Math.abs(end - start)

    if (distance <= 0.5) return lerp(start, end, fraction)
    else {
        if (end > start) start += 1
        else start -= 1
        let result = lerp(start, end, fraction)
        if (result < 0) result = 1 + result
        return result % 1
    }
}

/**
 * Interpolates between a start and end rotation to get a rotation in between.
 * @param start Start rotation.
 * @param end End rotation.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpRotation(
    start: Vec3,
    end: Vec3,
    fraction: number,
    easing?: EASE,
): Vec3 {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)
    const q1 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(start), 'YXZ'),
    )
    const q2 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(end), 'YXZ'),
    )
    q1.slerp(q2, fraction)
    return eulerFromQuaternion(q1)
}

/**
 * Find value between 0 and 1 from a beginning, length, and a point in time between.
 * @param beginning Start value.
 * @param end End value.
 * @param time Value between start and end.
 */
export function inverseLerp(beginning: number, end: number, time: number) {
    const length = end - beginning
    if (length === 0) return 0
    return (time - beginning) / length
}
