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
 * Copies an object recursively.
 * @param obj Object to copy
 * @returns The copy
 */
export function copy<T extends []>(obj: ReadonlyArray<T>): T[];
export function copy<T extends []>(obj: readonly T[]): T[];
export function copy<T>(obj: Readonly<T>): T;
export function copy<T extends []>(obj: readonly Readonly<T>[]): T[];
export function copy<T>(obj: T): T;
export function copy<T>(obj: T): T {
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj

    const newObj = Array.isArray(obj) ? new Array(obj.length) : Object.create(obj)

    const entries = Object.entries(obj) as [keyof T, any]
    entries.forEach(([k, v]) => {
        // This causes a big speed boost, reaching 50%
        // the JIT can just skip primitives with this
        // keep in mind that's practically 6ms -> 3ms, but still
        if (typeof v !== "object") {
            newObj[k] = v;
            return
        }
        
        const newValue = copy(v);
        newObj[k] = newValue
    })

    return newObj
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
