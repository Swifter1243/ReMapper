// deno-lint-ignore-file no-namespace no-explicit-any adjacent-overload-signatures
import { optimizeAnimation, OptimizeSettings } from "./anim_optimizer.ts";
import { activeDiffGet } from "./beatmap.ts";
import { ANIM, EASE, SPLINE } from "./constants.ts";
import { lerpEasing, arrAdd, copy, arrMul, arrLast, findFraction, lerp, Vec3, Vec4, lerpRotation } from "./general.ts";

export type Interpolation = EASE | SPLINE;
export type TimeValue = number;

/// T is the singular point
export type AbstractComplexKeyframeArray<T extends number[]> = [...T, TimeValue, Interpolation?, SPLINE?][] // [[T, time, spline, easing], [T, time, spline, easing]]
export type AbstractRawKeyframeArray<T extends number[]> = AbstractComplexKeyframeArray<T> | T // [T] or [[T, time, spline, easing], [T, time, spline, easing]]
export type AbstractKeyframeArray<T extends number[]> = AbstractRawKeyframeArray<T> | T | string // [T] or [[T, time, spline, easing], [T, time, spline, easing]] or string

export type KeyframesLinear = AbstractKeyframeArray<[number]>
export type ComplexKeyframesLinear = AbstractComplexKeyframeArray<[number]>

export type KeyframesVec3 = AbstractKeyframeArray<Vec3>
export type ComplexKeyframesVec3 = AbstractComplexKeyframeArray<Vec3>;
export type RawKeyframesVec3 = AbstractRawKeyframeArray<Vec3>;

export type KeyframesVec4 = AbstractKeyframeArray<Vec4>;
export type ComplexKeyframesVec4 = AbstractComplexKeyframeArray<Vec4>;
export type RawKeyframesVec4 = AbstractRawKeyframeArray<Vec4>;

export type SingleKeyframe = number[]; // [...]
export type KeyframeValues = (number | (EASE | undefined) | (SPLINE | undefined))[]; // [[...], [...]]
export type KeyframeArray = KeyframeValues[];
export type KeyframesAny = SingleKeyframe | KeyframeArray | string;
export type RawKeyframesAny = SingleKeyframe | KeyframeArray;

export type TrackValue = string | string[];
export namespace AnimationInternals {
    export class BaseAnimation {
        json: Record<string, any> = {};
        length: number;

        constructor(length?: number, data?: Record<string, any>) {
            length ??= 1;

            this.length = length;
            if (data !== undefined) this.json = data;
        }

        /**
         * Clear animation data. Leave blank to completely clear animation.
         */
        clear(property?: string) {
            if (property !== undefined) delete this.json[property];
            else Object.keys(this.json).forEach(x => { delete this.json[x] });
        }

        /**
         * Set a property's animations. Does not edit the value.
         * @param {String} property 
         * @param {*} value 
         */
        set(property: string, value: KeyframesAny, process = true) {
            if (typeof value === "string" || !process) this.json[property] = value;
            else this.json[property] = simplifyArray(this.convert(complexifyArray(value)).sort((a: KeyframeValues, b: KeyframeValues) => new Keyframe(a).time - new Keyframe(b).time))
        }

        /**
         * Get a property's animations.
         * @param {String} property 
         * @param {Number} time Option to get the values of a property at a certain time. Does not account for splines. 
         * Time can be in length of animation or between 0 and 1 if negative.
         * @returns {*}
         */
        get(property: string, time?: number) {
            if (time === undefined || typeof time === "string") return this.json[property];
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
        add(property: string, value: KeyframesAny) {
            if (typeof value === "string") this.json[property] = value;
            else {
                value = this.convert(complexifyArray(value));
                const concatArray = (value as KeyframeArray).concat(complexifyArray(this.json[property]));
                const newValue = simplifyArray(concatArray.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time));
                this.json[property] = newValue;
            }
        }

