import { activeDiff, info } from './beatmap';
import { Animation, AnimationInternals } from './animation';
import { isEmptyObject, getJumps, copy, jsonPrune, Vec2, Vec3, Vec4 } from './general';
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
    constructor(beat: number = undefined, type: COLOR = undefined, direction: CUT = undefined, position: [...Vec2, boolean?] = undefined, angleOffset: number = undefined) {
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
    get customData(): any { return this.json._customData }
    get preciseDirection(): number { return this.json._customData._cutDirection }
    get flip(): boolean { return this.json._customData._flip }
    get noteGravity(): boolean { return !this.json._customData._disableNoteGravity }
    get noteLook(): boolean { return !this.json._customData._disableNoteLook }
    get spawnEffect(): boolean { return !this.json._customData._disableSpawnEffect }
    get position(): [...Vec2, boolean?] {
        let isNoodle = false;
        if (this.json._customData._position) isNoodle = true;

        if (!isNoodle) return [this.json.x, this.json.y];
        else return [...(this.json._customData._position as Vec2), true];
    }
    get rotation(): Vec3 { return this.json._customData._rotation }
    get localRotation(): Vec3 { return this.json._customData._localRotation }
    get NJS(): number {
        if (this.json._customData._noteJumpMovementSpeed) return this.json._customData._noteJumpMovementSpeed;
        else return activeDiff.NJS;
    }
    get offset(): number {
        if (this.json._customData._noteJumpStartBeatOffset) return this.json._customData._noteJumpStartBeatOffset;
        else return activeDiff.offset;
    }
    get halfJumpDur(): number { return getJumps(this.NJS, this.offset, info.BPM).halfDur }
    get jumpDist(): number { return getJumps(this.NJS, this.offset, info.BPM).dist }
    get life(): number { return this.halfJumpDur * 2 }
    get lifeStart(): number { return this.beat - this.life / 2 }
    get fake(): boolean { return this.json._customData._fake }
    get interactable(): boolean { return this.json._customData._interactable }
    get track(): string { return this.json._customData._track }
    get color(): Vec3 | Vec4 { return this.json._customData._color }
    get animation(): any { return this.json._customData._animation }

    set customData(value: any) { this.json._customData = value }
    set preciseDirection(value: number) { this.json._customData._cutDirection = value }
    set flip(value: boolean) { this.json._customData._flip = value }
    set noteGravity(value: boolean) { this.json._customData._disableNoteGravity = !value }
    set noteLook(value: boolean) { this.json._customData._disableNoteLook = !value }
    set spawnEffect(value: boolean) { this.json._customData._disableSpawnEffect = !value }
    set position(value: [...Vec2, boolean?]) {
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
    set rotation(value: Vec3) { this.json._customData._rotation = value }
    set localRotation(value: Vec3) { this.json._customData._localRotation = value }
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
    set color(value: Vec3 | Vec4) { this.json._customData._color = value }
    set animation(value) { this.json._customData._animation = value }

    get isModded() {
        if (this.customData === undefined) return false;
        let customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}

export class Bomb {
    json: any = {
        b: 0,
        x: 0,
        y: 0,
        _customData: {
            _animation: {}
        }
    };

    animate = new Animation().noteAnimation(this.animation);

    /**
     * Note object for ease of creation.
     * @param {Number} beat
     * @param {Array} position Array for x and y of the note. If an additional boolean of true is added, noodle position will be used.
    */
    constructor(beat: number = undefined, position: [...Vec2, boolean?] = undefined) {
        if (beat !== undefined) this.beat = beat;
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
        activeDiff.bombs.push(copy(this));
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

    set beat(value: number) { this.json.b = value }

    // Modded
    get customData(): any { return this.json._customData }
    get preciseDirection(): number { return this.json._customData._cutDirection }
    get flip(): boolean { return this.json._customData._flip }
    get noteGravity(): boolean { return !this.json._customData._disableNoteGravity }
    get noteLook(): boolean { return !this.json._customData._disableNoteLook }
    get spawnEffect(): boolean { return !this.json._customData._disableSpawnEffect }
    get position(): [...Vec2, boolean?] {
        let isNoodle = false;
        if (this.json._customData._position) isNoodle = true;

        if (!isNoodle) return [this.json.x, this.json.y];
        else return [...(this.json._customData._position as Vec2), true];
    }
    get rotation(): Vec3 { return this.json._customData._rotation }
    get localRotation(): Vec3 { return this.json._customData._localRotation }
    get NJS(): number {
        if (this.json._customData._noteJumpMovementSpeed) return this.json._customData._noteJumpMovementSpeed;
        else return activeDiff.NJS;
    }
    get offset(): number {
        if (this.json._customData._noteJumpStartBeatOffset) return this.json._customData._noteJumpStartBeatOffset;
        else return activeDiff.offset;
    }
    get halfJumpDur(): number { return getJumps(this.NJS, this.offset, info.BPM).halfDur }
    get jumpDist(): number { return getJumps(this.NJS, this.offset, info.BPM).dist }
    get life(): number { return this.halfJumpDur * 2 }
    get lifeStart(): number { return this.beat - this.life / 2 }
    get fake(): boolean { return this.json._customData._fake }
    get interactable(): boolean { return this.json._customData._interactable }
    get track(): string { return this.json._customData._track }
    get color(): Vec3 | Vec4 { return this.json._customData._color }
    get animation(): any { return this.json._customData._animation }

    set customData(value: any) { this.json._customData = value }
    set preciseDirection(value: number) { this.json._customData._cutDirection = value }
    set flip(value: boolean) { this.json._customData._flip = value }
    set noteGravity(value: boolean) { this.json._customData._disableNoteGravity = !value }
    set noteLook(value: boolean) { this.json._customData._disableNoteLook = !value }
    set spawnEffect(value: boolean) { this.json._customData._disableSpawnEffect = !value }
    set position(value: [...Vec2, boolean?]) {
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
    set rotation(value: Vec3) { this.json._customData._rotation = value }
    set localRotation(value: Vec3) { this.json._customData._localRotation = value }
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
    set color(value: Vec3 | Vec4) { this.json._customData._color = value }
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
    constructor(head: [number, number?, number?, CUT?, number?] = undefined, tail: [number, number?, number?, CUT?, number?] = undefined, type: COLOR = undefined, midAnchorMode: ANCHOR_MODE = undefined) {
        if (type !== undefined) this.type = type;
        if (head !== undefined) {
            this.beats = [head[0], this.beats[1]];
            if (head[1] !== undefined && head[2] !== undefined) this.headPos = [head[1], head[2]];
            if (head[3] !== undefined) this.headDirection = head[3];
            if (head[4] !== undefined) this.headLength = head[4];
        }
        if (tail !== undefined) {
            this.beats = [this.beats[0], tail[0]];
            if (tail[1] !== undefined && tail[2] !== undefined) this.tailPos = [tail[1], tail[2]];
            if (tail[3] !== undefined) this.tailDirection = tail[3];
            if (tail[4] !== undefined) this.tailLength = tail[4];
        }
        if (midAnchorMode !== undefined) this.midAnchorMode = midAnchorMode;
    }

    /**
     * Create an arc using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json) {
        this.json = json;
        // if (this.customData === undefined) this.customData = {}; TODO: deal with the modded stuff in this class
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

    get beats(): Vec2 { return [this.json.b, this.json.tb] }
    get type(): COLOR { return this.json.c }
    get headPos(): Vec2 { return [this.json.x, this.json.y] }
    get headDirection(): CUT { return this.json.d }
    get tailPos(): Vec2 { return [this.json.tx, this.json.ty] }
    get tailDirection(): CUT { return this.json.tc }
    get headLength(): number { return this.json.mu }
    get tailLength(): number { return this.json.tmu }
    get midAnchorMode(): number { return this.json.m }

    set beats(value: Vec2) { this.json.b = value[0], this.json.tb = value[1] }
    set type(value: COLOR) { this.json.c = value }
    set headPos(value: Vec2) { this.json.x = value[0], this.json.y = value[1] }
    set headDirection(value: CUT) { this.json.d = value }
    set tailPos(value: Vec2) { this.json.tx = value[0], this.json.ty = value[1] }
    set tailDirection(value: CUT) { this.json.tc = value }
    set headLength(value: number) { this.json.mu = value }
    set tailLength(value: number) { this.json.tmu = value }
    set midAnchorMode(value: number) { this.json.m = value }
}

export class Chain {
    json: any = {
        b: 0,
        c: 0,
        x: 0,
        y: 0,
        d: 0,
        tb: 0,
        tx: 0,
        ty: 0,
        sc: 4,
        s: 1
    };

    /**
     * Chain object for ease of creation.
     * @param {Number} type 
     * @param {Number} direction 
     * @param {Array} head [beat, x, y]. Only beat is required.
     * @param {Array} tail [beat, x, y]. Only beat is required.
     * @param {Number} slices 
     * @param {Number} squish 
     */
    constructor(head: [number, number?, number?] = undefined, tail: [number, number?, number?] = undefined, type: COLOR = undefined, direction: CUT = undefined,  slices: number = undefined, squish: number = undefined) {
        if (type !== undefined) this.type = type;
        if (direction !== undefined) this.direction = direction;
        if (head !== undefined) {
            this.beats = [head[0], this.beats[1]];
            if (head[1] !== undefined && head[2] !== undefined) this.headPos = [head[1], head[2]];
        }
        if (tail !== undefined) {
            this.beats = [this.beats[0], tail[0]];
            if (tail[1] !== undefined && tail[2] !== undefined) this.tailPos = [tail[1], tail[2]];
        }
        if (slices !== undefined) this.slices = slices;
        if (squish !== undefined) this.squish = squish;
    }

    /**
     * Create a chain using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json) {
        this.json = json;
        // if (this.customData === undefined) this.customData = {}; TODO: deal with the modded stuff in this class
        // if (this.animation === undefined) this.animation = {};
        // this.animate = new Animation().noteAnimation(this.animation);
        return this;
    }

    /**
     * Push this chain to the difficulty
     */
    push() {
        activeDiff.chains.push(copy(this));
        return this;
    }

    get beats(): Vec2 { return [this.json.b, this.json.tb] }
    get type(): COLOR { return this.json.c }
    get headPos(): Vec2 { return [this.json.x, this.json.y] }
    get direction(): CUT { return this.json.d }
    get tailPos(): Vec2 { return [this.json.tx, this.json.ty] }
    get slices(): number { return this.json.sc }
    get squish(): number { return this.json.s }

    set beats(value: Vec2) { this.json.b = value[0], this.json.tb = value[1] }
    set type(value: COLOR) { this.json.c = value }
    set headPos(value: Vec2) { this.json.x = value[0], this.json.y = value[1] }
    set direction(value: CUT) { this.json.d = value }
    set tailPos(value: Vec2) { this.json.tx = value[0], this.json.ty = value[1] }
    set slices(value: number) { this.json.sc = value }
    set squish(value: number) { this.json.s = value }
}