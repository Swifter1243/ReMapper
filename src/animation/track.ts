import { TrackValue } from '../types/animation.ts'

export class Track {
    /** The value of the track. */
    value?: TrackValue

    constructor(value?: TrackValue) {
        this.value = value
    }

    private expandArray(array?: TrackValue) {
        if (!array) return []

        return typeof array === 'string' ? [array] : array
    }

    private simplifyArray(array?: TrackValue) {
        if (!array || array.length === 0) return undefined

        if (typeof array === 'string') return array

        return array.length === 1 ? array[0] : array
    }

    /**
     * Safely check if the track contains this value.
     * @param value
     */
    has(value: TrackValue) {
        if (!this.value) return false

        if (typeof this.value === 'string') {
            if (typeof value === 'string') {
                return this.value === value
            }
            return value.some((x) => x === this.value)
        }

        if (typeof value === 'string') {
            return this.value.some((x) => x === value)
        }
        return this.value.some((x) => value.some((y) => y === x))
    }

    /**
     * Safely add tracks.
     * @param value Can be one track or multiple.
     */
    add(value: TrackValue) {
        if (!this.value) {
            this.value = this.simplifyArray(value)
            return this
        }

        const arrValue = this.expandArray(this.value).concat(
            this.expandArray(value),
        )
        this.value = this.simplifyArray(arrValue)
        return this
    }

    /**
     * Remove tracks.
     * @param value Can be one track or multiple.
     */
    remove(value: TrackValue) {
        if (!this.value) return

        const removeValues = this.expandArray(value)
        const thisValue = this.expandArray(this.value)
        const removed: Record<number, boolean> = {}

        removeValues.forEach((x) => {
            thisValue.forEach((y, i) => {
                if (y === x) removed[i] = true
            })
        })

        const returnArr = thisValue.filter((_x, i) => !removed[i])

        if (returnArr.length === 0) {
            return
        }
        this.value = this.simplifyArray(returnArr)

        return this
    }

    /** Get the track value as an array. */
    array() {
        return this.expandArray(this.value)
    }

    /**
     * Check that each track passes a condition.
     * @param condition Function to run for each track, must return boolean
     */
    some(condition: (track: string) => boolean) {
        if (!this.value) return false

        return this.expandArray(this.value).some((x) => {
            return condition(x)
        })
    }
}
