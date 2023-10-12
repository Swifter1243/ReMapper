import {bsmap} from '../deps.ts'

import type {AbstractDifficulty} from '../beatmap/abstract_beatmap.ts'

export let info: bsmap.v2.IInfo
export let workingDirectory: string
export let activeDiff: AbstractDifficulty
export const settings = {
    forceJumpsForNoodle: true,
    decimals: 7 as number | undefined,
}

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function setActiveDiff(diff: AbstractDifficulty) {
    activeDiff = diff
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function getActiveDiff() {
    if (activeDiff) return activeDiff

    throw new Error('There is currently no loaded difficulty.')
}


export function setWorkingDirectory(info: string) {
    workingDirectory = info
}


export function getWorkingDirectory() {
    if (workingDirectory) return workingDirectory

    throw new Error('There is currently no loaded info.dat.')
}


export function setInfo(i: bsmap.v2.IInfo) {
    info = i
}


export function getInfo() {
    if (info) return info

    throw new Error('There is currently no loaded info.dat.')
}

