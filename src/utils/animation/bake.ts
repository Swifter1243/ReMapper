import { AnimationSettings, optimizeKeyframes } from './optimizer.ts'
import { getAnimatedObjectDomain } from './domain.ts'
import { getKeyframeValuesAtTime } from './interpolate.ts'
import {ceilTo, floorTo} from "../math/rounding.ts";
import {AnimatedTransform} from "../../types/math/transform.ts";

import {ComplexKeyframesVec3} from "../../types/animation/keyframe/vec3.ts";
import {TransformKeyframe} from "../../types/animation/bake.ts";
import {ModelObject} from "../../types/model/object.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";

/**
 * Generate keyframes from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param animation The keyframes for various transforms.
 * @param forKeyframe Runs for each generated keyframe.
 * @param animFreq The sampling rate of new keyframes.
 * @param animOptimizer The optional optimizer for the keyframes.
 * @param domain Precalculated minimum and maximum times for the animation to be baked.
 */
export function bakeAnimation(
    animation: DeepReadonly<AnimatedTransform>,
    forKeyframe?: (transform: TransformKeyframe) => void,
    animationSettings?: AnimationSettings,
    domain?: { min: number; max: number },
): ModelObject {
    animationSettings ??= new AnimationSettings()

    const pos = animation.position ?? [0, 0, 0]
    const rot = animation.rotation ?? [0, 0, 0]
    const scale = animation.scale ?? [1, 1, 1]

    const data = {
        position: <ComplexKeyframesVec3> [],
        rotation: <ComplexKeyframesVec3> [],
        scale: <ComplexKeyframesVec3> [],
    }
    const invBakeFreq = 1 / animationSettings.bakeFrequency

    domain ??= getAnimatedObjectDomain(animation)
    const totalMin = floorTo(domain.min, invBakeFreq)
    const totalMax = ceilTo(domain.max, invBakeFreq)

    for (
        let i = totalMin;
        i <= totalMax;
        i += invBakeFreq
    ) {
        const keyframe = {
            position: getKeyframeValuesAtTime('position', pos, i),
            rotation: getKeyframeValuesAtTime('rotation', rot, i),
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
