// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
const EPSILON = 1e-3;
import * as easings from './easings.ts';
import { bakeAnimation, complexifyArray, ComplexKeyframesLinear, ComplexKeyframesVec3, ComplexKeyframesVec4, KeyframesVec3, KeyframeValues, RawKeyframesAny, RawKeyframesLinear, RawKeyframesVec3, RawKeyframesVec4, simplifyArray } from './animation.ts';
import { Wall } from './wall.ts';
import { EASE, FILENAME, FILEPATH } from './constants.ts';
import { activeDiffGet, Json } from './beatmap.ts';
import { Note } from './note.ts';
import { EventInternals } from './basicEvent.ts';
import { OptimizeSettings } from "./anim_optimizer.ts";
import { fs, path, three } from "./deps.ts";
import { BloomFogEnvironment, Environment } from './environment.ts';

/** An array with 2 numbers. */
export type Vec2 = [number, number];
/** An array with 3 numbers. */
export type Vec3 = [number, number, number];
/** An array with 4 numbers. */
export type Vec4 = [number, number, number, number];
/** An array with [r,g,b] or [r,g,b,a]. */
export type ColorType = [number, number, number] | [number, number, number, number];

/** Cached data saved in the ReMapper cache. */
type CachedData = {
    processing: string,
    data: any,
    accessed?: boolean
};

class ReMapperJson {
    /** Filename of the cache. */
    readonly fileName = "RM_Cache.json";
    /** Json internals for the cache. */
    private json = {
        runs: 0,
        cachedData: {} as Record<string, CachedData>
    }

    /** Handler for the RM_Cache file. */
    constructor() {
        if (!fs.existsSync(this.fileName)) this.save();
        this.json = JSON.parse(Deno.readTextFileSync(this.fileName));
        this.runs++;
        Object.keys(this.cachedData).forEach(x => {
            const data = this.cachedData[x];
            if (!data.accessed) delete this.cachedData[x];
            else data.accessed = false;
        })
    }

    /** Save the cache. */
    save() {
        Deno.writeTextFileSync(this.fileName, JSON.stringify(this.json));
    }

    /** Amount of times the ReMapper script has been run. */
    get runs() { return this.json.runs }
    /** The cached data in the cache. */
    get cachedData() { return this.json.cachedData }

    protected set runs(value: number) { this.json.runs = value }

    protected set cachedData(value: Record<string, CachedData>) { this.json.cachedData = value }
}

/** The ReMapper cache. */
export const RMJson = new ReMapperJson();

/**
 * Store data in the ReMapper cache.
 * Retrieves the same data unless specified parameters are changed.
 * @param name Name of the data.
 * @param process Function to generate new data if the parameters are changed.
 * @param processing Parameters to compare to see if data should be re-cached.
 */
export function cacheData<T>(name: string, process: () => T, processing: any[] = []): T {
    let outputData: any;
    const processingJSON = JSON.stringify(processing).replaceAll('"', "");

    function getData() {
        outputData = process();
        RMLog(`cached ${name}`)
        return outputData;
    }

    const cachedData = RMJson.cachedData[name];
    if (cachedData !== undefined) {
        if (processingJSON !== cachedData.processing) {
            cachedData.processing = processingJSON;
            cachedData.data = getData();
        }
        else outputData = cachedData.data;
    }
    else {
        RMJson.cachedData[name] = {
            processing: processingJSON,
            data: getData()
        }
    }

    RMJson.cachedData[name].accessed = true;
    RMJson.save();

    return outputData as T;
}

/**
 * Allows you to filter through an array of objects with a min and max property.
 * @param min Minimum allowed value of the property.
 * @param max Maximum allowed value of the property.
 * @param objects Array of objects to check.
 * @param property What property to check for.
 */
export function filterObjects(objects: any[], min: number, max: number, property: string) {
    const passedObjects: any[] = [];

    objects.forEach(obj => {
        if (obj[property] + EPSILON >= min && obj[property] < max) passedObjects.push(obj);
    })

    return passedObjects;
}

