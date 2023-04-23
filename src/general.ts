const EPSILON = 1e-3
import * as easings from './easings.ts'
import {
    complexifyArray,
    ComplexKeyframesLinear,
    KeyframesAbstract,
    KeyframesLinear,
    RawKeyframesAbstract,
    simplifyArray,
} from './animation.ts'
import { Wall } from './wall.ts'
import { EASE, FILENAME, FILEPATH } from './constants.ts'
import { activeDiffGet, TJson } from './beatmap.ts'
import { Note } from './note.ts'
import { fs, path, three } from './deps.ts'
import { BloomFogEnvironment, Environment } from './environment.ts'
import { CustomEventInternals, EventInternals } from './internals/mod.ts'
import { OnlyNumbers, OnlyNumbersOptional } from './types.ts'
import { animateComponent } from './custom_event.ts'

/** An array with 2 numbers. */
export type Vec2 = [x: number, y: number]
/** An array with 3 numbers. */
export type Vec3 = [x: number, y: number, z: number]
/** An array with 4 numbers. */
export type Vec4 = [x: number, y: number, z: number, w: number]
/** An array with [r,g,b] or [r,g,b,a]. */
export type ColorType =
    | [number, number, number]
    | [number, number, number, number]
/** A type that can be used to prefer a tuple on an array of numbers. */
export type NumberTuple = number[] | []

/** Cached data saved in the ReMapper cache. */
type CachedData = {
    processing: string
    data: unknown
    accessed?: boolean
}

/** Filename of the cache. */
const RMCacheFilename = 'RM_Cache.json'

async function readRemapperJson(): Promise<ReMapperJson> {
    const json = new ReMapperJson()

    if (!fs.existsSync(RMCacheFilename)) json.save()
    try {
        Object.assign(
            json,
            JSON.parse(await Deno.readTextFile(RMCacheFilename)),
        )
    } catch (e) {
        console.error(`Suffered from error, invalidating cache: ${e}`)
        json.save()
    }

    json.runs++
    Object.keys(json.cachedData).forEach((x) => {
        const data = json.cachedData[x]
        if (!data.accessed) delete json.cachedData[x]
        else data.accessed = false
    })

    return json
}

class ReMapperJson {
    /** Amount of times the ReMapper script has been run. */
    runs = 0
    /** The cached data in the cache. */
    cachedData = {} as Record<string, CachedData>

    /** Save the cache. */
    async save(): Promise<void> {
        await Deno.writeTextFile(
            RMCacheFilename,
            JSON.stringify({
                runs: this.runs,
                cachedData: this.cachedData,
            }),
        )
    }
}

/** The ReMapper cache. */
export const RMJson = readRemapperJson()

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
 * Interpolates between a start and end value to get a value in between.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerp(
    start: number,
    end: number,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction)
    return start + (end - start) * fraction
}

/**
 * Interpolates between a start and end value to get a value in between. Will wrap around 0-1.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpWrap(
    start: number,
    end: number,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction)
    const distance = Math.abs(end - start)

    if (distance <= 0.5) return lerp(start, end, fraction)
    else {
        if (end > start) start += 1
        else start -= 1
        let result = lerp(start, end, fraction)
        if (result < 0) result = 1 + result
        return result % 1
    }
}

/**
 * Interpolates between a start and end rotation to get a rotation in between.
 * @param start Start rotation.
 * @param end End rotation.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpRotation(
    start: Vec3,
    end: Vec3,
    fraction: number,
    easing?: EASE,
): Vec3 {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction)
    const q1 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(start), 'YXZ'),
    )
    const q2 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(end), 'YXZ'),
    )
    q1.slerp(q2, fraction)
    return rotFromQuaternion(q1)
}

/**
 * Converts a quaternion to a euler rotation.
 * @param q Input quaternion.
 */
export function rotFromQuaternion(q: three.Quaternion) {
    let euler = new three.Euler(0, 0, 0, 'YXZ').setFromQuaternion(q)
        .toArray()
    euler.pop()
    euler = toDegrees(euler)
    return euler as Vec3
}

