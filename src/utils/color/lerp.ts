import { applyEasing } from '../animation/interpolate.ts'
import { lerp, lerpWrap } from '../math/lerp.ts'
import { arrayLerp } from '../array/operation.ts'
import {ColorVec} from "../../types/math/vector.ts";

import {EASE} from "../../types/animation/easing.ts";
import {HSVtoRGB, RGBtoHSV} from "./hsv.ts";

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

/** Converts colors to HSV space, lerps them, and then converts them back to RGB. */
export function lerpHSV(
    start: ColorVec,
    end: ColorVec,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)

    const startHSV = RGBtoHSV(start)
    const endHSV = RGBtoHSV(end)

    const output = [
        lerpWrap(startHSV[0], endHSV[0], fraction),
        lerp(startHSV[1], endHSV[1], fraction),
        lerp(startHSV[2], endHSV[2], fraction),
    ] as ColorVec

    if (startHSV[3] || endHSV[3]) {
        const outputAlpha = lerp(startHSV[3] ?? 1, endHSV[3] ?? 1, fraction)
        output.push(outputAlpha)
    }

    return HSVtoRGB(output)
}
