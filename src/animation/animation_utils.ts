import {
    AnimationKeys,
    ComplexKeyframesAbstract,
    ComplexKeyframesAny,
    ComplexKeyframesBoundless,
    ComplexKeyframesVec3,
    EASE,
    InnerKeyframeBoundless,
    RawKeyframesAbstract,
    RawKeyframesAny,
    RuntimePointDefinitionAny,
} from '../types/animation_types.ts'

import {
    arrayAdd,
    arrayLastElement,
    arrayLerp,
    arrayMultiply,
    arrayRemove,
} from '../utils/array_utils.ts'

import {
    applyEasing,
    ceilTo,
    findFraction,
    floorTo,
    lerpRotation,
} from '../utils/math.ts'
import { optimizeKeyframes, OptimizeSettings } from './anim_optimizer.ts'

import { DeepReadonly, NumberTuple } from '../types/util_types.ts'
import { TransformKeyframe, Vec3, Vec4 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import {
    areKeyframesSimple,
    getKeyframeEasing,
    getKeyframeFlagIndex,
    getKeyframeHSVLerp,
    getKeyframeSpline,
    getKeyframeTime,
    getKeyframeTimeIndex,
    getKeyframeValues,
    setKeyframeEasing,
} from './keyframe.ts'
import { lerpHSV } from '../data/color.ts'
import { ModelObject } from '../mod.ts'

/**
 * Ensures that this value is in the format of an array of keyframes.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The keyframe or array of keyframes.
 */
export function complexifyKeyframes<T extends NumberTuple>(
    array: DeepReadonly<RawKeyframesAbstract<T>> | RawKeyframesAbstract<T>,
): ComplexKeyframesAbstract<T> {
    if (!areKeyframesSimple(array as RawKeyframesAbstract<T>)) {
        return array as ComplexKeyframesAbstract<T>
    }
    return [[...array, 0]] as ComplexKeyframesAbstract<T>
}

/**
 * If possible, isolate an array of keyframes with one keyframe.
 * For example if you input [[x,y,z,0]], it would be converted to [x,y,z].
 * @param array The array of keyframes.
 */
export function simplifyKeyframes<T extends NumberTuple>(
    array: RawKeyframesAbstract<T>,
): RawKeyframesAbstract<T> {
    if (array.length <= 1 && !areKeyframesSimple(array)) {
        const keyframe = array[0] as InnerKeyframeBoundless
        const keyframeTime = getKeyframeTime(keyframe)
        if (keyframeTime === 0) {
            return getKeyframeValues(keyframe) as RawKeyframesAbstract<T>
        }
    }
    return array
}

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
        }
        if (property === 'color' && rHSVLerp) {
            return lerpHSV(
                lValues as Vec4,
                rValues as Vec4,
                timeInfo.normalTime,
            ) as unknown as T
        }
        if (rSpline === 'splineCatmullRom') {
            return splineCatmullRomLerp(
                timeInfo,
                complexAnimation,
            ) as T
        }

        return arrayLerp(
            lValues,
            rValues,
            timeInfo.normalTime,
        ) as T
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

    normalTime = findFraction(lTime, rTime - lTime, time)
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
export function getAnimatedObjectDomain(animation: DeepReadonly<ModelObject>) {
    const posDomain = getAnimationDomain(animation.position)
    const rotDomain = getAnimationDomain(animation.rotation)
    const scaleDomain = getAnimationDomain(animation.scale)

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
    animation: DeepReadonly<ModelObject>,
    forKeyframe?: (transform: TransformKeyframe) => void,
    animFreq?: number,
    animOptimizer?: OptimizeSettings,
    domain?: { min: number; max: number },
): ModelObject {
    animOptimizer ??= new OptimizeSettings()
    animFreq ??= 1 / 32

    const pos = animation.position ?? [0, 0, 0]
    const rot = animation.rotation ?? [0, 0, 0]
    const scale = animation.scale ?? [1, 1, 1]

    const data = {
        position: <ComplexKeyframesVec3> [],
        rotation: <ComplexKeyframesVec3> [],
        scale: <ComplexKeyframesVec3> [],
    }

    domain ??= getAnimatedObjectDomain(animation)
    const totalMin = floorTo(domain.min, animFreq)
    const totalMax = ceilTo(domain.max, animFreq)

    for (let i = totalMin; i <= totalMax; i += animFreq) {
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
        position: optimizeKeyframes(data.position, animOptimizer),
        rotation: optimizeKeyframes(data.rotation, animOptimizer),
        scale: optimizeKeyframes(data.scale, animOptimizer),
    }
}

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
 * Safely iterate through an array of keyframes.
 * @param keyframes Keyframes to iterate.
 * @param fn Function to run on each keyframe.
 */
export function iterateKeyframes<T extends NumberTuple>(
    keyframes: RawKeyframesAbstract<T>,
    fn: (values: ComplexKeyframesAbstract<T>[0], index: number) => void,
) {
    // TODO: Lookup point def
    if (typeof keyframes === 'string') return

    const newKeyframes = complexifyKeyframes<T>(keyframes)
    newKeyframes.forEach((x, i) => fn(x, i))
    const newSimpleKeyframes = simplifyKeyframes(newKeyframes)
    newSimpleKeyframes.forEach((x, i) => (keyframes[i] = x))
    keyframes.length = newSimpleKeyframes.length
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

/** Determine if keyframes are considered "runtime",
 * e.g. it contains properties such as "baseHeadLocalPosition" which are only evaluated at runtime. */
export function areKeyframesRuntime(
    keyframes: DeepReadonly<RuntimePointDefinitionAny>,
) {
    if (typeof keyframes === 'string') return false

    if (keyframes.some((x) => typeof x === 'string')) return true

    const json = JSON.stringify(keyframes)

    // this is scuffed as fuck.
    if (json.includes('op') || json.includes('base')) return true

    return false
}
