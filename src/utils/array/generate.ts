/** Generate array from a function */
export function generateArray<T>(size: number, element: (index: number) => T) {
    const result = []
    for (let i = 0; i < size; i++) result.push(element(i))
    return result
}

/**
 * Generate an array from a range of numbers.
 * @param start Starting number.
 * @param end Ending number.
 */
export function fillArrayWithValues(start: number, end: number) {
    return generateArray(end - start + 1, (i) => start + i)
}
