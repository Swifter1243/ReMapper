import { AnimationSettings, optimizeKeyframes } from './optimizer.ts'
import { getAnimatedObjectDomain } from './domain.ts'
import { getKeyframeValuesAtTime } from './interpolate.ts'
import {ceilTo, floorTo} from "../math/rounding.ts";
import {AnimatedTransform, type FullAnimatedTransform} from "../../types/math/transform.ts";

import {ComplexKeyframesVec3} from "../../types/animation/keyframe/vec3.ts";
import {TransformKeyframe} from "../../types/animation/bake.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";
import { EPSILON } from '../../constants/math.ts'

/**
 * Generate keyframes from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param animation The keyframes for various transforms.
 * @param forKeyframe Runs for each generated keyframe.
 * @param animationSettings Settings to process the animation.
 * @param domain Precalculated minimum and maximum times for the animation to be baked.
 */
export function bakeAnimation(
    animation: DeepReadonly<AnimatedTransform>,
    forKeyframe?: (transform: TransformKeyframe) => void,
    animationSettings?: AnimationSettings,
    domain?: { min: number; max: number },
): FullAnimatedTransform {
    animationSettings ??= new AnimationSettings()

    const position = animation.position ?? [0, 0, 0]
    const rotation = animation.rotation ?? [0, 0, 0]
    const scale = animation.scale ?? [1, 1, 1]

    const data = {
        position: <ComplexKeyframesVec3> [],
        rotation: <ComplexKeyframesVec3> [],
        scale: <ComplexKeyframesVec3> [],
    }
    const invBakeFreq = 1 / (animationSettings.bakeSampleFrequency - 1)

    domain ??= getAnimatedObjectDomain(animation)
    const totalMin = floorTo(domain.min, invBakeFreq)
    const totalMax = ceilTo(domain.max, invBakeFreq)

    for (
        let i = totalMin;
        i <= totalMax + EPSILON;
        i += invBakeFreq
    ) {
        const keyframe = {
            position: getKeyframeValuesAtTime('position', position, i),
            rotation: getKeyframeValuesAtTime('rotation', rotation, i),
            scale: getKeyframeValuesAtTime('scale', scale, i),
            time: i,
        } satisfies TransformKeyframe

        if (forKeyframe) forKeyframe(keyframe)

        data.position.push([...keyframe.position, keyframe.time])
        data.rotation.push([...keyframe.rotation, keyframe.time])
        data.scale.push([...keyframe.scale, keyframe.time])
    }

    return {
        position: optimizeKeyframes(
            data.position,
            animationSettings.optimizeSettings,
        ),
        rotation: optimizeKeyframes(
            data.rotation,
            animationSettings.optimizeSettings,
        ),
        scale: optimizeKeyframes(
            data.scale,
            animationSettings.optimizeSettings,
        ),
    }
}
