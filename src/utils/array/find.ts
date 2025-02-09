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