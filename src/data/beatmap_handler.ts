import {path} from '../deps.ts'

import type {AbstractDifficulty} from '../beatmap/abstract_beatmap.ts'
import { loadCache } from "../rm_cache.ts";

let workingDirectory: string
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


export function setWorkingDirectory(directory: string) {
    workingDirectory = directory

    loadCache()
}


export function getWorkingDirectory() {
    if (workingDirectory) return workingDirectory

    throw new Error('There is currently no working directory.')
}

export function workingDirectoryExists() {
    return workingDirectory !== undefined
}

export function attachWorkingDirectory(file: string) {
    if (path.isAbsolute(file)) return file
    
    return path.join(workingDirectory ?? '', file)
}

