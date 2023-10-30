import {
    AnimationKeys,
    EASE,
    GeometryMaterial,
    GeoType,
    LookupMethod,
    RawKeyframesAny,
} from '../types/mod.ts'

import * as AnimationInternals from '../internals/animation.ts'
import * as EnvironmentInternals from '../internals/environment.ts'

import { getActiveDiff } from '../data/beatmap_handler.ts'
import { combineAnimations } from '../animation/animation_utils.ts'

import { animateTrack } from './custom_event.ts'
let envCount = 0

export function environment(
    ...params:
        | ConstructorParameters<typeof EnvironmentInternals.Environment>
        | [
            id?: string,
            lookupMethod?: LookupMethod,
        ]
): EnvironmentInternals.Environment {
    const [first] = params
    if (typeof first === 'object') {
        return new EnvironmentInternals.Environment(first)
    }

    const [id, lookupMethod] = params

    return new EnvironmentInternals.Environment({
        id: id as string,
        lookupMethod: lookupMethod,
    })
}
export function geometry(
    ...params: ConstructorParameters<typeof EnvironmentInternals.Geometry> | [
        type?: GeoType,
        material?: GeometryMaterial | string,
    ]
): EnvironmentInternals.Geometry {
    const [first] = params
    if (typeof first === 'object') {
        return new EnvironmentInternals.Geometry(first)
    }

    const [type, material] = params

    return new EnvironmentInternals.Geometry({
        type: type,
        material: material,
    })
}
/**
 * Targets any environment objects in a group and animates them based on their original transforms.
 * @param group The group to target.
 * @param time The time of the animation.
 * @param animation Callback for the animation that will be used.
 * @param duration Duration of the animation.
 * @param easing Easing on the animation.
 */
export function animateEnvGroup(
    group: string,
    time: number,
    animation: (animation: AnimationInternals.EnvironmentAnimationData) => void,
    duration?: number,
    easing?: EASE,
) {
    const environmentCombined = getActiveDiff()
        .environmentEnhancementsCombined()

    for (const x of environmentCombined) {
        if (x.group === group) {
            const newAnimation: AnimationInternals.AnimationPropertiesV3 = {}
            animation(newAnimation)

            if (!x.track.value) {
                x.track.value = `environment_${envCount}`
                envCount++
            }

            const event = animateTrack(time, x.track.value)
            if (duration) event.duration = duration
            if (easing) event.easing = easing

            const keys = Object.keys(
                newAnimation,
            ) as (keyof AnimationInternals.AnimationPropertiesV3)[]
            keys.forEach((key) => {
                event.animation[key] = newAnimation[key] as any
                // TODO: Rework
                const prop = (x as any)[key]
                if (prop) {
                    event.animation[key] = combineAnimations(
                        event.animation[key]! as RawKeyframesAny,
                        prop,
                        key as AnimationKeys,
                    ) as any
                }
            })

            event.push()
        }
    }
}

/**
 * Targets any environment objects in a track and animates them based on their original transforms.
 * @param track The track to target.
 * @param time The time of the animation.
 * @param animation Callback for the animation that will be used.
 * @param duration Duration of the animation.
 * @param easing Easing on the animation.
 */
export function animateEnvTrack(
    track: string,
    time: number,
    animation: (animation: AnimationInternals.EnvironmentAnimationData) => void,
    duration?: number,
    easing?: EASE,
) {
    const environmentCombined = getActiveDiff()
        .environmentEnhancementsCombined()

    for (const x of environmentCombined) {
        if (x.track.value === track) {
            const newAnimation: AnimationInternals.AnimationPropertiesV3 = {}
            animation(newAnimation)

            const event = animateTrack(time, x.track.value)
            if (duration) event.duration = duration
            if (easing) event.easing = easing

            const keys = Object.keys(
                newAnimation,
            ) as unknown as (keyof AnimationInternals.AnimationPropertiesV3)[]

            keys.forEach((key) => {
                event.animation[key] = newAnimation[key] as any
                const prop = (x as any)[key]
                if (prop) {
                    event.animation[key] = combineAnimations(
                        event.animation[key] as RawKeyframesAny,
                        prop,
                        key as AnimationKeys,
                    ) as any
                }
            })

            event.push()
        }
    }
}
