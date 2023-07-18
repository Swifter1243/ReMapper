import {bsmap} from '../deps.ts'

import type {AbstractDifficulty} from '../beatmap/abstract_beatmap.ts'

export let info: bsmap.v2.IInfo
export let infoPath: string
export let activeDiff: AbstractDifficulty
export const settings = {
    forceJumpsForNoodle: true,
    decimals: 7 as number | undefined,
}

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function activeDiffSet(diff: AbstractDifficulty) {
    activeDiff = diff
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function activeDiffGet() {
    if (activeDiff) return activeDiff

    throw new Error('There is currently no loaded difficulty.')
}


/**
 * Set the difficulty that objects are being created for.
 * @param info The difficulty to set to.
 */
export function infoPathSet(info: string) {
    infoPath = info
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function infoPathGet() {
    if (infoPath) return infoPath

    throw new Error('There is currently no loaded info.dat.')
}

/**
 * Set the difficulty that objects are being created for.
 * @param info The difficulty to set to.
 */
export function infoSet(i: bsmap.v2.IInfo) {
    info = i
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function infoGet() {
    if (info) return info

    throw new Error('There is currently no loaded info.dat.')
}

