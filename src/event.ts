// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { activeDiff, info } from "./beatmap.ts";
import { copy } from "./general.ts";

export class BPMChange {
    json: Record<string, any> = {};

    constructor(beat: number = 0, BPM: number = info.BPM) {
        this.beat = beat;
        this.BPM = BPM;
    }

    /**
     * Create a BPM change using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json: Record<number, any>) {
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

    get beat() { return this.json.b }
    get BPM() { return this.json.m }

    set beat(value: number) { this.json.b = value }
    set BPM(value: number) { this.json.m = value }
}

export class RotationEvent {
    json: Record<string, any> = {};

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
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    /**
     * Push this BPM change to the difficulty
     */
    push() {
        activeDiff.rotationEvents.push(copy(this));
        return this;
    }

    get beat(): number { return this.json.b }
    get rotation(): number { return this.json.r }
    get early(): boolean { return this.json.e === 0 }

    set beat(value: number) { this.json.b = value }
    set rotation(value: number) { this.json.r = value }
    set early(value: boolean) { this.json.e = value ? 0 : 1 }
}