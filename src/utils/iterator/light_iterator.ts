import {BaseLightIterator} from './base_light_iterator.ts'

import {LightID} from '../../types/beatmap/object/environment.ts'

import {doesArrayHave} from "../array/check.ts";
import {copy} from "../object/copy.ts";
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
     * @param step Differences between light IDs.
     * @param start Start of the sequence.
     */
    normalizeLinear = (step: number, start = 1) =>
        this.addProcess((x) => {
            if (x.lightID !== undefined && typeof x.lightID === 'object') {
                x.lightID = solveLightMap([[start, step]], x.lightID)
            }
        })

    /**
     * Normalizes a sequence of light IDs to a sequence of: 1, 2, 3, 4, 5... etc.
     * Accounts for differences changing at different points.
     * If the sequence goes: 1, 3, 5, 6, 7, the differences change from 2 to 1 at the third number.
     * So map would look like: [[1, 2], [3, 1]]
     */
    normalizeWithChanges = (map: number[][]) =>
        this.addProcess((x) => {
            if (x.lightID && typeof x.lightID === 'object') {
                x.lightID = solveLightMap(map, x.lightID)
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
     * Given a normalized sequence of lightIDs (1, 2, 3, 4, 5), applies changes at given times
     * @param map Works like map in {@link normalizeWithChanges} but in reverse.
     * @param offset Adds a number to each lightID.
     */
    transformWithChanges = (map: number[][], offset = 0) =>
        this.addProcess((x) => {
            if (x.lightID === undefined) return

            const lightIDs = complexifyLightIDs(x.lightID)
            applyLightMap([offset, ...map], lightIDs)
            x.lightID = simplifyLightIDs(lightIDs)
        })
}

// Made by Rabbit cause I'm too dumb! :)
function solveLightMap(map: number[][], ids: number[]) {
    function solve(output: number, changes: number[][]) {
        let inputMapped = 0

        if (changes.length < 1) {
            return output
        }

        let currentChange, lastChange
        let currentIndex = 0
        while (true) {
            currentChange = changes[currentIndex++]

            const lastInputMapped = inputMapped

            if (!lastChange) { // implicit [0,1]
                inputMapped += currentChange[0]
            } else {
                inputMapped += lastChange[1] *
                    (currentChange[0] - lastChange[0])
            }

            if (inputMapped > output) { // next change is too far out
                if (!lastChange) { // implicit [0,1]
                    return output
                } else {
                    return lastChange[0] +
                        (output - lastInputMapped) / lastChange[1]
                }
            } else if (changes.length - currentIndex < 1) {
                return currentChange[0] +
                    (output - inputMapped) / currentChange[1]
            }

            lastChange = currentChange
        }
    }

    for (let i = 0; i < ids.length; i++) {
        ids[i] = solve(ids[i], map)
    }

    return ids
}

// This too, I cba to add type stuff here cause IDK how it works lol
function applyLightMap(map: (number | number[])[], ids: number[]) {
    map = copy(map)
    const offset = map.splice(0, 1)[0]

    // deno-lint-ignore no-explicit-any
    function apply(input: any, changes: any) {
        let output = 0

        if (changes.length < 1) {
            return input
        }

        let currentChange, lastChange
        let currentIndex = 0

        while (true) {
            currentChange = changes[currentIndex++]

            if (currentChange[0] <= input) { // fill entire previous change
                if (!lastChange) { // implicit [0,1]
                    output += currentChange[0]
                } else {
                    output += lastChange[1] * (currentChange[0] - lastChange[0])
                }
            } else { // next change is too far out
                if (!lastChange) { // implicit [0,1]
                    return input
                } else {
                    output += lastChange[1] * (input - lastChange[0])
                    return output
                }
            }

            if (changes.length - currentIndex < 1) {
                output += currentChange[1] * (input - currentChange[0])
                return output
            }

            lastChange = currentChange
        }
    }

    for (let i = 0; i < ids.length; i++) {
        ids[i] = apply(ids[i], map) + offset
    }
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
