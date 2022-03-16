import { activeDiff, info } from './beatmap';
import { Animation, AnimationInternals } from './animation';
import { isEmptyObject, getJumps, copy, jsonPrune } from './general';
import { ANCHOR_MODE, COLOR, CUT } from './constants';

export class Note {
    json: any = {
        b: 0,
        x: 0,
        y: 0,
        a: 0,
        c: 0,
        d: 0,
        _customData: {
            _animation: {}
        }
    };

    animate = new Animation().noteAnimation(this.animation);

    /**
     * Note object for ease of creation.
     * @param {Number} beat
     * @param {Number} type 
     * @param {Number} direction 
     * @param {Array} position Array for x and y of the note. If an additional boolean of true is added, noodle position will be used.
     * @param {Number} angleOffset
    */
    constructor(beat: number = undefined, type: COLOR = undefined, direction: CUT = undefined, position: [number, number, boolean?] = undefined, angleOffset: number = undefined) {
        if (beat !== undefined) this.beat = beat;
        if (type !== undefined) this.type = type;
        if (direction !== undefined) this.direction = direction;
        if (position !== undefined) this.position = position;
        if (angleOffset !== undefined) this.angleOffset = angleOffset;
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

    get beat(): number { return this.json.b }
    get angleOffset(): number { return this.json.a }
    get type(): COLOR { return this.json.c }
    get direction(): CUT { return this.json.d }

    set beat(value: number) { this.json.b = value }
    set angleOffset(value: number) { this.json.a = value }
    set type(value: COLOR) { this.json.c = value }
    set direction(value: CUT) { this.json.d = value }

    // Modded
    get customData() { return this.json._customData }
    get preciseDirection() { return this.json._customData._cutDirection }
    get flip() { return this.json._customData._flip }
    get noteGravity() { return !this.json._customData._disableNoteGravity }
    get noteLook() { return !this.json._customData._disableNoteLook }
    get spawnEffect() { return !this.json._customData._disableSpawnEffect }
    get position() {
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
    get life() { return this.halfJumpDur * 2 }
    get lifeStart() { return this.beat - this.life / 2 }
    get fake() { return this.json._customData._fake }
    get interactable() { return this.json._customData._interactable }
    get track() { return this.json._customData._track }
    get color() { return this.json._customData._color }
    get animation() { return this.json._customData._animation }

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
    set life(value: number) {
        if (value < 2) console.log("Warning: The lifespan of a note has a minimum of 2 beats.");
        let defaultJumps = getJumps(this.NJS, 0, info.BPM);
        this.offset = (value - (2 * defaultJumps.halfDur)) / 2;
    };
    set lifeStart(value: number) { this.beat = value + this.life / 2 }
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

export class Arc {
    json: any = {
        b: 0,
        c: 0,
        x: 0,
        y: 0,
        d: 0,
        tb: 0,
        tx: 0,
        ty: 0,
        mu: 1,
        tmu: 1,
        tc: 0,
        m: 0
    };

    /**
     * Arc object for ease of creation.
     * @param {Number} type 
     * @param {Array} head [beat, x, y, direction, length]. Only beat is required.
     * @param {Array} tail [beat, x, y, direction, length]. Only beat is required.
     * @param {Number} midAnchorMode 
     */
    constructor(type: COLOR = undefined, head: [number, number?, number?, CUT?, number?] = undefined, tail: [number, number?, number?, CUT?, number?] = undefined, midAnchorMode: ANCHOR_MODE = undefined) {
        if (type !== undefined) this.type = type;
        if (head !== undefined) {
            this.beats = [head[0], this.beats[1]];
            if (head[1] !== undefined && head[2] !== undefined) this.headPos = [head[1], head[2]];
            if (head[3] !== undefined) this.headDirection = head[3];
            if (head[4] !== undefined) this.headLength = head[4];
        }
        if (tail !== undefined) {
            this.beats = [this.beats[1], tail[0]];
            if (tail[1] !== undefined && tail[2] !== undefined) this.tailPos = [tail[1], tail[2]];
            if (tail[3] !== undefined) this.tailDirection = tail[3];
            if (tail[4] !== undefined) this.tailLength = tail[4];
        }
        if (midAnchorMode !== undefined) this.midAnchorMode = midAnchorMode;
    }

    /**
     * Create a note using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json) {
        this.json = json;
        // if (this.customData === undefined) this.customData = {};
        // if (this.animation === undefined) this.animation = {};
        // this.animate = new Animation().noteAnimation(this.animation);
        return this;
    }

    /**
     * Push this arc to the difficulty
     */
    push() {
        activeDiff.arcs.push(copy(this));
        return this;
    }

    get beats() { return [this.json.b, this.json.tb] }
    get type() { return this.json.c }
    get headPos() { return [this.json.x, this.json.y] }
    get headDirection() { return this.json.d }
    get tailPos() { return [this.json.tx, this.json.ty] }
    get tailDirection() { return this.json.tc }
    get headLength() { return this.json.mu }
    get tailLength() { return this.json.tmu }
    get midAnchorMode() { return this.json.m }

    set beats(value: [number, number]) { this.json.b = value[0], this.json.tb = value[1] }
    set type(value: COLOR) { this.json.c = value }
    set headPos(value: [number, number]) { this.json.x = value[0], this.json.y = value[1] }
    set headDirection(value: CUT) { this.json.d = value }
    set tailPos(value: [number, number]) { this.json.tx = value[0], this.json.ty = value[1] }
    set tailDirection(value: CUT) { this.json.tc = value }
    set headLength(value: number) { this.json.mu = value }
    set tailLength(value: number) { this.json.tmu = value }
    set midAnchorMode(value: number) { this.json.m = value }
}