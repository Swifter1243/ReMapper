import {lerp} from "../math/lerp.ts";

import {EASE} from "../../types/animation/easing.ts";

/**
 * Add either a number or another array to an array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrayAdd<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { readonly [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x + value) as unknown as T
    } else return arr.map((x, i) => x + value[i]) as unknown as T
}

/**
 * Subtract either a number or another array from an array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arraySubtract<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { readonly [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x - value) as unknown as T
    } else return arr.map((x, i) => x - value[i]) as unknown as T
}

/**
 * Multiply an array either by a number or another array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrayMultiply<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { readonly [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x * value) as unknown as T
    } else return arr.map((x, i) => x * value[i]) as unknown as T
}

/**
 * Divide an array either by a number or another array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrayDivide<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { readonly [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x / value) as unknown as T
    } else return arr.map((x, i) => x / value[i]) as unknown as T
}

/**
 * Interpolate to find an array between 2 arrays of the same length.
 * @param start Start array.
 * @param end End array.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function arrayLerp<T extends readonly [] | readonly number[]>(
    start: T,
    end: { readonly [K in keyof T]: number },
    fraction: number,
    easing?: EASE,
) {
    return start.map((x, i) => lerp(x, end[i], fraction, easing)) as unknown as T
}