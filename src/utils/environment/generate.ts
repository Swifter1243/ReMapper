import { LookupMethod } from '../../types/environment.ts'
import { environment } from '../../builder_functions/beatmap/object/environment/environment.ts'

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
