// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { activeDiff, info } from "./beatmap.ts";
import { DISTTYPE, FILTERTYPE, LIGHTCOLOR, TRANSITIONTYPE } from "./constants.ts";
import { copy } from "./general.ts";
import { BaseObject } from "./object.ts";

export class BPMChange extends BaseObject {
    constructor(beat: number = 0, BPM: number = info.BPM) {
        super();
        this.time = beat;
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

    get BPM() { return this.json.m }

    set BPM(value: number) { this.json.m = value }
}

export class RotationEvent extends BaseObject {
    constructor(beat: number = 0, rotation: number = 0, early: boolean = false) {
        super();
        this.time = beat;
        this.rotation = rotation;
        this.early = early;
    }

    /**
     * Create a rotation event using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    /**
     * Push this rotation event to the difficulty
     */
    push() {
        activeDiff.rotationEvents.push(copy(this));
        return this;
    }

    get rotation() { return this.json.r }
    get early() { return this.json.e === 0 }

    set rotation(value: number) { this.json.r = value }
    set early(value: boolean) { this.json.e = value ? 0 : 1 }
}

export class BoostEvent extends BaseObject {
    constructor(beat = 0, on = false) {
        super();
        this.time = beat;
        this.on = on;
    }

    /**
     * Create a boost event using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    /**
     * Push this boost event to the difficulty
     */
    push() {
        activeDiff.boostEvents.push(copy(this));
        return this;
    }

    get on() { return this.json.o }

    set on(value: boolean) { this.json.o = value }
}

export class LightEventBox extends BaseObject {
    json: Record<string, any> = {
        b: 0,
        g: 0,
        e: []
    }

    constructor(beat = 0, group = 0) {
        super();
        this.time = beat;
        this.group = group;
    }

    /**
     * Create a boost event using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    /**
     * Push this boost event to the difficulty
     */
    push() {
        activeDiff.lightEventBoxes.push(copy(this));
        return this;
    }

    get group() { return this.json.g }
    get boxGroups() { return this.json.e }

    set group(value: number) { this.json.g = value }
    set boxGroups(value: LightEventBoxGroup[]) { this.json.g = value }
}

interface LightEventFilter {
    f: number,
    p: number,
    t: number,
    r: number
}

export class LightEventBoxGroup {
    json: Record<string, any> = {
        f: {
            f: 1,
            p: 0,
            t: 0,
            r: 0
        },
        w: 1,
        d: 1,
        r: 1,
        t: 1,
        b: 1,
        e: []
    }

    /**
    * Create a light event box group using JSON.
    * @param {Object} json 
    * @returns {Note}
    */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    push = (array: LightEventBoxGroup[]) => array.push(copy(this));

    get filter() { return this.json.f }
    get filterType() { return this.json.f.f }
    get filterParam0() { return this.json.f.p }
    get filterParam1() { return this.json.f.t }
    get filterReverse() { return this.json.f.r === 1 }
    get beatDistribution() { return this.json.w }
    get beatDistributionType() { return this.json.d }
    get brightnessDistribution() { return this.json.r }
    get brightnessDistributionType() { return this.json.t }
    get brightnessDistributionFirst() { return this.json.b === 1 }
    get events() { return this.json.e }

    set filter(value: LightEventFilter) { this.json.f = value }
    set filterType(value: FILTERTYPE) { this.json.f.f = value }
    set filterParam0(value: number) { this.json.f.p = value }
    set filterParam1(value: number) { this.json.f.t = value }
    set filterReverse(value: boolean) { this.json.f.r = value ? 1 : 0 }
    set beatDistribution(value: number) { this.json.w = value }
    set beatDistributionType(value: DISTTYPE) { this.json.d = value }
    set brightnessDistribution(value: number) { this.json.r = value }
    set brightnessDistributionType(value: DISTTYPE) { this.json.t = value }
    set brightnessDistributionFirst(value: boolean) { this.json.b = value ? 1 : 0 }
    set events(value: LightEvent[]) { this.json.e = value }

    sections(amount: number, index: number, reverse = false) {
        this.filterType = FILTERTYPE.SECTIONS;
        this.filterParam0 = amount;
        this.filterParam1 = index;
        this.filterReverse = reverse;
    }

    stepAndOffset(offset: number, step: number, reverse = false) {
        this.filterType = FILTERTYPE.STEPANDOFFSET;
        this.filterParam0 = offset;
        this.filterParam1 = step;
        this.filterReverse = reverse;
    }
}

export class LightEvent {
    json: Record<string, any> = {
        b: 0,
        i: 0,
        c: 1,
        s: 1,
        f: 0
    }

    /**
    * Create a light event using JSON.
    * @param {Object} json 
    * @returns {Note}
    */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    push = (array: LightEvent[]) => array.push(copy(this));

    get addedBeat() { return this.json.b }
    get transition() { return this.json.i }
    get color() { return this.json.c }
    get brightness() { return this.json.s }
    get flickerFrequency() { return this.json.f }

    set addedBeat(value: number) { this.json.b = value }
    set transition(value: TRANSITIONTYPE) { this.json.i = value }
    set color(value: LIGHTCOLOR) { this.json.c = value }
    set brightness(value: number) { this.json.s = value }
    set flickerFrequency(value: number) { this.json.f = value }
}