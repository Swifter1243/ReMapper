/**
 * Get the last element in an array.
 * @param arr Input array.
 */
export function arrayLastElement<T>(arr: readonly T[]) {
    return arr[arr.length - 1]
}

/**
 * Get the first element in an array.
 * @param arr Input array.
 */
export function arrayFirstElement<T>(arr: readonly T[]){
    return arr[0]
}

/** Find the index of an element in an array, searching from the last element to first. -1 is returned if nothing is found. */
export function findIndexLastFirst<T extends unknown>(
    arr: readonly T[],
    predicate: (obj: T) => boolean,
) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) return i
    }

    return -1
}
