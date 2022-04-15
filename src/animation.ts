import { activeDiff } from "./beatmap";
import { ANIM, EASE, SPLINE } from "./constants";
import { lerpEasing, arrAdd, copy, arrEqual, arrMul, arrLast, findFraction, lerp, Vec3, Vec4, lerpRotation } from "./general";

export type Interpolation = EASE | SPLINE;

export type KeyframesLinear = [number] | [number, number, Interpolation?, SPLINE?][] | string;
export type KeyframesVec3 = Vec3 | [...Vec3, number, Interpolation?, SPLINE?][] | string;
export type KeyframesVec4 = Vec4 | [...Vec4, number, Interpolation?, SPLINE?][] | string;
export type KeyframesAny = number[] | KeyframeValues[] | string;

export type KeyframeValues = (number | EASE | SPLINE)[];
export type KeyframeArray = KeyframeValues[];

export type TrackValue = string | string[];
export namespace AnimationInternals {
    export class BaseAnimation {
        json: any = {};
        length;

        constructor(length: number = undefined, data = undefined) {
            length ??= 1;

            this.length = length;
            if (data !== undefined) this.json = data;
        }

        /**
         * Clear animation data. Leave blank to completely clear animation.
         */
        clear(property: string = undefined) {
            if (property !== undefined) delete this.json[property];
            else Object.keys(this.json).forEach(x => { delete this.json[x] });
        }

        /**
         * Set a property's animations. Does not edit the value.
         * @param {String} property 
         * @param {*} value 
         */
        set(property: string, value) { this.json[property] = value }

        /**
         * Get a property's animations.
         * @param {String} property 
         * @param {Number} time Option to get the values of a property at a certain time. Does not account for splines. 
         * Time can be in length of animation or between 0 and 1 if negative.
         * @returns {*}
         */
        get(property: string, time: number = undefined) {
            if (time === undefined) return this.json[property];
            else {
                time = this.convertTime(time);
                return getValuesAtTime(property, this.json[property], time);
            }
        }

        /**
         * Add animations to a property, also sorts by time and makes optimizations if possible.
         * @param {String} property 
         * @param {*} value 
         */
        add(property: string, value) {
            value = this.convert(complexifyArray(value));
            let concatArray = value.concat(complexifyArray(this.json[property]));
            let newValue = simplifyArray(concatArray.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time));
            this.json[property] = newValue;
        }

        /**
         * Remove similar values to cut down on keyframe count.
         * @param {Number} accuracy Multiplier for the max difference that values are considered "similar".
         * @param {String} property Optimize only a single property, or set to undefined to optimize all.
         */
        optimize(accuracy: number = undefined, property: string = undefined) {
            accuracy ??= 1;

            if (property === undefined) {
                Object.keys(this.json).forEach(key => {
                    if (Array.isArray(this.json[key])) {
                        this.set(key, optimizeArray(this.get(key), lookupLenience(key)));
                    }
                })
            }
            else this.set(property, optimizeArray(this.get(property), lookupLenience(property)));

            function lookupLenience(prop) {
                if (prop === ANIM.POSITION || prop === ANIM.LOCAL_POSITION || prop === ANIM.DEFINITE_POSITION) return 0.1 * accuracy;
                if (prop === ANIM.SCALE) return 0.05 * accuracy;
                if (prop === ANIM.ROTATION || prop === ANIM.LOCAL_ROTATION) return 4 * accuracy;
                return 0;
            }
        }

        private convert(value) {
            return value.map(x => {
                let time = new Keyframe(x).timeIndex;
                x[time] = this.convertTime(x[time]);
                return x;
            })
        }

