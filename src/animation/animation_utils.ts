import {
    AnimationKeys,
    ComplexKeyframesAbstract,
    ComplexKeyframesAny,
    ComplexKeyframesVec3,
    ComplexKeyframesVec4,
    ComplexKeyframeValuesUnsafe,
    EASE,
    KeyframeValuesUnsafe,
    RawKeyframesAbstract,
    RawKeyframesAny,
    RawKeyframesVec3,
    RawKeyframesVec4,
    SimpleKeyframesAny,
    SingleKeyframeAbstract,
    SingleKeyframeValuesUnsafe,
} from '../types/animation_types.ts'

import {
    arrAdd,
    arrLast,
    arrLerp,
    arrMul,
    arrRemove,
} from '../utils/array_utils.ts'

import {
    ceilTo,
    findFraction,
    floorTo,
    lerpEasing,
    lerpRotation,
} from '../utils/math.ts'
import { optimizeAnimation, OptimizeSettings } from './anim_optimizer.ts'

import * as AnimationInternals from '../internals/animation.ts'
import { NumberTuple } from '../types/util_types.ts'
import { TransformKeyframe, Vec3, Vec4 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import {
    getKeyframeEasing,
    getKeyframeFlagIndex,
    getKeyframeHSVLerp,
    getKeyframeSpline,
    getKeyframeTime,
    getKeyframeTimeIndex,
    getKeyframeValues,
    isSimple,
    setKeyframeEasing,
} from './keyframe.ts'
import { lerpHSV } from '../data/color.ts'
import { ComplexKeyframesLinear, RawKeyframesLinear } from '../mod.ts'

/**
 * Ensures that this value is in the format of an array of keyframes.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The keyframe or array of keyframes.
 */
export function complexifyArray<T extends NumberTuple>(
    array: RawKeyframesAbstract<T>,
): ComplexKeyframesAbstract<T> {
    if (!isSimple(array)) return array as ComplexKeyframesAbstract<T>
    return [[...array, 0]] as ComplexKeyframesAbstract<T>
}

/**
 * If possible, isolate an array of keyframes with one keyframe.
 * For example if you input [[x,y,z,0]], it would be converted to [x,y,z].
 * @param array The array of keyframes.
 */
export function simplifyArray<T extends NumberTuple>(
    array: RawKeyframesAbstract<T>,
): RawKeyframesAbstract<T> {
    if (array.length <= 1 && !isSimple(array)) {
        const keyframe = array[0] as KeyframeValuesUnsafe
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
export function getValuesAtTime<K extends string = AnimationKeys>(
    property: K,
    animation: RawKeyframesAny,
    time: number,
): SimpleKeyframesAny {
    if (typeof animation === 'string') {
        throw 'Does not support point definitions!'
    }

    if (isSimple(animation)) return animation as unknown as SimpleKeyframesAny

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
            )
        }
        if (property === 'color' && rHSVLerp) {
            return lerpHSV(
                lValues as Vec4,
                rValues as Vec4,
                timeInfo.normalTime,
            )
        }
        if (rSpline === 'splineCatmullRom') {
            return splineCatmullRomLerp(
                timeInfo,
                complexAnimation,
            ) as SimpleKeyframesAny
        }

        return arrLerp(
            lValues,
            rValues,
            timeInfo.normalTime,
        ) as SimpleKeyframesAny
    }
    return getKeyframeValues(
        timeInfo.l as KeyframeValuesUnsafe,
    ) as SimpleKeyframesAny
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

    const o0 = arrMul(p0, q0)
    const o1 = arrMul(p1, q1)
    const o2 = arrMul(p2, q2)
    const o3 = arrMul(p3, q3)

    return arrMul(arrAdd(arrAdd(o0, o1), arrAdd(o2, o3)), 0.5)
}

