import { AnimationSettings, optimizePoints } from './optimizer.ts'
import { getAnimatedObjectDomain } from './domain.ts'
import { getPointValuesAtTime } from './interpolate.ts'
import {ceilTo, floorTo} from "../math/rounding.ts";
import {AnimatedTransform, type FullAnimatedTransform} from "../../types/math/transform.ts";

import {ComplexPointsVec3} from "../../types/animation/points/vec3.ts";
import {TransformKeyframe} from "../../types/animation/bake.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";
import { EPSILON } from '../../constants/math.ts'

/**
 * Generate points from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param animation The points for various transforms.
 * @param forPoint Runs for each generated points.
 * @param animationSettings Settings to process the animation.
 * @param domain Precalculated minimum and maximum times for the animation to be baked.
 */
export function bakeAnimation(
    animation: DeepReadonly<AnimatedTransform>,
    forPoint?: (transform: TransformKeyframe) => void,
    animationSettings?: AnimationSettings,
    domain?: { min: number; max: number },
): FullAnimatedTransform {
    animationSettings ??= new AnimationSettings()

    const position = animation.position ?? [0, 0, 0]
    const rotation = animation.rotation ?? [0, 0, 0]
    const scale = animation.scale ?? [1, 1, 1]

    const data = {
        position: <ComplexPointsVec3> [],
        rotation: <ComplexPointsVec3> [],
        scale: <ComplexPointsVec3> [],
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
        const point = {
            position: getPointValuesAtTime('position', position, i),
            rotation: getPointValuesAtTime('rotation', rotation, i),
            scale: getPointValuesAtTime('scale', scale, i),
            time: i,
        } satisfies TransformKeyframe

        if (forPoint) forPoint(point)

        data.position.push([...point.position, point.time])
        data.rotation.push([...point.rotation, point.time])
        data.scale.push([...point.scale, point.time])
    }

    return {
        position: optimizePoints(
            data.position,
            animationSettings.optimizeSettings,
        ),
        rotation: optimizePoints(
            data.rotation,
            animationSettings.optimizeSettings,
        ),
        scale: optimizePoints(
            data.scale,
            animationSettings.optimizeSettings,
        ),
    }
}