/**
 * Process a number through an easing.
 * @param easing Name of easing.
 * @param value Progress of easing (0-1).
 */
export function lerpEasing(easing: EASE, value: number) {
    if (easing === 'easeLinear' || easing === undefined) return value
    if (easing === 'easeStep') return value === 1 ? 1 : 0
    return easings[easing](value, 0, 1, 1)
}

/**
 * Find value between 0 and 1 from a beginning, length, and a point in time between.
 * @param beginning Start value.
 * @param length Length between start and end value.
 * @param time Value between start and end.
 */
export function findFraction(beginning: number, length: number, time: number) {
    if (length === 0) return 0
    return (time - beginning) / length
}

/**
 * Get the last element in an array.
 * @param arr Input array.
 */
export const arrLast = <T>(arr: T[]) => arr[arr.length - 1]

/**
 * Add either a number or another array to an array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrAdd<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x + value) as unknown as T
    } else return arr.map((x, i) => x + value[i]) as unknown as T
}

/**
 * Subtract either a number or another array from an array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrSubtract<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x - value) as unknown as T
    } else return arr.map((x, i) => x - value[i]) as unknown as T
}

/**
 * Interpolate to find an array between 2 arrays of the same length.
 * @param start Start array.
 * @param end End array.
 * @param fraction Value to find in between start and end.
 */
export const arrLerp = <T extends readonly [] | readonly number[]>(
    start: T,
    end: { [K in keyof T]: number },
    fraction: number,
) => start.map((x, i) => lerp(x, end[i], fraction))

/**
 * Multiply an array either by a number or another array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrMul<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x * value) as unknown as T
    } else return arr.map((x, i) => x * value[i]) as unknown as T
}

/**
 * Divide an array either by a number or another array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrDiv<T extends readonly [] | readonly number[]>(
    arr: T,
    value: { [K in keyof T]: number } | number,
) {
    if (typeof value === 'number') {
        return arr.map((x) => x / value) as unknown as T
    } else return arr.map((x, i) => x / value[i]) as unknown as T
}

/**
 * Check if 2 arrays are equal to each other.
 * @param arr1 First array.
 * @param arr2 Second array.
 * @param lenience The maximum difference 2 numbers in an array can have before they're considered not equal.
 */
export function arrEqual<T extends readonly [] | readonly number[]>(
    arr1: T,
    arr2: { [K in keyof T]: number },
    lenience = 0,
) {
    let result = true
    arr1.forEach((x, i) => {
        if (
            lenience !== 0 &&
            typeof x === 'number' &&
            typeof arr2[i] === 'number'
        ) {
            const difference = x - arr2[i]
            if (Math.abs(difference) > lenience) result = false
        } else if (x !== arr2[i]) result = false
    })
    return result
}

/**
 * Remove a single element of an array, mutating it.
 * @param arr Array to mutate.
 * @param index Element to remove. Can be -1 to remove last element.
 */
export function arrRemove(arr: any[], index: number) {
    if (index === -1) index = arr.length - 1
    if (index > arr.length - 1 || index < 0) return

    for (let i = index; i < arr.length - 1; i++) {
        arr[i] = arr[i + 1]
    }

    arr.length -= 1
}

/**
 * Check if an array contains a value.
 * @param arr Input array.
 * @param value Value to check for.
 */
export const arrHas = (arr: any[], value: any) => arr.some((x) => x === value)

/**
 * Add values of one array to another.
 * @param arr Array to add values to.
 * @param arr2 Values to add.
 */
export const arrAppend = (arr: any[], arr2: any[]) => arr.push.apply(arr, arr2)

/**
 * Generate an array from a range of numbers.
 * @param start Starting number.
 * @param start Ending number.
 */
export const arrFill = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start)

/**
 * Gives a random number in the given range.
 * @param start Minimum value.
 * @param end Maximum value.
 * @param roundResult If defined, result will be rounded to nearest multiple of this number.
 */
