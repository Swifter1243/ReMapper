import { NumberTuple } from '../../types/util.ts'
import { ComplexKeyframesAbstract, EASE, RawKeyframesAbstract } from '../../types/animation.ts'
import { areKeyframesSimple, complexifyKeyframes } from './keyframe/complexity.ts'
import { getKeyframeEasing, getKeyframeFlagIndex, getKeyframeTimeIndex } from './keyframe/get.ts'
import { setKeyframeEasing } from './keyframe/set.ts'

import {iterateKeyframes} from "./keyframe/iterate.ts";
import {arrayRemove} from "../array/mutate.ts";
import {copy} from "../object/copy.ts";

/**
 * Reverse an animation. Accounts for most easings but not splines.
 * @param animation Animation to reverse.
 */
export function reverseAnimation<T extends NumberTuple>(
    animation: RawKeyframesAbstract<T>,
) {
    if (areKeyframesSimple(animation)) return animation
    const keyframes: ComplexKeyframesAbstract<T> = []
    ;(animation as ComplexKeyframesAbstract<T>).forEach((x, i) => {
        const k = copy(x)
        const timeIndex = getKeyframeTimeIndex(k)
        k[timeIndex] = 1 - (k as number[])[timeIndex]
        keyframes[animation.length - 1 - i] = k
    })

    for (let i = keyframes.length - 1; i >= 0; i--) {
        const current = keyframes[i]
        const currentEasing = getKeyframeEasing(current)

        if (currentEasing) {
            if (currentEasing && !currentEasing.includes('InOut')) {
                if (currentEasing.includes('In')) {
                    setKeyframeEasing(
                        current,
                        currentEasing.replace('In', 'Out') as EASE,
                    )
                } else if (currentEasing.includes('Out')) {
                    setKeyframeEasing(
                        current,
                        currentEasing.replace('Out', 'In') as EASE,
                    )
                }
            }

            const last = keyframes[i + 1]
            setKeyframeEasing(last, getKeyframeEasing(current))
            arrayRemove(current, getKeyframeFlagIndex(current, 'ease', false))
        }
    }

    return keyframes
}

/**
 * Get an animation with a reversed animation after.
 * @param animation Animation to mirror.
 */
export function mirrorAnimation<T extends NumberTuple>(
    animation: RawKeyframesAbstract<T>,
) {
    if (complexifyKeyframes(animation).length === 1) return animation

    const reversedAnim = reverseAnimation(animation)
    const output: ComplexKeyframesAbstract<T> = []

    iterateKeyframes(animation, (x) => {
        const k = copy(x)
        const timeIndex = getKeyframeTimeIndex(k)
        k[timeIndex] = (k as number[])[timeIndex] / 2
        output.push(k)
    })

    iterateKeyframes(reversedAnim, (x) => {
        const k = copy(x)
        const timeIndex = getKeyframeTimeIndex(k)
        k[timeIndex] = (k as number[])[timeIndex] / 2 + 0.5
        output.push(k)
    })

    return output
}
