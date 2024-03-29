import {path} from '../deps.ts'

import type {AbstractDifficulty} from '../beatmap/abstract_beatmap.ts'
import { loadCache } from "../rm_cache.ts";

let workingDirectory: string

/** This is the current difficulty ReMapper considers "active".
 * This gets set automatically whenever a difficulty class constructor is called.
 */
export let activeDiff: AbstractDifficulty

/** Various settings to control ReMapper. */
export const settings = {
    /** Force note offset for modcharts to combat against JDFixer and similar mods. */
    forceJumpsForNoodle: true,
    /** Decimal precision of file output. 7 by default. */
    decimals: 7 as number | undefined,
}

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function setActiveDifficulty(diff: AbstractDifficulty) {
    activeDiff = diff
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function getActiveDifficulty() {
    if (activeDiff) return activeDiff

    throw new Error('There is currently no loaded difficulty.')
}

/** Set the directory of the map you're working in.
 * Automatically set from the difficulty if it's loaded first.
 */
export function setWorkingDirectory(directory: string) {
    workingDirectory = directory

    loadCache()
}

/** Get the directory of the map ReMapper is working in. */
export function getWorkingDirectory() {
    if (workingDirectory) return workingDirectory

    throw new Error('There is currently no working directory.')
}

/** Ensure the working directory has been set. */
export function workingDirectoryExists() {
    return workingDirectory !== undefined
}

/** Take some path to a file and make it relative to the working directory. */
export function attachWorkingDirectory(file: string) {
    if (path.isAbsolute(file)) return file
    
    return path.join(workingDirectory ?? '', file)
}