export function rand(start: number, end: number, roundResult?: number) {
    const result = Math.random() * (end - start) + start
    return roundResult ? round(result, roundResult) : result
}

/**
 * Rounds a number to the nearest multiple of another number.
 * @param input Number to round.
 * @param number Number to round to.
 */
export const round = (input: number, number: number) =>
    Math.round(input / number) * number

/**
 * Floors a number to the nearest multiple of another number.
 * @param input Number to floor.
 * @param number Number to floor to.
 */
export const floorTo = (input: number, number: number) =>
    Math.floor(input / number) * number

/**
 * Ceils a number to the nearest multiple of another number.
 * @param input Number to ceil.
 * @param number Number to ceil to.
 */
export const ceilTo = (input: number, number: number) =>
    Math.ceil(input / number) * number

/**
 * Makes a number fit between a min and max value.
 * @param input Input number.
 * @param min Optional minimum value.
 * @param max Optional maximum value.
 */
export function clamp(input: number, min?: number, max?: number) {
    if (max !== undefined && input > max) input = max
    else if (min !== undefined && input < min) input = min
    return input
}

/**
 * Sets the decimal place amount on a number.
 * @param input Input number.
 * @param decimals Amount of decimals.
 */
export function setDecimals(input: number, decimals: number) {
    const multiplier = Math.pow(10, decimals)
    return Math.round(input * multiplier) / multiplier
}

/**
 * Get the amount of seconds in the script.
 * @param decimals Amount of decimals in returned number.
 */
export const getSeconds = (decimals = 2) =>
    setDecimals(performance.now() / 1000, decimals)

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
    const copied = copy<T>(obj)
    Object.assign(copied, overwrite)

    return copied
}

/**
 * Creates a new instance of an object, recursively.
 * @param obj Object to clone.
 */
export function copy<T>(obj: T): T {
    return structuredClone(obj)
    // if (obj === null || typeof obj !== "object") return obj;

    // const newObj: T = Array.isArray(obj) ? [] : {};
    // const keys = Object.getOwnPropertyNames(obj);

    // keys.forEach((x) => {
    //   const value = copy((obj)[x]);
    //   newObj[x] = value;
    // });

    // Object.setPrototypeOf(newObj, obj);
    // return newObj as T;
}

/**
 * Checks if an object is empty.
 * @param o Object to check.
 */
export function isEmptyObject(o: unknown): boolean {
    if (typeof o !== 'object') return false
    if (Object.keys(o as TJson).length === 0) {
        return true
    }

    return !Object.values(o as TJson).some((v) => isEmptyObject(v))
}

/**
 * Gets the distance between 2 points.
 * @param A First point.
 * @param B Second point.
 */
export function getDist(A: Vec3, B: Vec3) {
    const deltaX = B[0] - A[0]
    const deltaY = B[1] - A[1]
    const deltaZ = B[2] - A[2]
    const sum = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
    return Math.sqrt(sum)
}

/**
 * Rotates a point around a mathematical anchor, [0,0,0] by default.
 * @param point Point to rotate.
 * @param rotation Rotation to apply.
 * @param anchor Location of the rotation anchor.
 */
export function rotatePoint(
    point: Vec3,
    rotation: Vec3,
    anchor: Vec3 = [0, 0, 0],
) {
    const mathRot = toRadians(rotation)
    const vector = toVec3(arrAdd(point, arrMul(anchor, -1))).applyEuler(
        new three.Euler(...mathRot, 'YXZ'),
    )
    return arrAdd(toArr(vector), anchor) as Vec3
}

/**
 * Rotate a vector, starts downwards.
 * @param rotation Rotation to apply.
 * @param length Length of the vector.
 */
export function rotateVector(rotation: Vec3, length: number) {
    return rotatePoint([0, -length, 0], rotation)
}

/**
 * Convert an array of numbers from degrees to radians.
 * @param values Input array of numbers.
 */
export function toRadians<T extends number[] | []>(values: T) {
    return values.map((x) => x * (Math.PI / 180)) as T
}

