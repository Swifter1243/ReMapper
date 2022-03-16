import { activeDiff, info } from './beatmap';
import { copy, jsonPrune, isEmptyObject, getJumps } from './general';
import { Animation, AnimationInternals } from './animation';

export class Wall {
    json: any = {
        b: 0,
        x: 0,
        y: 0,
        d: 0,
        w: 1,
        h: 1,
        _customData: {
            _animation: {}
        }
    };

    animate = new Animation().wallAnimation(this.animation);

    /**
     * Wall object for ease of creation.
     * @param {Number} beat 
     * @param {Number} duration 
     * @param {Array} position Array for x and y of the wall. If an additional boolean of true is added, noodle position will be used.
     * @param {Array} dimensions Array for width and height.
     */
    constructor(beat: number = undefined, duration: number = undefined, position: [number, number, boolean?] = undefined, dimensions: [number, number] = undefined) {
        if (beat !== undefined) this.beat = beat;
        if (duration !== undefined) this.duration = duration;
        if (position !== undefined) this.position = position;
        if (dimensions !== undefined) this.dimensions = dimensions;
    }

    /**
     * Create a wall using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json) {
        this.json = json;
        if (this.customData === undefined) this.customData = {};
        if (this.animation === undefined) this.animation = {};
        this.animate = new Animation().wallAnimation(this.animation);
        return this;
    }

    /**
     * Push this wall to the difficulty
     */
    push() {
        activeDiff.walls.push(copy(this));
        return this;
    }

    /**
     * Apply an animation through the Animation class.
     * @param {Animation} animation 
     */
    importAnimation(animation: AnimationInternals.BaseAnimation) {
        this.animation = animation.json;
        this.animate = new Animation().wallAnimation(this.animation);
        return this;
    }

    get beat(): number { return this.json.b }
    get duration(): number { return this.json.d }
    get dimensions(): [number, number] { return [this.json.w, this.json.h] }

    set beat(value: number) { this.json.b = value }
    set duration(value: number) { this.json.d = value }
    set dimensions(value: [number, number]) { this.json.w = value[0]; this.json.h = value[1] }

    // Modded
    get customData() { return this.json._customData }
    get scale(): [number, number, number] { return this.json._customData._scale }
    get position(): [number, number, boolean?] {
        let isNoodle = false;
        if (this.json._customData._position) isNoodle = true;

        if (!isNoodle) return [this.json.x, this.json.y];
        else return [...(this.json._customData._position as [number, number]), true];
    }
    get rotation() { return this.json._customData._rotation }
    get localRotation() { return this.json._customData._localRotation }
    get NJS() {
        if (this.json._customData._noteJumpMovementSpeed) return this.json._customData._noteJumpMovementSpeed;
        else return activeDiff.NJS;
    }
    get offset() {
        if (this.json._customData._noteJumpStartBeatOffset) return this.json._customData._noteJumpStartBeatOffset;
        else return activeDiff.offset;
    }
    get halfJumpDur() { return getJumps(this.NJS, this.offset, info.BPM).halfDur }
    get jumpDist() { return getJumps(this.NJS, this.offset, info.BPM).dist }
    get life() { return this.halfJumpDur * 2 + this.duration }
    get lifeStart() { return this.beat - this.halfJumpDur }
    get fake() { return this.json._customData._fake }
    get interactable() { return this.json._customData._interactable }
    get track() { return this.json._customData._track }
    get color() { return this.json._customData._color }
    get animation() { return this.json._customData._animation }

    set customData(value) { this.json._customData = value }
    set scale(value: [number, number, number]) { this.json._customData._scale = value }
    set position(value: [number, number, boolean?]) {
        let isNoodle = false;
        if (value[2] !== undefined) isNoodle = value[2];

        if (!isNoodle) {
            this.json.x = value[0];
            this.json.y = value[1];

            delete this.json._customData._position;
        }
        else {
            this.json.x = 0;
            this.json.y = 0;

            this.json._customData._position = [value[0] - 0.5, value[1]];
        }
    }
    set rotation(value: number[]) { this.json._customData._rotation = value }
    set localRotation(value: number[]) { this.json._customData._localRotation = value }
    set NJS(value: number) { this.json._customData._noteJumpMovementSpeed = value }
    set offset(value: number) { this.json._customData._noteJumpStartBeatOffset = value }
    set life(value: number) { this.duration = value - (this.halfJumpDur * 2) }
    set lifeStart(value: number) { this.beat = value + this.halfJumpDur }
    set fake(value: boolean) { this.json._customData._fake = value }
    set interactable(value: boolean) { this.json._customData._interactable = value }
    set track(value: string) { this.json._customData._track = value }
    set color(value: number[]) { this.json._customData._color = value }
    set animation(value) { this.json._customData._animation = value }

    get isModded() {
        if (this.customData === undefined) return false;
        let customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}