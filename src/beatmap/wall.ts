// deno-lint-ignore-file adjacent-overload-signatures no-extra-semi
import { worldToWall } from '../general.ts'
import { wallAnimation } from '../animation/animation.ts'
import { BaseGameplayObject } from './object.ts'
import { getModel, ModelObject } from '../model.ts'
import {
    optimizeAnimation,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'
import {
    ComplexKeyframesAny,
    ComplexKeyframesVec3,
    Fields,
    KeyframesVec3,
    RawKeyframesAny,
    RawKeyframesVec3,
    Vec3,
} from '../data/types.ts'
import { bsmap } from '../deps.ts'
import {
    bakeAnimation,
    complexifyArray,
    isSimple,
} from '../animation/animation_utils.ts'
import { Keyframe } from '../animation/keyframe.ts'
import { activeDiffGet } from '../data/beatmap_handler.ts'

/**
 * Wall object for ease of creation.
 * @param time The time this wall will arrive at the player.
 * @param duration The duration of the wall.
 * @param x The lane of the wall.
 * @param y The vertical row of the wall.
 * @param height The height of the wall.
 * @param width The width of the wall.
 */

export function wall(
    time?: number,
    duration?: number,
    x?: number,
    y?: number,
    height?: number,
    width?: number,
): Wall
export function wall(...params: ConstructorParameters<typeof Wall>): Wall
export function wall(
    ...params: ConstructorParameters<typeof Wall> | [
        time?: number,
        duration?: number,
        x?: number,
        y?: number,
        height?: number,
        width?: number,
    ]
): Wall {
    const [first] = params
    if (typeof first === 'object') {
        return new Wall(first)
    }

    const [time, duration, x, y, height, width] = params

    return new Wall({
        time: time as number ?? 0,
        duration: duration ?? 1,
        lineIndex: x ?? 0,
        lineLayer: y ?? 0,
        height: height,
        width: width,
    })
}

export class Wall
    extends BaseGameplayObject<bsmap.v2.IObstacle, bsmap.v3.IObstacle> {
    toJson(v3: true): bsmap.v3.IObstacle
    toJson(v3: false): bsmap.v2.IObstacle
    toJson(v3: boolean): bsmap.v2.IObstacle | bsmap.v3.IObstacle {
        if (v3) {
            return {
                b: this.time,
                d: this.duration,
                h: this.height,
                w: this.width,
                x: this.lineIndex,
                y: this.lineLayer,
                customData: {
                    animation: this.animation.toJson(v3),
                    size: this.scale,
                    noteJumpMovementSpeed: this.localNJS,
                    noteJumpStartBeatOffset: this.localBeatOffset,
                    localRotation: this.localRotation,
                    coordinates: this.coordinates,
                    worldRotation: this.rotation,
                    track: this.track.value,
                    color: this.color,
                    uninteractable: !(this.interactable ?? false),
                    fake: this.fake ?? true,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IObstacle
        }

        return {
            _duration: this.duration,
            _lineIndex: this.lineIndex,
            _time: this.time,
            _type: 0,
            _width: this.width,
            _customData: {
                _animation: this.animation.toJson(v3),
                _scale: this.scale,
                _noteJumpMovementSpeed: this.localNJS,
                _noteJumpStartBeatOffset: this.localBeatOffset,
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.rotation,
                _track: this.track.value,
                _color: this.color,
                _interactable: this.interactable ?? false,
                _fake: this.fake ?? true,
                ...this.customData,
            },
        } satisfies bsmap.v2.IObstacle
    }

    constructor(
        fields: Partial<Fields<Wall>>,
    ) {
        super(fields, wallAnimation())
    }

    /**
     * Push this wall to the difficulty.
     * @param fake Whether this wall will be pushed to the fakeWalls array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        activeDiffGet().walls.push(clone ? structuredClone(this) : this)
        return this
    }

    /** The duration of the wall. */
    duration = 0
    /** The height of the wall. */
    height = 1
    /** The width of the wall. */
    width = 1
    /** The scale of the wall. */
    scale?: Vec3

    get life() {
        return this.halfJumpDur * 2 + this.duration
    }
    get lifeStart() {
        return this.time - this.halfJumpDur
    }

    set life(value: number) {
        this.duration = value - (this.halfJumpDur * 2)
    }
    set lifeStart(value: number) {
        this.time = value + this.halfJumpDur
    }
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
    transform: {
        pos?: RawKeyframesVec3
        rot?: RawKeyframesVec3
        scale?: RawKeyframesVec3
    },
    animStart?: number,
    animDur?: number,
    animFreq?: number,
    animOptimizer = new OptimizeSettings(),
) {
    animStart ??= 0
    animDur ??= 0
    animFreq ??= 1 / 64

    const pos = transform.pos ?? [0, 0, 0]
    const rot = transform.rot ?? [0, 0, 0]
    const scale = transform.scale ?? [1, 1, 1]

    const w = wall()
    w.life = animDur + 69420
    w.lifeStart = 0
    w.color = [0, 0, 0, 1]
    w.coordinates = [0, 0]

    if (
        !isSimple(pos) ||
        !isSimple(rot) ||
        !isSimple(scale)
    ) {
        transform = bakeAnimation(
            transform,
            (keyframe) => {
                const wtw = worldToWall(
                    keyframe.pos,
                    keyframe.rot,
                    keyframe.scale,
                    true,
                )
                keyframe.pos = wtw.pos
                keyframe.scale = wtw.scale
                keyframe.time = keyframe.time * (animDur as number) +
                    (animStart as number)
            },
            animFreq,
            animOptimizer,
        )

        w.scale = [1, 1, 1]
        w.animation.duration = w.life
        w.animation.definitePosition = transform.pos as KeyframesVec3
        w.animation.localRotation = transform.rot as KeyframesVec3
        w.animation.scale = transform.scale as KeyframesVec3
    } else {
        const wtw = worldToWall(pos as Vec3, rot as Vec3, scale as Vec3)
        w.animation.definitePosition = wtw.pos
        w.scale = wtw.scale
        w.localRotation = rot as Vec3
    }

    w.push()
}

let modelToWallCount = 0

/**
 * Function to represent objects as walls.
 * @param input Can be a path to a model or an array of objects.
 * @param start Wall's lifespan start.
 * @param end Wall's lifespan end.
 * @param wallCall A callback for each wall being spawned.
 * @param distribution Beats to spread spawning of walls out.
 * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
 * @param animFreq The frequency for the animation baking (if using array of objects).
 * @param animOptimizer The optimizer for the animation baking (if using array of objects).
 */
export async function modelToWall(
    input: string | ModelObject[],
    start: number,
    end: number,
    wallCall?: (wall: Wall) => void,
    distribution?: number,
    animFreq?: number,
    animOptimizer = new OptimizeSettings(),
) {
    animFreq ??= 1 / 64
    distribution ??= 1

    const dur = end - start

    modelToWallCount++

    function isAnimated(obj: ModelObject) {
        return (
            !isSimple(obj.pos) ||
            !isSimple(obj.rot) ||
            !isSimple(obj.scale)
        )
    }

    function getDistributeNums(index: number, length: number) {
        const fraction = index / (length - 1)
        const backwardOffset = (distribution as number) * fraction
        const newLife = dur + backwardOffset
        const animMul = dur / newLife
        const animAdd = 1 - animMul

        return {
            backwardOffset: backwardOffset,
            newLife: newLife,
            animMul: animMul,
            animAdd: animAdd,
        }
    }

    function distributeWall(o: Wall, index: number, length: number) {
        if (distribution === undefined || length < 1) return
        const nums = getDistributeNums(index, length)

        o.life = nums.newLife
        o.lifeStart = start - nums.backwardOffset
        distributeAnim(o.animation.dissolve as RawKeyframesAny, index, length)
    }

    function distributeAnim(
        anim: RawKeyframesAny,
        index: number,
        length: number,
    ) {
        if (distribution === undefined || length < 1) return
        const nums = getDistributeNums(index, length)

        if (isSimple(anim)) {
            return anim
        }

        ;(anim as ComplexKeyframesAny).forEach((k) => {
            const keyframe = new Keyframe(k)
            const newTime = (keyframe.time * nums.animMul) + nums.animAdd
            k[keyframe.timeIndex] = newTime
        })
    }

    const w = wall()
    w.life = end - start
    w.lifeStart = start
    w.animation.dissolve = [[0, 0], [1, 0]]
    w.coordinates = [0, 0]
    w.interactable = false

    let objects: ModelObject[]

    if (typeof input === 'string') {
        objects = await getModel(
            input,
            `modelToWall_${modelToWallCount}`,
            (o) => {
                o.forEach((x, i) => {
                    const animated = isAnimated(x)

                    const pos = complexifyArray(x.pos)
                    const rot = complexifyArray(x.rot)
                    const scale = complexifyArray(x.scale)

                    const getVec3 = (
                        keyframes: ComplexKeyframesVec3,
                        index: number,
                    ) => [
                        keyframes[index][0],
                        keyframes[index][1],
                        keyframes[index][2],
                    ] as Vec3

                    for (let i = 0; i < pos.length; i++) {
                        const wtw = worldToWall(
                            getVec3(pos, i),
                            getVec3(rot, i),
                            getVec3(scale, i),
                            animated,
                        )
                        pos[i] = [...wtw.pos, pos[i][3]]
                        scale[i] = [...wtw.scale, scale[i][3]]
                    }

                    x.pos = optimizeAnimation(pos, animOptimizer)
                    x.rot = optimizeAnimation(rot, animOptimizer)
                    x.scale = optimizeAnimation(scale, animOptimizer)

                    distributeAnim(x.pos, i, o.length)
                    distributeAnim(x.rot, i, o.length)
                    distributeAnim(x.scale, i, o.length)
                })
            },
            [animOptimizer, distribution],
        )
    } else {
        objects = input.map((x, i) => {
            x = structuredClone(x)
            const animated = isAnimated(x)

            const anim = bakeAnimation(
                {
                    pos: x.pos,
                    rot: x.rot,
                    scale: x.scale,
                },
                (k) => {
                    const wtw = worldToWall(k.pos, k.rot, k.scale, animated)
                    k.pos = wtw.pos
                    k.scale = wtw.scale
                },
                animFreq,
                animOptimizer,
            )

            x.pos = anim.pos
            x.rot = anim.rot
            x.scale = anim.scale

            distributeAnim(x.pos, i, input.length)
            distributeAnim(x.rot, i, input.length)
            distributeAnim(x.scale, i, input.length)

            return x
        })
    }

    objects.forEach((x, i) => {
        const o = structuredClone(w)

        o.animation.definitePosition = x.pos
        if (x.color) o.color = x.color

        if (isSimple(x.rot)) o.localRotation = x.rot as Vec3
        else o.animation.localRotation = x.rot

        if (isSimple(x.scale)) o.scale = x.scale as Vec3
        else {
            o.scale = [1, 1, 1]
            o.animation.scale = x.scale
        }

        distributeWall(o, i, objects.length)

        if (wallCall) wallCall(o)
        o.push(false)
    })
}
