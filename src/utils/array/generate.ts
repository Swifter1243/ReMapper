/** Generate array from a function */
export function generateArray<T>(size: number, element: () => T) {
    const result = []
    for (let i = 0; i < size; i++) result.push(element())
    return result
}

/**
 * Generate an array from a range of numbers.
 * @param start Starting number.
 * @param end Ending number.
 */
export const fillArrayWithValues = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start)
