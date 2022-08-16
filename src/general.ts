// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
const EPSILON = 1e-3;
import * as easings from './easings.ts';
import { bakeAnimation, complexifyArray, ComplexKeyframesLinear, ComplexKeyframesVec3, ComplexKeyframesVec4, KeyframesAny, KeyframesLinear, KeyframesVec3, KeyframesVec4, KeyframeValues, RawKeyframesAny, RawKeyframesVec3, simplifyArray } from './animation.ts';
import { Wall } from './wall.ts';
import { EASE } from './constants.ts';
import { activeDiffGet } from './beatmap.ts';
import { Note } from './note.ts';
import { EventInternals } from './event.ts';
import { OptimizeSettings } from "./anim_optimizer.ts";
import { fs, three } from "./deps.ts";

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type ColorType = [number, number, number] | [number, number, number, number];

type CachedData = {
    processing: string,
    data: any,
    accessed?: boolean
};

class ReMapperJson {
    readonly fileName = "RM_Cache.json";
    private json = {
        runs: 0,
        cachedData: {} as Record<string, CachedData>
    }

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

    save() {
        Deno.writeTextFileSync(this.fileName, JSON.stringify(this.json));
    }

    get runs() { return this.json.runs }
    get cachedData() { return this.json.cachedData }

    protected set runs(value: number) { this.json.runs = value }

    protected set cachedData(value: Record<string, CachedData>) { this.json.cachedData = value }
}

export const RMJson = new ReMapperJson();

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
 * @param {Number} min
 * @param {Number} max
 * @param {Array} objects Array of objects to check.
 * @param {String} property What property to check for.
 * @returns {Array}
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
 * @param {Array} objects Array of objects to sort.
 * @param {String} property What property to sort.
 * @param {Boolean} smallestToLargest Whether to sort smallest to largest. True by default.
 */
export function sortObjects(objects: Record<string, any>[], property: string, smallestToLargest = true) {
    if (objects === undefined) return;

    objects.sort((a, b) => smallestToLargest ?
        a[property] - b[property] :
        b[property] - a[property]);
}

/**
 * Gets notes between a min and max time, as a Note class.
 * @param {Number} min 
 * @param {Number} max 
 * @param {Function} forEach Lambda function for each note.
 * @returns {Array}
 */
