import { EPSILON, getSeconds } from './utils/math.ts'
import { fs, path } from './deps.ts'
import { RMJson } from './rm_json.ts'
import { getActiveDiff } from './data/beatmap_handler.ts'
import { OnlyNumbersOptional } from './types/util_types.ts'
import { FILENAME, FILEPATH } from './types/beatmap_types.ts'
import { Note, Bomb, Arc, Chain } from "./internals/note.ts"
import { Wall } from './internals/wall.ts'
import { LightEvent } from './internals/basic_event.ts'

/**
 * Store data in the ReMapper cache.
 * Retrieves the same data unless specified parameters are changed.
 * @param name Name of the data.
 * @param process Function to generate new data if the parameters are changed.
 * @param processing Parameters to compare to see if data should be re-cached.
 */
export async function cacheData<T>(
    name: string,
    process: () => Promise<T>,
    processing: unknown[] = [],
): Promise<T> {
    let outputData: unknown
    const processingJSON = JSON.stringify(processing).replaceAll('"', '')

    async function getData() {
        outputData = await process()
        RMLog(`cached ${name}`)
        return outputData
    }

    const rmCache = await RMJson

    const cachedData = rmCache.cachedData[name]
    if (cachedData !== undefined) {
        if (processingJSON !== cachedData.processing) {
            cachedData.processing = processingJSON
            cachedData.data = await getData()
        } else {
            outputData = cachedData.data
        }
    } else {
        rmCache.cachedData[name] = {
            processing: processingJSON,
            data: await getData(),
        }
    }

    rmCache.cachedData[name].accessed = true
    await rmCache.save()

    return outputData as T
}

/**
 * Allows you to filter through an array of objects with a min and max property.
 * @param min Minimum allowed value of the property.
 * @param max Maximum allowed value of the property.
 * @param objects Array of objects to check.
 * @param property What property to check for.
 */
export function filterObjects<T extends OnlyNumbersOptional<T>>(
    objects: T[],
    min: number,
    max: number,
    property: keyof T,
) {
    const passedObjects: T[] = []

    objects.forEach((obj) => {
        if (obj[property] + EPSILON >= min && obj[property] < max) {
            passedObjects.push(obj)
        }
    })

    return passedObjects
}

/**
 * Sorts an array of objects by a property.
 * @param objects Array of objects to sort.
 * @param property What property to sort.
 * @param smallestToLargest Whether to sort smallest to largest. True by default.
 */
export function sortObjects<T extends Record<string, number>>(
    objects: T[],
    property: keyof T,
    smallestToLargest = true,
) {
    if (objects === undefined) return

    objects.sort((a, b) =>
        smallestToLargest
            ? a[property] - b[property]
            : b[property] - a[property]
    )
}

export type AnyNote = Note | Bomb | Arc | Chain
type BeatmapObject = AnyNote | Wall | LightEvent

function objBetween<T extends BeatmapObject>(
    array: T[],
    min: number,
    max: number,
    forEach?: (obj: T) => void
) {
    const filtered = filterObjects(array, min, max, 'time')
    if (forEach) filtered.forEach(forEach)
    return filtered
}

/**
 * Gets all note types (note, bomb, arc, chain) between a min and max time.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function allNotesBetween(
    min: number,
    max: number,
    forEach?: (obj: AnyNote) => void
) {
    return objBetween(getActiveDiff().allNotes as AnyNote[], min, max, forEach)
}

/**
 * Gets notes between a min and max time.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function colorNotesBetween(
    min: number,
    max: number,
    forEach?: (obj: Note) => void
) {
    return objBetween(getActiveDiff().notes, min, max, forEach)
}

/**
 * Gets bombs between a min and max time.
 * @param min Minimum time of the bombs.
 * @param max Maximum time of the bombs.
 * @param forEach Function for each bomb.
 */
export function bombsBetween(
    min: number,
    max: number,
    forEach?: (obj: Bomb) => void
) {
    return objBetween(getActiveDiff().bombs, min, max, forEach)
}

/**
 * Gets arcs between a min and max time..
 * @param min Minimum time of the arcs.
 * @param max Maximum time of the arcs.
 * @param forEach Function for each arc.
 */
export function arcsBetween(
    min: number,
    max: number,
    forEach?: (obj: Arc) => void
) {
    return objBetween(getActiveDiff().arcs, min, max, forEach)
}

/**
 * Gets chains between a min and max time.
 * @param min Minimum time of the chains.
 * @param max Maximum time of the chains.
 * @param forEach Function for each chain.
 */
export function chainsBetween(
    min: number,
    max: number,
    forEach?: (obj: Chain) => void
) {
    return objBetween(getActiveDiff().chains, min, max, forEach)
}

/**
 * Gets walls between a min and max time.
 * @param min Minimum time of the walls.
 * @param max Maximum time of the walls.
 * @param forEach Function for each wall.
 */
export function wallsBetween(
    min: number,
    max: number,
    forEach?: (obj: Wall) => void
) {
    return objBetween(getActiveDiff().walls, min, max, forEach)
}

/**
 * Gets events between a min and max time.
 * @param min Minimum of the events.
 * @param max Maximum time of the events.
 * @param forEach Function for each event.
 */
export function eventsBetween(
    min: number,
    max: number,
    forEach?: (obj: LightEvent) => void
) {
    return objBetween(getActiveDiff().basicEvents, min, max, forEach)
}

/**
 * Log a message as ReMapper, displaying seconds.
 * @param message Message to log.
 */
export const RMLog = (message: string) =>
    console.log(`[ReMapper: ${getSeconds()}s] ` + message)

/**
 * Parse a file path, allowing extension forcing and getting useful information.
 * @param input Input path. Can be relative or absolute.
 * @param ext Force extension on the file.
 * @param error Throw an error if the file doesn't exist.
 */
export async function parseFilePath(
    input: FILEPATH,
    ext?: `.${string}`,
    error = true,
) {
    if (ext && !path.extname(input)) input += ext

    if (error && !await fs.exists(input)) {
        throw new Error(`The file "${input}" does not exist`)
    }

    const output: { name: FILENAME; path: FILEPATH; dir?: string } = {
        name: path.basename(input),
        path: input,
    }

    const dir = path.dirname(input)
    if (dir !== '.') output.dir = dir

    return output
}
