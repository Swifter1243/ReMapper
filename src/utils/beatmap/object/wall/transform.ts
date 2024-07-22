import { Wall } from '../../../../internals/beatmap/object/gameplay_object/wall.ts'
import { AnimationSettings } from '../../../animation/optimizer.ts'
import { bakeAnimation } from '../../../animation/bake.ts'
import { areKeyframesSimple } from '../../../animation/keyframe/complexity.ts'
import {worldToWall} from "./world_to_wall.ts";
import {copy} from "../../../object/copy.ts";
import {Vec3} from "../../../../types/math/vector.ts";
import {AnimatedTransform, Transform} from "../../../../types/math/transform.ts";
import {DeepReadonly} from "../../../../types/util/mutability.ts";

/** Transform a wall given a transform. If animated, it will be baked. */
export function setWallWorldTransform(
    wall: Wall,
    transform: DeepReadonly<AnimatedTransform>,
    animationSettings = new AnimationSettings(),
) {
    const animatedScale = !areKeyframesSimple(transform.scale ?? [1, 1, 1])
    const animatedRotation = !areKeyframesSimple(
        transform.position ?? [0, 0, 0],
    )
    const animatedPosition = !areKeyframesSimple(
        transform.position ?? [0, 0, 0],
    )
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
    wall.localRotation = [0, 0, 0]

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
