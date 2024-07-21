import { DeepReadonly } from '../../types/util.ts'
import { AnimatedTransform, Vec3, Vec4 } from '../../types/data.ts'
import { RawKeyframesAny } from '../../types/animation.ts'
import { complexifyKeyframes } from './keyframe/complexity.ts'
import { getKeyframeTime } from './keyframe/get.ts'

/** Gets the minimum and maximum times of an animation. */
export function getAnimationDomain(arr: DeepReadonly<RawKeyframesAny>) {
    const newArr = complexifyKeyframes<[number] | Vec3 | Vec4>(arr)

    let min = 1
    let max = 0

    newArr.forEach((x) => {
        const time = getKeyframeTime(x)
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
