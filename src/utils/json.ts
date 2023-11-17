// deno-lint-ignore-file no-explicit-any
import { bsmap } from '../deps.ts'
import { TJson } from '../types/util_types.ts'

/**
 * Checks if an object is empty.
 * @param o Object to check.
 */
export function isEmptyObject(o: unknown, recursive = true): boolean {
    // If undefined, it is empty
    if (o === undefined) return true

    // If not an object, it's not empty
    if (typeof o !== 'object') return false

    // If object has nothing inside, it's empty
    if (Object.keys(o as TJson).length === 0) {
        return true
    }

    // Check for non empty objects inside
    return !Object.values(o as TJson).some((x) => !isEmptyObject(x)) && recursive
}

/**
 * Delete empty objects/arrays from an object recursively.
 * @param obj Object to prune.
 */
export function jsonPrune<T extends Record<string, any>>(obj: T) {
    if (typeof obj !== 'object') return obj

    Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined) {
            delete obj[k]
            return
        }

        const type = typeof v
        if (type === 'object') {
            jsonPrune(v)
            if (!Array.isArray(v) && isEmptyObject(v)) {
                delete obj[k]
            }
        } else if (type === 'string' && v.length === 0) {
            delete obj[k]
        }
    })

    return obj as T
}

export function shallowPrune<T extends Record<string, any>>(obj: T) {
    if (typeof obj !== 'object') return obj

    Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined) {
            delete obj[k]
            return
        }

        const type = typeof v
        if (type === 'object') {
            if (isEmptyObject(v, false)) {
                delete obj[k]
            }
        } else if (type === 'string' && v.length === 0) {
            delete obj[k]
        }
    })

    return obj as T
}

/**
 * This should be faster than jsonPrune because it
 * explicitly goes into the fields WE know that should be pruned
 *
 * @param obj
 * @returns
 */
export function fastJsonPruneV3<
    T extends {
        customData?: Record<string, unknown> & {
            animation?: bsmap.v3.IChromaAnimation | bsmap.v3.INEAnimation
            track?: string
        }
    },
>(obj: T): T {
    if (!obj.customData) {
        return obj
    }

    const animation = obj.customData.animation
    const animationEntries = animation &&
        Object.entries(animation) as [
            keyof typeof animation,
            string | unknown[],
        ][]
    if (animationEntries) {
        let length = animationEntries.length
        animationEntries.forEach(([k, v]) => {
            if (v && v.length > 0) return

            length--
            delete animation[k]
        })

        if (length === 0) {
            delete obj.customData['animation']
        }
    }

    if (!obj.customData.track || obj.customData.track.length === 0) {
        delete obj.customData['track']
    }

    if (Object.entries(obj.customData).length === 0) {
        delete obj['customData']
    }

    return obj
}

/**
 * This should be faster than jsonPrune because it
 * explicitly goes into the fields WE know that should be pruned
 *
 * @param obj
 * @returns
 */
export function fastJsonPruneV2<
    T extends {
        _customData?: Record<string, unknown> & {
            _animation?: bsmap.v2.IChromaAnimation | bsmap.v2.INEAnimation
            _track?: string | string[] | undefined
        }
    },
>(obj: T): T {
    if (!obj._customData) {
        return obj
    }

    const animation = obj._customData._animation
    const animationEntries = animation &&
        Object.entries(animation) as [
            keyof typeof animation,
            string | unknown[],
        ][]
    if (animationEntries) {
        let length = animationEntries.length
        animationEntries.forEach(([k, v]) => {
            if (v && v.length > 0) return

            length--
            delete animation[k]
        })

        if (length === 0) {
            delete obj._customData['_animation']
        }
    }

    if (!obj._customData._track || obj._customData._track.length === 0) {
        delete obj._customData['_track']
    }

    if (Object.entries(obj._customData).length === 0) {
        delete obj['_customData']
    }

    return obj
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
