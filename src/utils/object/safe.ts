import {TJson} from "../../types/util/json.ts";

/**
 * If a property doesn't exist through a path of objects, fill objects to get to that property.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param value Value to set the property to.
 */
export function objectFillPath<T>(obj: TJson, prop: string, value: T) {
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
 * Get a property of an object recursively.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param init Optional value to initialize the property if it doesn't exist yet.
 */
export function objectSafeGet<T = unknown>(
    obj: TJson,
    prop: string,
    init?: T,
): T | undefined {
    // If the property doesn't exist, initialize it.
    if (init != null) objectFillPath(obj, prop, init)

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
 * Set a property in an object, add objects if needed.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param value Value to set the property to.
 */
export function objectSafeSet<T>(obj: TJson, prop: string, value: T) {
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
 * Remove a property of an object recursively, and delete empty objects left behind.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 */
export function objectSafeRemove(obj: TJson, prop: string) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]] as Record<string, unknown>
        if (currentObj === undefined) return
    }
    delete currentObj[steps[steps.length - 1]]
}

/**
 * Sets a property on object B to object A if object B has that property
 * @param obj1 object A
 * @param obj2 object B
 * @param prop The property
 */
export function setIfDefined<O1 extends TJson, O2 extends TJson>(
    obj1: O1,
    obj2: O2,
    prop: keyof O1 & keyof O2,
) {
    if (Object.hasOwn(obj1, prop)) {
        obj2[prop as keyof O2] = obj1[prop] as unknown as O2[keyof O2];
    }
}