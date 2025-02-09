import {ColorVec, Vec3} from "../../types/math/vector.ts";

function componentToHex(c: number) {
    const hex = (Math.round(c * 255)).toString(16)
    return hex.length == 1 ? '0' + hex : hex
}

function _RGBToHEX(color: ColorVec) {
    return '#' + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2])
}

/** Converts a color from RGB (red, green, blue) to HEX (e.g. #000000) */
export function RGBtoHEX(color: ColorVec): string
export function RGBtoHEX(r: number, g: number, b: number): string
export function RGBtoHEX(...params: [ColorVec] | Vec3): string {
    if (params.length === 1) {
        const [color] = params
        return _RGBToHEX(color)
    } else {
        const [r, g, b] = params
        return _RGBToHEX([r, g, b])
    }
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
