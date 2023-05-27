import {EPSILON, getSeconds, rotatePoint} from "./utils/math.ts";
import {fs, path} from './deps.ts'
import {FILENAME, FILEPATH, OnlyNumbersOptional, Vec3} from './data/types.ts'
import {RMJson} from "./rm_json.ts";
import {arrAdd} from "./utils/array_utils.ts";
import {activeDiffGet} from "./data/beatmap_handler.ts";

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

/**
 * Gets notes between a min and max time.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function notesBetween(
    min: number,
    max: number,
) {
    return filterObjects(activeDiffGet().notes, min, max, 'time')
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
) {
    return filterObjects(activeDiffGet().bombs, min, max, 'time')
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
) {
    return filterObjects(activeDiffGet().arcs, min, max, 'time')
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
) {
    return filterObjects(activeDiffGet().chains, min, max, 'time')
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
) {
    return filterObjects(activeDiffGet().walls, min, max, 'time')
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
) {
    return filterObjects(activeDiffGet().events, min, max, 'time')
}

/**
 * Copies @param obj with the new properties in @param overwrite
 * @param obj Original
 * @param overwrite New values
 * @returns The copy
 */
export function copyWith<T extends Record<string | number | symbol, never>>(
    obj: T,
    overwrite: Partial<T>,
) {
    const copied = structuredClone(obj)
    Object.assign(copied, overwrite)

    return copied
}

/**
 * Calculate the correct position for a wall to line up with a position in the world.
 * Assumes that position is set to [0,0].
 * @param pos Position of the wall in world space.
 * @param rot Rotation of the wall in world space.
 * @param scale Scale of the wall in world space.
 * @param animated Corrects for animated scale. If you are using this, plug [1,1,1] into static scale.
 */
export function worldToWall(
    pos: Vec3 = [0, 0, 0],
    rot: Vec3 = [0, 0, 0],
    scale: Vec3 = [1, 1, 1],
    animated = false,
) {
    scale = scale.map((x) => x / 0.6) as Vec3

    pos = [pos[0] /= 0.6, pos[1] /= 0.6, pos[2] /= 0.6]

    let offset = [0, -0.5, -0.5] as Vec3
    offset = rotatePoint(offset.map((x, i) => x * scale[i]) as Vec3, rot)
    pos = arrAdd(pos, offset)

    pos[1] += 0.2
    pos[0] -= animated ? 0.5 : scale[0] / 2

    return {
        pos: pos,
        scale: scale,
    }
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

