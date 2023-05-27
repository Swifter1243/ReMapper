import {EASE, KeyframeFlag, KeyframeValues, SPLINE} from "../data/types.ts";
import {arrRemove} from "../utils/array_utils.ts";

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
        this.data = data
    }

    /** The index of the time value. */
    get timeIndex() {
        for (let i = this.data.length - 1; i >= 0; i--) {
            if (typeof this.data[i] !== 'string') return i
        }
        return -1
    }

    /** The time value. */
    get time() {
        return this.data[this.timeIndex] as number
    }

    /** The values in the keyframes.
     * For example [x,y,z,time] would have [x,y,z] as values.
     */
    get values() {
        return this.data.slice(0, this.timeIndex) as number[]
    }

    /** The easing in the keyframe. Returns undefined if not found. */
    get easing() {
        return this.data[this.getFlagIndex('ease', false)] as EASE
    }

    /** The spline in the keyframe. Returns undefined if not found. */
    get spline() {
        return this.data[this.getFlagIndex('spline', false)] as SPLINE
    }

    /** Whether this keyframe has the "hsvLerp" flag. */
    get hsvLerp() {
        return this.getFlagIndex('hsvLerp') !== -1
    }

    set time(value: number) {
        this.data[this.timeIndex] = value
    }

    set values(value: number[]) {
        for (let i = 0; i < this.timeIndex; i++) this.data[i] = value[i]
    }

    set easing(value: EASE) {
        this.setFlag(value, 'ease')
    }

    set spline(value: SPLINE) {
        this.setFlag(value, 'spline')
    }

    set hsvLerp(value: boolean) {
        if (value) this.setFlag('hsvLerp')
        else {
            const flagIndex = this.getFlagIndex('hsvLerp')
            if (flagIndex !== -1) arrRemove(this.data, flagIndex)
        }
    }

    /**
     * Set a flag in the keyframe.
     * @param value The flag to be set.
     * @param old An existing flag containing this will be replaced by the value.
     */
    setFlag(value: KeyframeFlag, old?: string) {
        let index = this.getFlagIndex(old ? old : value, old === undefined)
        if (index === -1) index = this.data.length
        this.data[index] = value
    }

    /**
     * Gets the index of a flag.
     * @param flag The flag to look for.
     * @param exact Whether it should be an exact match, or just contain the flag argument.
     */
    getFlagIndex(flag: string, exact = true) {
        if (exact) {
            return this.data.findIndex((x) =>
                typeof x === 'string' && x === flag
            )
        }
        return this.data.findIndex(
            (x) => typeof x === 'string' && x.includes(flag),
        )
    }
}