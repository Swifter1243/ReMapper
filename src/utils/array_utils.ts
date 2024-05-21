import { three } from '../deps.ts'
import { lerp } from './math.ts'
import { Vec3 } from '../types/data_types.ts'
import { EASE } from '../types/animation_types.ts'

/** Splits an array into a success array and failure array based on a filter.
 * ```ts
 * const arr = [1, 2, 3]
 * const split = arraySplit(arr, x > 1)
 * // { success: [2, 3], fail: [1] }
 * ```
 */
export function arraySplit<T>(
    array: readonly T[],
    filter: (obj: T, index: number, array: readonly T[]) => boolean,
) {
    const passVal = 0
    const failVal = 1

    const map = arraySplit2(
        array,
        (obj, index, array) => filter(obj, index, array) ? passVal : failVal,
    )

    return {
        success: map[passVal] ?? [],
        fail: map[failVal] ?? [],
    }
}

/** Splits an array into keys in a dictionary based on a function.
 * ```ts
 * const arr = [1, 2, 3]
 * const split = arraySplit2(arr, x => x * 2)
 * // { 2: [1], 4: [2], 6: [3]}
 * ```
 */
export function arraySplit2<T, K extends string | number | symbol>(
    array: readonly T[],
    fn: (obj: T, index: number, array: readonly T[]) => K,
): Record<K, T[]> {
    const map = {} as Record<K, T[]>

    array.forEach((e, idx, arr) => {
        const key = fn(e, idx, arr)
        const mapArr = map[key]
        // existing array found
        if (mapArr) {
            mapArr.push(e)
            return
        }

        // no array found
        map[key] = [e]
    })
    return map
}

/**
 * Get the last element in an array.
 * @param arr Input array.
 */
export const arrayLastElement = <T>(arr: readonly T[]) => arr[arr.length - 1]

/** Generate array from a function */
export function generateArray<T>(size: number, element: () => T) {
    const result = []
    for (let i = 0; i < size; i++) result.push(element())
    return result
}

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
export const arrayLerp = <T extends readonly [] | readonly number[]>(
    start: T,
    end: { readonly [K in keyof T]: number },
    fraction: number,
    easing?: EASE,
) => start.map((x, i) => lerp(x, end[i], fraction, easing)) as unknown as T

/**
 * Check if 2 arrays are equal to each other.
 * @param arr1 First array.
 * @param arr2 Second array.
 * @param lenience The maximum difference 2 numbers in an array can have before they're considered not equal.
 */
export function areArraysEqual<T extends readonly [] | readonly number[]>(
    arr1: T,
    arr2: { readonly [K in keyof T]: number },
    lenience = 0,
) {
    let result = true
    arr1.forEach((x, i) => {
        if (
            lenience !== 0 &&
            typeof x === 'number' &&
            typeof arr2[i] === 'number'
        ) {
            const difference = x - arr2[i]
            if (Math.abs(difference) > lenience) result = false
        } else if (x !== arr2[i]) result = false
    })
    return result
}

/**
 * Remove a single element of an array, mutating it.
 * @param arr Array to mutate.
 * @param index Element to remove. Can be -1 to remove last element.
 */
export function arrayRemove(arr: unknown[], index: number) {
    if (index === -1) index = arr.length - 1
    if (index > arr.length - 1 || index < 0) return

    for (let i = index; i < arr.length - 1; i++) {
        arr[i] = arr[i + 1]
    }

    arr.length -= 1
}

/**
 * Prefer a tuple on a number array
 */
export const vec = <T extends readonly number[]>(...params: T) =>
    params as { [K in keyof T]: number }

/**
 * Check if an array contains a value.
 * @param arr Input array.
 * @param value Value to check for.
 */
export const doesArrayHave = <T>(
    arr: readonly T[],
    value: T,
) => arr.some((x) => x === value)

/**
 * Add values of one array to another.
 * @param arr Array to add values to.
 * @param arr2 Values to add.
 */
export const appendArray = <T>(arr: T[], arr2: readonly T[]) =>
    arr.push(...arr2)

/**
 * Generate an array from a range of numbers.
 * @param start Starting number.
 * @param start Ending number.
 */
export const fillArrayWithValues = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start)

/**
 * Convert three Vector3 and Euler classes to a three number array.
 * @param v Vector or Euler to convert.
 */
export const threeClassToArray = (v: three.Vector3 | three.Euler) =>
    [v.x, v.y, v.z] as Vec3
