// deno-lint-ignore-file adjacent-overload-signatures
import { activeDiff, info, Json } from "./beatmap.ts";
import { AXIS, DISTTYPE, FILTERTYPE, LIGHTCOL, ROTDIR, ROTEASE, ROTTRANS, LIGHTTRANS } from "./constants.ts";
import { copy } from "./general.ts";
import { BaseObject } from "./object.ts";

export class BPMChange extends BaseObject {
    /**
     * BPMChange object for ease of creation.
     * @param time The time that the BPM changes.
     * @param BPM The BPM when this event activates.
     */
    constructor(time: number = 0, BPM: number = info.BPM) {
        super();
        this.time = time;
        this.BPM = BPM;
    }

    /**
     * Create a BPM change using Json.
     * @param json The Json to import.
     */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** Push this BPM change to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
    */
    push(clone = true) {
        activeDiff.BPMChanges.push(clone ? copy(this) : this);
        return this;
    }

    /** The BPM when this event activates. */
    get BPM() { return this.json.m }

    set BPM(value: number) { this.json.m = value }
}

export class RotationEvent extends BaseObject {
    /**
     * Event for rotating gameplay elements, used in 90 and 360 levels.
     * @param time The time that this rotation will happen.
     * @param rotation The degrees of this rotation.
     * @param early Whether this rotation effects objects that are already active.
     */
    constructor(time: number = 0, rotation: number = 0, early: boolean = false) {
        super();
        this.time = time;
        this.rotation = rotation;
        this.early = early;
    }

    /**
     * Create a rotation event using Json.
     * @param json The Json to import.
     */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** Push this rotation event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
    */
    push(clone = true) {
        activeDiff.rotationEvents.push(clone ? copy(this) : this);
        return this;
    }

    /** The degrees of this rotation. */
    get rotation() { return this.json.r }
    /** Whether this rotation effects objects that are already active. */
    get early() { return this.json.e === 0 }

    set rotation(value: number) { this.json.r = value }
    set early(value: boolean) { this.json.e = value ? 0 : 1 }
}

export class BoostEvent extends BaseObject {
    /**
     * Boost event object for ease of creation.
     * @param time The time this boost event will happen.
     * @param on Whether boost colors will be on.
     */
    constructor(time = 0, on = false) {
        super();
        this.time = time;
        this.on = on;
    }

    /**
     * Create a boost event using JSON.
     * @param json The Json to import.
     */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** Push this boost event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
    */
    push(clone = true) {
        activeDiff.boostEvents.push(clone ? copy(this) : this);
        return this;
    }

    /** Whether boost colors will be on. */
    get on() { return this.json.o }

    set on(value: boolean) { this.json.o = value }
}

class EventBox extends BaseObject {
    json: Json = {
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
     * Create an event box using Json.
     * @param json The Json to import.
     */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** The group of this lighting event. */
    get group() { return this.json.g }

    set group(value: number) { this.json.g = value }
}

export class LightEventBox extends EventBox {
    /** Push this light event box to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
    */
    push(clone = true) {
        activeDiff.lightEventBoxes.push(clone ? copy(this) : this);
        return this;
    }

    /** The different lanes in this group. */
    get boxGroups() { return this.json.e }

    set boxGroups(value: LightEventBoxGroup[]) { this.json.g = value }
}

export class LightRotationBox extends EventBox {
    /** Push this light rotation box to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
    */
    push(clone = true) {
        activeDiff.lightRotationBoxes.push(clone ? copy(this) : this);
        return this;
    }

    /** The different lanes in this group. */
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
    json: Json = {};

    /**
    * Create a light event box group using Json.
    * @param json Json to import.
    */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** A Json object containing data describing the lights to effect. */
    get filter() { return this.json.f }
    /** The method used to pick lights to effect. */
    get filterType() { return this.json.f.f }
    /** Parameter 0 for the filter. */
    get filterParam0() { return this.json.f.p }
    /** Parameter 1 for the filter. */
    get filterParam1() { return this.json.f.t }
    /** Whether the filter method should be reversed. */
    get filterReverse() { return this.json.f.r === 1 }
    /** Parameter for the beat distribution type. */
    get beatDistribution() { return this.json.w }
    /** How the lights take effect over time. */
    get beatDistributionType() { return this.json.d }

    set filter(value: EventFilter) { this.json.f = value }
    set filterType(value: FILTERTYPE) { this.json.f.f = value }
    set filterParam0(value: number) { this.json.f.p = value }
    set filterParam1(value: number) { this.json.f.t = value }
    set filterReverse(value: boolean) { this.json.f.r = value ? 1 : 0 }
    set beatDistribution(value: number) { this.json.w = value }
    set beatDistributionType(value: DISTTYPE) { this.json.d = value }

    /**
     * Select lights by grouping them in intervals.
     * @param amount How many sections the light group is split into.
     * @param index Which section to use.
     * @param reverse Whether the method should be reversed.
     */
    sections(amount: number, index: number, reverse = false) {
        this.filterType = FILTERTYPE.SECTIONS;
        this.filterParam0 = amount;
        this.filterParam1 = index;
        this.filterReverse = reverse;
    }