        private convertTime(time) {
            if (time >= 0) return time / this.length;
            else return time * -1;
        }
    }


    class ObjectAnimation extends BaseAnimation {
        get position() { return this.get(ANIM.POSITION) }
        get definitePosition() { return this.get(ANIM.DEFINITE_POSITION) }
        get rotation() { return this.get(ANIM.ROTATION) }
        get localRotation() { return this.get(ANIM.LOCAL_ROTATION) }
        get scale() { return this.get(ANIM.SCALE) }
        get dissolve() { return this.get(ANIM.DISSOLVE) }
        get color() { return this.get(ANIM.COLOR) }
        get interactable() { return this.get(ANIM.INTERACTABLE) }
        get time() { return this.get(ANIM.TIME) }

        set position(value: KeyframesVec3) { this.add(ANIM.POSITION, value) }
        set definitePosition(value: KeyframesVec3) { this.add(ANIM.DEFINITE_POSITION, value) }
        set rotation(value: KeyframesVec3) { this.add(ANIM.ROTATION, value) }
        set localRotation(value: KeyframesVec3) { this.add(ANIM.LOCAL_ROTATION, value) }
        set scale(value: KeyframesVec3) { this.add(ANIM.SCALE, value) }
        set dissolve(value: KeyframesLinear) { this.add(ANIM.DISSOLVE, value) }
        set color(value: KeyframesVec4) { this.add(ANIM.COLOR, value) }
        set interactable(value: KeyframesLinear) { this.add(ANIM.INTERACTABLE, value) }
        set time(value: KeyframesLinear) { this.add(ANIM.TIME, value) }
    }

    export class NoteAnimation extends ObjectAnimation {
        get dissolveArrow() { return this.get(ANIM.DISSOLVE_ARROW) }
        set dissolveArrow(value: KeyframesLinear) { this.add(ANIM.DISSOLVE_ARROW, value) }
    }

    export class WallAnimation extends ObjectAnimation { }

    export class EnvironmentAnimation extends BaseAnimation {
        get position() { return this.get(ANIM.POSITION) }
        get rotation() { return this.get(ANIM.ROTATION) }
        get localPosition() { return this.get(ANIM.LOCAL_POSITION) }
        get localRotation() { return this.get(ANIM.LOCAL_ROTATION) }
        get scale() { return this.get(ANIM.SCALE) }

        set position(value: KeyframesVec3) { this.add(ANIM.POSITION, value) }
        set rotation(value: KeyframesVec3) { this.add(ANIM.ROTATION, value) }
        set localPosition(value: KeyframesVec3) { this.add(ANIM.LOCAL_POSITION, value) }
        set localRotation(value: KeyframesVec3) { this.add(ANIM.LOCAL_ROTATION, value) }
        set scale(value: KeyframesVec3) { this.add(ANIM.SCALE, value) }
    }

    export class FogAnimation extends BaseAnimation {
        get attenuation() { return this.get(ANIM.ATTENUATION) }
        get offset() { return this.get(ANIM.OFFSET) }
        get startY() { return this.get(ANIM.STARTY) }
        get height() { return this.get(ANIM.HEIGHT) }

        set attenuation(value: KeyframesLinear) { this.add(ANIM.ATTENUATION, value) }
        set offset(value: KeyframesLinear) { this.add(ANIM.OFFSET, value) }
        set startY(value: KeyframesLinear) { this.add(ANIM.STARTY, value) }
        set height(value: KeyframesLinear) { this.add(ANIM.HEIGHT, value) }
    }

    export class AbstractAnimation extends ObjectAnimation {
        get position() { return this.get(ANIM.POSITION) }
        get localPosition() { return this.get(ANIM.LOCAL_POSITION) }
        get definitePosition() { return this.get(ANIM.DEFINITE_POSITION) }
        get rotation() { return this.get(ANIM.ROTATION) }
        get localRotation() { return this.get(ANIM.LOCAL_ROTATION) }
        get scale() { return this.get(ANIM.SCALE) }
        get dissolve() { return this.get(ANIM.DISSOLVE) }
        get dissolveArrow() { return this.get(ANIM.DISSOLVE_ARROW) }
        get color() { return this.get(ANIM.COLOR) }
        get interactable() { return this.get(ANIM.INTERACTABLE) }
        get time() { return this.get(ANIM.TIME) }
        get attenuation() { return this.get(ANIM.ATTENUATION) }
        get offset() { return this.get(ANIM.OFFSET) }
        get startY() { return this.get(ANIM.STARTY) }
        get height() { return this.get(ANIM.HEIGHT) }

        set position(value: KeyframesVec3) { this.add(ANIM.POSITION, value) }
        set localPosition(value: KeyframesVec3) { this.add(ANIM.LOCAL_POSITION, value) }
        set definitePosition(value: KeyframesVec3) { this.add(ANIM.DEFINITE_POSITION, value) }
        set rotation(value: KeyframesVec3) { this.add(ANIM.ROTATION, value) }
        set localRotation(value: KeyframesVec3) { this.add(ANIM.LOCAL_ROTATION, value) }
        set scale(value: KeyframesVec3) { this.add(ANIM.SCALE, value) }
        set dissolve(value: KeyframesLinear) { this.add(ANIM.DISSOLVE, value) }
        set dissolveArrow(value: KeyframesLinear) { this.add(ANIM.DISSOLVE_ARROW, value) }
        set color(value: KeyframesVec4) { this.add(ANIM.COLOR, value) }
        set interactable(value: KeyframesLinear) { this.add(ANIM.INTERACTABLE, value) }
        set time(value: KeyframesLinear) { this.add(ANIM.TIME, value) }
        set attenuation(value: KeyframesLinear) { this.add(ANIM.ATTENUATION, value) }
        set offset(value: KeyframesLinear) { this.add(ANIM.OFFSET, value) }
        set startY(value: KeyframesLinear) { this.add(ANIM.STARTY, value) }
        set height(value: KeyframesLinear) { this.add(ANIM.HEIGHT, value) }
    }
}