        /**
         * Remove similar values to cut down on keyframe count.
         * @param {String} property Optimize only a single property, or set to undefined to optimize all.
         * @param {OptimizeSettings} property Options for the optimizer. Optional.
         */
        optimize(property?: string, settings: OptimizeSettings = new OptimizeSettings()) {
            if (property === undefined) {
                Object.keys(this.json).forEach(key => {
                    if (Array.isArray(this.json[key])) {
                        const oldArray = this.get(key);
                        const oldCount = oldArray.length;

                        const print = settings.performance_log;
                        settings.performance_log = false;

                        this.set(key, optimizeAnimation(oldArray, settings));

                        const newCount = this.get(key).length;
                        settings.performance_log = print;
                        if (print && newCount !== oldCount) {
                            console.log(`Optimized ${key} ${oldCount} -> ${newCount} (reduced ${(100 - (newCount / oldCount * 100)).toFixed(2)}%) points`)
                        }
                    }
                })
            }
            else {
                this.set(property, optimizeAnimation(this.get(property), settings));
            }
        }

        private convert(value: KeyframeArray) {
            return value.map(x => {
                const time = new Keyframe(x).timeIndex;
                x[time] = this.convertTime(x[time] as number);
                return x;
            })
        }

        private convertTime(time: number) {
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

        set position(value: KeyframesVec3) { this.set(ANIM.POSITION, value as KeyframesAny) }
        set definitePosition(value: KeyframesVec3) { this.set(ANIM.DEFINITE_POSITION, value as KeyframesAny) }
        set rotation(value: KeyframesVec3) { this.set(ANIM.ROTATION, value as KeyframesAny) }
        set localRotation(value: KeyframesVec3) { this.set(ANIM.LOCAL_ROTATION, value as KeyframesAny) }
        set scale(value: KeyframesVec3) { this.set(ANIM.SCALE, value as KeyframesAny) }
        set dissolve(value: KeyframesLinear) { this.set(ANIM.DISSOLVE, value as KeyframesAny) }
        set color(value: KeyframesVec4) { this.set(ANIM.COLOR, value as KeyframesAny) }
        set interactable(value: KeyframesLinear) { this.set(ANIM.INTERACTABLE, value as KeyframesAny) }
        set time(value: KeyframesLinear) { this.set(ANIM.TIME, value as KeyframesAny) }
    }

    export class NoteAnimation extends ObjectAnimation {
        get dissolveArrow() { return this.get(ANIM.DISSOLVE_ARROW) }
        set dissolveArrow(value: KeyframesLinear) { this.set(ANIM.DISSOLVE_ARROW, value as KeyframesAny) }
    }

    export class WallAnimation extends ObjectAnimation { }

    export class EnvironmentAnimation extends BaseAnimation {
        get position() { return this.get(ANIM.POSITION) }
        get rotation() { return this.get(ANIM.ROTATION) }
        get localPosition() { return this.get(ANIM.LOCAL_POSITION) }
        get localRotation() { return this.get(ANIM.LOCAL_ROTATION) }
        get scale() { return this.get(ANIM.SCALE) }

        set position(value: KeyframesVec3) { this.set(ANIM.POSITION, value as KeyframesAny) }
        set rotation(value: KeyframesVec3) { this.set(ANIM.ROTATION, value as KeyframesAny) }
        set localPosition(value: KeyframesVec3) { this.set(ANIM.LOCAL_POSITION, value as KeyframesAny) }
        set localRotation(value: KeyframesVec3) { this.set(ANIM.LOCAL_ROTATION, value as KeyframesAny) }
        set scale(value: KeyframesVec3) { this.set(ANIM.SCALE, value as KeyframesAny) }
    }

    export class FogAnimation extends BaseAnimation {
        get attenuation() { return this.get(ANIM.ATTENUATION) }
        get offset() { return this.get(ANIM.OFFSET) }
        get startY() { return this.get(ANIM.STARTY) }
        get height() { return this.get(ANIM.HEIGHT) }

        set attenuation(value: KeyframesLinear) { this.set(ANIM.ATTENUATION, value as KeyframesAny) }
        set offset(value: KeyframesLinear) { this.set(ANIM.OFFSET, value as KeyframesAny) }
        set startY(value: KeyframesLinear) { this.set(ANIM.STARTY, value as KeyframesAny) }
        set height(value: KeyframesLinear) { this.set(ANIM.HEIGHT, value as KeyframesAny) }
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

