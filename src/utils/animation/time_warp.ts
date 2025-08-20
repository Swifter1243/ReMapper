import { arePointsSimple, complexifyPoints } from './points/complexity.ts'
import {getPointEasing, getPointFlagIndex, getPointTime, getPointTimeIndex} from './points/get.ts'
import { setPointEasing, setPointTime } from './points/set.ts'

import {iteratePoints} from "./points/iterate.ts";
import {arrayRemove} from "../array/mutate.ts";
import {copy} from "../object/copy.ts";
import {EASE} from "../../types/animation/easing.ts";
import {ComplexPointsAbstract, RawPointsAbstract} from "../../types/animation/points/abstract.ts";
import {NumberTuple} from "../../types/util/tuple.ts";
import { inverseLerp } from '../math/lerp.ts'

/**
 * Reverse an animation. Accounts for most easings but not splines.
 * @param animation Animation to reverse.
 */
export function reverseAnimation<T extends NumberTuple>(
    animation: RawPointsAbstract<T>,
) {
    if (arePointsSimple(animation)) return animation
    const points: ComplexPointsAbstract<T> = []
    ;(animation as ComplexPointsAbstract<T>).forEach((x, i) => {
        const k = copy<typeof x>(x)
        const timeIndex = getPointTimeIndex(k)
        k[timeIndex] = 1 - (k as number[])[timeIndex]
        points[animation.length - 1 - i] = k
    })

    for (let i = points.length - 1; i >= 0; i--) {
        const current = points[i]
        const currentEasing = getPointEasing(current)

        if (currentEasing) {
            if (currentEasing && !currentEasing.includes('InOut')) {
                if (currentEasing.includes('In')) {
                    setPointEasing(
                        current,
                        currentEasing.replace('In', 'Out') as EASE,
                    )
                } else if (currentEasing.includes('Out')) {
                    setPointEasing(
                        current,
                        currentEasing.replace('Out', 'In') as EASE,
                    )
                }
            }

            const last = points[i + 1]
            setPointEasing(last, getPointEasing(current))
            arrayRemove(current, getPointFlagIndex(current, 'ease', false))
        }
    }

    return points
}

/**
 * Get an animation with a reversed animation after.
 * @param animation Animation to mirror.
 */
export function mirrorAnimation<T extends NumberTuple>(
    animation: RawPointsAbstract<T>,
) {
    if (complexifyPoints(animation).length === 1) return animation

    const reversedAnim = reverseAnimation(animation)
    const output: ComplexPointsAbstract<T> = []

    iteratePoints(animation, (x) => {
        const k = copy<typeof x>(x)
        const timeIndex = getPointTimeIndex(k)
        k[timeIndex] = (k as number[])[timeIndex] / 2
        output.push(k)
    })

    iteratePoints(reversedAnim, (x) => {
        const k = copy<typeof x>(x)
        const timeIndex = getPointTimeIndex(k)
        k[timeIndex] = (k as number[])[timeIndex] / 2 + 0.5
        output.push(k)
    })

    return output
}

/** Convert time in points from beats to a normalized 0-1 range.
 * ```ts
 * const points: rm.ComplexPointsVec3 = [
 *     [0, 0, 0, 5],
 *     [0, 1, 0, 10]
 * ]
 * const normalized = rm.pointsBeatsToNormalized(points)
 * // {
 * //     points: [[0, 0, 0, 0], [0, 1, 0, 1]],
 * //     minTime: 5,
 * //     maxTime: 10,
 * //     duration: 5,
 * // }
 * ```
 * */
export function pointsBeatsToNormalized<T extends number[]>(points: ComplexPointsAbstract<T>): {
    points: ComplexPointsAbstract<T>
    minTime: number
    maxTime: number
    duration: number
} {
    let minTime = getPointTime(points[0])
    let maxTime = minTime

    points.forEach((x) => {
        const time = getPointTime(x)
        minTime = Math.min(minTime, time)
        maxTime = Math.max(maxTime, time)
    })

    const normalizedPoints = points.map((x) => {
        const time = getPointTime(x)
        const normalizedTime = inverseLerp(minTime, maxTime, time)
        setPointTime(x, normalizedTime)
        return x
    })

    return {
        points: normalizedPoints,
        maxTime,
        minTime,
        duration: maxTime - minTime,
    }
}