export class Animation extends AnimationInternals.BaseAnimation {
    /**
    * Noodle animation manager.
    * The time in each keyframe is divided by the length.
    * Use a negative number or don't specify a length to use a range between 0 and 1.
    * Setting a property will add any existing keyframes and sort by time.
    * @param {Number} length
    */
    constructor(length: number = 1) { super(length) }

    /**
    * Create an animation using JSON.
    * @param {Object} json 
    * @returns {AbstractAnimation}
    */
    import(json: object) { return new AnimationInternals.AbstractAnimation(this.length, json) }

    /**
     * Create an event with no particular identity.
     * @returns {AbstractAnimation};
     */
    abstract(json: object = {}) { return this.import(json) }

    /**
     * State that this animation is for a note.
     * @param {Object} json 
     * @returns 
     */
    noteAnimation(json: object = undefined) { return new AnimationInternals.NoteAnimation(this.length, json) }

    /**
     * State that this animation is for a wall.
     * @param {Object} json 
     * @returns 
     */
    wallAnimation(json: object = undefined) { return new AnimationInternals.WallAnimation(this.length, json) }

    /**
     * State that this animation is for an environment object.
     * @param {Object} json 
     * @returns 
     */
    environmentAnimation(json: object = undefined) { return new AnimationInternals.EnvironmentAnimation(this.length, json) }

    /**
     * State that this animation is for fog.
     * @param {Object} json 
     * @returns 
     */
    fogAnimation(json: object = undefined) { return new AnimationInternals.FogAnimation(this.length, json) }
}

export class Keyframe {
    values: number[] = [];
    timeIndex = 0;
    time: number = 0;
    easing: EASE = undefined;
    spline: SPLINE = undefined;

    constructor(data: KeyframeValues) {
        this.timeIndex = this.getTimeIndex(data);
        this.time = data[this.timeIndex] as number;
        this.values = this.getValues(data);
        this.easing = this.getEasing(data);
        this.spline = this.getSpline(data);
    }

    private getValues(arr: KeyframeValues): number[] {
        let time = this.getTimeIndex(arr);
        return arr.slice(0, time) as number[];
    }

    private getTimeIndex(arr: KeyframeValues): number {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (typeof arr[i] !== "string") return i;
        }
    }

    private getEasing(arr: KeyframeValues): EASE {
        return arr.filter(x => typeof x === "string" && x.includes("ease"))[0] as EASE;
    }

    private getSpline(arr: KeyframeValues): SPLINE {
        return arr.filter(x => typeof x === "string" && x.includes("spline"))[0] as SPLINE;
    }

    get data() {
        let output: (string | number)[] = [...this.values, this.time];
        if (this.easing !== undefined) output.push(this.easing);
        if (this.spline !== undefined) output.push(this.spline);
        return output;
    }
}

export class Track {
    value: TrackValue;

    /**
     * Handler for the track property.
     * @param {TrackValue} value 
     */
    constructor(value: TrackValue) { this.value = value }

