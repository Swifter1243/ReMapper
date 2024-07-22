import { path } from '../deps.ts'

import {loadCache} from "./active_cache.ts";

let workingDirectory: string

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
