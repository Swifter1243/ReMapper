import {TrackValue} from "../../types/animation/track.ts";

export class Track {
    private _value: Set<string>

    constructor(value?: TrackValue) {
        this._value = new Set(Track.complexifyValue(value))
    }

    set value(value: TrackValue | undefined) {
        this._value = new Set(Track.complexifyValue(value))
    }
    get value() {
        if (this._value.size === 0) {
            return undefined
        }
        else if (this._value.size === 1) {
            return [...this._value][0]
        }
        else {
            return [...this._value]
        }
    }

    private static complexifyValue(value: TrackValue | undefined) {
        if (typeof value === 'string') {
            return [value]
        } else {
            return value ?? []
        }
    }

    /**
     * Check if the track contains this value.
     * @param value
     */
    has(value: TrackValue) {
        const other = new Set([value])
        return this._value.intersection(other).size > 0
    }

    /**
     * Add tracks.
     * @param value Can be one track or multiple.
     */
    add(value: TrackValue) {
        const other = Track.complexifyValue(value)
        other.forEach(t => this._value.add(t))
    }

    /**
     * Delete tracks.
     * @param value Can be one track or multiple.
     */
    delete(value: TrackValue) {
        const other = Track.complexifyValue(value)
        other.forEach(t => this._value.delete(t))
    }

    /**
     * Check that each track passes a condition.
     * @param condition Function to run for each track, must return boolean
     */
    some(condition: (track: string) => boolean) {
        return [...this._value].some(condition)
    }

    /** Get the track value as an array. */
    get array() {
        return [...this._value]
    }

    /** Get the track value as a set. */
    set() {
        return this._value
    }
}
