import { ColorVec, Vec3 } from '../../types/data.ts'

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
