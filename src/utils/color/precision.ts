import {ColorVec} from "../../types/math/vector.ts";

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
