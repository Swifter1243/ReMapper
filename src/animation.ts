// deno-lint-ignore-file no-namespace adjacent-overload-signatures no-explicit-any
import { optimizeAnimation, OptimizeSettings } from "./anim_optimizer.ts";
import { Json } from "./beatmap.ts";
import { Color, lerpColor } from "./color.ts";
import { ANIM, EASE, SPLINE } from "./constants.ts";
import { lerpEasing, arrAdd, copy, arrMul, arrLast, findFraction, Vec3, Vec4, lerpRotation, arrLerp } from "./general.ts";

/** Any flag that could be in a keyframe. E.g. easings, splines */
export type KeyframeFlag = Interpolation | "hsvLerp";
/** Easings and splines. */
export type Interpolation = EASE | SPLINE;
/** Time value in a keyframe. */
export type TimeValue = number;

/** Helper type for complex keyframes. */
export type AbstractComplexKeyframeArray<T extends number[]> = [...T, TimeValue, Interpolation?, SPLINE?][]
/** Helper type for raw keyframes. */
export type AbstractRawKeyframeArray<T extends number[]> = AbstractComplexKeyframeArray<T> | T
/** Helper type for keyframe arrays. */
export type AbstractKeyframeArray<T extends number[]> = AbstractRawKeyframeArray<T> | T | string

/** Keyframe or array of keyframes with 1 value. [[x, time]...] or [x] */
export type KeyframesLinear = AbstractKeyframeArray<[number]>
/** Array of keyframes with 1 value. [[x, time]...] */
export type ComplexKeyframesLinear = AbstractComplexKeyframeArray<[number]>

/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type KeyframesVec3 = AbstractKeyframeArray<Vec3>
/** Keyframe or array of keyframes with 3 values.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type ComplexKeyframesVec3 = AbstractComplexKeyframeArray<Vec3>;
/** Array of keyframes with 3 values. [[x,y,z,time]...] */
export type RawKeyframesVec3 = AbstractRawKeyframeArray<Vec3>;

/** Keyframe or array of keyframes with 4 values. Allows "hsvLerp".
 * [[r,g,b,a,time]...] or [r,g,b,a]
 */
export type ComplexKeyframesColor = [...Vec4, number, KeyframeFlag?, KeyframeFlag?, KeyframeFlag?][]
/** Keyframe or array of keyframes with 4 values. Allows "hsvLerp" and point definitions.
 * [[r,g,b,a,time]...] or [r,g,b,a]
 */
export type KeyframesColor = ComplexKeyframesColor | Vec4 | string
/** Array of keyframes with 4 values. [[r,g,b,a,time]...] */
export type RawKeyframesColor = ComplexKeyframesColor | Vec4

/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type KeyframesVec4 = AbstractKeyframeArray<Vec4>;
/** Keyframe or array of keyframes with 4 values.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type ComplexKeyframesVec4 = AbstractComplexKeyframeArray<Vec4>;
/** Array of keyframes with 4 values. [[x,y,z,w,time]...] */
export type RawKeyframesVec4 = AbstractRawKeyframeArray<Vec4>;

/** Keyframe which isn't in an array with other keyframes, has any amount of values. */
export type SingleKeyframe = number[];
/** Keyframe which is in an array with other keyframes, has any amount of values. */
export type KeyframeValues = (number | (KeyframeFlag | undefined))[];
/** Array of keyframes which have any amount of values. */
export type KeyframeArray = KeyframeValues[];
/** Keyframe or array of keyframes with any amount of values. Allows point definitions. */
export type KeyframesAny = SingleKeyframe | KeyframeArray | string;
/** Keyframe or array of keyframes with any amount of values. */
export type RawKeyframesAny = SingleKeyframe | KeyframeArray;

/** A track or multiple tracks. */
export type TrackValue = string | string[];

/** Contains subclasses for animation related classes. */
export namespace AnimationInternals {
    /** Bare minimum animation class. */
    export class BaseAnimation {
        /** The JSON data of this animation. */
        json: Json = {};
        /** 
         * The time in each keyframe is divided by the length.
         * Use a negative number or don't specify a length to use a range between 0 and 1.
         */
        length: number;