    /**
     * Select lights by a start point and interval.
     * @param offset Start point index.
     * @param step Interval of light picking.
     * @param reverse Whether the method should be reversed.
     */
    stepAndOffset(offset: number, step: number, reverse = false) {
        this.filterType = FILTERTYPE.STEPANDOFFSET;
        this.filterParam0 = offset;
        this.filterParam1 = step;
        this.filterReverse = reverse;
    }
}

export class LightEventBoxGroup extends EventBoxGroup {
    json: Json = {
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

    /** Push this light event box group to a light event box. */
    push(box: LightEventBox) {
        box.boxGroups.push(copy(this));
        return this;
    }

    /** Parameter for the brightness distribution type. */
    get brightnessDistribution() { return this.json.r }
    /** How the brightness of the lights take effect over time. */
    get brightnessDistributionType() { return this.json.t }
    /** Determines if the brightness distribution effects the first event in the lane. */
    get brightnessDistributionFirst() { return this.json.b === 1 }
    /** Lighting events in this group. */
    get events() { return this.json.e }

    set brightnessDistribution(value: number) { this.json.r = value }
    set brightnessDistributionType(value: DISTTYPE) { this.json.t = value }
    set brightnessDistributionFirst(value: boolean) { this.json.b = value ? 1 : 0 }
    set events(value: LightEvent[]) { this.json.e = value }
}

export class LightRotationBoxGroup extends EventBoxGroup {
    json: Json = {
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

    /** Push this light rotation box group to a light rotation box. */
    push(box: LightRotationBox) {
        box.boxGroups.push(copy(this));
        return this;
    }

    /** Parameter for the rotation distribution type. */
    get rotationDistribution() { return this.json.s }
    /** How the rotation of the lights take effect over time. */
    get rotationDistributionType() { return this.json.t }
    /** Determines if the rotation distribution effects the first event in the lane. */
    get rotationDistributionFirst() { return this.json.b === 1 }
    /** The axis of rotation. */
    get axis() { return this.json.a }
    /** Whether the rotation should be flipped. */
    get flipped() { return this.json.r === 1 }
    /** Rotation events in this group. */
    get events() { return this.json.l }

    set rotationDistribution(value: number) { this.json.s = value }
    set rotationDistributionType(value: DISTTYPE) { this.json.t = value }
    set rotationDistributionFirst(value: boolean) { this.json.b = value ? 1 : 0 }
    set axis(value: AXIS) { this.json.a = value }
    set flipped(value: boolean) { this.json.r = value ? 1 : 0 }
    set events(value: LightRotation[]) { this.json.l = value }
}

export class LightEvent {
    /** The Json of this light event. */
    json: Json = {
        b: 0,
        i: 0,
        c: 0,
        s: 1,
        f: 0
    }

    /**
    * Create a light event using JSON.
    * @param json Json to import.
    */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** Push this light event to a light event box group. */
    push(group: LightEventBoxGroup) {
        group.events.push(copy(this));
        return this;
    }

    /** The beat this event happens, added to the light event box's time. */
    get addedBeat() { return this.json.b }
    /** The transition type between this light event and the previous. */
    get transition() { return this.json.i }
    /** The color of this lighting event. */
    get color() { return this.json.c }
    /** The brightness of this lighting event. */
    get brightness() { return this.json.s }
    /** The frequency of this light event's flickering. */
    get flickerFrequency() { return this.json.f }

    set addedBeat(value: number) { this.json.b = value }
    set transition(value: LIGHTTRANS) { this.json.i = value }
    set color(value: LIGHTCOL) { this.json.c = value }
    set brightness(value: number) { this.json.s = value }
    set flickerFrequency(value: number) { this.json.f = value }
}

export class LightRotation {
    /** The Json of this light rotation. */
    json: Json = {
        b: 0,
        p: 0,
        e: 0,
        l: 0,
        r: 0,
        o: 1
    }

    /**
    * Create a light rotation using Json.
    * @param json Json to import.
    */
    import(json: Json) {
        this.json = json;
        return this;
    }

    /** Push this light rotation to a light rotation box group. */
    push(group: LightRotationBoxGroup) {
        group.events.push(copy(this));
        return this;
    }

    /** The beat this event happens, added to the rotation event box's time. */
    get addedBeat() { return this.json.b }
    /** The transition type between this rotation event and the previous. */
    get transition() { return this.json.p }
    /** The easing of the rotation. */
    get ease() { return this.json.e }
    /** The amount of additional 360 degree loops. */
    get loops() { return this.json.l }
    /** The degrees of the rotation. */
    get rotation() { return this.json.r }
    /** The direction of the rotation. */
    get direction() { return this.json.o }

    set addedBeat(value: number) { this.json.b = value }
    set transition(value: ROTTRANS) { this.json.p = value }
    set ease(value: ROTEASE) { this.json.e = value }
    set loops(value: number) { this.json.l = value }
    set rotation(value: number) { this.json.r = value }
    set direction(value: ROTDIR) { this.json.o = value }
}