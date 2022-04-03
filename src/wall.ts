import { activeDiff, info } from './beatmap';
import { copy, jsonPrune, isEmptyObject, getJumps } from './general';
import { Animation, AnimationInternals, Track, TrackValue } from './animation';
import { WALL } from './constants';

export class Wall {
    json: any = {
        _time: 0,
        _type: 0,
        _lineIndex: 0,
        _duration: 1,
        _width: 1,
        _customData: {
            _animation: {}
        }
    };
    animate = new Animation().wallAnimation(this.animation);

    /**
     * Wall object for ease of creation.
     * @param {Number} time
     * @param {Number} duration 
     * @param {Number} type Can be left empty to create a noodle wall template.
     * @param {Number} lineIndex 
     * @param {Number} width
     */
    constructor(time: number = undefined, duration: number = undefined, type: WALL = undefined, lineIndex: number = undefined, width: number = undefined) {
        if (time !== undefined) this.time = time;
        if (duration !== undefined) this.duration = duration;
        if (type !== undefined) this.type = type;
        else {
            this.lineIndex = 0;
            this.width = 0;
            this.scale = [1, 1, 1];
            this.position = [0, 0];
            return;
        }
        if (lineIndex !== undefined) this.lineIndex = lineIndex;
        if (width !== undefined) this.width = width;
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
        activeDiff.obstacles.push(copy(this));
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

    get time() { return this.json._time }
    get type() { return this.json._type }
    get duration() { return this.json._duration }
    get lineIndex() { return this.json._lineIndex }
    get width() { return this.json._width }
    get customData() { return this.json._customData }
    get scale() { return this.json._customData._scale }
    get position() { return this.json._customData._position }
    get rotation() { return this.json._customData._rotation }
    get localRotation() { return this.json._customData._localRotation }
    get NJS() {
        if (this.json._customData._noteJumpMovementSpeed) return this.json._customData._noteJumpMovementSpeed;
        else return activeDiff.NJS;
    };
    get offset() {
        if (this.json._customData._noteJumpStartBeatOffset) return this.json._customData._noteJumpStartBeatOffset;
        else return activeDiff.offset;
    };
    get halfJumpDur() { return getJumps(this.NJS, this.offset, info.BPM).halfDur }
    get jumpDist() { return getJumps(this.NJS, this.offset, info.BPM).dist }
    get life() { return this.halfJumpDur * 2 + this.duration }
    get lifeStart() { return this.time - this.halfJumpDur }
    get fake() { return this.json._customData._fake }
    get interactable() { return this.json._customData._interactable }
    get track() { return new Track(this.json._customData._track) }
    get color() { return this.json._customData._color }
    get animation() { return this.json._customData._animation }

    set time(value: number) { this.json._time = value }
    set type(value: number) { this.json._type = value }
    set duration(value: number) { this.json._duration = value }
    set lineIndex(value: number) { this.json._lineIndex = value }
    set width(value: number) { this.json._width = value }
    set customData(value) { this.json._customData = value }
    set scale(value: number[]) { this.json._customData._scale = value }
    set position(value: number[]) { this.json._customData._position = value }
    set rotation(value: number[]) { this.json._customData._rotation = value }
    set localRotation(value: number[]) { this.json._customData._localRotation = value }
    set NJS(value: number) { this.json._customData._noteJumpMovementSpeed = value }
    set offset(value: number) { this.json._customData._noteJumpStartBeatOffset = value }
    set life(value: number) { this.duration = value - (this.halfJumpDur * 2) }
    set lifeStart(value: number) { this.time = value + this.halfJumpDur }
    set fake(value: boolean) { this.json._customData._fake = value }
    set interactable(value: boolean) { this.json._customData._interactable = value }
    set trackSet(value: TrackValue) { this.json._customData._track = value }
    set color(value: number[]) { this.json._customData._color = value }
    set animation(value) { this.json._customData._animation = value }

    get isModded() {
        if (this.customData === undefined) return false;
        let customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}