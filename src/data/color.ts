import { lerp, applyEasing, lerpWrap, positiveMod } from '../utils/math.ts'
import { ColorVec, Vec3 } from '../types/data.ts'
import { EASE } from '../types/animation.ts'
import { arrayLerp } from '../utils/array_utils.ts'

/** Converts color from integer space (0-255 with whole numbers) to linear space (0-1 with decimals) */
export function to01Color<T extends ColorVec>(color: T, hsv = false) {
    if (hsv) {
        return color.map((x, i) => !i ? x * 360 : x * 100) as T
    }

    return color.map((x) => x / 255) as T
}

/** Converts color from linear space (0-1 with decimals) to integer space (0-255 with whole numbers) */
export function toIntegerColor<T extends ColorVec>(color: T, hsv = false) {
    if (hsv) {
        return color.map((x, i) => Math.round(!i ? x * 360 : x * 100)) as T
    }

    return color.map((x) => Math.round(x * 255)) as T
}

/** Converts a color from HSV (hue, saturation, value) to RGB (red, green, blue) */
export function HSVtoRGB<T extends ColorVec>(color: T) {
    const h = positiveMod(color[0], 1)
    const s = color[1]
    const v = color[2]

    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    let r, g, b = 0

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p
            break
        case 1:
            r = q, g = v, b = p
            break
        case 2:
            r = p, g = v, b = t
            break
        case 3:
            r = p, g = q, b = v
            break
        case 4:
            r = t, g = p, b = v
            break
        case 5:
            r = v, g = p, b = q
            break
    }

    const output = [r, g, b]
    if (color[3]) output.push(color[3])

    return output as T
}

/** Converts a color from RGB (red, green, blue) to HSV (hue, saturation, value) */
export function RGBtoHSV<T extends ColorVec>(color: T) {
    const r = color[0]
    const g = color[1]
    const b = color[2]

    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min

    let h = 69
    const s = max === 0 ? 0 : d / max
    const v = max

    switch (max) {
        case min:
            h = 0
            break
        case r:
            h = (g - b) + d * (g < b ? 6 : 0)
            h /= 6 * d
            break
        case g:
            h = (b - r) + d * 2
            h /= 6 * d
            break
        case b:
            h = (r - g) + d * 4
            h /= 6 * d
            break
    }

    const output = [h, s, v]
    if (color[3]) output.push(color[3])

    return output as T
}

function componentToHex(c: number) {
    const hex = (Math.round(c * 255)).toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

/** Converts a color from RGB (red, green, blue) to HEX (e.g. #000000) */
export function RGBtoHEX(color: ColorVec) {
    return '#' + componentToHex(color[0]) + componentToHex(color[1]) +
        componentToHex(color[2])
}

/** Converts a color from HEX (e.g. #000000) to RGB (red, green, blue) */
export function HEXtoRGB(color: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    return (result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
        ]
        : [0, 0, 0]) as Vec3
}

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
