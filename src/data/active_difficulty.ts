import type { AbstractDifficulty } from '../internals/beatmap/abstract_beatmap.ts'

/** This is the current difficulty ReMapper considers "active".
 * This gets set automatically whenever a difficulty class constructor is called.
 */
export let activeDifficulty: AbstractDifficulty

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function setActiveDifficulty(diff: AbstractDifficulty) {
    activeDifficulty = diff
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function getActiveDifficulty() {
    if (activeDifficulty) return activeDifficulty

    throw new Error('There is currently no loaded difficulty.')
}
