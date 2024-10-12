// deno-lint-ignore-file

import { AnimationSettings, optimizeKeyframes } from '../animation/optimizer.ts'
import { wall } from '../../builder_functions/beatmap/object/gameplay_object/wall.ts'
import { getModel } from './file.ts'
import { areKeyframesSimple, complexifyKeyframes, simplifyKeyframes } from '../animation/keyframe/complexity.ts'
import { getKeyframeTimeIndex } from '../animation/keyframe/get.ts'
import { bakeAnimation } from '../animation/bake.ts'
import { worldToWall } from '../beatmap/object/wall/world_to_wall.ts'
import { copy } from '../object/copy.ts'
import { ColorVec, Vec3 } from '../../types/math/vector.ts'
import { Transform } from '../../types/math/transform.ts'
import { ComplexKeyframesVec3 } from '../../types/animation/keyframe/vec3.ts'
import { ModelObject, ReadonlyModel } from '../../types/model/object.ts'
import { Wall } from '../../internals/beatmap/object/gameplay_object/wall.ts'
import { ComplexKeyframesBoundless } from '../../types/animation/keyframe/boundless.ts'
import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";

let modelToWallCount = 0

/**
 * Represents model objects as walls, supporting animations. Returns the walls spawned.
 * @param difficulty The difficulty to push the walls to.
 * @param input Can be a path to a model or an array of objects.
 * @param start Wall's lifespan start.
 * @param end Wall's lifespan end.
 * @param distribution Beats to spread spawning of walls out to prevent lag spikes.
 * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
 * @param animationSettings Settings for processing the animation, if there is any.
 */
export async function modelToWall(
    difficulty: AbstractDifficulty,
    input: string | ReadonlyModel,
    start: number,
    end: number,
    distribution?: number,
    animationSettings?: AnimationSettings,
): Promise<Wall[]> {
    animationSettings ??= new AnimationSettings()
    distribution ??= 0.3

    return await difficulty.runAsync(async () => {
        modelToWallCount++

        function isAnimated(obj: ModelObject) {
            return (
                !areKeyframesSimple(obj.position) ||
                !areKeyframesSimple(obj.rotation) ||
                !areKeyframesSimple(obj.scale)
            )
        }

        const duration = end - start
        const spawnedWall = wall()
        spawnedWall.animation.dissolve = [[0, 0], [1, 0]]
        spawnedWall.coordinates = [0, 0]
        spawnedWall.uninteractable = false

        async function getObjectsFromInput(): Promise<ReadonlyModel> {
            if (typeof input === 'string') {
                return await getObjectsFromString(input)
            } else {
                return await getObjectsFromArray(input)
            }
        }

        async function getObjectsFromString(input: string): Promise<ReadonlyModel> {
            function processFileObject(x: ModelObject) {
                const objectIsAnimated = isAnimated(x)

                const position = complexifyKeyframes(x.position)
                const rotation = complexifyKeyframes(x.rotation)
                const scale = complexifyKeyframes(x.scale)

                function getVec3(
                    keyframes: ComplexKeyframesVec3,
                    index: number,
                ): Vec3 {
                    return [
                        keyframes[index][0],
                        keyframes[index][1],
                        keyframes[index][2],
                    ]
                }

                for (let i = 0; i < position.length; i++) {
                    const transform: Transform = {
                        position: getVec3(position, i),
                        rotation: getVec3(rotation, i),
                        scale: getVec3(scale, i),
                    }

                    const wtw = worldToWall(
                        transform,
                        objectIsAnimated,
                    )

                    position[i] = [...wtw.position, position[i][3]]
                    scale[i] = [...wtw.scale, scale[i][3]]
                }

                x.position = optimizeKeyframes(position, animationSettings!.optimizeSettings)
                x.rotation = optimizeKeyframes(rotation, animationSettings!.optimizeSettings)
                x.scale = optimizeKeyframes(scale, animationSettings!.optimizeSettings)
            }

            return await getModel(input, `modelToWall_${modelToWallCount}`, (o) => {
                o.forEach(processFileObject)
            }, animationSettings!.toData() + distribution!.toString())
        }

        async function getObjectsFromArray(input: ReadonlyModel): Promise<ReadonlyModel> {
            return input.map((x) => {
                const o = copy(x) as ModelObject
                const objectIsAnimated = isAnimated(o)

                const anim = bakeAnimation(x, (k) => {
                    const wtw = worldToWall(k, objectIsAnimated)
                    k.position = wtw.position
                    k.scale = wtw.scale
                })

                o.position = simplifyKeyframes(anim.position)
                o.rotation = simplifyKeyframes(anim.rotation)
                o.scale = simplifyKeyframes(anim.scale)

                return o
            })
        }

        const objects = await getObjectsFromInput()
        return objects.map((x, i) => {
            const wall = copy(spawnedWall)

            // Copy position
            wall.animation.definitePosition = copy(x.position)
            if (x.color) wall.chromaColor = copy(x.color) as ColorVec

            // Copy rotation
            if (areKeyframesSimple(x.rotation)) {
                wall.localRotation = copy(x.rotation) as Vec3
            } else {
                wall.animation.localRotation = copy(x.rotation)
            }

            // Copy scale
            if (areKeyframesSimple(x.scale)) wall.size = copy(x.scale) as Vec3
            else {
                wall.size = [1, 1, 1]
                wall.animation.scale = copy(x.scale)
            }

            // Distribute walls
            if (distribution! > 0 && objects.length > 1) {
                const fraction = i / (objects.length - 1)
                const beatOffset = fraction * distribution!
                const squish = duration / (duration + beatOffset)
                const animationOffset = 1 - squish

                for (const key in wall.animation) {
                    const keyframes = wall.animation[key]!
                    if (typeof keyframes === 'string') continue

                    const complexKeyframes = typeof keyframes[0] === 'object' ? keyframes : [[...keyframes, 0]] as ComplexKeyframesBoundless
                    complexKeyframes.forEach((k) => {
                        const timeIndex = getKeyframeTimeIndex(k)
                        k[timeIndex] = (k[timeIndex] as number) * squish + animationOffset
                    })
                }

                wall.life = duration + beatOffset
                wall.lifeStart = start - beatOffset
            } else {
                wall.life = duration
                wall.lifeStart = start
            }

            return wall
        })
    })
}
