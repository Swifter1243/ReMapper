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
 * Add values of one array to another.
 * @param arr Array to add values to.
 * @param arr2 Values to add.
 */
export function appendArray<T>(arr: T[], arr2: readonly T[]) {
    return arr.push(...arr2)
}
