// deno-lint-ignore-file no-explicit-any
import { bsmap } from '../deps.ts'
import { TJson } from '../types/util_types.ts'

/**
 * Checks if an object is empty.
 * @param o Object to check.
 */
export function isEmptyObject(o: unknown): boolean {
    if (typeof o !== 'object') return false
    if (Object.keys(o as TJson).length === 0) {
        return true
    }

    return !Object.values(o as TJson).some((v) => isEmptyObject(v))
}

/**
 * Delete empty objects/arrays from an object recursively.
 * @param obj Object to prune.
 */
export function jsonPrune<T extends Record<string, any>>(obj: T) {
    Object.entries(obj).forEach(([prop, v]) => {
        if (v === null || v === undefined) {
            delete obj[prop]
            return
        }

        const type = typeof v
        if (type === 'object') {
            if (Array.isArray(v)) {
                if (v.length === 0) {
                    delete obj[prop]
                }
            } else {
                const rec = v as TJson
                jsonPrune(rec)
                if (isEmptyObject(rec)) {
                    delete obj[prop]
                }
            }
        } else if (type === 'string' && v.length === 0) {
            delete obj[prop]
        }
    })

    return obj as T
}

/**
 * Get a property of an object recursively.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param init Optional value to initialize the property if it doesn't exist yet.
 */
export function jsonGet<T = unknown>(
    obj: TJson,
    prop: string,
    init?: T,
): T | undefined {
    // If the property doesn't exist, initialize it.
    if (init != null) jsonFill(obj, prop, init)

    // Fetch the property based on the path/prop.
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]] as Record<string, unknown>
        if (currentObj === undefined) return
    }

    // Return the needed property.
    return currentObj[steps[steps.length - 1]] as T
}

/**
 * If a property doesn't exist through a path of objects, fill objects to get to that property.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param value Value to set the property to.
 */
export function jsonFill<T>(obj: TJson, prop: string, value: T) {
    const steps = prop.split('.')

    // Create empty objects along the path
    const nestedObject: Record<string, unknown> = [...steps].reverse()
        .reduce(
            (prev, current, i) => {
                return i === 0 ? { [current]: value } : { [current]: prev }
            },
            {},
        )

    // Merge the original object into the nested object (if the original object is empty, it will just take the nested object)
    obj[steps[0]] = Object.assign({}, nestedObject[steps[0]], obj[steps[0]])
}

/**
 * Set a property in an object, add objects if needed.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param value Value to set the property to.
 */
export function jsonSet<T>(obj: TJson, prop: string, value: T) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        if (!(steps[i] in currentObj)) {
            currentObj[steps[i]] = {}
        }
        currentObj = currentObj[steps[i]] as Record<string, unknown>
    }
    currentObj[steps[steps.length - 1]] = value
}

/**
 * Check if a property in an object exists
 * @param obj
 * @param prop
 * @returns
 */
export function jsonCheck(obj: TJson, prop: string) {
    const value = jsonGet(obj, prop)
    if (value != null) return true
    return false
}

/**
 * Remove a property of an object recursively, and delete empty objects left behind.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 */
export function jsonRemove(obj: TJson, prop: string) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]] as Record<string, unknown>
        if (currentObj === undefined) return
    }
    delete currentObj[steps[steps.length - 1]]
}
