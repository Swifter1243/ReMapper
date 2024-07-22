import {objectSafeGet} from "./safe.ts";
import {TJson} from "../../types/util/json.ts";

/**
 * Checks if an object is empty.
 * @param o Object to check.
 */
export function isEmptyObject(o: unknown, recursive = true): boolean {
    // If undefined, it is empty
    if (o === undefined) return true

    // If not an object, it's not empty
    if (typeof o !== 'object') return false

    // If a key is null, it's not empty
    if (o === null) return false

    // If object has nothing inside, it's empty
    if (Object.keys(o as TJson).length === 0) {
        return true
    }

    // Check for non empty objects inside
    if (recursive) {
        return Object.values(o as TJson).every((x) => isEmptyObject(x))
    }

    /// Not empty
    return false
}

/**
 * Check if a property in an object exists
 * @param obj
 * @param prop
 * @returns
 */
export function objectCheckExists(obj: TJson, prop: string) {
    const value = objectSafeGet(obj, prop)
    if (value != null) return true
    return false
}