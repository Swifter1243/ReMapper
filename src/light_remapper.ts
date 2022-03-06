import { Event, EventInternals } from "./event";
import { activeDiff } from "./beatmap";
import { copy } from "./general";
import { EVENT } from "./constants";

export namespace LightRemapperInternals {
    export class BaseLightRemapper {
        protected startType: EVENT;
        protected endType: EVENT;
        protected range: number[];
        protected startMap: number[] | number[][] | boolean;
        protected endMap: number | number[] | (number | number[])[];
        protected mulColor: number[];

        /**
         * Class mainly focused on remapping lightIDs for events.
         * @param {Number} startType 
         * @param {Number | Array} range Range a lightID needs to fit in, in order to pass
         */
        constructor(startType: EVENT, range: number | number[] = undefined) { this.conditions(startType, range) }

        /**
         * Set the entry conditions for each event.
         * @param {Number} type 
         * @param {Number | Array} range Range a lightID needs to fit in, in order to pass
         * @returns 
         */
        conditions(type: number, range: number | number[]) {
            this.startType = type;
            this.setRange = range;
            return this;
        }

        /**
         * Sets the type of the event.
         * @param {Number} type 
         * @returns 
         */
        setType(type: EVENT) {
            this.endType = type;
            return this;
        }

        /**
         * Multiplies the colors of the event. Applies to gradients too.
         * @param {Number} rgb 
         * @param {Number} alpha 
         * @returns 
         */
        multiplyColor(rgb: number, alpha: number = 1) {
            this.mulColor = [rgb, alpha]
            return this;
        }

        /**
         * Test the algorithm with some lightIDs which will be logged.
         * @param {Array} ids 
         */
        test(ids: number[]) { this.doProcess(ids) }

        /**
         * Run the algorithm.
         * @param {Boolean} log Log the output JSON of each event.
         * @param {Function} forLights Lambda function for each event.
         */
        run(log: boolean = undefined, forLights: (event: EventInternals.AbstractEvent) => void = undefined) {
            log ??= false;
            this.doProcess(log, forLights);
        }

        protected set setRange(value: number | number[]) { this.range = typeof value === "number" ? [value, value] : value }

        protected doProcess(test: number[] | boolean, forLights: (event: EventInternals.AbstractEvent) => void = undefined) {
            let array: EventInternals.AbstractEvent[] = [];
            if (typeof test === "boolean") array = activeDiff.events;
            else {
                test.forEach(x => {
                    let event = new Event().abstract();
                    event.lightID = x;
                    event.type = this.startType;
                    array.push(event);
                })
            }
            let startIDs = [];
            let endIDs = [];

            array.forEach(event => {
                let isInRange = event.lightID !== undefined;
                if (this.range !== undefined && isInRange) isInRange = isInID(event.lightID, this.range[0], this.range[1]);

                if (event.type === this.startType && isInRange) {
                    algorithm(this);
                    if (forLights !== undefined) forLights(event);
                    if (typeof test === "object") endIDs.push(event.lightID);
                    else if (test) console.log(event.json)
                }

                function algorithm(thisKey) {
                    if (typeof test === "object") startIDs.push(event.lightID);

                    if (thisKey.endType !== undefined) event.type = thisKey.endType;

                    if (thisKey.mulColor !== undefined) {
                        function mulColor(color) {
                            color[0] *= thisKey.mulColor[0];
                            color[1] *= thisKey.mulColor[0];
                            color[2] *= thisKey.mulColor[0];
                            if (thisKey.mulColor[1] && color[3]) color[3] *= thisKey.mulColor[1];
                        }

                        if (event.color) mulColor(event.color);
                        if (event.startColor) mulColor(event.startColor);
                        if (event.endColor) mulColor(event.endColor);
                    }

                    let ids: number[] = typeof event.lightID === "number" ? [event.lightID] : event.lightID;
                    let start = 1;

                    if (typeof thisKey.startMap === "object" && typeof thisKey.startMap[0] === "object") {
                        ids = solveLightMap(thisKey.startMap as number[][], ids);
                        start = thisKey.startMap[0][0];
                    }
                    else if (typeof thisKey.startMap === "object") {
                        ids = ids.map(x => (x - (thisKey.startMap[0] as number)) / (thisKey.startMap[1] as number) + 1);
                        start = thisKey.startMap[0] as number;
                    }
                    else if (typeof thisKey.startMap === "boolean") {
                        event.lightID = thisKey.endMap as number | number[];
                        return;
                    }

                    if (typeof thisKey.endMap === "object" && typeof thisKey.endMap[1] === "object") { applyLightMap(thisKey.endMap as number[][], ids) }
                    else if (typeof thisKey.endMap === "object") ids = ids.map(x => (x - start) * (thisKey.endMap[1] as number) + start + (thisKey.endMap[0] as number));
                    else if (thisKey.endMap !== undefined) ids = ids.map(x => x + thisKey.endMap as number);

                    event.lightID = ids.length === 1 ? ids[0] : ids;
                }
            })

            if (typeof test === "object") console.log(`startIDs: ${startIDs}\nendIDs: ${endIDs}`);
        }
    }