    /**
     * Safely check if either the array contains this value or the track is equal to this value.
     * @param {String} value 
     * @returns 
     */
    has(value: string) {
        if (this.value === undefined) return false;
        if (typeof this.value === "string") return this.value === value;
        else return this.value.some(x => x === value);
    }
}

/**
 * Specific function for animations, converts an array with a single element to be double nested.
 * @param {Array} array 
 * @returns {Array}
 */
export function complexifyArray(array: KeyframesAny): KeyframeArray {
    if (array === undefined) return [];
    if (!isSimple(array)) return array as KeyframeValues[];
    return [[...array as number[], 0]];
}

/**
 * Specific function for animations, converts a double nested array with a single element to an array with a single element.
 * @param {Array} array 
 * @returns {Array}
 */
export function simplifyArray(array: KeyframesAny): KeyframesAny {
    if (array === undefined) return [];
    if (array.length <= 1 && !isSimple(array) && new Keyframe(array[0] as KeyframeValues).time === 0) {
        let newArr = array[0] as KeyframeValues;
        newArr.pop();
        return newArr as KeyframesAny;
    }
    return array;
}

/**
 * Specific function for animations, removes similar keyframes from an animation.
 * @param {Array} animation 
 * @param {Number} lenience The maximum distance values can be considered similar.
 * @returns {Array}
 */
export function optimizeArray(animation: KeyframesAny, lenience: number = 0.1): KeyframesAny {
    let keyframes: Keyframe[] = copy(complexifyArray(animation)).map(x => new Keyframe(x));

    // not enough points to optimize
    if (keyframes.length <= 2) return simplifyArray(keyframes.map(x => x.data) as KeyframesAny);

    // Initialize an array with values of 0
    // TODO: Why keep an array of differences when we don't need it?
    let differences: number[] = [];
    for (let i = 0; i < keyframes[0].values.length; i++) differences[i] = 0;

    // Checks if point a-b have similar keyframe data including time
    for (let i = 1; i < keyframes.length; i++) {
        let left: Keyframe = keyframes[i - 1];
        let point: Keyframe = keyframes[i];

        // While the keyframes may be similar, their easing/spline difference is
        // non-negligible to the animation path and therefore should not be considered for removal
        if (left?.easing !== point.easing) continue;
        if (left?.spline !== point.spline) continue;


        // TODO: instead of comparing left-middle value similarity and middle-right value similarity,
        // compare if middle - left / right is similar to left - right
        // or just compare left-middle instead
        // - Fern
        if (arrEqual(left.values, point.values, lenience)) { checkSplice() }

        // TODO: Make this less complicated
        // If you're already checking if the arrays are similar, 
        // why bother check again ?
        function checkSplice() {
            if (left !== undefined) {
                for (let j = 0; j < differences.length; j++) {
                    differences[j] += point[j] - left[j];
                    if (Math.abs(differences[j]) > lenience) {
                        for (let k = 0; k < differences.length; k++) differences[k] = 0;
                        return;
                    }
                }

                deleteElem();
            }

            function deleteElem() { keyframes.splice(i, 1); i--; }
        }
    }
    return simplifyArray(keyframes.map(x => x.data) as KeyframesAny);
}

/**
 * Specific function for animations, checks if an animation isn't double nested.
 * @param {Object} array 
 * @returns {Boolean}
 */
export function isSimple(array: KeyframesAny) {
    return typeof array[0] !== "object";
}

/**
 * Get the values of an animation at a given time. Accounts for easings and splines!
 * @param {String} property 
 * @param {Array} animation 
 * @param {Time} time 
 * @returns {Array}
 */