function timeInKeyframes(time: number, animation: ComplexKeyframeValuesUnsafe) {
    let l: SingleKeyframeValuesUnsafe
    let normalTime = 0

    if (animation.length === 0) return { interpolate: false }

    const first = animation[0]
    const firstTime = getKeyframeTime(first)

    if (firstTime >= time) {
        l = first
        return { interpolate: false, l: l }
    }

    const last = arrLast(animation)
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
    if (rEasing) normalTime = lerpEasing(rEasing, normalTime)

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
 * Allows you to combine two animations together.
 * Atleast one of them must have only a single keyframe.
 * @param anim1 The first animation.
 * @param anim2 The second animation.
 * @param property The property that this animation came from.
 */
export function combineAnimations(
    anim1: RawKeyframesAny,
    anim2: RawKeyframesAny,
    property: AnimationKeys,
) {
    let simpleArr = copy(anim1)
    let complexArr: ComplexKeyframeValuesUnsafe = []

    if (isSimple(anim1) && isSimple(anim2)) complexArr = complexifyArray<[number] | Vec3 | Vec4>(anim2)
    else if (!isSimple(anim1) && isSimple(anim2)) {
        simpleArr = copy(anim2)
        complexArr = copy(anim1) as ComplexKeyframesAny
    } else if (!isSimple(anim1) && !isSimple(anim2)) {
        console.error(`[${anim1}] and [${anim2}] are unable to combine!`)
    } else {
        complexArr = copy(anim2) as ComplexKeyframesAny
    }

    const editElem = function (e: number, e2: number) {
        if (
            property === 'position' ||
            property === 'localPosition' ||
            property === 'definitePosition' ||
            property === 'offsetPosition'
        ) {
            e += e2
        }
        if (
            property === 'rotation' ||
            property === 'localRotation' ||
            property === 'offsetWorldRotation'
        ) {
            e = (e + e2) % 360
        }
        if (property === 'scale') e *= e2
        return e
    }

    for (let j = 0; j < complexArr.length; j++) {
        for (let i = 0; i < simpleArr.length; i++) {
            complexArr[j][i] = editElem(
                complexArr[j][i] as number,
                simpleArr[i] as number,
            )
        }
    }
    return complexArr
}

/**
 * Generate keyframes from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param animation The keyframes for various transforms.
 * @param forKeyframe Runs for each generated keyframe.
 * @param animFreq The sampling rate of new keyframes.
 * @param animOptimizer The optional optimizer for the keyframes.
 */
export function bakeAnimation(
    animation: {
        pos?: RawKeyframesVec3
        rot?: RawKeyframesVec3
        scale?: RawKeyframesVec3
    },
    forKeyframe?: (transform: TransformKeyframe) => void,
    animFreq?: number,
    animOptimizer?: OptimizeSettings,
) {
    animOptimizer ??= new OptimizeSettings()
    animFreq ??= 1 / 32
    animation.pos ??= [0, 0, 0]
    animation.rot ??= [0, 0, 0]
    animation.scale ??= [1, 1, 1]

    const dataAnim = copy(animation)
    const data = {
        pos: <ComplexKeyframesVec3> [],
        rot: <ComplexKeyframesVec3> [],
        scale: <ComplexKeyframesVec3> [],
    }

    function getDomain(arr: RawKeyframesAny) {
        const newArr = complexifyArray<[number] | Vec3 | Vec4>(arr)

        let min = 1
        let max = 0

        newArr.forEach((x) => {
            const time = getKeyframeTime(x)
            if (time < min) min = time
            if (time > max) max = time
        })

        return { min: min, max: max }
    }

    const posDomain = getDomain(animation.pos)
    const rotDomain = getDomain(animation.rot)
    const scaleDomain = getDomain(animation.scale)

    const totalMin = floorTo(
        getDomain([[0, posDomain.min], [0, rotDomain.min], [
            0,
            scaleDomain.min,
        ]]).min,
        animFreq,
    )
    const totalMax = ceilTo(
        getDomain([[0, posDomain.max], [0, rotDomain.max], [
            0,
            scaleDomain.max,
        ]]).max,
        animFreq,
    )

    for (let i = totalMin; i <= totalMax; i += animFreq) {
        const keyframe = {
            pos: dataAnim.pos as Vec3,
            rot: dataAnim.rot as Vec3,
            scale: dataAnim.scale as Vec3,
            time: i,
        } satisfies TransformKeyframe

        if (forKeyframe) forKeyframe(keyframe)

        data.pos.push([...keyframe.pos, keyframe.time])
        data.rot.push([...keyframe.rot, keyframe.time])
        data.scale.push([...keyframe.scale, keyframe.time])
    }

    dataAnim.pos = optimizeAnimation(data.pos, animOptimizer)
    dataAnim.rot = optimizeAnimation(data.rot, animOptimizer)
    dataAnim.scale = optimizeAnimation(data.scale, animOptimizer)

    return {
        pos: dataAnim.pos as RawKeyframesVec3,
        rot: dataAnim.rot as RawKeyframesVec3,
        scale: dataAnim.scale as RawKeyframesVec3,
    }
}

/**
 * Reverse an animation. Accounts for most easings but not splines.
 * @param animation Animation to reverse.
 */
export function reverseAnimation<T extends NumberTuple>(
    animation: RawKeyframesAbstract<T>,
) {
    if (isSimple(animation)) return animation
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
            arrRemove(current, getKeyframeFlagIndex(current, 'ease', false))
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

    const newKeyframes = complexifyArray<T>(keyframes)
    newKeyframes.forEach((x, i) => fn(x, i))
    const newSimpleKeyframes = simplifyArray(newKeyframes)
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
