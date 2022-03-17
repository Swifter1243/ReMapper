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

export class Rotation {
    json: any = {};

    constructor(beat: number = 0, rotation: number = 0, early: boolean = false) {
        this.beat = beat;
        this.rotation = rotation;
        this.early = early;
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
        activeDiff.rotations.push(copy(this));
        return this;
    }

    get beat(): number { return this.json.b }
    get rotation(): number { return this.json.r }
    get early(): boolean { return this.json.e === 0 }

    set beat(value: number) { this.json.b = value }
    set rotation(value: number) { this.json.r = value }
    set early(value: boolean) { this.json.e = value ? 0 : 1 }
}