export function notesBetween(min: number, max: number, forEach: (note: Note) => void) {
    filterObjects(activeDiffGet().notes, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets walls between a min and max time, as a Wall class.
 * @param {Number} min 
 * @param {Number} max 
 * @param {Function} forEach Lambda function for each wall.
 * @returns {Array}
 */
export function wallsBetween(min: number, max: number, forEach: (note: Wall) => void) {
    filterObjects(activeDiffGet().walls, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets events between a min and max time, as an Event class.
 * @param {Number} min 
 * @param {Number} max 
 * @param {Function} forEach Lambda function for each event.
 * @returns {Array}
 */
export function eventsBetween(min: number, max: number, forEach: (note: EventInternals.AbstractEvent) => void) {
    filterObjects(activeDiffGet().events, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Interpolates between a start and end value to get a value in between.
 * @param {Number} start 
 * @param {Number} end 
 * @param {Number} fraction
 * @param {String} easing Optional easing
 * @returns {Number}
 */
export function lerp(start: number, end: number, fraction: number, easing?: EASE) {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    return start + (end - start) * fraction;
}

/**
 * Interpolates between a start and end value to get a value in between. Will wrap around 0-1.
 * @param {Number} start 
 * @param {Number} end 
 * @param {Number} fraction 
 * @param {String} easing Optional easing 
 * @returns 
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
 * @param {Vec3} start 
 * @param {Vec3} end 
 * @param {Number} fraction 
 * @param {EASE} easing 
 * @returns
 */
export function lerpRotation(start: Vec3, end: Vec3, fraction: number, easing?: EASE): Vec3 {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    const q1 = new three.Quaternion().setFromEuler(new three.Euler(...(toRadians(start) as Vec3), "YXZ"));
    const q2 = new three.Quaternion().setFromEuler(new three.Euler(...(toRadians(end) as Vec3), "YXZ"));
    q1.slerp(q2, fraction);
    return eulerFromQuaternion(q1);
}

export function eulerFromQuaternion(q: three.Quaternion) {
    let euler = new three.Euler(0, 0, 0, "YXZ").setFromQuaternion(q).toArray();
    euler.pop();
    euler = toDegrees(euler);
    return euler as Vec3;
}

/**
 * Process a number through an easing.
 * @param {String} easing Name of easing.
 * @param {Number} value Progress of easing (0-1).
 * @returns {Number}
 */
export function lerpEasing(easing: EASE, value: number) {
    if (easing === "easeLinear" || easing === undefined) return value;
    if (easing === "easeStep") return value === 1 ? 1 : 0;
    return easings[easing](value, 0, 1, 1);
}

/**
 * Find value between 0 and 1 from a beginning, length, and a point in time between.
 * @param {Number} beginning 
 * @param {Number} length 
 * @param {Number} time 
 * @returns {Number}
 */
export function findFraction(beginning: number, length: number, time: number) {
    if (length === 0) return 0;
    return (time - beginning) / length;
}

/**
 * Get the last element in an array.
 * @param {Array} arr 
 * @returns {*}
 */
export function arrLast(arr: any[]) {
    return arr[arr.length - 1];
}

/**
 * Add either a number or another array to an array.
 * @param {Array} arr 
 * @param {*} value Can be a number or an array.
 * @returns {Array}
 */
export function arrAdd(arr: number[], value: number[] | number) {
    if (typeof value === "number") return arr.map(x => x + value);
    else return arr.map((x, i) => x + (value[i] !== undefined ? value[i] : 0));
}

/**
 * Multiply an array either by a number or another array.
 * @param {Array} arr 
 * @param {*} value Can be a number or an array.
 * @returns {Array}
 */
export function arrMul(arr: number[], value: number[] | number) {
    if (typeof value === "number") return arr.map(x => x * value);
    else return arr.map((x, i) => x * (value[i] !== undefined ? value[i] : 1));
}

/**
 * Divide an array either by a number or another array.
 * @param {Array} arr 
 * @param {*} value Can be a number or an array.
 * @returns {Array}
 */
export function arrDiv(arr: number[], value: number[] | number) {
    if (typeof value === "number") return arr.map(x => x / value);
    else return arr.map((x, i) => x / (value[i] !== undefined ? value[i] : 1));
}

/**
 * Check if 2 arrays are equal to each other.
 * @param {Array} arr1 
 * @param {Array} arr2 
 * @param {Number} lenience The maximum difference 2 numbers in an array can have before they're considered not equal.
 * @returns {Boolean}
 */
export function arrEqual(arr1: number[], arr2: number[], lenience = 0) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
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
 * Gives a random number in the given range.
 * @param {Number} start
 * @param {Number} end
 * @param roundResult
 * @returns {Number}
 */
export function rand(start: number, end: number, roundResult?: number | undefined) {
    const result = (Math.random() * (end - start)) + start;
    return roundResult ? round(result, roundResult) : result;
}

/**
 * Rounds a number to the nearest other number.
 * @param {Number} input 
 * @param {Number} number 
 * @returns {Number}
 */
export function round(input: number, number: number) {
    return Math.round(input / number) * number;
}

/**
 * Makes a number fit between a min and max value.
 * @param {Number} input
 * @param {Number} min Can be left undefined to ignore.
 * @param {Number} max Can be left undefined to ignore.
 * @returns {Number}
 */
export function clamp(input: number, min?: number, max?: number) {
    if (max !== undefined && input > max) input = max;
    else if (min !== undefined && input < min) input = min;
    return input;
}

/**
 * Sets the decimals on a number.
 * @param {Number} input 
 * @param {Number} decimals 
 * @returns {Number}
 */
export function setDecimals(input: number, decimals: number) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(input * multiplier) / multiplier;
}

/**
 * Get the amount of seconds in the script.
 * @param {Number} decimals 
 * @returns {Number}
 */
export function getSeconds(decimals = 2) {
    return setDecimals(performance.now() / 1000, decimals);
}

/**
 * Creates a new instance of an object.
 * @param {*} obj 
 * @returns
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
 * @param {Object} o 
 * @returns {Boolean}
 */
export function isEmptyObject(o: Record<string, any>) {
    if (typeof o !== "object") return false;
    return Object.keys(o).length === 0;
}

/**
 * Rotate a point around 0,0,0.
 * @param {Array} rotation
 * @param {Array} point
 * @param {Array} anchor Anchor of rotation.
 * @returns {Array}
 */
export function rotatePoint(rotation: Vec3, point: Vec3, anchor: Vec3 = [0, 0, 0]) {
    const mathRot = toRadians(rotation) as Vec3;
    const vector = new three.Vector3(...arrAdd(point, arrMul(anchor, -1))).applyEuler(new three.Euler(...mathRot, "YXZ"));
    return arrAdd([vector.x, vector.y, vector.z], anchor) as Vec3;
}

/**
 * Rotate a vector, starts downwards.
 * @param {Array} rotation
 * @param {Number} length
 * @returns {Array}
 */
export function rotateVector(rotation: Vec3, length: number) {
    return rotatePoint(rotation, [0, -length, 0]);
}

/**
 * Convert an array of numbers from degrees to radians.
 * @param {Array} values 
 * @returns 
 */
export function toRadians(values: number[]) {
    return values.map(x => x * (Math.PI / 180));
}

/**
 * Convert an array of numbers from radians to degrees.
 * @param {Array} values 
 * @returns 
 */
export function toDegrees(values: number[]) {
    return values.map(x => x * (180 / Math.PI));
}

/**
 * Delete empty objects/arrays from an object recursively.
 * @param {Object} obj 
 */
export function jsonPrune(obj: Record<string, any>) {
    for (const prop in obj) {
        if (obj[prop] == null) {
            delete obj[prop];
            continue;
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
    }
}

/**
* Get a property of an object.
* @param {Object} obj 
* @param {String} prop
* @param {Any?} init Optional value to initialize the property if it doesn't exist yet.
*/
export function jsonGet(obj: Record<string, any>, prop: string, init?: any) {

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
* Fill the object with empty properties along the path of prop.
* @param {Object} obj
* @param {String} prop
* @param {Any} value
*/
export function jsonFill(obj: Record<string, any>, prop: string, value: any) {
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
 * @param {Object} obj 
 * @param {String} prop 
 * @param {*} value
 */
export function jsonSet(obj: Record<string, any>, prop: string, value: any) {
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
 * @param {Object} obj 
 * @param {String} prop 
 * @returns {Boolean}
 */
export function jsonCheck(obj: Record<string, any>, prop: string) {
    const value = jsonGet(obj, prop);
    if (value != null) return true;
    return false;
}

/**
* Remove a property of an object recursively, and delete empty objects left behind.
* @param {Object} obj 
* @param {String} prop 
*/
export function jsonRemove(obj: Record<string, any>, prop: string) {
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
 * @param {Number} NJS 
 * @param {Number} offset 
 * @param {Number} BPM 
 * @returns {Object} Returns an object; {halfDur, dist}.
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
 * @param {Array} pos 
 * @param {Array} rot 
 * @param {Array} scale 
 * @returns {Vec3}
 */
export function worldToWall(pos: Vec3, rot: Vec3, scale: Vec3) {
    const wallOffset = [0, -0.5, -0.5];
    const offset = rotatePoint(rot, scale.map((y, i) => y * wallOffset[i]) as Vec3);
    pos = pos.map((y, i) => y + offset[i]) as Vec3;

    pos[0] -= 0.5;
    pos[1] += 0.1 / 0.6;
    pos[2] -= 0.65 / 0.6;

    return pos;
}

/**
 * Create a wall for debugging. Position, rotation, and scale are in world space and can be animations.
 * @param {Object} transform
 * @param {Number} animStart When animation starts.
 * @param {Number} animDur How long animation lasts for.
 * @param {Number} animFreq Frequency of keyframes in animation.
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

export const RMLog = (message: string) => console.log(`[ReMapper: ${getSeconds()}s] ` + message);

export function iterateKeyframes(keyframes: KeyframesLinear, fn: (values: ComplexKeyframesLinear[0], index: number) => void): void;
export function iterateKeyframes(keyframes: KeyframesVec3, fn: (values: ComplexKeyframesVec3[0], index: number) => void): void;
export function iterateKeyframes(keyframes: KeyframesVec4, fn: (values: ComplexKeyframesVec4[0], index: number) => void): void;
export function iterateKeyframes(keyframes: KeyframesAny, fn: (any: any, index: number) => void): void {
    iterateKeyframesInternal(keyframes as KeyframesAny, fn)
}

function iterateKeyframesInternal(keyframes: KeyframesAny, fn: (values: KeyframeValues, index: number) => void): void {
    // TODO: Lookup point def
    if (typeof keyframes === "string") return;

    const newKeyframes = complexifyArray(copy(keyframes));
    newKeyframes.forEach((x, i) => fn(x, i));
    keyframes.length = 0;
    (simplifyArray(newKeyframes) as RawKeyframesAny).forEach(x => (keyframes as any).push(x));
}

// TODO: Make complexifyArray and simplifyArray only take in raw types