/**
 * Convert an array of numbers from radians to degrees.
 * @param values Input array of numbers.
 */
export function toDegrees<T extends number[] | []>(values: T) {
    return values.map((x) => x * (180 / Math.PI)) as T
}

/**
 * Convert three Vector3 and Euler classes to a three number array.
 * @param v Vector or Euler to convert.
 */
export const toArr = (v: three.Vector3 | three.Euler) => [v.x, v.y, v.z] as Vec3

/**
 * Converts a three number array to three Vector3.
 * @param v Array to convert.
 */
export const toVec3 = (v: Vec3) => new three.Vector3(...v)

/**
 * Converts a three number array to three Euler.
 * @param v Array to convert.
 */
export const toEuler = (v: Vec3) => new three.Euler(...toRadians(v), 'YXZ')

/**
 * Converts a three number array to three Quaternion.
 * @param v Array to convert.
 */
export const toQuaternion = (v: Vec3) =>
    new three.Quaternion().setFromEuler(toEuler(v))

/**
 * Takes a transformation and converts it to matrix.
 * @param transform Transform to convert.
 */
export function getMatrixFromTransform(transform: Transform) {
    const m = new three.Matrix4()
    const pos = transform.pos ?? [0, 0, 0]
    const rot = transform.rot ?? [0, 0, 0]
    const scale = transform.scale ?? [1, 1, 1]
    m.compose(toVec3(pos), toQuaternion(rot), toVec3(scale))
    return m
}

/**
 * Takes matrix and converts it to a transformation.
 * @param matrix Matrix to convert.
 */
export function getTransformFromMatrix(matrix: three.Matrix4) {
    const pos = new three.Vector3()
    const q = new three.Quaternion()
    const scale = new three.Vector3()
    matrix.decompose(pos, q, scale)
    const rot = rotFromQuaternion(q)
    return {
        pos: toArr(pos),
        rot: rot,
        scale: toArr(scale),
    }
}

/**
 * Applies 2 transformations to each other.
 * @param target Input transformation.
 * @param transform Transformation to apply.
 * @param anchor
 * @returns
 */
export function combineTransforms(
    target: Transform,
    transform: Transform,
    anchor: Vec3 = [0, 0, 0],
) {
    target = copy(target)
    transform = copy(transform)

    target.pos ??= [0, 0, 0]
    target.pos = arrSubtract(target.pos, anchor)

    const targetM = getMatrixFromTransform(target)
    const transformM = getMatrixFromTransform(transform)
    targetM.premultiply(transformM)
    target = getTransformFromMatrix(targetM)

    return {
        pos: target.pos as Vec3,
        rot: target.rot as Vec3,
        scale: target.scale as Vec3,
    }
}

/**
 * Delete empty objects/arrays from an object recursively.
 * @param obj Object to prune.
 */
export function jsonPrune(obj: TJson) {
    Object.keys(obj).forEach((prop) => {
        if (obj[prop] == null) {
            delete obj[prop]
            return
        }

        const v = obj[prop]
        const type = typeof v
        if (type === 'object') {
            if (Array.isArray(v)) {
                if (v.length === 0) {
                    delete obj[prop]
                }
            } else {
                const rec = v as Record<string, unknown>
                jsonPrune(rec)
                if (isEmptyObject(rec)) {
                    delete obj[prop]
                }
            }
        } else if (type === 'string' && (v as string).length === 0) {
            delete obj[prop]
        }
    })
}

/**
 * Get a property of an object recursively.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param init Optional value to initialize the property if it doesn't exist yet.
 */
export function jsonGet<T = unknown>(
    obj: TJson,
    prop: string,
    init?: T,
): T | undefined {
    // If the property doesn't exist, initialize it.
    if (init != null) jsonFill(obj, prop, init)

    // Fetch the property based on the path/prop.
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]] as Record<string, unknown>
        if (currentObj === undefined) return
    }

    // Return the needed property.
    return currentObj[steps[steps.length - 1]] as T
}

