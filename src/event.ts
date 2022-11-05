// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { activeDiff, info } from "./beatmap.ts";
import { AXIS, DISTTYPE, FILTERTYPE, LIGHTCOL, ROTDIR, ROTEASE, ROTTRANS, LIGHTTRANS } from "./constants.ts";
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
    push(clone = true) {
        activeDiff.BPMChanges.push(clone ? copy(this) : this);
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
    push(clone = true) {
        activeDiff.rotationEvents.push(clone ? copy(this) : this);
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
    push(clone = true) {
        activeDiff.boostEvents.push(clone ? copy(this) : this);
        return this;
    }

    get on() { return this.json.o }

    set on(value: boolean) { this.json.o = value }
}

class EventBox extends BaseObject {
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

    get group() { return this.json.g }

    set group(value: number) { this.json.g = value }
}

export class LightEventBox extends EventBox {
    /**
     * Push this boost event to the difficulty
     */
    push(clone = true) {
        activeDiff.lightEventBoxes.push(clone ? copy(this) : this);
        return this;
    }

    get boxGroups() { return this.json.e }

    set boxGroups(value: LightEventBoxGroup[]) { this.json.g = value }
}

export class LightRotationBox extends EventBox {
    /**
    * Push this boost event to the difficulty
    */
    push(clone = true) {
        activeDiff.lightRotationBoxes.push(clone ? copy(this) : this);
        return this;
    }

    get boxGroups() { return this.json.e }

    set boxGroups(value: LightRotationBoxGroup[]) { this.json.g = value }
}

interface EventFilter {
    f: number,
    p: number,
    t: number,
    r: number
}

export class EventBoxGroup {
    json: Record<string, any> = {};

    /**
    * Create a light event box group using JSON.
    * @param {Object} json 
    * @returns {Note}
    */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    get filter() { return this.json.f }
    get filterType() { return this.json.f.f }
    get filterParam0() { return this.json.f.p }
    get filterParam1() { return this.json.f.t }
    get filterReverse() { return this.json.f.r === 1 }
    get beatDistribution() { return this.json.w }
    get beatDistributionType() { return this.json.d }

    set filter(value: EventFilter) { this.json.f = value }
    set filterType(value: FILTERTYPE) { this.json.f.f = value }
    set filterParam0(value: number) { this.json.f.p = value }
    set filterParam1(value: number) { this.json.f.t = value }
    set filterReverse(value: boolean) { this.json.f.r = value ? 1 : 0 }
    set beatDistribution(value: number) { this.json.w = value }
    set beatDistributionType(value: DISTTYPE) { this.json.d = value }

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

export class LightEventBoxGroup extends EventBoxGroup {
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

    push(box: LightEventBox) {
        box.boxGroups.push(copy(this));
        return this;
    }

    get brightnessDistribution() { return this.json.r }
    get brightnessDistributionType() { return this.json.t }
    get brightnessDistributionFirst() { return this.json.b === 1 }
    get events() { return this.json.e }

    set brightnessDistribution(value: number) { this.json.r = value }
    set brightnessDistributionType(value: DISTTYPE) { this.json.t = value }
    set brightnessDistributionFirst(value: boolean) { this.json.b = value ? 1 : 0 }
    set events(value: LightEvent[]) { this.json.e = value }
}

export class LightRotationBoxGroup extends EventBoxGroup {
    json: Record<string, any> = {
        f: {
            f: 1,
            p: 0,
            t: 0,
            r: 0
        },
        w: 1,
        d: 1,
        s: 1,
        t: 1,
        b: 1,
        a: 0,
        r: 0,
        l: []
    }

    push(box: LightRotationBox) {
        box.boxGroups.push(copy(this));
        return this;
    }

    get rotationDistribution() { return this.json.s }
    get rotationDistributionType() { return this.json.t }
    get rotationDistributionFirst() { return this.json.b === 1 }
    get axis() { return this.json.a }
    get reverse() { return this.json.r === 1 }
    get events() { return this.json.l }

    set rotationDistribution(value: number) { this.json.s = value }
    set rotationDistributionType(value: DISTTYPE) { this.json.t = value }
    set rotationDistributionFirst(value: boolean) { this.json.b = value ? 1 : 0 }
    set axis(value: AXIS) { this.json.a = value }
    set reverse(value: boolean) { this.json.r = value ? 1 : 0 }
    set events(value: LightRotation[]) { this.json.l = value }
}

export class LightEvent {
    json: Record<string, any> = {
        b: 0,
        i: 0,
        c: 0,
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

    push(group: LightEventBoxGroup) {
        group.events.push(copy(this));
        return this;
    }

    get addedBeat() { return this.json.b }
    get transition() { return this.json.i }
    get color() { return this.json.c }
    get brightness() { return this.json.s }
    get flickerFrequency() { return this.json.f }

    set addedBeat(value: number) { this.json.b = value }
    set transition(value: LIGHTTRANS) { this.json.i = value }
    set color(value: LIGHTCOL) { this.json.c = value }
    set brightness(value: number) { this.json.s = value }
    set flickerFrequency(value: number) { this.json.f = value }
}

export class LightRotation {
    json: Record<string, any> = {
        b: 0,
        p: 0,
        e: 0,
        l: 0,
        r: 0,
        o: 1
    }

    /**
    * Create a light rotation using JSON.
    * @param {Object} json 
    * @returns {Note}
    */
    import(json: Record<number, any>) {
        this.json = json;
        return this;
    }

    push(group: LightRotationBoxGroup) {
        group.events.push(copy(this));
        return this;
    }

    get addedBeat() { return this.json.b }
    get transition() { return this.json.p }
    get ease() { return this.json.e }
    get loops() { return this.json.l }
    get rotation() { return this.json.r }
    get direction() { return this.json.o }

    set addedBeat(value: number) { this.json.b = value }
    set transition(value: ROTTRANS) { this.json.p = value }
    set ease(value: ROTEASE) { this.json.e = value }
    set loops(value: number) { this.json.l = value }
    set rotation(value: number) { this.json.r = value }
    set direction(value: ROTDIR) { this.json.o = value }
}