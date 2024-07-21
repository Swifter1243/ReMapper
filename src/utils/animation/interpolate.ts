import {
    AnimationKeys,
    ComplexKeyframesAny,
    ComplexKeyframesBoundless,
    EASE,
    InnerKeyframeBoundless,
    RawKeyframesAbstract,
} from '../../types/animation.ts'
import {
    getKeyframeEasing,
    getKeyframeHSVLerp,
    getKeyframeSpline,
    getKeyframeTime,
    getKeyframeValues,
} from './keyframe/get.ts'
import {DeepReadonly} from '../../types/util.ts'
import {areKeyframesSimple} from './keyframe/complexity.ts'
import {Vec3, Vec4} from '../../types/data.ts'
import {arrayAdd, arrayLerp, arrayMultiply} from "../array/operation.ts";
import {arrayLastElement} from "../array/find.ts";
import {inverseLerp, lerpRotation} from "../math/lerp.ts";
import * as easings from "../math/easing_functions.ts";
import {lerpHSV} from "../color/lerp.ts";

/**
 * Get the value of keyframes at a given time.
 * @param property The property this animation came from.
 * @param animation The keyframes.
 * @param time The time to get the value at.
 */
export function getKeyframeValuesAtTime<
    T extends number[],
    K extends string = AnimationKeys,
>(
    property: K,
    animation: DeepReadonly<RawKeyframesAbstract<T>>,
    time: number,
): T {
    if (areKeyframesSimple(animation as RawKeyframesAbstract<T>)) {
        return animation as T
    }

    const complexAnimation = animation as ComplexKeyframesAny

    const timeInfo = timeInKeyframes(time, complexAnimation)
    if (timeInfo.interpolate && timeInfo.r && timeInfo.l) {
        const lValues = getKeyframeValues(timeInfo.l)
        const rValues = getKeyframeValues(timeInfo.r)
        const rHSVLerp = getKeyframeHSVLerp(timeInfo.r)
        const rSpline = getKeyframeSpline(timeInfo.r)

        if (
            property === 'rotation' ||
            property === 'localRotation' ||
            property === 'offsetWorldRotation'
        ) {
            return lerpRotation(
                lValues as Vec3,
                rValues as Vec3,
                timeInfo.normalTime,
            ) as unknown as T
        } else if (property === 'color' && rHSVLerp) {
            return lerpHSV(
                lValues as Vec4,
                rValues as Vec4,
                timeInfo.normalTime,
            ) as unknown as T
        } else if (rSpline === 'splineCatmullRom') {
            return splineCatmullRomLerp(
                timeInfo,
                complexAnimation,
            ) as T
        } else {
            return arrayLerp(
                lValues,
                rValues,
                timeInfo.normalTime,
            ) as T
        }
    }
    return getKeyframeValues(
        timeInfo.l!,
    ) as T
}

export function splineCatmullRomLerp(
    timeInfo: Required<ReturnType<typeof timeInKeyframes>>,
    animation: ComplexKeyframesAny,
) {
    const p1 = getKeyframeValues(timeInfo.l)
    const p2 = getKeyframeValues(timeInfo.r)

    const p0 = timeInfo.leftIndex - 1 < 0
        ? p1
        : getKeyframeValues(animation[timeInfo.leftIndex - 1])
    const p3 = timeInfo.rightIndex + 1 > animation.length - 1
        ? p2
        : getKeyframeValues(animation[timeInfo.rightIndex + 1])

    const t = timeInfo.normalTime
    const tt = t * t
    const ttt = tt * t

    const q0 = -ttt + 2 * tt - t
    const q1 = 3 * ttt - 5 * tt + 2
    const q2 = -3 * ttt + 4 * tt + t
    const q3 = ttt - tt

    const o0 = arrayMultiply(p0, q0)
    const o1 = arrayMultiply(p1, q1)
    const o2 = arrayMultiply(p2, q2)
    const o3 = arrayMultiply(p3, q3)

    return arrayMultiply(arrayAdd(arrayAdd(o0, o1), arrayAdd(o2, o3)), 0.5)
}

function timeInKeyframes(time: number, animation: ComplexKeyframesBoundless) {
    let l: InnerKeyframeBoundless
    let normalTime = 0

    if (animation.length === 0) return { interpolate: false }

    const first = animation[0]
    const firstTime = getKeyframeTime(first)

    if (firstTime >= time) {
        l = first
        return { interpolate: false, l: l }
    }

    const last = arrayLastElement(animation)
    const lastTime = getKeyframeTime(last)

    if (lastTime <= time) {
        l = last
        return { interpolate: false, l: l }
    }

    let leftIndex = 0
    let rightIndex = animation.length

    while (leftIndex < rightIndex - 1) {
        const m = Math.floor((leftIndex + rightIndex) / 2)
        const pointTime = getKeyframeTime(animation[m])

        if (pointTime < time) leftIndex = m
        else rightIndex = m
    }

    l = animation[leftIndex]
    const lTime = getKeyframeTime(l)
    const r = animation[rightIndex]
    const rTime = getKeyframeTime(r)
    const rEasing = getKeyframeEasing(r)

    normalTime = inverseLerp(lTime, rTime, time)
    if (rEasing) normalTime = applyEasing(rEasing, normalTime)

    return {
        interpolate: true,
        l: l,
        r: r,
        normalTime: normalTime,
        leftIndex: leftIndex,
        rightIndex: rightIndex,
    }
}

/**
 * Process a number through an easing.
 * @param easing Name of easing.
 * @param value Progress of easing (0-1).
 */
export function applyEasing(easing: EASE, value: number) {
    if (easing === 'easeLinear' || easing === undefined) return value
    if (easing === 'easeStep') return value === 1 ? 1 : 0
    return easings[easing](value)
}
