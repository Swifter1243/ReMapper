import {LightID} from "../../../../types/beatmap/object/environment.ts";
import {generateArray} from "../../../array/generate.ts";

let nextID = 0

/**
 * Get a unique light ID, useful for separating groups of custom lights.
 * @param increment How much to increment the internal unique variable by
 */
export function newUniqueLightID(increment = 1000) {
    nextID += increment
    return nextID
}

/**
 * Fill an array with light IDs from a start value, with "length" entries
 * e.x: (start: 3, length: 4) would make [3, 4, 5, 6]
 */
export function fillLightIDs(start: number, length: number) {
    return generateArray(length, (i) => i + start)
}

/** Transform light IDs (number or number[]) to always be an array of numbers. */
export function complexifyLightIDs(lightID: LightID) {
    if (typeof lightID === 'number') {
        return [lightID]
    } else {
        return lightID
    }
}

/** Try to simplify an array of light IDs to a single number if it contains only one element. */
export function simplifyLightIDs(lightID: number[]): LightID {
    if (lightID.length === 1) {
        return lightID[0]
    } else {
        return lightID
    }
}