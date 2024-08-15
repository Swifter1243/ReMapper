/**
 * Check if an array contains a value.
 * @param arr Input array.
 * @param value Value to check for.
 */
export function doesArrayHave<T>(
    arr: readonly T[],
    value: T,
) {
    return arr.some((x) => x === value)
}

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
            typeof arr2[i] === 'number'
        ) {
            const difference = x - arr2[i]
            if (Math.abs(difference) > lenience) result = false
        } else if (x !== arr2[i]) result = false
    })
    return result
}