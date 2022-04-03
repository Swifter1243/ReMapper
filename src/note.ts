import { activeDiff, info } from './beatmap';
import { Animation, AnimationInternals, Track, TrackValue } from './animation';
import { isEmptyObject, getJumps, copy, jsonPrune } from './general';
import { NOTE } from './constants';

export class Note {
    json: any = {
        _time: 0,
        _type: 0,
        _cutDirection: 0,
        _lineIndex: 0,
        _lineLayer: 0,
        _customData: {
            _animation: {}
        }
    };
    /// NOOO DON'T DO THIS PLEASE USE A CONSTRUCTOR
    animate = new Animation().noteAnimation(this.animation);

    /**
     * Note object for ease of creation
     * @param {Number} time
     * @param {Number} type 
     * @param {Number} direction 
     * @param {Array} position Array for x and y of the note. If an additional boolean of true is added, it will be converted to a noodle position instead of the vanilla grid.
     */
    constructor(time: number = undefined, type: NOTE = undefined, direction: NOTE = undefined, position: [number, number, boolean?] = undefined) {
        if (time !== undefined) this.time = time;
        if (type !== undefined) this.type = type;
        if (direction !== undefined) this.direction = direction;
        if (position !== undefined) this.position = position;
    }

    /**
     * Create a note using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json) {
        this.json = json;
        if (this.customData === undefined) this.customData = {};
        if (this.animation === undefined) this.animation = {};
        this.animate = new Animation().noteAnimation(this.animation);
        return this;
    }

    /**
     * Push this note to the difficulty
     */
    push() {
        activeDiff.notes.push(copy(this));
        return this;
    }

    /**
     * Apply an animation through the Animation class.
     * @param {Animation} animation 
     */
    importAnimation(animation: AnimationInternals.BaseAnimation) {
        this.animation = animation.json;
        this.animate = new Animation().noteAnimation(this.animation);
        return this;
    }

    get time() { return this.json._time }
    get type() { return this.json._type }
    get direction() { return this.json._cutDirection }
    get customData() { return this.json._customData }
    get preciseDirection() { return this.json._customData._cutDirection }
    get flip() { return this.json._customData._flip }
    get noteGravity() { return !this.json._customData._disableNoteGravity }
    get noteLook() { return !this.json._customData._disableNoteLook }
    get spawnEffect() { return !this.json._customData._disableSpawnEffect }
    get position() {
        let isNoodle = false;
        if (this.json._customData._position) isNoodle = true;

        if (!isNoodle) return [this.json._lineIndex, this.json._lineLayer];
        else return [...(this.json._customData._position as [number, number]), true];
    }
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
    get life() { return this.halfJumpDur * 2 }
    get lifeStart() { return this.time - this.life / 2 }
    get fake() { return this.json._customData._fake }
    get interactable() { return this.json._customData._interactable }
    get track() { return new Track(this.json._customData._track) }
    get color() { return this.json._customData._color }
    get animation() { return this.json._customData._animation }

    set time(value: number) { this.json._time = value }
    set type(value: number) { this.json._type = value }
    set direction(value: number) { this.json._cutDirection = value }
    set customData(value) { this.json._customData = value }
    set preciseDirection(value: number) { this.json._customData._cutDirection = value }
    set flip(value: boolean) { this.json._customData._flip = value }
    set noteGravity(value: boolean) { this.json._customData._disableNoteGravity = !value }
    set noteLook(value: boolean) { this.json._customData._disableNoteLook = !value }
    set spawnEffect(value: boolean) { this.json._customData._disableSpawnEffect = !value }
    set position(value: [number, number, boolean?]) {
        let isNoodle = false;
        if (value[2] !== undefined) isNoodle = value[2];

        if (!isNoodle) {
            this.json._lineIndex = value[0];
            this.json._lineLayer = value[1];

            delete this.json._customData._position;
        }
        else {
            this.json._lineIndex = 0;
            this.json._lineLayer = 0;

            this.json._customData._position = [value[0] - 0.5, value[1]];
        }
    }
    set rotation(value: number[]) { this.json._customData._rotation = value }
    set localRotation(value: number[]) { this.json._customData._localRotation = value }
    set NJS(value: number) { this.json._customData._noteJumpMovementSpeed = value }
    set offset(value: number) { this.json._customData._noteJumpStartBeatOffset = value }
    set life(value: number) { 
        if (value < 2) console.log("Warning: The lifespan of a note has a minimum of 2 beats.");
        let defaultJumps = getJumps(this.NJS, 0, info.BPM);
        this.offset = (value - (2 * defaultJumps.halfDur)) / 2;
    };
    set lifeStart(value: number) { this.time = value + this.life / 2 }
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