        constructor(length?: number, data?: Json) {
            length ??= 1;

            this.length = length;
            if (data !== undefined) this.json = data;
        }

        /**
         * Clear animation data.
         * @param property The property to clear. 
         * Leave undefined to clear everything in this animation.
         */
        clear(property?: string) {
            if (property !== undefined) delete this.json[property];
            else Object.keys(this.json).forEach(x => { delete this.json[x] });
        }

        /**
         * Set a property's animations.
         * @param property The property to set.
         * @param value The value of the property.
         * @param process Whether the value should be processed. E.g. sort by time.
         */
        set(property: ANIM, value: KeyframesAny, process = true) {
            if (typeof value === "string" || !process) this.json[property] = value;
            else this.json[property] = simplifyArray(this.convert(complexifyArray(value)).sort((a: KeyframeValues, b: KeyframeValues) => new Keyframe(a).time - new Keyframe(b).time))
        }

        /**
         * Get a property's animations.
         * @param property The property to get.
         * @param time Option to get the values of a property at a certain time.
         * Time can be in length of animation or between 0 and 1 if negative.
         * Can be left undefined.
         */
        get(property: ANIM, time?: number) {
            if (time === undefined || typeof time === "string") return this.json[property];
            else {
                time = this.convertTime(time);
                return getValuesAtTime(property, this.json[property], time);
            }
        }

