// deno-lint-ignore-file
import {
    ComplexKeyframesAny,
    ComplexKeyframesVec3,
    RawKeyframesAny,
    RuntimeComplexKeyframesAny,
    RuntimeRawKeyframesVec3,
} from '../types/animation_types.ts'

import { arrayAdd } from '../utils/array_utils.ts'
import { rotatePoint } from '../utils/math.ts'

import {
    optimizeKeyframes,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'

import {
    bakeAnimation,
    complexifyKeyframes,
} from '../animation/animation_utils.ts'

import { wall } from '../beatmap/wall.ts'
import { Wall } from '../internals/wall.ts'

import { getModel } from './model.ts'
import { ModelObject, ReadonlyModel } from '../types/model_types.ts'
import { ColorVec, Transform, Vec3 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import {
    areKeyframesSimple,
    getKeyframeTime,
    getKeyframeTimeIndex,
} from '../animation/keyframe.ts'
import { getActiveDifficulty } from '../mod.ts'
import { DeepReadonly } from '../types/util_types.ts'
import { arrayDivide, arrayMultiply, vec } from '../utils/mod.ts'
import { AnimationSettings } from '../animation/anim_optimizer.ts'
import { AnimatedTransform } from '../types/mod.ts'

let modelToWallCount = 0

/**
 * Calculate the correct position for a wall to line up with a position in the world.
 * Assumes that position is set to [0,0].
 * @param animated Corrects for animated scale. If you are using this, plug [1,1,1] into static scale.
 */
export function worldToWall(
    transform: DeepReadonly<Transform>,
    animated = false,
) {
    const position = transform.position ?? [0, 0, 0]
    const rotation = transform.rotation ?? [0, 0, 0]
    const scale = transform.scale ?? [1, 1, 1]

    // Turn units into noodle unit scale
    const resizedScale = arrayDivide(scale as Vec3, 0.6)
    let resizedPos = arrayDivide(position as Vec3, 0.6)

    // Initialize offset to get to center
    let offset = vec(0, -0.5, -0.5)

    // Scale offset
    offset = arrayMultiply(offset, resizedScale)

    // Rotate offset
    offset = rotatePoint(offset, rotation)

    // Add position
    resizedPos = arrayAdd(resizedPos, offset)

    // Move walls up because they're down for some reason
    resizedPos[1] += 0.2

    // Move by half of the base width
    // In the case of animated, this is implicitly 1
    resizedPos[0] -= animated ? 0.5 : resizedScale[0] / 2

    return {
        position: resizedPos,
        scale: resizedScale,
    }
}

/**
 * Function to represent objects as walls.
 * @param input Can be a path to a model or an array of objects.
 * @param start Wall's lifespan start.
 * @param end Wall's lifespan end.
 * @param forWall A callback for each wall being spawned.
 * @param distribution Beats to spread spawning of walls out.
 * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
 */
export async function modelToWall(
    input: string | ReadonlyModel,
    start: number,
    end: number,
    forWall?: (wall: Wall) => void,
    distribution?: number,
    animationSettings?: AnimationSettings,
) {
    animationSettings ??= new AnimationSettings()
    distribution ??= 0.3

    const diff = getActiveDifficulty()
    return await diff.runAsync(async () => {
        modelToWallCount++

        function isAnimated(obj: ModelObject) {
            return (
                !areKeyframesSimple(obj.position) ||
                !areKeyframesSimple(obj.rotation) ||
                !areKeyframesSimple(obj.scale)
            )
        }

        const duration = end - start
        const w = wall()
        w.animation.dissolve = [[0, 0], [1, 0]]
        w.coordinates = [0, 0]
        w.uninteractable = false

        let objects: ReadonlyModel

        if (typeof input === 'string') {
            objects = await getModel(
                input,
                `modelToWall_${modelToWallCount}`,
                (o) => {
                    o.forEach((x, i) => {
                        const animated = isAnimated(x)

                        const pos = complexifyKeyframes(x.position)
                        const rot = complexifyKeyframes(x.rotation)
                        const scale = complexifyKeyframes(x.scale)

                        const getVec3 = (
                            keyframes: ComplexKeyframesVec3,
                            index: number,
                        ) => [
                            keyframes[index][0],
                            keyframes[index][1],
                            keyframes[index][2],
                        ] as Vec3

                        for (let i = 0; i < pos.length; i++) {
                            const transform: Transform = {
                                position: getVec3(pos, i),
                                rotation: getVec3(rot, i),
                                scale: getVec3(scale, i),
                            }

                            const wtw = worldToWall(
                                transform,
                                animated,
                            )

                            pos[i] = [...wtw.position, pos[i][3]]
                            scale[i] = [...wtw.scale, scale[i][3]]
                        }

                        x.position = optimizeKeyframes(
                            pos,
                            animationSettings!.optimizeSettings,
                        )
                        x.rotation = optimizeKeyframes(
                            rot,
                            animationSettings!.optimizeSettings,
                        )
                        x.scale = optimizeKeyframes(
                            scale,
                            animationSettings!.optimizeSettings,
                        )
                    })
                },
                [animationSettings!.toData(), distribution],
            )
        } else {
            objects = input.map((x, i) => {
                const o = copy(x) as ModelObject
                const animated = isAnimated(o)

                const anim = bakeAnimation(
                    {
                        position: x.position,
                        rotation: x.rotation,
                        scale: x.scale,
                    },
                    (k) => {
                        const wtw = worldToWall(k, animated)
                        k.position = wtw.position
                        k.scale = wtw.scale
                    },
                )

                o.position = anim.position
                o.rotation = anim.rotation
                o.scale = anim.scale

                return o
            })
        }

        objects.forEach((x, i) => {
            const o = copy(w)

            // Copy position
            o.animation.definitePosition = copy(
                x.position,
            ) as RuntimeRawKeyframesVec3
            if (x.color) o.color = copy(x.color) as ColorVec

            // Copy rotation
            if (areKeyframesSimple(x.rotation)) {
                o.localRotation = copy(x.rotation) as Vec3
            } else {
                o.animation.localRotation = copy(
                    x.rotation,
                ) as RuntimeRawKeyframesVec3
            }

            // Copy scale
            if (areKeyframesSimple(x.scale)) o.size = copy(x.scale) as Vec3
            else {
                o.size = [1, 1, 1]
                o.animation.scale = copy(x.scale) as RuntimeRawKeyframesVec3
            }

            // Run callback
            if (forWall) forWall(o)

            // Distribute walls
            if (distribution! > 0 && objects.length > 1) {
                const fraction = i / (objects.length - 1)
                const beatOffset = fraction * distribution!
                const squish = duration / (duration + beatOffset)
                const animationOffset = 1 - squish

                for (const key in o.animation) {
                    const anim = o.animation[key]!

                    if (typeof anim === 'string') continue

                    const complexAnim = (typeof anim[0] === 'object'
                        ? anim
                        : [anim]) as RuntimeComplexKeyframesAny

                    complexAnim.forEach((k) => {
                        const timeIndex = getKeyframeTimeIndex(k)
                        const time = (k[timeIndex] as number) * squish +
                            animationOffset
                        k[timeIndex] = time
                    })
                }

                o.life = duration + beatOffset
                o.lifeStart = start - beatOffset
            } else {
                o.life = duration
                o.lifeStart = start
            }

            o.push(false)
        })
    })
}

/** Transform a wall given a transform. If animated, it will be baked. */
export function setWallWorldTransform(
    wall: Wall,
    transform: DeepReadonly<AnimatedTransform>,
    animationSettings = new AnimationSettings(),
) {
    const animatedScale = !areKeyframesSimple(transform.scale ?? [1, 1, 1])
    const animatedRotation = !areKeyframesSimple(transform.position ?? [0, 0, 0])
    const animatedPosition = !areKeyframesSimple(transform.position ?? [0, 0, 0])
    const needsBake = animatedRotation || animatedPosition || animatedScale

    if (needsBake) {
        bakeWallWorldTransform(wall, transform, animationSettings)
    } else {
        const wtw = worldToWall(transform as Transform, false)

        wall.size = wtw.scale
        wall.localRotation = copy(transform.rotation) as Vec3
        wall.animation.definitePosition = wtw.position
        wall.coordinates = [0, 0]
        wall.animation.scale = undefined
        wall.animation.localRotation = undefined
    }
}

/** Bake an animated transform into a wall. */
export function bakeWallWorldTransform(
    wall: Wall,
    transform: DeepReadonly<AnimatedTransform>,
    animationSettings = new AnimationSettings(),
) {
    wall.coordinates = [0, 0]
    wall.size = [1, 1, 1]

    const anim = bakeAnimation(
        transform,
        (k) => {
            const wtw = worldToWall(k, true)
            k.position = wtw.position
            k.scale = wtw.scale
        },
        animationSettings,
    )

    wall.animation.definitePosition = anim.position
    wall.animation.localRotation = anim.rotation
    wall.animation.scale = anim.scale
}