/**
 * If a property doesn't exist through a path of objects, fill objects to get to that property.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param value Value to set the property to.
 */
export function jsonFill<T>(obj: TJson, prop: string, value: T) {
    const steps = prop.split('.')

    // Create empty objects along the path
    const nestedObject: Record<string, unknown> = [...steps].reverse()
        .reduce(
            (prev, current, i) => {
                return i === 0 ? { [current]: value } : { [current]: prev }
            },
            {},
        )

    // Merge the original object into the nested object (if the original object is empty, it will just take the nested object)
    obj[steps[0]] = Object.assign({}, nestedObject[steps[0]], obj[steps[0]])
}

/**
 * Set a property in an object, add objects if needed.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 * @param value Value to set the property to.
 */
export function jsonSet<T>(obj: TJson, prop: string, value: T) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        if (!(steps[i] in currentObj)) {
            currentObj[steps[i]] = {}
        }
        currentObj = currentObj[steps[i]] as Record<string, unknown>
    }
    currentObj[steps[steps.length - 1]] = value
}

/**
 * Check if a property in an object exists
 * @param obj
 * @param prop
 * @returns
 */
export function jsonCheck(obj: TJson, prop: string) {
    const value = jsonGet(obj, prop)
    if (value != null) return true
    return false
}

/**
 * Remove a property of an object recursively, and delete empty objects left behind.
 * @param obj Base object.
 * @param prop Property on this object to check. Can be multiple objects deep.
 */
export function jsonRemove(obj: TJson, prop: string) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]] as Record<string, unknown>
        if (currentObj === undefined) return
    }
    delete currentObj[steps[steps.length - 1]]
}

/**
 * Get jump related info.
 * @param NJS Note jump speed.
 * @param offset Note offset.
 * @param BPM Song BPM.
 * @returns Returns an object; {halfDur, dist}.
 * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
 * Jump Duration is the time in beats that the object will be jumping for.
 * This function will output half of this, so it will end when the note is supposed to be hit.
 * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
 */