export function getValuesAtTime(property: string, animation: KeyframesAny, time: number) {
    animation = complexifyArray(animation);
    let timeInfo = timeInKeyframes(time, animation);
    if (timeInfo.interpolate) {
        if (property === ANIM.ROTATION || property === ANIM.LOCAL_ROTATION) {
            return lerpRotation(timeInfo.l.values as Vec3, timeInfo.r.values as Vec3, timeInfo.normalTime);
        }
        else {
            // TODO: Move this into its own function, this is bad
            if (timeInfo.r.spline === "splineCatmullRom") {
                let p0 = timeInfo.leftIndex - 1 < 0 ? timeInfo.l.values : new Keyframe(animation[timeInfo.leftIndex - 1]).values;
                let p1 = timeInfo.l.values;
                let p2 = timeInfo.r.values;
                let p3 = timeInfo.rightIndex + 1 > animation.length - 1 ? timeInfo.r.values : new Keyframe(animation[timeInfo.rightIndex + 1]).values;

                let t = timeInfo.normalTime;
                let tt = t * t;
                let ttt = tt * t;

                let q0 = -ttt + (2 * tt) - t;
                let q1 = (3 * ttt) - (5 * tt) + 2;
                let q2 = (-3 * ttt) + (4 * tt) + t;
                let q3 = ttt - tt;

                let o0 = arrMul(p0, q0);
                let o1 = arrMul(p1, q1);
                let o2 = arrMul(p2, q2);
                let o3 = arrMul(p3, q3);

                return arrMul(arrAdd(arrAdd(o0, o1), arrAdd(o2, o3)), 0.5);
            }
            else {
                // TODO: Move this into a lerpArray function?
                return timeInfo.l.values.map((x, i) => {
                    return lerp(x, timeInfo.r.values[i], timeInfo.normalTime);
                });
            }
        }
    }
    else return timeInfo.l.values;
}

function timeInKeyframes(time: number, animation: KeyframeArray) {
    let l: Keyframe | undefined;
    let r: Keyframe | undefined;
    let normalTime = 0;

    if (animation.length === 0) return { interpolate: false };

    let first = new Keyframe(animation[0]);
    if (first.time >= time) {
        l = first;
        return { interpolate: false, l: l };
    }

    let last = new Keyframe(arrLast(animation));
    if (last.time <= time) {
        l = last;
        return { interpolate: false, l: l };
    }

    let leftIndex = 0;
    let rightIndex = animation.length;

    while (leftIndex < rightIndex - 1) {
        let m = Math.floor((leftIndex + rightIndex) / 2);
        let pointTime = new Keyframe(animation[m]).time;

        if (pointTime < time) leftIndex = m;
        else rightIndex = m;
    }

    l = new Keyframe(animation[leftIndex]);
    r = new Keyframe(animation[rightIndex]);

    normalTime = findFraction(l.time, r.time - l.time, time);
    normalTime = lerpEasing(r.easing, normalTime);

    return {
        interpolate: true,
        l: l,
        r: r,
        normalTime: normalTime,
        leftIndex: leftIndex,
        rightIndex: rightIndex
    }
}

/**
 * Allows you to combine two animations together as long as atleast one of them has only a single keyframe.
 * @param {Array} anim1 
 * @param {Array} anim2 
 * @param {String} property Property that the animation originated from, important to determine how to combine.
 * @returns {Array}
 */
export function combineAnimations(anim1: KeyframesAny, anim2: KeyframesAny, property: string) {
    let simpleArr = copy(anim1);
    let complexArr = copy(anim2);

    if (isSimple(anim1) && isSimple(anim2)) { complexArr = complexifyArray(anim2) }
    if (!isSimple(anim1) && isSimple(anim2)) {
        simpleArr = anim2;
        complexArr = anim1;
    }
    if (!isSimple(anim1) && !isSimple(anim2)) { console.warn(`[${anim1}] and [${anim2}] are unable to combine!`); }

    let editElem = function (e: number, e2: number) {
        if (property === (ANIM.POSITION || ANIM.LOCAL_POSITION)) e += e2;
        if (property === (ANIM.ROTATION || ANIM.LOCAL_ROTATION)) e = (e + e2) % 360;
        if (property === (ANIM.SCALE)) e *= e2;
        return e;
    }

    for (let j = 0; j < complexArr.length; j++) for (let i = 0; i < simpleArr.length; i++) {
        complexArr[j][i] = editElem(complexArr[j][i], simpleArr[i] as number);
    }
    return complexArr;
}

/**
 * Export keyframes to a point definition.
 * @param {Array} animation 
 * @param {String} name 
 */
export function toPointDef(animation: KeyframesAny, name: string) {
    if (activeDiff.pointDefinitions === undefined) activeDiff.pointDefinitions = [];
    activeDiff.pointDefinitions.push({
        "_name": name,
        "_points": animation
    })
}