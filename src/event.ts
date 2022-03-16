import { activeDiff, info } from "./beatmap";
import { copy } from "./general";

export class BPMChange {
    json: any = {};

    constructor(beat: number = 0, BPM: number = info.BPM) {
        this.beat = beat;
        this.BPM = BPM;
    }

    /**
     * Create a BPM change using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json) {
        this.json = json;
        return this;
    }

    /**
     * Push this BPM change to the difficulty
     */
    push() {
        activeDiff.BPMChanges.push(copy(this));
        return this;
    }

    get beat(): number { return this.json.b }
    get BPM(): number { return this.json.m }

    set beat(value: number) { this.json.b = value }
    set BPM(value: number) { this.json.m = value }
}