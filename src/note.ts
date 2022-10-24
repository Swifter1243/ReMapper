// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { activeDiffGet } from './beatmap.ts';
import { Animation, AnimationInternals } from './animation.ts';
import { CUT, NOTE } from './constants.ts';
import { BaseGameplayObject } from './object.ts';
import { copy } from './general.ts';

export class Note extends BaseGameplayObject {
    json: Record<string, any> = {
        b: 0,
        x: 0,
        y: 0,
        c: 0,
        d: 0,
        a: 0, 
        _customData: {
            _animation: {}
        }
    };
    animate = new Animation().noteAnimation(this.animation);

    /**
     * Note object for ease of creation
     */
    constructor(time = 0, type = NOTE.BLUE, direction = CUT.DOWN, x = 0, y = 0) {
        super();
        this.time = time;
        this.type = type;
        this.direction = direction;
        this.x = x;
        this.y = y;
    }

    /**
     * Create a note using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json: Record<number, any>) {
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
        activeDiffGet().notes.push(copy(this));
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

    get y() { return this.json.y }
    get type() { return this.json.c }
    get direction() { return this.json.d }
    get angleOffset() { return this.json.a }
    get flip() { return this.json._customData._flip }
    get noteGravity() { return !this.json._customData._disableNoteGravity }
    get noteLook() { return !this.json._customData._disableNoteLook }
    get spawnEffect() { return !this.json._customData._disableSpawnEffect }

    set y(value: number) { this.json.y = value }
    set type(value: NOTE) { this.json.c = value }
    set direction(value: CUT) { this.json.d = value }
    set angleOffset(value: number) { this.json.a = value }
    set flip(value: boolean) { this.json._customData._flip = value }
    set noteGravity(value: boolean) { this.json._customData._disableNoteGravity = !value }
    set noteLook(value: boolean) { this.json._customData._disableNoteLook = !value }
    set spawnEffect(value: boolean) { this.json._customData._disableSpawnEffect = !value }
}