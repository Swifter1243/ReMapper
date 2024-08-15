import {BaseLightIterator} from './base_light_iterator.ts'
import {LightID} from '../../types/beatmap/object/environment.ts'
import {doesArrayHave} from "../array/check.ts";
import {complexifyLightIDs, simplifyLightIDs} from "../beatmap/object/environment/light_id.ts";

export class LightIterator extends BaseLightIterator {
    /**
     * Checks if any light IDs on this event are in this range.
     */
    hasIDsInRange(min: number, max: number) {
        this.addCondition((e) => {
            return isInID(e.lightID, min, max)
        })
    }

    /** Checks whether this event uses light IDs or is considered an "all lights" event. */
    usesIDs() {
        return this.addCondition(e => e.lightID !== undefined)
    }

    /**
     * Events will pass if one of their light IDs matches an element in {@link checkID}.
     * @param checkID Input light ID(s).
     */
    checkIDs(checkID: LightID) {
        return this.addCondition((e) => {
            if (e.lightID === undefined) return false

            const checkIDs = complexifyLightIDs(checkID)
            const eventIDs = complexifyLightIDs(e.lightID)
            return eventIDs.some(x => doesArrayHave(checkIDs, x))
        })
    }

    /**
     * Sets the light ID of the event.
     * @param lightID Input light ID(s).
     */
    setIDs(lightID: LightID) {
        this.addProcess((e) => {
            e.lightID = lightID
        })

        const lightOverrider = new BaseLightIterator()
        lightOverrider.conditions = this.conditions
        lightOverrider.processes = this.processes
        return lightOverrider
    }

    /**
     * Adds light IDs to the event.
     * @param lightID Light ID(s) to add.
     * @param initialize Whether to initialize IDs on events that don't have them, or move on.
     */
    appendIDs = (lightID: LightID, initialize = false) =>
        this.addProcess((x) => {
            if (x.lightID === undefined) {
                if (initialize) x.lightID = []
                else return
            }

            const addIDs = complexifyLightIDs(lightID)
            const lightIDs = complexifyLightIDs(x.lightID)
            x.lightID = [...lightIDs, ...addIDs]
        })

    /**
     * Initialize light IDs if event has none.
     * @param lightID Initializing light ID(s).
     */
    initializeIDs = (lightID: LightID) =>
        this.addProcess((x) => {
            if (x.lightID === undefined) x.lightID = lightID
        })

    /**
     * Normalizes a sequence of light IDs to a sequence of: 1, 2, 3, 4, 5... etc.
     * A good explanation of this function can be found here: https://github.com/Swifter1243/ReMapper/wiki/Lighting/#normalizingtransforming
     * @param start Start of the sequence.
     * @param step Differences between light IDs.
     */
    normalizeLinear = (start: number, step: number) =>
        this.addProcess((x) => {
            if (x.lightID !== undefined && typeof x.lightID === 'object') {
                x.lightID = normalizeIDChanges(start, {
                    1: step
                }, x.lightID)
            }
        })

    /**
     * Normalizes a sequence of light IDs to a sequence of: 1, 2, 3, 4, 5... etc.
     * Accounts for "step" changing at different points.
     * A good explanation of this function can be found here: https://github.com/Swifter1243/ReMapper/wiki/Lighting/#normalizingtransforming
     */
    normalizeWithChanges = (start: number, map: Record<number, number>) =>
        this.addProcess((x) => {
            if (x.lightID && typeof x.lightID === 'object') {
                x.lightID = normalizeIDChanges(start, map, x.lightID)
            }
        })

    /** Goes through every light ID in each event and adds an offset to them. */
    shiftIDs = (offset: number) =>
        this.addProcess((e) => {
            if (e.lightID === undefined) return

            if (typeof e.lightID === 'object') {
                e.lightID = e.lightID.map(x => x + offset)
            } else {
                e.lightID += offset
            }
        })

    /**
     * Given a normalized sequence of lightIDs (1, 2, 3, 4, 5), linearly multiplies and adds an offset
     * A good explanation of this function can be found here: https://github.com/Swifter1243/ReMapper/wiki/Lighting/#normalizingtransforming
     * @param offset Add a number to each light ID.
     * @param step Changes the differences between each light ID.
     */
    transformLinear = (offset = 0, step = 1) =>
        this.addProcess((x) => {
            if (x.lightID === undefined) return

            const lightIDs = complexifyLightIDs(x.lightID).map(id => {
                id = (id - 1) * step + 1
                return id + offset
            })
            x.lightID = simplifyLightIDs(lightIDs)
        })

    /**
     * Provide a dictionary of IDs and their corresponding new IDs, and apply it to the IDs of each event.
     * A good explanation of this function can be found here: https://github.com/Swifter1243/ReMapper/wiki/Lighting/#normalizingtransforming
     * */
    remapIDs(map: Record<number, number>) {
        this.addProcess((e) => {
            if (e.lightID === undefined) return

            const lightIDs = complexifyLightIDs(e.lightID).map(id => {
                if (map[id] === undefined) {
                    throw `ID ${id} was not found in the provided map.`
                } else {
                    return map[id]
                }
            })
            e.lightID = simplifyLightIDs(lightIDs)
        })
    }
}

function normalizeIDChanges(start: number, map: Record<number, number>, ids: number[]) {
    let currentRawTime = start

    const changes = Object.entries(map)
        // Build array of objects from dictionary
        .map(([key, value]) => {
            return {
                normalizedTime: parseFloat(key),
                step: value
            }
        })
        // Sort by time
        .sort((a, b) => a.normalizedTime - b.normalizedTime)
        // Accumulate changes and store timestamps
        .map((o, i, arr) => {
            if (i > 0) {
                const last = arr[i - 1]
                const elapsed = o.normalizedTime - last.normalizedTime
                currentRawTime += elapsed * last.step
            }

            return {
                ...o,
                rawTime: currentRawTime
            }
        })

    if (changes.length === 0) {
        return
    }

    return ids.map(id => {
        const lastChange = changes.findLast(change => change.rawTime <= id)

        if (!lastChange) {
            throw `id ${id} was outside of the range of the map provided.`
        }

        id -= lastChange.rawTime
        id /= lastChange.step
        id += lastChange.normalizedTime
        return id
    })
}

function isInID(lightID: LightID | undefined, start: number, end: number) {
    if (lightID === undefined) return false

    if (typeof lightID === 'object') {
        let passed = false
        lightID.forEach((z) => {
            if (z >= start && z <= end) passed = true
        })
        if (passed) return true
    } else {
        return (lightID >= start && lightID <= end)
    }

    return false
}
