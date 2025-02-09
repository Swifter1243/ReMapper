import { RangeOf } from '../../types/util/generate.ts'
import { TupleOfSize } from '../../types/util/tuple.ts'

/** Generate array from a function */
export function generateArray<T, S extends number>(size: S, element: (index: number extends S ? number : RangeOf<S>) => T) {
    const result = []
    for (let i = 0; i < size; i++) result.push(element(i as RangeOf<S>))
    return result as TupleOfSize<T, S>
}

/**
 * Generate an array from a range of numbers.
 * @param start Starting number.
 * @param end Ending number.
 */
export function fillArrayWithValues(start: number, end: number) {
    return generateArray(end - start + 1, (i) => start + i)
}
