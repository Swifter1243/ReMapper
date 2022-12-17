// deno-lint-ignore-file adjacent-overload-signatures
import { activeDiffGet, Json } from './beatmap.ts';
import { copy, Vec3, worldToWall } from './general.ts';
import { Animation, AnimationInternals, bakeAnimation, complexifyArray, ComplexKeyframesAny, ComplexKeyframesVec3, isSimple, Keyframe, KeyframesVec3, RawKeyframesAny, RawKeyframesVec3, simplifyArray } from './animation.ts';
import { BaseGameplayObject } from './object.ts';
import { getModel, ModelObject } from './model.ts';
import { OptimizeSettings } from './anim_optimizer.ts';

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

/**
 * Create a wall for debugging. Position, rotation, and scale are in world space and can be animations.
 * @param transform All of the transformations for the wall.
 * @param animStart When animation starts.
 * @param animDur How long animation lasts for.
 * @param animFreq Frequency of keyframes in animation.
 * @param animOptimizer Optimizer for the animation.
 */
export function debugWall(
    transform: { pos?: RawKeyframesVec3, rot?: RawKeyframesVec3, scale?: RawKeyframesVec3 },
    animStart?: number,
    animDur?: number,
    animFreq?: number,
    animOptimizer = new OptimizeSettings()
) {
    animStart ??= 0;
    animDur ??= 0;
    animFreq ??= 1 / 64;

    const pos = transform.pos ?? [0, 0, 0];
    const rot = transform.rot ?? [0, 0, 0];
    const scale = transform.scale ?? [1, 1, 1];

    const wall = new Wall();
    wall.life = animDur + 69420;
    wall.lifeStart = 0;
    wall.color = [0, 0, 0, 1];
    wall.position = [0, 0];

    if (
        !isSimple(pos) ||
        !isSimple(rot) ||
        !isSimple(scale)
    ) {
        transform = bakeAnimation(transform, keyframe => {
            const wtw = worldToWall(keyframe.pos, keyframe.rot, keyframe.scale, true);
            keyframe.pos = wtw.pos;
            keyframe.scale = wtw.scale;
            keyframe.time = keyframe.time * (animDur as number) + (animStart as number);
        }, animFreq, animOptimizer);

        wall.scale = [1, 1, 1];
        wall.animate.length = wall.life;
        wall.animate.definitePosition = transform.pos as KeyframesVec3;
        wall.animate.localRotation = transform.rot as KeyframesVec3;
        wall.animate.scale = transform.scale as KeyframesVec3;
    }
    else {
        const wtw = worldToWall(pos as Vec3, rot as Vec3, scale as Vec3);
        wall.animate.definitePosition = wtw.pos;
        wall.scale = wtw.scale;
        wall.localRotation = rot as Vec3;
    }

    wall.push();
}

let modelToWallCount = 0;

/**
 * Function to represent objects as walls.
 * @param input Can be a path to a model or an array of objects.
 * @param start Wall's lifespan start.
 * @param end Wall's lifespan end.
 * @param wall A callback for each wall being spawned.
 * @param distribution Beats to spread spawning of walls out. 
 * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
 * @param animFreq The frequency for the animation baking (if using array of objects).
 * @param animOptimizer The optimizer for the animation baking (if using array of objects).
 */
export function modelToWall(
    input: string | ModelObject[],
    start: number,
    end: number,
    wall?: (wall: Wall) => void,
    distribution = 1,
    animFreq?: number,
    animOptimizer = new OptimizeSettings()
) {
    animFreq ??= 1 / 64;

    let objects: ModelObject[] = [];
    modelToWallCount++;

    function isAnimated(obj: ModelObject) {
        return (
            !isSimple(obj.pos) ||
            !isSimple(obj.rot) ||
            !isSimple(obj.scale)
        )
    }

    const w = new Wall();
    w.life = end - start;
    w.lifeStart = start;
    w.animate.dissolve = [[0, 0], [1, 0]];
    w.position = [0, 0];
    w.interactable = false;

    if (typeof input === "string") {
        objects = getModel(input, `modelToWall_${modelToWallCount}`, o => {
            o.forEach(x => {
                const animated = isAnimated(x);

                const pos = complexifyArray(x.pos) as ComplexKeyframesVec3;
                const rot = complexifyArray(x.rot) as ComplexKeyframesVec3;
                const scale = complexifyArray(x.scale) as ComplexKeyframesVec3;

                const getVec3 = (keyframes: ComplexKeyframesVec3, index: number) =>
                    [keyframes[index][0], keyframes[index][1], keyframes[index][2]] as Vec3

                for (let i = 0; i < pos.length; i++) {
                    const wtw = worldToWall(getVec3(pos, i), getVec3(rot, i), getVec3(scale, i), animated);
                    pos[i] = [...wtw.pos, pos[i][3]];
                    scale[i] = [...wtw.scale, scale[i][3]];
                }

                x.pos = simplifyArray(pos) as RawKeyframesVec3;
                x.rot = simplifyArray(rot) as RawKeyframesVec3;
                x.scale = simplifyArray(scale) as RawKeyframesVec3;
            })
        });
    }
    else {
        objects = input.map(x => {
            const animated = isAnimated(x);

            const anim = bakeAnimation({
                pos: x.pos,
                rot: x.rot,
                scale: x.scale
            }, k => {
                const wtw = worldToWall(k.pos, k.rot, k.scale, animated);
                k.pos = wtw.pos;
                k.scale = wtw.scale;
            }, animFreq, animOptimizer)

            x.pos = anim.pos;
            x.rot = anim.rot;
            x.scale = anim.scale;

            return x;
        })
    }

    objects.forEach((x, i) => {
        const o = copy(w);
        o.animate = new Animation().wallAnimation(o.animation);

        if (distribution > 0) {
            const fraction = i / (objects.length - 1);
            const backwardOffset = o.life * fraction;
            const newLife = o.life + backwardOffset;
            const animMul = o.life / newLife;
            const animAdd = 1 - animMul;

            o.life = newLife;
            o.lifeStart = start - backwardOffset;

            const transformAnim = (anim: RawKeyframesAny) => {
                if (isSimple(anim)) return anim;
                (anim as ComplexKeyframesAny).forEach(k => {
                    const keyframe = new Keyframe(k);
                    const newTime = (keyframe.time * animMul) + animAdd;
                    k[keyframe.timeIndex] = newTime;
                })
            }

            transformAnim(x.pos);
            transformAnim(x.rot);
            transformAnim(x.scale);
            transformAnim(o.animate.dissolve as RawKeyframesAny);
        }

        o.animate.definitePosition = x.pos;
        if (x.color) o.color = x.color;

        if (isSimple(x.rot)) o.localRotation = x.rot as Vec3;
        else o.animate.localRotation = x.rot;

        if (isSimple(x.scale)) o.scale = x.scale as Vec3;
        else {
            o.scale = [1, 1, 1];
            o.animate.scale = x.scale;
        }

        if (wall) wall(o);
        o.push(true, false);
    })
}