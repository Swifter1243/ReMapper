/**
 * Copies @param obj with the new properties in @param overwrite
 * @param obj Original
 * @param overwrite New values
 * @returns The copy
 */
export function copyWith<T extends Record<string | number | symbol, never>>(
    obj: T,
    overwrite: Partial<T>,
) {
    const copied = copy(obj)
    Object.assign(copied, overwrite)

    return copied
}

/**
 * Copies an object
 * @param obj Object to copy
 * @returns The copy
 */
export function copy<T>(obj: T) {
    return structuredClone(obj) as T
}
