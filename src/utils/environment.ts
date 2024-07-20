import { iterateKeyframes } from "../animation/animation_utils.ts";
import { RawKeyframesVec3 } from "../types/animation.ts";
import { LookupMethod } from '../types/environment.ts'
import {environment} from "../builder_functions/environment/environment.ts";

let nextID = 0

/**
 * Get a unique lightID, useful for lightID logic
 * @param increment How much to increment the internal unique variable by
 */
export function newUniqueLightID(increment = 1000) {
    nextID += increment
    return nextID
}

/** Remove a list of IDs from the environment */
export function environmentRemoval(
    ids: string[],
    lookupMethod: LookupMethod = 'Contains',
) {
    const env = environment(undefined, lookupMethod)
    env.active = false

    ids.forEach((x) => {
        env.id = x
        env.push()
    })
}

/**
 * Fill an array with lightIDs from a start value, with "length" entries
 * e.x: (base: 3, length: 4) would make [3, 4, 5, 6]
 */
export const fillLightIDs = (base: number, length: number) =>
    Array.from({ length: length }, (_, i) => base + i)

/**
 * Runs code that deals with situations that require mirrored logic.
 * e.x: Positioning rotating lasers.
 * @param iterations How many times to run the code for each side.
 * @param callback Code to run on each side.
 * "index" runs from 0 to (1 - iterations) for each side.
 * "sideIndex" is -1 on the left side, and 1 on the right.
 * "sideName" is "L" on the left side, and "R" on the right. Useful for IDs.
 */
export function mirroredIterator(
    iterations: number,
    callback: (index: number, sideIndex: number, sideName: string) => void,
) {
    for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < iterations; i++) {
            const name = s === -1 ? 'L' : 'R'
            callback(i, s, name)
        }
    }
}

/** Convert a position in unity units to noodle/grid units.
 * This is also the conversion from V3 to V2.
 */
export function positionUnityToNoodle(position: RawKeyframesVec3) {
    iterateKeyframes(position, x => {
        x[0] /= 0.6
        x[1] /= 0.6
        x[2] /= 0.6
    })
    return position
}

/** Convert a position in noodle/grid units to unity units.
 * This is also the conversion from V2 to V3.
 */
export function positionNoodleToUnity(position: RawKeyframesVec3) {
    iterateKeyframes(position, x => {
        x[0] *= 0.6
        x[1] *= 0.6
        x[2] *= 0.6
    })
    return position
}