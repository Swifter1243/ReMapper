// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { activeDiffGet } from './beatmap.ts';
import { Animation, AnimationInternals } from './animation.ts';
import { NOTE } from './constants.ts';
import { BaseGameplayObject } from './object.ts';
import { copy } from './general.ts';

export class Note extends BaseGameplayObject {
    json: Record<string, any> = {
        _time: 0,
        _type: 0,
        _cutDirection: 0,
        _lineIndex: 0,
        _lineLayer: 0,
        _customData: {
            _animation: {}
        }
    };
    animate = new Animation().noteAnimation(this.animation);

    /**
     * Note object for ease of creation
     */
    constructor(time?: number, type?: NOTE, direction?: NOTE, x = 0, y = 0) {
        super();
        if (time !== undefined) this.time = time;
        if (type !== undefined) this.type = type;
        if (direction !== undefined) this.direction = direction;
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

    get y() { return this.json._lineLayer }
    get direction() { return this.json._cutDirection }
    get preciseDirection() { return this.json._customData._cutDirection }
    get flip() { return this.json._customData._flip }
    get noteGravity() { return !this.json._customData._disableNoteGravity }
    get noteLook() { return !this.json._customData._disableNoteLook }
    get spawnEffect() { return !this.json._customData._disableSpawnEffect }

    set y(value: number) { this.json._lineLayer = value }
    set direction(value: number) { this.json._cutDirection = value }
    set preciseDirection(value: number) { this.json._customData._cutDirection = value }
    set flip(value: boolean) { this.json._customData._flip = value }
    set noteGravity(value: boolean) { this.json._customData._disableNoteGravity = !value }
    set noteLook(value: boolean) { this.json._customData._disableNoteLook = !value }
    set spawnEffect(value: boolean) { this.json._customData._disableSpawnEffect = !value }
}