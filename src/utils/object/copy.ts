import {DeepReadonly} from "../../types/util/mutability.ts";
import {BeatmapArrayMember} from "../../types/beatmap/beatmap_array_member.ts";

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
export function copy<T>(obj: readonly T[]): T[]
export function copy<T>(obj: ReadonlyArray<DeepReadonly<T>>): T[]
export function copy<T extends []>(obj: ReadonlyArray<T>): T[]
export function copy<T>(obj: DeepReadonly<T>): T
export function copy<T>(obj: Readonly<T>): T
export function copy<T extends []>(obj: readonly Readonly<T>[]): T[]
export function copy<T>(obj: T): T
export function copy<T>(obj: T): T {
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj

    if (obj instanceof Set) {
        return new Set([...obj]) as T
    }

    const newObj = Array.isArray(obj) ? new Array(obj.length) : Object.create(obj)

    const entries = Object.entries(obj)
    entries.forEach(([k, v]) => {
        // This causes a big speed boost, reaching 50%
        // the JIT can just skip primitives with this
        // keep in mind that's practically 6ms -> 3ms, but still
        if (typeof v !== 'object') {
            newObj[k] = v
            return
        }

        newObj[k] = copy(v)
    })

    return newObj
}

/** Copy something inheriting BeatmapArrayMember, ignoring the "parent" property. */
export function copyBeatmapMember<T extends BeatmapArrayMember<K>, K>(obj: T): T {
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj

    const newObj = Array.isArray(obj) ? new Array(obj.length) : Object.create(obj)

    const entries = Object.entries(obj)
    entries.forEach(([k, v]) => {
        if (k === 'parent') {
            return
        }

        if (typeof v !== 'object') {
            newObj[k] = v
            return
        }

        newObj[k] = copy(v)
    })

    return newObj
}