import {bsmap} from '../../deps.ts'
import {TJson} from '../../types/util.ts'

import {isEmptyObject} from "./check.ts";

/**
 * Delete empty objects/arrays from an object recursively.
 * @param obj Object to prune.
 */
export function objectPrune<T extends TJson>(obj: T) {
    if (typeof obj !== 'object') return obj

    Object.entries(obj).forEach(([k, v]) => {
        if (v === null) return

        if (v === undefined) {
            delete obj[k]
            return
        }

        if (typeof v === 'object') {
            objectPrune(v as TJson)
            if (!Array.isArray(v) && isEmptyObject(v)) {
                delete obj[k]
            }
        } else if (typeof v === 'string' && v.length === 0) {
            delete obj[k]
        }
    })

    return obj as T
}

/**
 * Delete empty objects/arrays from an object.
 * This should be faster than objectPrune because it
 * explicitly goes into the fields WE know that should be pruned
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
 * Delete empty objects/arrays from an object.
 * This should be faster than jsonPrune because it
 * explicitly goes into the fields WE know that should be pruned
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
 * Delete empty objects/arrays from an object.
 * @param obj Object to prune.
 */
export function shallowPrune<T extends TJson>(obj: T) {
    if (typeof obj !== 'object') return obj

    Object.entries(obj).forEach(([k, v]) => {
        if (v === null) return

        if (v === undefined) {
            delete obj[k]
            return
        }

        if (typeof v === 'object') {
            if (isEmptyObject(v, false)) {
                delete obj[k]
            }
        } else if (typeof v === 'string' && v.length === 0) {
            delete obj[k]
        }
    })

    return obj as T
}