import { positiveMod } from '../math/rounding.ts'
import {ColorVec} from "../../types/math/vector.ts";

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
