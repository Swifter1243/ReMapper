// deno-lint-ignore-file no-explicit-any
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
    if (obj === null || typeof obj !== 'object') return obj

    const newObj = Array.isArray(obj) ? [] : {}
    const keys = Object.getOwnPropertyNames(obj)

    keys.forEach((x) => {
        const value = copy((obj as any)[x])
        ;(newObj as any)[x] = value
    })

    Object.setPrototypeOf(newObj, obj as any)
    return newObj as T
}

/**
 * Sets a property on object B to object A if object B has that property
 * @param obj1 object A
 * @param obj2 object B
 * @param prop The property
 */
export function setIfDefined<O1 extends Record<string, any>, O2 extends Record<string, any>>(
    obj1: O1,
    obj2: O2,
    prop: keyof O1 & keyof O2,
) {
    if (Object.hasOwn(obj1, prop)) {
        obj2[prop] = obj1[prop] as any
    }
}