        set position(value: KeyframesVec3) { this.set(ANIM.POSITION, value as KeyframesAny) }
        set localPosition(value: KeyframesVec3) { this.set(ANIM.LOCAL_POSITION, value as KeyframesAny) }
        set definitePosition(value: KeyframesVec3) { this.set(ANIM.DEFINITE_POSITION, value as KeyframesAny) }
        set rotation(value: KeyframesVec3) { this.set(ANIM.ROTATION, value as KeyframesAny) }
        set localRotation(value: KeyframesVec3) { this.set(ANIM.LOCAL_ROTATION, value as KeyframesAny) }
        set scale(value: KeyframesVec3) { this.set(ANIM.SCALE, value as KeyframesAny) }
        set dissolve(value: KeyframesLinear) { this.set(ANIM.DISSOLVE, value as KeyframesAny) }
        set dissolveArrow(value: KeyframesLinear) { this.set(ANIM.DISSOLVE_ARROW, value as KeyframesAny) }
        set color(value: KeyframesVec4) { this.set(ANIM.COLOR, value as KeyframesAny) }
        set interactable(value: KeyframesLinear) { this.set(ANIM.INTERACTABLE, value as KeyframesAny) }
        set time(value: KeyframesLinear) { this.set(ANIM.TIME, value as KeyframesAny) }
        set attenuation(value: KeyframesLinear) { this.set(ANIM.ATTENUATION, value as KeyframesAny) }
        set offset(value: KeyframesLinear) { this.set(ANIM.OFFSET, value as KeyframesAny) }
        set startY(value: KeyframesLinear) { this.set(ANIM.STARTY, value as KeyframesAny) }
        set height(value: KeyframesLinear) { this.set(ANIM.HEIGHT, value as KeyframesAny) }
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
    constructor(length = 1) { super(length) }

    /**
    * Create an animation using JSON.
    * @param {Object} json 
    * @returns {AbstractAnimation}
    */
    import(json: Record<string, any>) { return new AnimationInternals.AbstractAnimation(this.length, json) }

    /**
     * Create an event with no particular identity.
     * @returns {AbstractAnimation};
     */
    abstract(json: Record<string, any> = {}) { return this.import(json) }

    /**
     * State that this animation is for a note.
     * @param {Object} json 
     * @returns 
     */
    noteAnimation(json?: Record<string, any>) { return new AnimationInternals.NoteAnimation(this.length, json) }

    /**
     * State that this animation is for a wall.
     * @param {Object} json 
     * @returns 
     */
    wallAnimation(json?: Record<string, any>) { return new AnimationInternals.WallAnimation(this.length, json) }

    /**
     * State that this animation is for an environment object.
     * @param {Object} json 
     * @returns 
     */
    environmentAnimation(json?: Record<string, any>) { return new AnimationInternals.EnvironmentAnimation(this.length, json) }

    /**
     * State that this animation is for fog.
     * @param {Object} json 
     * @returns 
     */
    fogAnimation(json?: Record<string, any>) { return new AnimationInternals.FogAnimation(this.length, json) }
}

export class Keyframe {
    values: number[] = [];
    timeIndex = 0;
    time = 0;
    easing?: EASE;
    spline?: SPLINE;

    constructor(data: KeyframeValues) {
        this.timeIndex = this.getTimeIndex(data);
        this.time = data[this.timeIndex] as number;
        this.values = this.getValues(data);
        this.easing = this.getEasing(data);
        this.spline = this.getSpline(data);
    }

    private getValues(arr: KeyframeValues): number[] {
        const time = this.getTimeIndex(arr);
        return arr.slice(0, time) as number[];
    }

    private getTimeIndex(arr: KeyframeValues): number {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (typeof arr[i] !== "string") return i;
        }
        return 0;
    }

    private getEasing(arr: KeyframeValues): EASE {
        return arr.filter(x => typeof x === "string" && x.includes("ease"))[0] as EASE;
    }

    private getSpline(arr: KeyframeValues): SPLINE {
        return arr.filter(x => typeof x === "string" && x.includes("spline"))[0] as SPLINE;
    }

    // TODO: Rename this to compile or build?
    get data() {
        const output: (string | number)[] = [...this.values, this.time];
        if (this.easing !== undefined) output.push(this.easing);
        if (this.spline !== undefined) output.push(this.spline);
        return output;
    }
}

type TrackReference = {
    _track: any;
}

export class Track {
    private reference: TrackReference;

    /**
     * Handler for the track property.
     * @param {TrackValue} value 
     */
    constructor(reference: TrackReference) { 
        this.reference = reference;
    }

    private expandArray(array: TrackValue) {
        return typeof array === "string" ? [array] : array;
    }

    private simplifyArray(array: string[]) {
        return array.length === 1 ? array[0] : array;
    }