/**
 * Sorts an array of objects by a property.
 * @param objects Array of objects to sort.
 * @param property What property to sort.
 * @param smallestToLargest Whether to sort smallest to largest. True by default.
 */
export function sortObjects(objects: Json[], property: string, smallestToLargest = true) {
    if (objects === undefined) return;

    objects.sort((a, b) => smallestToLargest ?
        a[property] - b[property] :
        b[property] - a[property]);
}

/**
 * Gets notes between a min and max time.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function notesBetween(min: number, max: number, forEach: (note: Note) => void) {
    filterObjects(activeDiffGet().notes, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets bombs between a min and max time.
 * @param min Minimum time of the bombs.
 * @param max Maximum time of the bombs.
 * @param forEach Function for each bomb.
 */
export function bombsBetween(min: number, max: number, forEach: (note: Note) => void) {
    filterObjects(activeDiffGet().bombs, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets arcs between a min and max time..
 * @param min Minimum time of the arcs.
 * @param max Maximum time of the arcs.
 * @param forEach Function for each arc.
 */
export function arcsBetween(min: number, max: number, forEach: (note: Note) => void) {
    filterObjects(activeDiffGet().arcs, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets chains between a min and max time.
 * @param min Minimum time of the chains.
 * @param max Maximum time of the chains.
 * @param forEach Function for each chain.
 */
export function chainsBetween(min: number, max: number, forEach: (note: Note) => void) {
    filterObjects(activeDiffGet().chains, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets walls between a min and max time.
 * @param min Minimum time of the walls.
 * @param max Maximum time of the walls.
 * @param forEach Function for each wall.
 */
export function wallsBetween(min: number, max: number, forEach: (note: Wall) => void) {
    filterObjects(activeDiffGet().walls, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets events between a min and max time.
 * @param min Minimum of the events.
 * @param max Maximum time of the events.
 * @param forEach Function for each event.
 */
export function eventsBetween(min: number, max: number, forEach: (note: EventInternals.AbstractEvent) => void) {
    filterObjects(activeDiffGet().events, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Interpolates between a start and end value to get a value in between.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerp(start: number, end: number, fraction: number, easing?: EASE) {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    return start + (end - start) * fraction;
}

/**
 * Interpolates between a start and end value to get a value in between. Will wrap around 0-1.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpWrap(start: number, end: number, fraction: number, easing?: EASE) {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    const distance = Math.abs(end - start);

    if (distance <= 0.5) return lerp(start, end, fraction);
    else {
        if (end > start) start += 1;
        else start -= 1;
        let result = lerp(start, end, fraction);
        if (result < 0) result = 1 + result;
        return result % 1;
    }
}

/**
 * Interpolates between a start and end rotation to get a rotation in between.
 * @param start Start rotation.
 * @param end End rotation.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpRotation(start: Vec3, end: Vec3, fraction: number, easing?: EASE): Vec3 {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    const q1 = new three.Quaternion().setFromEuler(new three.Euler(...(toRadians(start) as Vec3), "YXZ"));
    const q2 = new three.Quaternion().setFromEuler(new three.Euler(...(toRadians(end) as Vec3), "YXZ"));
    q1.slerp(q2, fraction);
    return eulerFromQuaternion(q1);
}

/**
 * Converts a quaternion to a euler rotation.
 * @param q Input quaternion.
 */
export function eulerFromQuaternion(q: three.Quaternion) {
    let euler = new three.Euler(0, 0, 0, "YXZ").setFromQuaternion(q).toArray();
    euler.pop();
    euler = toDegrees(euler);
    return euler as Vec3;
}

/**
 * Process a number through an easing.
 * @param easing Name of easing.
 * @param value Progress of easing (0-1).
 */
export function lerpEasing(easing: EASE, value: number) {
    if (easing === "easeLinear" || easing === undefined) return value;
    if (easing === "easeStep") return value === 1 ? 1 : 0;
    return easings[easing](value, 0, 1, 1);
}

/**
 * Find value between 0 and 1 from a beginning, length, and a point in time between.
 * @param beginning Start value.
 * @param length Length between start and end value.
 * @param time Value between start and end.
 */
export function findFraction(beginning: number, length: number, time: number) {
    if (length === 0) return 0;
    return (time - beginning) / length;
}

/**
 * Get the last element in an array.
 * @param arr Input array.
 */
export const arrLast = <T>(arr: T[]) => arr[arr.length - 1];

/**
 * Add either a number or another array to an array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrAdd<T extends readonly [] | readonly number[]>
    (arr: T, value: { [K in keyof T]: number } | number) {
    if (typeof value === "number") return arr.map(x => x + value) as unknown as T;
    else return arr.map((x, i) => x + value[i]) as unknown as T;
}

/**
 * Subtract either a number or another array from an array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrSubtract<T extends readonly [] | readonly number[]>
    (arr: T, value: { [K in keyof T]: number } | number) {
    if (typeof value === "number") return arr.map(x => x - value) as unknown as T;
    else return arr.map((x, i) => x - value[i]) as unknown as T;
}

/**
 * Interpolate to find an array between 2 arrays of the same length.
 * @param start Start array.
 * @param end End array.
 * @param fraction Value to find in between start and end.
 */
export const arrLerp = <T extends readonly [] | readonly number[]>
    (start: T, end: { [K in keyof T]: number }, fraction: number) =>
    start.map((x, i) => lerp(x, end[i], fraction));

/**
 * Multiply an array either by a number or another array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrMul<T extends readonly [] | readonly number[]>
    (arr: T, value: { [K in keyof T]: number } | number) {
    if (typeof value === "number") return arr.map(x => x * value) as unknown as T;
    else return arr.map((x, i) => x * value[i]) as unknown as T;
}

/**
 * Divide an array either by a number or another array.
 * @param arr Input array.
 * @param value Can be a number or an array.
 */
export function arrDiv<T extends readonly [] | readonly number[]>
    (arr: T, value: { [K in keyof T]: number } | number) {
    if (typeof value === "number") return arr.map(x => x / value) as unknown as T;
    else return arr.map((x, i) => x / value[i]) as unknown as T;
}

/**
 * Check if 2 arrays are equal to each other.
 * @param arr1 First array.
 * @param arr2 Second array.
 * @param lenience The maximum difference 2 numbers in an array can have before they're considered not equal.
 */
export function arrEqual<T extends readonly [] | readonly number[]>
    (arr1: T, arr2: { [K in keyof T]: number }, lenience = 0) {
    let result = true;
    arr1.forEach((x, i) => {
        if (lenience !== 0 && typeof x === "number" && typeof arr2[i] === "number") {
            const difference = x - arr2[i];
            if (Math.abs(difference) > lenience) result = false;
        }
        else if (x !== arr2[i]) result = false;
    });
    return result;
}

/**
 * Check if an array contains a value.
 * @param arr Input array.
 * @param value Value to check for.
 */
export const arrHas = (arr: any[], value: any) => arr.some(x => x === value);

/**
 * Gives a random number in the given range.
 * @param start Minimum value.
 * @param end Maximum value.
 * @param roundResult If defined, result will be rounded to nearest multiple of this number.
 */
export function rand(start: number, end: number, roundResult?: number) {
    const result = (Math.random() * (end - start)) + start;
    return roundResult ? round(result, roundResult) : result;
}

/**
 * Rounds a number to the nearest multiple of another number.
 * @param input Number to round.
 * @param number Number to round to.
 */
export function round(input: number, number: number) {
    return Math.round(input / number) * number;
}

/**
 * Makes a number fit between a min and max value.
 * @param input Input number.
 * @param min Optional minimum value.
 * @param max Optional maximum value.
 */
export function clamp(input: number, min?: number, max?: number) {
    if (max !== undefined && input > max) input = max;
    else if (min !== undefined && input < min) input = min;
    return input;
}

/**
 * Sets the decimal place amount on a number.
 * @param input Input number.
 * @param decimals Amount of decimals.
 */
export function setDecimals(input: number, decimals: number) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(input * multiplier) / multiplier;
}

/**
 * Get the amount of seconds in the script.
 * @param decimals Amount of decimals in returned number.
 */
export const getSeconds = (decimals = 2) =>
    setDecimals(performance.now() / 1000, decimals);

/**
 * Creates a new instance of an object, recursively.
 * @param obj Object to clone.
 */
export function copy<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") { return obj; }

    const newObj = Array.isArray(obj) ? [] : {};
    const keys = Object.getOwnPropertyNames(obj);

    keys.forEach(x => {
        const value = copy((obj as any)[x]);
        (newObj as any)[x] = value;
    })

    Object.setPrototypeOf(newObj, obj as any);
    return newObj as T;
}

/**
 * Checks if an object is empty.
 * @param o Object to check.
 */
export function isEmptyObject(o: Json) {
    if (typeof o !== "object") return false;
    return Object.keys(o).length === 0;
}

/**
 * Gets the distance between 2 points.
 * @param A First point.
 * @param B Second point.
 */
export function getDist(A: Vec3, B: Vec3) {
    const deltaX = B[0] - A[0];
    const deltaY = B[1] - A[1];
    const deltaZ = B[2] - A[2];
    const sum = (deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ);
    return Math.sqrt(sum);
}

/**
 * Rotates a point around a mathematical anchor, [0,0,0] by default.
 * @param point Point to rotate.
 * @param rotation Rotation to apply.
 * @param anchor Location of the rotation anchor.
 */
export function rotatePoint(point: Vec3, rotation: Vec3, anchor: Vec3 = [0, 0, 0]) {
    const mathRot = toRadians(rotation) as Vec3;
    const vector = new three.Vector3(...arrAdd(point, arrMul(anchor, -1))).applyEuler(new three.Euler(...mathRot, "YXZ"));
    return arrAdd([vector.x, vector.y, vector.z], anchor) as Vec3;
}

/**
 * Rotate a vector, starts downwards.
 * @param rotation Rotation to apply.
 * @param length Length of the vector.
 */
export function rotateVector(rotation: Vec3, length: number) {
    return rotatePoint([0, -length, 0], rotation);
}

/**
 * Convert an array of numbers from degrees to radians.
 * @param values Input array of numbers.
 */
export function toRadians(values: number[]) {
    return values.map(x => x * (Math.PI / 180));
}

/**
 * Convert an array of numbers from radians to degrees.
 * @param values Input array of numbers.
 */
export function toDegrees(values: number[]) {
    return values.map(x => x * (180 / Math.PI));
}

/**
 * Delete empty objects/arrays from an object recursively.
 * @param obj Object to prune.
 */
export function jsonPrune(obj: Json) {
    Object.keys(obj).forEach(prop => {
        if (obj[prop] == null) {
            delete obj[prop];
            return;
        }
        const type = typeof obj[prop];
        if (type === "object") {
            if (Array.isArray(obj[prop])) {
                if (obj[prop].length === 0) {
                    delete obj[prop];
                }
            } else {
                jsonPrune(obj[prop]);
                if (isEmptyObject(obj[prop])) {
                    delete obj[prop];
                }
            }
        } else if (type === "string" && obj[prop].length === 0) {
            delete obj[prop];
        }
    })
}

/**
* Get a property of an object recursively.
* @param obj Base object.
* @param prop Property on this object to check. Can be multiple objects deep.
* @param init Optional value to initialize the property if it doesn't exist yet.
*/
export function jsonGet(obj: Json, prop: string, init?: any) {

    // If the property doesn't exist, initialize it.
    if (init != null) jsonFill(obj, prop, init);

    // Fetch the property based on the path/prop.
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]]
        if (currentObj === undefined) return;
    }

    // Return the needed property.
    return currentObj[steps[steps.length - 1]];
}

/**
* If a property doesn't exist through a path of objects, fill objects to get to that property.
* @param obj Base object.
* @param prop Property on this object to check. Can be multiple objects deep.
* @param value Value to set the property to.
*/
export function jsonFill(obj: Json, prop: string, value: any) {
    const steps = prop.split('.');

    // Create empty objects along the path
    const nestedObject: any = [...steps]
        .reverse()
        .reduce((prev, current, i) => {
            return i === 0 ? { [current]: value } : { [current]: prev };
        }, {});

    // Merge the original object into the nested object (if the original object is empty, it will just take the nested object)
    obj[steps[0]] = Object.assign({}, nestedObject[steps[0]], obj[steps[0]]);
}

/**
 * Set a property in an object, add objects if needed.
* @param obj Base object.
* @param prop Property on this object to check. Can be multiple objects deep.
* @param value Value to set the property to.
 */
export function jsonSet(obj: Json, prop: string, value: any) {
    const steps = prop.split('.');
    let currentObj = obj;
    for (let i = 0; i < steps.length - 1; i++) {
        if (!(steps[i] in currentObj)) {
            currentObj[steps[i]] = {};
        }
        currentObj = currentObj[steps[i]];
    }
    currentObj[steps[steps.length - 1]] = value;
}

/**
 * Check if a property in an object exists
 * @param obj 
 * @param prop 
 * @returns
 */
export function jsonCheck(obj: Json, prop: string) {
    const value = jsonGet(obj, prop);
    if (value != null) return true;
    return false;
}

/**
* Remove a property of an object recursively, and delete empty objects left behind.
* @param obj Base object.
* @param prop Property on this object to check. Can be multiple objects deep.
*/
export function jsonRemove(obj: Json, prop: string) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]]
        if (currentObj === undefined) return;
    }
    delete currentObj[steps[steps.length - 1]];
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
 * This function will output the jump distance converted to noodle units.
 */
export function getJumps(NJS: number, offset: number, BPM: number) {
    const startHJD = 4;
    const maxHJD = 18;

    const num = 60 / BPM;
    let num2 = startHJD;
    while (NJS * num * num2 > maxHJD) num2 /= 2;
    num2 += offset;
    if (num2 < 1) num2 = 1;

    const jumpDur = num * num2 * 2;
    let jumpDist = NJS * jumpDur;
    jumpDist /= 0.6;

    return { halfDur: num2, dist: jumpDist };
}

/**
 * Calculate the correct position for a wall to line up with a position in the world.
 * @param pos Position of the wall in world space.
 * @param rot Rotation of the wall in world space.
 * @param scale Scale of the wall in world space.
 */
export function worldToWall(pos: Vec3, rot: Vec3, scale: Vec3) {
    const wallOffset = [0, -0.5, -0.5];
    const offset = rotatePoint(scale.map((y, i) => y * wallOffset[i]) as Vec3, rot);
    pos = pos.map((y, i) => y + offset[i]) as Vec3;

    pos[0] -= 0.5;
    pos[1] += 0.1 / 0.6;
    pos[2] -= 0.65 / 0.6;

    return pos;
}

/**
 * Create a wall for debugging. Position, rotation, and scale are in world space and can be animations.
 * @param transform All of the transformations for the wall.
 * @param animStart When animation starts.
 * @param animDur How long animation lasts for.
 * @param animFreq Frequency of keyframes in animation.
 */
export function debugWall(transform: { pos?: RawKeyframesVec3, rot?: RawKeyframesVec3, scale?: RawKeyframesVec3 }, animStart?: number, animDur?: number, animFreq?: number, animOptimizer = new OptimizeSettings()) {
    animStart ??= 0;
    animDur ??= 0;
    animFreq ??= 1 / 32;

    const wall = new Wall();
    wall.life = animDur + 69420;
    wall.lifeStart = 0;

    transform = bakeAnimation(transform, keyframe => {
        keyframe.pos = worldToWall(keyframe.pos, keyframe.rot, keyframe.scale);
        keyframe.time = keyframe.time * (animDur as number) + (animStart as number);
    }, animFreq, animOptimizer);

    wall.color = [0, 0, 0, 1];
    wall.animate.length = wall.life;
    wall.animate.definitePosition = transform.pos as KeyframesVec3;
    wall.animate.localRotation = transform.rot as KeyframesVec3;
    wall.animate.scale = transform.scale as KeyframesVec3;
    wall.push();
}

/**
 * Log a message as ReMapper, displaying seconds.
 * @param message Message to log.
 */
export const RMLog = (message: string) => console.log(`[ReMapper: ${getSeconds()}s] ` + message);

/**
 * Safely iterate through an array of keyframes.
 * @param keyframes Keyframes to iterate.
 * @param fn Function to run on each keyframe.
 */
export function iterateKeyframes(keyframes: RawKeyframesLinear, fn: (values: ComplexKeyframesLinear[0], index: number) => void): void;
export function iterateKeyframes(keyframes: RawKeyframesVec3, fn: (values: ComplexKeyframesVec3[0], index: number) => void): void;
export function iterateKeyframes(keyframes: RawKeyframesVec4, fn: (values: ComplexKeyframesVec4[0], index: number) => void): void;
export function iterateKeyframes(keyframes: RawKeyframesAny, fn: (any: any, index: number) => void): void {
    iterateKeyframesInternal(keyframes, fn)
}

function iterateKeyframesInternal(keyframes: RawKeyframesAny, fn: (values: KeyframeValues, index: number) => void): void {
    // TODO: Lookup point def
    if (typeof keyframes === "string") return;

    const newKeyframes = complexifyArray(copy(keyframes));
    newKeyframes.forEach((x, i) => fn(x, i));
    keyframes.length = 0;
    (simplifyArray(newKeyframes)).forEach(x => (keyframes as any).push(x));
}

// TODO: Make complexifyArray and simplifyArray only take in raw types

/**
 * Parse a file path, allowing extension forcing and getting useful information.
 * @param input Input path. Can be relative or absolute.
 * @param ext Force extension on the file.
 * @param error Throw an error if the file doesn't exist.
 */
export function parseFilePath(input: FILEPATH, ext?: `.${string}`, error = true) {
    if (ext && !path.extname(input)) input += ext;

    if (error && !fs.existsSync(input)) throw new Error(`The file "${input}" does not exist`);

    const output: { name: FILENAME, path: FILEPATH, dir?: string } = {
        name: path.basename(input),
        path: input
    };

    const dir = path.dirname(input);
    if (dir !== ".") output.dir = dir;

    return output
}

/** Get the base "Environment" object. */
export const getBaseEnvironment = () => new Environment("[0]Environment", "EndsWith");

/**
 * Assign a track to the base "Environment" object.
 * @param track Track to assign the object to.
 */
export function baseEnvironmentTrack(track: string) {
    const env = getBaseEnvironment();
    env.track.value = track;
    env.push();
}

/**
 * Edits the base Environment object's fog component.
 * @param fog The fog component.
 */
export function adjustFog(fog: (bfe: BloomFogEnvironment<number>) => void) {
    const env = getBaseEnvironment();
    env.components.BloomFogEnvironment = {};
    fog(env.components.BloomFogEnvironment);
    env.push();
}

/**
 * Get the bounds of a box, assuming the center is 0,0,0.
 * @param rotation Rotation of the box.
 * @param scale Scale of the box.
 */
export function getBoxBounds(rotation: Vec3, scale: Vec3 = [1, 1, 1]) {
    const corners: Vec3[] = [
        [-1, 1, 1],
        [1, 1, 1],
        [-1, -1, 1],
        [1, -1, 1],
        [-1, 1, -1],
        [1, 1, -1],
        [-1, -1, -1],
        [1, -1, -1]
    ]

    const lowBound: Vec3 = [0, 0, 0];
    const highBound: Vec3 = [0, 0, 0];

    corners.forEach(c => {
        c = rotatePoint(c, rotation);

        c.forEach((x, i) => {
            x = (x / 2) * scale[i];
            if (lowBound[i] > x) lowBound[i] = x;
            if (highBound[i] < x) highBound[i] = x;
        })
    })

    return {
        lowBound: lowBound,
        highBound: highBound
    }
}