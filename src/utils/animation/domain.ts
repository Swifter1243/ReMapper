import { complexifyPoints } from './points/complexity.ts'
import { getPointTime } from './points/get.ts'
import {Vec3, Vec4} from "../../types/math/vector.ts";
import {AnimatedTransform} from "../../types/math/transform.ts";

import {RawPointsAny} from "../../types/animation/points/any.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";

/** Gets the minimum and maximum times of an animation. */
export function getAnimationDomain(arr: DeepReadonly<RawPointsAny>) {
    const newArr = complexifyPoints<[number] | Vec3 | Vec4>(arr)

    let min = 1
    let max = 0

    newArr.forEach((x) => {
        const time = getPointTime(x)
        if (time < min) min = time
        if (time > max) max = time
    })

    return { min: min, max: max }
}

/** Gets the minimum and maximum times of all animations on a model object. */
export function getAnimatedObjectDomain(
    animation: DeepReadonly<AnimatedTransform>,
) {
    const posDomain = getAnimationDomain(animation.position ?? [0, 0, 0])
    const rotDomain = getAnimationDomain(animation.rotation ?? [0, 0, 0])
    const scaleDomain = getAnimationDomain(animation.scale ?? [1, 1, 1])

    const totalMin = getAnimationDomain([
        [0, posDomain.min],
        [0, rotDomain.min],
        [0, scaleDomain.min],
    ]).min

    const totalMax = getAnimationDomain([
        [0, posDomain.max],
        [0, rotDomain.max],
        [0, scaleDomain.max],
    ]).max

    return {
        min: totalMin,
        max: totalMax,
    }
}
