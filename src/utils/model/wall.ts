// deno-lint-ignore-file

import {AnimationSettings, optimizeKeyframes,} from '../animation/optimizer.ts'

import {wall} from '../../builder_functions/beatmap/object/gameplay_object/wall.ts'
import {Wall} from '../../internals/beatmap/object/gameplay_object/wall.ts'

import {getModel} from './file.ts'
import {areKeyframesSimple, complexifyKeyframes,} from '../animation/keyframe/complexity.ts'
import {getKeyframeTimeIndex} from "../animation/keyframe/get.ts";
import {bakeAnimation} from "../animation/bake.ts";
import {worldToWall} from "../beatmap/object/wall/world_to_wall.ts";
import { getActiveDifficulty } from '../../data/active_difficulty.ts'
import { copy } from '../object/copy.ts'
import {ColorVec, Vec3} from "../../types/math/vector.ts";
import {Transform} from "../../types/math/transform.ts";
import {RuntimeRawKeyframesVec3} from "../../types/animation/keyframe/runtime/vec3.ts";
import {RuntimeComplexKeyframesAny} from "../../types/animation/keyframe/runtime/any.ts";
import {ComplexKeyframesVec3} from "../../types/animation/keyframe/vec3.ts";
import {ModelObject, ReadonlyModel} from "../../types/model/object.ts";

let modelToWallCount = 0

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

