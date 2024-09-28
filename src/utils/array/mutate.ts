/**
 * Remove a single element of an array, mutating it.
 * @param arr Array to mutate.
 * @param index Element to remove. Can be -1 to remove last element.
 */
export function arrayRemove<T>(arr: T[], index: number) {
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

/**
 * Control whether a unique value is in an array.
 * If {@link ensure} is true and {@link element} is not present, it will be added.
 * If {@link ensure} is false and {@link element} is present, it will be removed.
 * */
export function arrayEnsureValue<T>(arr: T[], element: T, ensure = true) {
    const elementIndex = arr.indexOf(element)

    if (ensure) {
        if (elementIndex === -1) { // not present, add
            arr.push(element)
        }
    } else {
        if (elementIndex !== -1) { // present, remove
            arrayRemove(arr, elementIndex)
        }
    }
}