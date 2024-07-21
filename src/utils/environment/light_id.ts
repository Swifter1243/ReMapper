let nextID = 0

/**
 * Get a unique lightID, useful for lightID logic
 * @param increment How much to increment the internal unique variable by
 */
export function newUniqueLightID(increment = 1000) {
    nextID += increment
    return nextID
}

/**
 * Fill an array with lightIDs from a start value, with "length" entries
 * e.x: (base: 3, length: 4) would make [3, 4, 5, 6]
 */
export const fillLightIDs = (base: number, length: number) =>
    Array.from({ length: length }, (_, i) => base + i)
