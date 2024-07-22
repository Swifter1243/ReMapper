import { applyEasing } from '../animation/interpolate.ts'
import { lerp, lerpWrap } from '../math/lerp.ts'
import { arrayLerp } from '../array/operation.ts'
import {ColorVec} from "../../types/math/vector.ts";

import {EASE} from "../../types/animation/easing.ts";

/** Lerps an RGB (red, green, blue) color with another RGB color */
export function lerpRGB(
    start: ColorVec,
    end: ColorVec,
    fraction: number,
    easing?: EASE,
) {
    if (start.length != end.length) {
        start[3] ??= 1
        end[3] ??= 1
    }

    return arrayLerp(start, end, fraction, easing) as ColorVec
}

/** Lerps an HSV (hue, saturation, value) color with another HSV color */
export function lerpHSV(
    start: ColorVec,
    end: ColorVec,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)

    const output = [
        lerpWrap(start[0], end[0], fraction),
        lerp(start[1], end[1], fraction),
        lerp(start[2], end[2], fraction),
    ]

    if (start.length != end.length) {
        start[3] ??= 1
        end[3] ??= 1
    }

    if (start[3] !== undefined) {
        output.push(lerp(start[3], end[3] as number, fraction))
    }

    return output as ColorVec
}
