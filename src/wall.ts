// deno-lint-ignore-file adjacent-overload-signatures
import { activeDiffGet, Json } from './beatmap.ts';
import { copy, Vec3 } from './general.ts';
import { Animation, AnimationInternals } from './animation.ts';
import { BaseGameplayObject } from './object.ts';

export class Wall extends BaseGameplayObject {
    json: Json = {
        b: 0,
        x: 0,
        y: 0,
        d: 0,
        w: 1,
        h: 1,
        customData: {
            animation: {}
        }
    };
    /** The animation of this wall. */
    animate = new Animation().wallAnimation(this.animation);

    /**
     * Wall object for ease of creation.
     * @param time The time this wall will arrive at the player.
     * @param duration The duration of the wall.
     * @param x The lane of the wall.
     * @param y The vertical row of the wall.
     * @param height The height of the wall.
     * @param width The width of the wall.
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
     * Create a wall using Json.
     * @param json Json to import.
     */
    import(json: Json) {
        this.json = json;
        if (this.customData === undefined) this.customData = {};
        if (this.animation === undefined) this.animation = {};
        this.animate = new Animation().wallAnimation(this.animation);
        return this;
    }

    /**
     * Push this wall to the difficulty.
     * @param fake Whether this wall will be pushed to the fakeWalls array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(fake = false, clone = true) {
        if (fake) activeDiffGet().fakeWalls.push(clone ? copy(this) : this);
        else activeDiffGet().walls.push(clone ? copy(this) : this);
        return this;
    }

    /**
     * Apply an animation through the Animation class.
     * @param animation Animation to apply.
     */
    importAnimation(animation: AnimationInternals.BaseAnimation) {
        this.animation = animation.json;
        this.animate = new Animation().wallAnimation(this.animation);
        return this;
    }

    /** The duration of the wall. */
    get duration() { return this.json.d }
    /** The height of the wall. */
    get height() { return this.json.h }
    /** The width of the wall. */
    get width() { return this.json.w }
    /** The scale of the wall. */
    get scale() { return this.json.customData.size }
    get life() { return this.halfJumpDur * 2 + this.duration }
    get lifeStart() { return this.time - this.halfJumpDur }

    set duration(value: number) { this.json.d = value }
    set height(value: number) { this.json.h = value }
    set width(value: number) { this.json.w = value }
    set scale(value: Vec3) { this.json.customData.size = value }
    set life(value: number) { this.duration = value - (this.halfJumpDur * 2) }
    set lifeStart(value: number) { this.time = value + this.halfJumpDur }
}