    set value(value: TrackValue) { this.reference._track = value }
    get value() { return this.reference._track }

    /**
     * Safely check if the track contains this value.
     * @param {String} value 
     * @returns 
     */
    has(value: string) {
        if (!this.value) return false;
        if (typeof this.value === "string") return this.value === value;
        else return this.value.some(x => x === value);
    }

    /**
     * Safely add tracks.
     * @param value
     */
    add(value: TrackValue) {
        if (!this.value) this.value = [];
        const arrValue = this.expandArray(this.value).concat(this.expandArray(value));
        this.value = this.simplifyArray(arrValue);
    }

    /**
     * Remove tracks.
     * @param value 
     */
    remove(value: TrackValue) {
        const removeValues = this.expandArray(value);
        const thisValue = this.expandArray(this.value);
        const removed: Record<number, boolean> = {};

        removeValues.forEach(x => {
            thisValue.forEach((y, i) => {
                if (y === x) removed[i] = true;
            })
        })

        const returnArr = thisValue.filter((_x, i) => !removed[i]);

        if (returnArr.length === 0) {
            delete this.reference._track;
            return
        }
        this.value = this.simplifyArray(returnArr);
    }

    /**
     * Get the track value as an array.
     */
    array() {
        return this.expandArray(this.value);
    }

