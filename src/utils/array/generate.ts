/** Generate array from a function */
export function generateArray<T>(size: number, element: () => T) {
    const result = []
    for (let i = 0; i < size; i++) result.push(element())
    return result
}

/**
 * Prefer a tuple on a number array
 */
export const vec = <T extends readonly number[]>(...params: T) =>
    params as { [K in keyof T]: number }

/**
 * Generate an array from a range of numbers.
 * @param start Starting number.
 * @param start Ending number.
 */
export const fillArrayWithValues = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start)