        /**
         * Add keyframes to a property, also sorts by time and makes optimizations if possible.
         * @param property The property to add to.
         * @param value What keyframes to add. 
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
         * @param property Optimize only a single property, or set to undefined to optimize all.
         * @param settings Options for the optimizer. Optional.
         */
        optimize(property?: ANIM, settings: OptimizeSettings = new OptimizeSettings()) {
            if (property === undefined) {
                (Object.keys(this.json) as ANIM[]).forEach(key => {
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
        /** Adds to the position of the object. */
        get position() { return this.get("offsetPosition") }
        /** Sets the absolute position of the object. */
        get definitePosition() { return this.get("definitePosition") }
        /** Rotates the object around the world origin. */
        get rotation() { return this.get("offsetWorldRotation") }
        /** Rotates the object around it's anchor point. */
        get localRotation() { return this.get("localRotation") }
        /** Scales the object. */
        get scale() { return this.get("scale") }
        /** Controls the dissolve shader on the object.
         * 0 means invisible, 1 means visible.
         */
        get dissolve() { return this.get("dissolve") }
        /** Controls the color of the object. */
        get color() { return this.get("color") }
        /** Controls whether the object is interactable.
         * 0 = interactable, 1 means uninteractable.
         */
        get uninteractable() { return this.get("uninteractable") }
        /** Controls the time value for other animations. */
        get time() { return this.get("time") }

        set position(value: KeyframesVec3) { this.set("offsetPosition", value as KeyframesAny) }
        set definitePosition(value: KeyframesVec3) { this.set("definitePosition", value as KeyframesAny) }
        set rotation(value: KeyframesVec3) { this.set("offsetWorldRotation", value as KeyframesAny) }
        set localRotation(value: KeyframesVec3) { this.set("localRotation", value as KeyframesAny) }
        set scale(value: KeyframesVec3) { this.set("scale", value as KeyframesAny) }
        set dissolve(value: KeyframesLinear) { this.set("dissolve", value as KeyframesAny) }
        set color(value: KeyframesColor) { this.set("color", value as KeyframesAny) }
        set uninteractable(value: KeyframesLinear) { this.set("uninteractable", value as KeyframesAny) }
        set time(value: KeyframesLinear) { this.set("time", value as KeyframesAny) }
    }

    /** Animation specifically for note objects. */
    export class NoteAnimation extends ObjectAnimation {
        /** Controls the dissolve shader on the arrow.
         * 0 means invisible, 1 means visible.
         */
        get dissolveArrow() { return this.get("dissolveArrow") }
        set dissolveArrow(value: KeyframesLinear) { this.set("dissolveArrow", value as KeyframesAny) }
    }

    /** Animation specifically for wall objects. */
    export class WallAnimation extends ObjectAnimation { }

    /** Animation specifically for environment objects. */
    export class EnvironmentAnimation extends BaseAnimation {
        /** The position of the object in world space. */
        get position() { return this.get("position") }
        /** The rotation of the object in world space. */
        get rotation() { return this.get("rotation") }
        /** The position of the object relative to it's parent. */
        get localPosition() { return this.get("localPosition") }
        /** The rotation of the object relative to it's parent. */
        get localRotation() { return this.get("localRotation") }
        /** The scale of the object. */
        get scale() { return this.get("scale") }

        set position(value: KeyframesVec3) { this.set("position", value as KeyframesAny) }
        set rotation(value: KeyframesVec3) { this.set("rotation", value as KeyframesAny) }
        set localPosition(value: KeyframesVec3) { this.set("localPosition", value as KeyframesAny) }
        set localRotation(value: KeyframesVec3) { this.set("localRotation", value as KeyframesAny) }
        set scale(value: KeyframesVec3) { this.set("scale", value as KeyframesAny) }
    }

    /** Animation that can apply to any object. */
    export class AbstractAnimation extends BaseAnimation {
        /** The position of the object in world space. For environment objects. */
        get position() { return this.get("position") }
        /** The rotation of the object in world space. For environment objects. */
        get rotation() { return this.get("rotation") }
        /** The position of the object relative to it's parent. For environment objects. */
        get localPosition() { return this.get("localPosition") }
        /** The rotation of the object relative to it's parent. For environment objects. */
        get localRotation() { return this.get("localRotation") }
        /** Adds to the position of the object. For gameplay objects. */
        get offsetPosition() { return this.get("offsetPosition") }
        /** Adds to the rotation of the object. For gameplay objects.  */
        get offsetRotation() { return this.get("offsetWorldRotation") }
        /** Sets the absolute position of the object. For gameplay objects. */
        get definitePosition() { return this.get("definitePosition") }
        /** Sets the scale of the object. */
        get scale() { return this.get("scale") }
        /** Controls the dissolve shader on the object.
         * 0 means invisible, 1 means visible.
         * For gameplay objects.
         */
        get dissolve() { return this.get("dissolve") }
        /** Controls the dissolve shader on the object.
         * 0 means invisible, 1 means visible.
         * For note objects.
         */
        get dissolveArrow() { return this.get("dissolveArrow") }
        /** Controls the color of the object. */
        get color() { return this.get("color") }
        /** Controls whether the object is interactable.
         * 0 = interactable, 1 means uninteractable.
         */
        get uninteractable() { return this.get("uninteractable") }
        /** Controls the time value for other animations. */
        get time() { return this.get("time") }

        set position(value: KeyframesVec3) { this.set("position", value as KeyframesAny) }
        set rotation(value: KeyframesVec3) { this.set("rotation", value as KeyframesAny) }
        set localPosition(value: KeyframesVec3) { this.set("localPosition", value as KeyframesAny) }
        set localRotation(value: KeyframesVec3) { this.set("localRotation", value as KeyframesAny) }
        set offsetPosition(value: KeyframesVec3) { this.set("offsetPosition", value as KeyframesAny) }
        set offsetRotation(value: KeyframesVec3) { this.set("offsetWorldRotation", value as KeyframesAny) }
        set definitePosition(value: KeyframesVec3) { this.set("definitePosition", value as KeyframesAny) }
        set scale(value: KeyframesVec3) { this.set("scale", value as KeyframesAny) }
        set dissolve(value: KeyframesLinear) { this.set("dissolve", value as KeyframesAny) }
        set dissolveArrow(value: KeyframesLinear) { this.set("dissolveArrow", value as KeyframesAny) }
        set color(value: KeyframesColor) { this.set("color", value as KeyframesAny) }
        set uninteractable(value: KeyframesLinear) { this.set("uninteractable", value as KeyframesAny) }
        set time(value: KeyframesLinear) { this.set("time", value as KeyframesAny) }
    }
}

export class Animation extends AnimationInternals.BaseAnimation {
    /**
    * Noodle animation manager.
    * @param length The time in each keyframe is divided by the length.
    * Use a negative number or don't specify a length to use a range between 0 and 1.
    */
    constructor(length = 1) { super(length) }

    /**
    * Create an animation using JSON.
    * @param json The json to create the animation with.
    */
    import(json: Json) { return new AnimationInternals.AbstractAnimation(this.length, json) }

    /**
     * Create an animation that can animate any object.
     * @param json The json to create the animation with.
     */
    abstract(json: Json = {}) { return this.import(json) }

    /**
     * State that this animation is for a note.
     * @param json The json to create the animation with.
     */
    noteAnimation(json?: Json) { return new AnimationInternals.NoteAnimation(this.length, json) }

    /**
     * State that this animation is for a wall.
     * @param json The json to create the animation with.
     */
    wallAnimation(json?: Json) { return new AnimationInternals.WallAnimation(this.length, json) }

    /**
     * State that this animation is for an environment object.
     * @param json The json to create the animation with.
     */
    environmentAnimation(json?: Json) { return new AnimationInternals.EnvironmentAnimation(this.length, json) }
}

export class Keyframe {
    /** The data stored in this keyframe. */
    data: KeyframeValues

    /**
     * Interface for keyframes in animations.
     * A keyframe looks something like [x,y,z,time,easing].
     * It is separated into values (x,y,z), time, and flags (easings, splines.. etc).
     * Anything that is a string is considered a flag.
     * A keyframe can have any amount of values.
     * @param data The data stored in this keyframe.
     */
    constructor(data: KeyframeValues) {
        this.data = data;
    }

    /** The index of the time value. */
    get timeIndex() {
        for (let i = this.data.length - 1; i >= 0; i--)
            if (typeof this.data[i] !== "string") return i;
        return -1;
    }

    /** The time value. */
    get time() { return this.data[this.timeIndex] as number }
    /** The values in the keyframes.
     * For example [x,y,z,time] would have [x,y,z] as values.
     */
    get values() { return this.data.slice(0, this.timeIndex) as number[] }
    /** The easing in the keyframe. Returns undefined if not found. */
    get easing() { return this.data[this.getFlagIndex("ease", false)] as EASE }
    /** The spline in the keyframe. Returns undefined if not found. */
    get spline() { return this.data[this.getFlagIndex("spline", false)] as SPLINE }
    /** Whether this keyframe has the "hsvLerp" flag. */
    get hsvLerp() { return this.getFlagIndex("hsvLerp") !== -1 }

    set time(value: number) { this.data[this.timeIndex] = value }
    set values(value: number[]) { for (let i = 0; i < this.timeIndex; i++) this.data[i] = value[i] }
    set easing(value: EASE) { this.setFlag(value, "ease") }
    set spline(value: SPLINE) { this.setFlag(value, "ease") }
    set hsvLerp(value: boolean) {
        if (value) this.setFlag("hsvLerp")
        else {
            const flagIndex = this.getFlagIndex("hsvLerp");
            if (flagIndex !== -1) this.data.splice(flagIndex, 1);
        }
    }

    /**
     * Set a flag in the keyframe.
     * @param value The flag to be set.
     * @param old An existing flag containing this will be replaced by the value.
     */
    setFlag(value: string, old?: string) {
        let index = this.getFlagIndex(old ? old : value, old !== undefined);
        if (index === -1) index = this.data.length;
        this.data[index] = value as any;
    }

    /**
     * Gets the index of a flag.
     * @param flag The flag to look for.
     * @param exact Whether it should be an exact match, or just contain the flag argument.
     */
    getFlagIndex(flag: string, exact = true) {
        if (exact) return this.data.findIndex(x => typeof x === "string" && x === flag);
        return this.data.findIndex(x => typeof x === "string" && x.includes(flag));
    }
}

export class Track {
    private reference: Json;

    /**
     * Handler for the track property.
     * @param reference The object that contains the "track" key. 
     */
    constructor(reference: Json) {
        this.reference = reference;
    }

    private expandArray(array: TrackValue) {
        return typeof array === "string" ? [array] : array;
    }

    private simplifyArray(array: string[]) {
        return array.length === 1 ? array[0] : array;
    }

    /** The value of the track. */
    set value(value: TrackValue) { this.reference.track = value }
    get value() { return this.reference.track }

    /**
     * Safely check if the track contains this value.
     * @param value
     */
    has(value: string) {
        if (!this.value) return false;
        if (typeof this.value === "string") return this.value === value;
        else return this.value.some(x => x === value);
    }

    /**
     * Safely add tracks.
     * @param value Can be one track or multiple.
     */
    add(value: TrackValue) {
        if (!this.value) this.value = [];
        const arrValue = this.expandArray(this.value).concat(this.expandArray(value));
        this.value = this.simplifyArray(arrValue);
    }

    /**
     * Remove tracks.
     * @param value Can be one track or multiple.
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
            delete this.reference.track;
            return
        }
        this.value = this.simplifyArray(returnArr);
    }

    /** Get the track value as an array. */
    get array() { return this.expandArray(this.value) }

    /**
     * Check that each track passes a condition.
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
 * Ensures that this value is in the format of an array of keyframes.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The keyframe or array of keyframes.
 */
 export function complexifyArray(array: KeyframesAny) {
    if (array === undefined) return [];
    if (!isSimple(array)) return array as KeyframeArray;
    return [[...array, 0]] as KeyframeArray;
}

/**
 * If possible, isolate an array of keyframes with one keyframe.
 * For example if you input [[x,y,z,0]], it would be converted to [x,y,z].
 * @param array The array of keyframes.
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
 * Checks if value is an array of keyframes.
 * @param array The keyframe or array of keyframes.
 */
export const isSimple = (array: KeyframesAny) => typeof array[0] !== "object";

/**
 * Get the value of keyframes at a given time.
 * @param property The property this animation came from.
 * @param animation The keyframes.
 * @param time The time to get the value at.
 */
export function getValuesAtTime(property: ANIM, animation: KeyframesAny, time: number) {
    animation = complexifyArray(animation);
    const timeInfo = timeInKeyframes(time, animation);
    if (timeInfo.interpolate && timeInfo.r && timeInfo.l) {
        if (property === "rotation" || property === "localRotation" || property === "offsetWorldRotation")
            return lerpRotation(timeInfo.l.values as Vec3, timeInfo.r.values as Vec3, timeInfo.normalTime);
        if (property === "color" && timeInfo.r.hsvLerp) {
            const color1 = new Color(timeInfo.l.values as Vec4, "RGB");
            const color2 = new Color(timeInfo.r.values as Vec4, "RGB");
            const lerp = lerpColor(color1, color2, timeInfo.normalTime, undefined, "HSV");
            return lerp.export();
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
            else return arrLerp(timeInfo.l.values, timeInfo.r.values, timeInfo.normalTime);
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
 * Allows you to combine two animations together. 
 * Atleast one of them must have only a single keyframe.
 * @param anim1 The first animation.
 * @param anim2 The second animation.
 * @param property The property that this animation came from.
 */
export function combineAnimations(anim1: KeyframesAny, anim2: KeyframesAny, property: ANIM) {
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
        if (
            property === "position" ||
            property === "localPosition" ||
            property === "definitePosition" ||
            property === "offsetPosition"
        ) e += e2;
        if (
            property === "rotation" ||
            property === "localRotation" ||
            property === "offsetWorldRotation"
        ) e = (e + e2) % 360;
        if (property === "scale") e *= e2;
        return e;
    }

    for (let j = 0; j < complexArr.length; j++) for (let i = 0; i < simpleArr.length; i++) {
        complexArr[j][i] = editElem(complexArr[j][i] as number, simpleArr[i] as number);
    }
    return complexArr;
}

/**
 * Generate keyframes from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param animation The keyframes for various transforms.
 * @param forKeyframe Runs for each generated keyframe.
 * @param animFreq The sampling rate of new keyframes.
 * @param animOptimizer The optional optimizer for the keyframes.
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
            pos: dataAnim.get("position", i),
            rot: dataAnim.get("rotation", i),
            scale: dataAnim.get("scale", i),
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