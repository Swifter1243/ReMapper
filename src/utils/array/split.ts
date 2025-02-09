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
