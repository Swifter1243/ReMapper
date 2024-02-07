// deno-lint-ignore-file
import {
    ComplexKeyframesAny,
    ComplexKeyframesVec3,
    RawKeyframesAny,
    RuntimeRawKeyframesVec3,
} from '../types/animation_types.ts'

import { arrayAdd } from '../utils/array_utils.ts'
import { rotatePoint } from '../utils/math.ts'

import {
    optimizeKeyframes,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'

import { bakeAnimation, complexifyArray } from '../animation/animation_utils.ts'

import { wall } from '../beatmap/wall.ts'
import { Wall } from '../internals/wall.ts'

import { getModel } from './model.ts'
import { ModelObject, ReadonlyModel } from '../types/model_types.ts'
import { ColorVec, Vec3 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import { areKeyframesSimple, getKeyframeTime } from '../animation/keyframe.ts'
import { getActiveDifficulty } from '../mod.ts'
import { DeepReadonly } from '../types/util_types.ts'
import { arrayDivide, arrayMultiply, vec } from '../utils/mod.ts'

let modelToWallCount = 0

/**
 * Calculate the correct position for a wall to line up with a position in the world.
 * Assumes that position is set to [0,0].
 * @param pos Position of the wall in world space.
 * @param rot Rotation of the wall in world space.
 * @param scale Scale of the wall in world space.
 * @param animated Corrects for animated scale. If you are using this, plug [1,1,1] into static scale.
 */
export function worldToWall(
    pos: DeepReadonly<Vec3> = [0, 0, 0],
    rot: DeepReadonly<Vec3> = [0, 0, 0],
    scale: DeepReadonly<Vec3> = [1, 1, 1],
    animated = false,
) {
    // Turn units into noodle unit scale
    const resizedScale = arrayDivide(scale as Vec3, 0.6)
    let resizedPos = arrayDivide(pos as Vec3, 0.6)

    // Initialize offset to get to center
    let offset = vec(0, -0.5, -0.5)

    // Scale offset
    offset = arrayMultiply(offset, resizedScale)

    // Rotate offset
    offset = rotatePoint(offset, rot)

    // Add position
    resizedPos = arrayAdd(resizedPos, offset)

    // Move walls up because they're down for some reason
    resizedPos[1] += 0.2

    // Move by half of the base width
    // In the case of animated, this is implicitly 1
    resizedPos[0] -= animated ? 0.5 : resizedScale[0] / 2

    return {
        pos: resizedPos,
        scale: resizedScale,
    }
}

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
    input: string | ReadonlyModel,
    start: number,
    end: number,
    wallCall?: (wall: Wall) => void,
    distribution?: number,
    animFreq?: number,
    animOptimizer = new OptimizeSettings(),
) {
    const diff = getActiveDifficulty()
    return await diff.runAsync(async () => {
        animFreq ??= 1 / 64
        distribution ??= 1

        const dur = end - start

        modelToWallCount++

        function isAnimated(obj: ModelObject) {
            return (
                !areKeyframesSimple(obj.pos) ||
                !areKeyframesSimple(obj.rot) ||
                !areKeyframesSimple(obj.scale)
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
            distributeAnim(
                o.animation.dissolve as RawKeyframesAny,
                index,
                length,
            )
        }

        function distributeAnim(
            anim: RawKeyframesAny,
            index: number,
            length: number,
        ) {
            if (distribution === undefined || length < 1) return
            const nums = getDistributeNums(index, length)

            if (areKeyframesSimple(anim)) {
                return anim
            }

            ;(anim as ComplexKeyframesAny).forEach((k) => {
                const time = getKeyframeTime(k)
                k[time] = ((k as number[])[time] * nums.animMul) + nums.animAdd
            })
        }

        const w = wall()
        w.life = end - start
        w.lifeStart = start
        w.animation.dissolve = [[0, 0], [1, 0]]
        w.coordinates = [0, 0]
        w.interactable = false

        let objects: ReadonlyModel

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

                        x.pos = optimizeKeyframes(pos, animOptimizer)
                        x.rot = optimizeKeyframes(rot, animOptimizer)
                        x.scale = optimizeKeyframes(scale, animOptimizer)

                        distributeAnim(x.pos, i, o.length)
                        distributeAnim(x.rot, i, o.length)
                        distributeAnim(x.scale, i, o.length)
                    })
                },
                [animOptimizer, distribution],
            )
        } else {
            objects = input.map((x, i) => {
                const o = copy(x) as ModelObject
                const animated = isAnimated(o)

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

                o.pos = anim.pos
                o.rot = anim.rot
                o.scale = anim.scale

                distributeAnim(o.pos, i, input.length)
                distributeAnim(o.rot, i, input.length)
                distributeAnim(o.scale, i, input.length)

                return o
            })
        }

        objects.forEach((x, i) => {
            const o = copy(w)

            o.animation.definitePosition = copy(
                x.pos,
            ) as RuntimeRawKeyframesVec3
            if (x.color) o.color = copy(x.color) as ColorVec

            if (areKeyframesSimple(x.rot)) o.localRotation = copy(x.rot) as Vec3
            else {o.animation.localRotation = copy(
                    x.rot,
                ) as RuntimeRawKeyframesVec3}

            if (areKeyframesSimple(x.scale)) o.scale = copy(x.scale) as Vec3
            else {
                o.scale = [1, 1, 1]
                o.animation.scale = copy(x.scale) as RuntimeRawKeyframesVec3
            }

            distributeWall(o, i, objects.length)

            if (wallCall) wallCall(o)
            o.push(false)
        })
    })
}
