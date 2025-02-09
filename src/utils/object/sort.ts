/**
 * Sorts an array of objects by a property.
 * @param objects Array of objects to sort.
 * @param property What property to sort.
 * @param smallestToLargest Whether to sort smallest to largest. True by default.
 */
export function sortObjectsByProperty<T extends Record<string, number>>(
    objects: T[],
    property: keyof T,
    smallestToLargest = true,
) {
    if (objects === undefined) return

    objects.sort((a, b) =>
        smallestToLargest ? a[property] - b[property] : b[property] - a[property]
    )
}