export function getJumps(NJS: number, offset: number, BPM: number) {
    const startHJD = 4
    const maxHJD = 18 - 0.001
    const oneBeatDur = 60 / BPM

    let halfDur = startHJD
    const num2 = NJS * oneBeatDur
    let num3 = num2 * halfDur
    while (num3 > maxHJD) {
        halfDur /= 2
        num3 = num2 * halfDur
    }
    halfDur += offset
    if (halfDur < 0.25) halfDur = 0.25

    const jumpDur = halfDur * 2 * oneBeatDur
    const jumpDist = NJS * jumpDur

    return { halfDur: halfDur, dist: jumpDist }
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
 * Safely iterate through an array of keyframes.
 * @param keyframes Keyframes to iterate.
 * @param fn Function to run on each keyframe.
 */
export function iterateKeyframes<T extends NumberTuple>(
    keyframes: RawKeyframesAbstract<T>,
    fn: (values: KeyframesAbstract<T>, index: number) => void,
) {
    // TODO: Lookup point def
    if (typeof keyframes === 'string') return

    const newKeyframes = complexifyArray(keyframes)
    newKeyframes.forEach((x, i) => fn(x, i))
    const newSimpleKeyframes = simplifyArray(newKeyframes)
    newSimpleKeyframes.forEach((x, i) => (keyframes[i] = x))
    keyframes.length = newSimpleKeyframes.length
}

/**
 * Parse a file path, allowing extension forcing and getting useful information.
 * @param input Input path. Can be relative or absolute.
 * @param ext Force extension on the file.
 * @param error Throw an error if the file doesn't exist.
 */
export function parseFilePath(
    input: FILEPATH,
    ext?: `.${string}`,
    error = true,
) {
    if (ext && !path.extname(input)) input += ext

    if (error && !fs.existsSync(input)) {
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

/** Get the base "Environment" object. */
export const getBaseEnvironment = () =>
    new Environment('[0]Environment', 'EndsWith')

/**
 * Assign a track to the base "Environment" object.
 * @param track Track to assign the object to.
 */
export function baseEnvironmentTrack(track: string) {
    const env = getBaseEnvironment()
    env.track.value = track
    env.push()
}

let fogInitialized = false
type AnyFog = BloomFogEnvironment<number | ComplexKeyframesLinear>

/**
 * Edits the base Environment object's fog component.
 * Or spawns an event to animate the fog.
 * @param fog The fog component.
 * @param time The time of the event.
 * @param duration The duration of the animation.
 * @param event The animation event.
 */
export function adjustFog(
    fog: (bfe: AnyFog) => void,
    time?: number,
    duration?: number,
    event?: (event: CustomEventInternals.AnimateComponent) => void,
) {
    let isStatic = true

    if (
        time !== undefined || duration !== undefined || event ||
        fogInitialized
    ) {
        isStatic = false
    }

    const anyFog: AnyFog = {}
    fog(anyFog)

    Object.entries(anyFog).forEach((x) => {
        if (typeof x[1] !== 'number') isStatic = false
    })

    if (isStatic) {
        const env = getBaseEnvironment()
        env.components ??= {}
        env.components.BloomFogEnvironment = anyFog as BloomFogEnvironment<
            number
        >
        env.push()
        fogInitialized = true
    } else {
        baseEnvironmentTrack('fog')

        const fogEvent = animateComponent(time ?? 0, 'fog', duration)

        Object.entries(anyFog).forEach((x) => {
            // TODO: what?
            if (typeof x[1] === 'number') {
                ;(anyFog as any)[x[0]] = [x[1]]
            }
        })

        fogEvent.fog = anyFog as BloomFogEnvironment<KeyframesLinear>
        if (event) event(fogEvent)
        fogEvent.push()
    }
}

export type Transform = {
    pos?: Vec3
    rot?: Vec3
    scale?: Vec3
}

export type FullTransform = {
    pos: Vec3
    rot: Vec3
    scale: Vec3
}

export type Bounds = {
    lowBound: Vec3
    highBound: Vec3
    scale: Vec3
    midPoint: Vec3
}

/**
 * Gets information about the bounding box of a box or a bunch of boxes.
 * @param boxes Can be one box or an array of boxes.
 */
export function getBoxBounds(boxes: Transform | Transform[]): Bounds {
    let lowBound: Vec3 | undefined
    let highBound: Vec3 | undefined

    const boxArr = Array.isArray(boxes) ? boxes : [boxes]

    boxArr.forEach((b) => {
        const pos = b.pos ?? [0, 0, 0]
        const rot = b.rot ?? [0, 0, 0]
        const scale = b.scale ?? [1, 1, 1]

        const corners: Vec3[] = [
            [-1, 1, 1],
            [1, 1, 1],
            [-1, -1, 1],
            [1, -1, 1],
            [-1, 1, -1],
            [1, 1, -1],
            [-1, -1, -1],
            [1, -1, -1],
        ]

        corners.forEach((c) => {
            c = c.map((x, i) => (x / 2) * scale[i]) as Vec3
            c = rotatePoint(c, rot)
            c = arrAdd(c, pos)

            if (lowBound === undefined) {
                lowBound = copy(c)
                highBound = copy(c)
                return
            }

            c.forEach((x, i) => {
                if ((lowBound as Vec3)[i] > x) {
                    ;(lowBound as Vec3)[i] = x
                }
                if ((highBound as Vec3)[i] < x) {
                    ;(highBound as Vec3)[i] = x
                }
            })
        })
    })

    const scale = (lowBound as Vec3).map((x, i) =>
        Math.abs(x - (highBound as Vec3)[i])
    ) as Vec3
    const midPoint = (lowBound as Vec3).map((x, i) =>
        lerp(x, (highBound as Vec3)[i], 0.5)
    ) as Vec3

    return {
        lowBound: lowBound as Vec3,
        highBound: highBound as Vec3,
        scale: scale,
        midPoint: midPoint,
    }
}
