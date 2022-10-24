// deno-lint-ignore-file adjacent-overload-signatures no-explicit-any
import { activeDiffGet } from './beatmap.ts';
import { copy, Vec3 } from './general.ts';
import { Animation, AnimationInternals } from './animation.ts';
import { BaseGameplayObject } from './object.ts';

export class Wall extends BaseGameplayObject {
    json: Record<string, any> = {
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
     */
    constructor(time = 0, duration = 1, x = 0, y = 0, height = 1, width = 1) {
        super();
        this.time = time;
        this.duration = duration;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }

    /**
     * Create a wall using JSON.
     * @param {Object} json 
     * @returns {Note}
     */
    import(json: Record<string, any>) {
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
        activeDiffGet().walls.push(copy(this));
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

    get duration() { return this.json.d }
    get height() { return this.json.h }
    get width() { return this.json.w }
    get scale() { return this.json._customData._scale }
    get life() { return this.halfJumpDur * 2 + this.duration }
    get lifeStart() { return this.time - this.halfJumpDur }

    set duration(value: number) { this.json.d = value }
    set height(value: number) { this.json.h = value }
    set width(value: number) { this.json.w = value }
    set scale(value: Vec3) { this.json._customData._scale = value }
    set life(value: number) { this.duration = value - (this.halfJumpDur * 2) }
    set lifeStart(value: number) { this.time = value + this.halfJumpDur }
}