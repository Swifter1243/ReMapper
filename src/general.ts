const EPSILON = 1e-3;
import * as jseasingfunctions from 'js-easing-functions';
import { Animation, complexifyArray, Keyframe, KeyframesVec3 } from './animation';
import { Wall } from './wall';
import * as three from 'three';
import { ANIM, EASE } from './constants';
import { activeDiff } from './beatmap';
import { Note } from './note';
import { EventInternals } from './event';

export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

/**
 * Allows you to filter through an array of objects with a min and max property.
 * @param {Number} min
 * @param {Number} max
 * @param {Array} objects Array of objects to check.
 * @param {String} property What property to check for.
 * @returns {Array}
 */
export function filterObjects(objects: object[], min: number, max: number, property: string) {
    let passedObjects = [];

    objects.forEach(obj => {
        if (obj[property] + EPSILON >= min && obj[property] + EPSILON < max) passedObjects.push(obj);
    })

    return passedObjects;
}

/**
 * Sorts an array of objects by a property.
 * @param {Array} objects Array of objects to sort.
 * @param {String} property What property to sort.
 * @param {Boolean} smallestToLargest Whether to sort smallest to largest. True by default.
 */
export function sortObjects(objects: object[], property: string, smallestToLargest = true) {
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
    filterObjects(activeDiff.notes, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets walls between a min and max time, as a Wall class.
 * @param {Number} min 
 * @param {Number} max 
 * @param {Function} forEach Lambda function for each wall.
 * @returns {Array}
 */
export function wallsBetween(min: number, max: number, forEach: (note: Wall) => void) {
    filterObjects(activeDiff.obstacles, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Gets events between a min and max time, as an Event class.
 * @param {Number} min 
 * @param {Number} max 
 * @param {Function} forEach Lambda function for each event.
 * @returns {Array}
 */
export function eventsBetween(min: number, max: number, forEach: (note: EventInternals.AbstractEvent) => void) {
    filterObjects(activeDiff.events, min, max, "time").forEach(x => { forEach(x) });
}

/**
 * Interpolates between a start and end value to get a value in between.
 * @param {Number} start 
 * @param {Number} end 
 * @param {Number} fraction
 * @param {String} easing Optional easing
 * @returns {Number}
 */
export function lerp(start: number, end: number, fraction: number, easing: EASE = undefined) {
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
export function lerpWrap(start: number, end: number, fraction: number, easing: EASE = undefined) {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    let distance = Math.abs(end - start);

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
export function lerpRotation(start: Vec3, end: Vec3, fraction: number, easing: EASE = undefined): Vec3 {
    if (easing !== undefined) fraction = lerpEasing(easing, fraction);
    let q1 = new three.Quaternion().setFromEuler(new three.Euler(...toRadians(start), "YXZ"));
    let q2 = new three.Quaternion().setFromEuler(new three.Euler(...toRadians(end), "YXZ"));
    q1.slerp(q2, fraction);
    let output = toDegrees(new three.Euler().reorder("YXZ").setFromQuaternion(q1).toArray());
    output.pop();
    return output as Vec3;
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
    return jseasingfunctions[easing](value, 0, 1, 1);
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
export function arrEqual(arr1: number[], arr2: number[], lenience: number = 0) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    let result = true;
    arr1.forEach((x, i) => {
        if (lenience !== 0 && typeof x === "number" && typeof arr2[i] === "number") {
            let difference = x - arr2[i];
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
 * @returns {Number}
 */
export function rand(start: number, end: number) {
    return (Math.random() * (end - start)) + start;
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
export function clamp(input: number, min: number = undefined, max: number = undefined) {
    if (max !== undefined && input > max) input = max;
    else if (min !== undefined && input < min) input = min;
    return input;
}

/**
 * Creates a new instance of an object.
 * @param {*} obj 
 * @returns
 */
export function copy<T>(obj: T): T {
    if (obj == null || typeof obj !== "object") { return obj; }

    let newObj = Array.isArray(obj) ? [] : {};
    let keys = Object.getOwnPropertyNames(obj);

    keys.forEach(x => {
        let value = copy(obj[x]);
        newObj[x] = value;
    })

    Object.setPrototypeOf(newObj, (obj as any).__proto__);
    return newObj as T;
}

/**
 * Checks if an object is empty.
 * @param {Object} o 
 * @returns {Boolean}
 */
export function isEmptyObject(o: object) {
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
export function rotatePoint(rotation: Vec3, point: Vec3, anchor: Vec3 = [0,0,0]) {
    let mathRot = toRadians(rotation);
    let vector = new three.Vector3(...arrAdd(point, arrMul(anchor, -1))).applyEuler(new three.Euler(...mathRot, "YXZ"));
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
export function jsonPrune(obj: object) {
    for (let prop in obj) {
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
        if (type === "undefined") delete obj[prop];
    }
}

/**
* Get a property of an object.
* @param {Object} obj 
* @param {String} prop
* @param {*} init Optional value to initialize the property if it doesn't exist yet.
*/
export function jsonGet(obj: object, prop: string) {
    const steps = prop.split('.')
    let currentObj = obj
    for (let i = 0; i < steps.length - 1; i++) {
        currentObj = currentObj[steps[i]]
        if (currentObj === undefined) return;
    }
    return currentObj[steps[steps.length - 1]];
}

/**
 * Set a property in an object, add objects if needed.
 * @param {Object} obj 
 * @param {String} prop 
 * @param {*} value
 */
export function jsonSet(obj: object, prop: string, value) {
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
export function jsonCheck(obj: object, prop: string) {
    let value = jsonGet(obj, prop);
    if (value !== undefined) return true;
    return false;
}

/**
* Remove a property of an object recursively, and delete empty objects left behind.
* @param {Object} obj 
* @param {String} prop 
*/
export function jsonRemove(obj: object, prop: string) {
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

    let num = 60 / BPM;
    let num2 = startHJD;
    while (NJS * num * num2 > maxHJD) num2 /= 2;
    num2 += offset;
    if (num2 < 1) num2 = 1;

    let jumpDur = num * num2 * 2;
    let jumpDist = NJS * jumpDur;
    jumpDist /= 0.6;

    return { halfDur: num2, dist: jumpDist };
}

/**
 * Calculate the correct position for a wall to line up with a position in the world.
 * @param {Array} pos 
 * @param {Array} rot 
 * @param {Array} scale 
 * @returns 
 */
export function worldToWall(pos: Vec3, rot: Vec3, scale: Vec3) {
    let wallOffset = [0, -0.5, -0.5];
    let offset = rotatePoint(rot, scale.map((y, i) => y * wallOffset[i]) as Vec3);
    pos = pos.map((y, i) => y + offset[i]) as Vec3;

    pos[0] -= 0.5;
    pos[1] -= 0.1 / 0.6;
    pos[2] -= 0.65 / 0.6;

    return pos;
}

/**
 * Create a wall for debugging. Position, rotation, and scale are in world space and can be animations.
 * @param {Array} pos 
 * @param {Array} rot 
 * @param {Array} scale 
 * @param {Number} animStart When animation starts.
 * @param {Number} animDur How long animation lasts for.
 * @param {Number} animFreq Frequency of keyframes in animation.
 */
export function debugWall(pos: KeyframesVec3 = undefined, rot: KeyframesVec3 = undefined, scale: KeyframesVec3 = undefined, animStart: number = undefined, animDur: number = undefined, animFreq: number = 1 / 8) {
    pos ??= [0,0,0];
    rot ??= [0,0,0];
    scale ??= [1,1,1];
    animStart ??= 0;
    animDur ??= 0;

    let wall = new Wall();
    wall.life = animDur + 69420;
    wall.lifeStart = 0;
    let wallAnim = new Animation(wall.life).wallAnimation();
    let dataAnim = new Animation().wallAnimation();
    dataAnim.position = copy(pos);
    dataAnim.rotation = copy(rot);
    dataAnim.scale = copy(scale);

    let data = {
        pos: [],
        rot: [],
        scale: []
    }

    function getDomain(arr) {
        arr = complexifyArray(arr);
        arr = arr.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time);
        let min = 1;
        let max = 0;
        arr.forEach(x => {
            let time = new Keyframe(x).time;
            if (time < min) min = time;
            if (time > max) max = time;
        })
        return { min: min, max: max };
    }

    let posDomain = getDomain(pos);
    let rotDomain = getDomain(rot);
    let scaleDomain = getDomain(scale);

    let totalMin = getDomain([[posDomain.min], [rotDomain.min], [scaleDomain.min]]).min;
    let totalMax = getDomain([[posDomain.max], [rotDomain.max], [scaleDomain.max]]).max;

    for (let i = totalMin; i <= totalMax; i += animFreq / animDur) {
        let time = i * animDur + animStart;
        let objPos = dataAnim.get(ANIM.POSITION, i);
        let objRot = dataAnim.get(ANIM.ROTATION, i);
        let objScale = dataAnim.get(ANIM.SCALE, i);

        objPos = worldToWall(objPos, objRot, objScale);

        data.pos.push([...objPos, time]);
        data.rot.push([...objRot, time]);
        data.scale.push([...objScale, time])
    }

    wallAnim.definitePosition = data.pos;
    wallAnim.localRotation = data.rot;
    wallAnim.scale = data.scale;
    wallAnim.optimize();

    wall.color = [0, 0, 0, 1];
    wall.importAnimation(wallAnim);
    wall.push();
}