    /**
     * Check each track with a condition.
     * @param condition Function to run for each track, must return boolean
     */
    check(condition: (track: string) => boolean) {
        let passed = false;

        this.expandArray(this.value).forEach(x => {
            if (condition(x)) passed = true;
        })

        return passed;
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
        const newArr = array[0] as KeyframeValues;
        newArr.pop();
        return newArr as KeyframesAny;
    }
    return array;
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
    const timeInfo = timeInKeyframes(time, animation);
    if (timeInfo.interpolate && timeInfo.r && timeInfo.l) {
        if (property === ANIM.ROTATION || property === ANIM.LOCAL_ROTATION) {
            return lerpRotation(timeInfo.l.values as Vec3, timeInfo.r.values as Vec3, timeInfo.normalTime);
        }
        else {
            // TODO: Move this into its own function, this is bad
            if (timeInfo.r.spline === "splineCatmullRom") {
                const p0 = timeInfo.leftIndex - 1 < 0 ? timeInfo.l.values : new Keyframe(animation[timeInfo.leftIndex - 1]).values;
                const p1 = timeInfo.l.values;
                const p2 = timeInfo.r.values;
                const p3 = timeInfo.rightIndex + 1 > animation.length - 1 ? timeInfo.r.values : new Keyframe(animation[timeInfo.rightIndex + 1]).values;

                const t = timeInfo.normalTime;
                const tt = t * t;
                const ttt = tt * t;

                const q0 = -ttt + (2 * tt) - t;
                const q1 = (3 * ttt) - (5 * tt) + 2;
                const q2 = (-3 * ttt) + (4 * tt) + t;
                const q3 = ttt - tt;

                const o0 = arrMul(p0, q0);
                const o1 = arrMul(p1, q1);
                const o2 = arrMul(p2, q2);
                const o3 = arrMul(p3, q3);

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
    else return (timeInfo.l as Keyframe).values;
}

function timeInKeyframes(time: number, animation: KeyframeArray) {
    let l: Keyframe;
    let normalTime = 0;

    if (animation.length === 0) return { interpolate: false };

    const first = new Keyframe(animation[0]);
    if (first.time >= time) {
        l = first;
        return { interpolate: false, l: l };
    }

    const last = new Keyframe(arrLast(animation));
    if (last.time <= time) {
        l = last;
        return { interpolate: false, l: l };
    }

    let leftIndex = 0;
    let rightIndex = animation.length;

    while (leftIndex < rightIndex - 1) {
        const m = Math.floor((leftIndex + rightIndex) / 2);
        const pointTime = new Keyframe(animation[m]).time;

        if (pointTime < time) leftIndex = m;
        else rightIndex = m;
    }

    l = new Keyframe(animation[leftIndex]);
    // eslint-disable-next-line prefer-const
    const r = new Keyframe(animation[rightIndex]);

    normalTime = findFraction(l.time, r.time - l.time, time);
    if (r.easing) normalTime = lerpEasing(r.easing, normalTime);

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
    let complexArr: KeyframeArray = [];

    if (isSimple(anim1) && isSimple(anim2)) { complexArr = complexifyArray(anim2) }
    else if (!isSimple(anim1) && isSimple(anim2)) {
        simpleArr = copy(anim2);
        complexArr = copy(anim1) as KeyframeArray;
    }
    else if (!isSimple(anim1) && !isSimple(anim2)) {
        console.error(`[${anim1}] and [${anim2}] are unable to combine!`);
    }
    else {
        complexArr = copy(anim2) as KeyframeArray;
    }

    const editElem = function (e: number, e2: number) {
        if (property === (ANIM.POSITION || ANIM.LOCAL_POSITION)) e += e2;
        if (property === (ANIM.ROTATION || ANIM.LOCAL_ROTATION)) e = (e + e2) % 360;
        if (property === (ANIM.SCALE)) e *= e2;
        return e;
    }

    for (let j = 0; j < complexArr.length; j++) for (let i = 0; i < simpleArr.length; i++) {
        complexArr[j][i] = editElem(complexArr[j][i] as number, simpleArr[i] as number);
    }
    return complexArr;
}

/**
 * Export keyframes to a point definition.
 * @param {Array} animation 
 * @param {String} name 
 */
export function toPointDef(animation: KeyframesAny, name: string) {
    if (activeDiffGet().pointDefinitions === undefined) activeDiffGet().pointDefinitions = [];
    activeDiffGet().pointDefinitions.push({
        "_name": name,
        "_points": animation
    })
}

/**
 * Generate keyframes from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param {Object} animation 
 * @param {Function} forKeyframe Runs for each generated keyframe.
 * @param {Number} animFreq The sampling rate of new keyframes.
 * @param {OptimizeSettings} animOptimizer 
 * @returns {Object}
 */
export function bakeAnimation(animation: { pos?: RawKeyframesVec3, rot?: RawKeyframesVec3, scale?: RawKeyframesVec3 },
    forKeyframe?: (transform: { pos: Vec3, rot: Vec3, scale: Vec3, time: number }) => void,
    animFreq?: number, animOptimizer?: OptimizeSettings) {
    animFreq ??= 1 / 32,
    animation.pos ??= [0, 0, 0];
    animation.rot ??= [0, 0, 0];
    animation.scale ??= [1, 1, 1];

    const dataAnim = new Animation().abstract();
    dataAnim.position = copy(animation.pos);
    dataAnim.rotation = copy(animation.rot);
    dataAnim.scale = copy(animation.scale);

    const data = {
        pos: <number[][]>[],
        rot: <number[][]>[],
        scale: <number[][]>[]
    }

    function getDomain(arr: KeyframesAny) {
        let newArr = complexifyArray(arr);
        newArr = newArr.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time);
        let min = 1;
        let max = 0;
        newArr.forEach(x => {
            const time = new Keyframe(x).time;
            if (time < min) min = time;
            if (time > max) max = time;
        })
        return { min: min, max: max };
    }

    const posDomain = getDomain(animation.pos as KeyframesAny);
    const rotDomain = getDomain(animation.rot as KeyframesAny);
    const scaleDomain = getDomain(animation.scale as KeyframesAny);

    const totalMin = getDomain([[posDomain.min], [rotDomain.min], [scaleDomain.min]]).min;
    const totalMax = getDomain([[posDomain.max], [rotDomain.max], [scaleDomain.max]]).max;

    for (let i = totalMin; i <= totalMax; i += animFreq) {
        const keyframe = {
            pos: dataAnim.get(ANIM.POSITION, i),
            rot: dataAnim.get(ANIM.ROTATION, i),
            scale: dataAnim.get(ANIM.SCALE, i),
            time: i
        };

        if (forKeyframe) forKeyframe(keyframe);

        data.pos.push([...keyframe.pos, keyframe.time]);
        data.rot.push([...keyframe.rot, keyframe.time]);
        data.scale.push([...keyframe.scale, keyframe.time]);
    }

    dataAnim.position = data.pos as KeyframesVec3;
    dataAnim.rotation = data.rot as KeyframesVec3;
    dataAnim.scale = data.scale as KeyframesVec3;

    dataAnim.optimize(undefined, animOptimizer);

    return {
        pos: dataAnim.position as RawKeyframesVec3,
        rot: dataAnim.rotation as RawKeyframesVec3,
        scale: dataAnim.scale as RawKeyframesVec3
    };
} 