    export class LightOverrider extends BaseLightRemapper {
        constructor(startType: number, endType: number, range: number[], lightID: number | number[], mulColor: number[]) {
            super(startType, range);
            this.endType = endType;
            this.startMap = false;
            this.endMap = lightID;
            this.mulColor = mulColor;
        }
    }
}

export class LightRemapper extends LightRemapperInternals.BaseLightRemapper {
    /**
     * Sets the lightID of the event.
     * Removes some (now redundant) functions.
     * @param {Number | Array} lightID 
     * @returns 
     */
    setLightID(lightID: number | number[]) { return new LightRemapperInternals.LightOverrider(this.startType, this.endType, this.range, lightID, this.mulColor); }

    /**
     * Normalizes a sequence of lightIDs to a sequence of: 1, 2, 3, 4, 5... etc.
     * @param {Number} start Start of the sequence.
     * @param {Number} step Differences between lightIDs.
     * @returns 
     */
    normalizeLinear(start: number, step: number) {
        this.startMap = [start, step];
        return this;
    }

    /**
     * Normalizes a sequence of lightIDs to a sequence of: 1, 2, 3, 4, 5... etc.
     * Accounts for differences changing at different points.
     * @param {Array} map [[start, step], [start, step]...]
     * 
     * start - The point at which the differences change.
     * 
     * step - The new differences.
     * 
     * If the sequence goes: 1, 3, 5, 6, 7, the differences change from 2 to 1 at the third number.
     * So map would look like: [[1, 2], [3, 1]]
     * @returns 
     */
    normalizeWithChanges(map: number[][]) {
        this.startMap = map;
        return this;
    }

    /**
     * Effects the ending sequence of lightIDs.
     * @param {Number} offset Add a number to each lightID.
     * @param {Number} step Changes the differences between each lightID.
     * @returns 
     */
    addToEnd(offset: number, step: number = undefined) {
        if (step === undefined) this.endMap = offset;
        else this.endMap = [offset, step];
        return this;
    }

    /**
     * Remap lightIDs assuming the output is a sequence of 1, 2, 3, 4, 5...
     * @param {Array} map Works like map in normalizeWithChanges() but in reverse.
     * @param {Number} offset Adds a number to each lightID.
     * @returns 
     */
    remapEnd(map: number[][], offset: number = 0) {
        this.endMap = [offset, ...map];
        return this;
    }
}

// Made by Rabbit cause I'm too dumb! :)
function solveLightMap(map: number[][], ids: number[]) {
    for (let i = 0; i < ids.length; i++) {
        ids[i] = solve(ids[i], map);

        function solve(output, changes) {
            let inputMapped = 0

            if (changes.length < 1) {
                return output
            }

            let currentChange, lastChange
            let currentIndex = 0
            while (true) {
                currentChange = changes[currentIndex++]

                let lastInputMapped = inputMapped

                if (!lastChange) { // implicit [0,1]
                    inputMapped += currentChange[0]
                } else {
                    inputMapped += lastChange[1] * (currentChange[0] - lastChange[0])
                }

                if (inputMapped > output) { // next change is too far out
                    if (!lastChange) { // implicit [0,1]
                        return output
                    } else {
                        return lastChange[0] + (output - lastInputMapped) / lastChange[1]
                    }
                } else if (changes.length - currentIndex < 1) {
                    return currentChange[0] + (output - inputMapped) / currentChange[1]
                }

                lastChange = currentChange
            }
        }
    }

    return ids;
}

// This too
function applyLightMap(map: (number | number[])[], ids: number[]) {
    map = copy(map);
    let offset = map.splice(0, 1)[0];

    for (let i = 0; i < ids.length; i++) {
        ids[i] = apply(ids[i], map) + offset;

        function apply(input, changes) {
            let output = 0;

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
    }
}

function isInID(lightID: number | number[], start: number, end: number) {
    if (lightID === undefined) return false;
    if (typeof lightID === "object") {
        let passed = false;
        lightID.forEach(z => {
            if (z >= start && z <= end) passed = true;
        })
        if (passed) return true;
    }
    else if (lightID >= start && lightID <= end) return true;
    return false;
}