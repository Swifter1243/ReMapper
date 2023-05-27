import {
    AnimationKeys,
    ComplexKeyframesAbstract,
    ComplexKeyframesAny,
    EASE,
    KeyframesAbstract,
    KeyframesAny,
    KeyframesVec3,
    KeyframeValues,
    NumberTuple,
    RawKeyframesAbstract,
    RawKeyframesAny,
    RawKeyframesVec3,
    TransformKeyframe,
    Vec3,
    Vec4,
} from '../data/types.ts'

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
import type { OptimizeSettings } from './anim_optimizer.ts'
import { Color, lerpColor } from '../data/color.ts'

import { Keyframe } from './keyframe.ts'

import * as AnimationInternals from '../internals/animation.ts'

/**
 * Ensures that this value is in the format of an array of keyframes.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The keyframe or array of keyframes.
 */
export function complexifyArray<T extends NumberTuple>(
    array: RawKeyframesAbstract<T> | RawKeyframesAny,
) {
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
        const keyframe = new Keyframe(array[0] as KeyframeValues)
        if (keyframe.time === 0) {
            return keyframe.values as RawKeyframesAbstract<T>
        }
    }
    return array
}

/**
 * Checks if value is an array of keyframes.
 * @param array The keyframe or array of keyframes.
 */
export const isSimple = (array: RawKeyframesAny) => typeof array[0] !== 'object'

/**
 * Get the value of keyframes at a given time.
 * @param property The property this animation came from.
 * @param animation The keyframes.
 * @param time The time to get the value at.
 */
export function getValuesAtTime<K extends string = AnimationKeys>(
    property: K,
    animation: KeyframesAny,
    time: number,
) {
    if (typeof animation === 'string') {
        throw 'Does not support point definitions!'
    }

    animation = complexifyArray(animation)
    const timeInfo = timeInKeyframes(time, animation)
    if (timeInfo.interpolate && timeInfo.r && timeInfo.l) {
        if (
            property === 'rotation' ||
            property === 'localRotation' ||
            property === 'offsetWorldRotation'
        ) {
            return lerpRotation(
                timeInfo.l.values as Vec3,
                timeInfo.r.values as Vec3,
                timeInfo.normalTime,
            )
        }
        if (property === 'color' && timeInfo.r.hsvLerp) {
            const color1 = new Color(timeInfo.l.values as Vec4, 'RGB')
            const color2 = new Color(timeInfo.r.values as Vec4, 'RGB')
            const lerp = lerpColor(
                color1,
                color2,
                timeInfo.normalTime,
                undefined,
                'HSV',
            )
            return lerp.export()
        }
        if (timeInfo.r.spline === 'splineCatmullRom') {
            return splineCatmullRomLerp(timeInfo, animation)
        }

        return arrLerp(
            timeInfo.l.values,
            timeInfo.r.values,
            timeInfo.normalTime,
        )
    }
    return (timeInfo.l as Keyframe).values
}

export function splineCatmullRomLerp(
    timeInfo: Required<ReturnType<typeof timeInKeyframes>>,
    animation: ComplexKeyframesAny,
) {
    const p0 = timeInfo.leftIndex - 1 < 0
        ? timeInfo.l.values
        : new Keyframe(animation[timeInfo.leftIndex - 1]).values
    const p1 = timeInfo.l.values
    const p2 = timeInfo.r.values
    const p3 = timeInfo.rightIndex + 1 > animation.length - 1
        ? timeInfo.r.values
        : new Keyframe(animation[timeInfo.rightIndex + 1]).values

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

function timeInKeyframes(time: number, animation: ComplexKeyframesAny) {
    let l: Keyframe
    let normalTime = 0

    if (animation.length === 0) return { interpolate: false }

    const first = new Keyframe(animation[0])
    if (first.time >= time) {
        l = first
        return { interpolate: false, l: l }
    }

    const last = new Keyframe(arrLast(animation))
    if (last.time <= time) {
        l = last
        return { interpolate: false, l: l }
    }

    let leftIndex = 0
    let rightIndex = animation.length

    while (leftIndex < rightIndex - 1) {
        const m = Math.floor((leftIndex + rightIndex) / 2)
        const pointTime = new Keyframe(animation[m]).time

        if (pointTime < time) leftIndex = m
        else rightIndex = m
    }

    l = new Keyframe(animation[leftIndex])
    // eslint-disable-next-line prefer-const
    const r = new Keyframe(animation[rightIndex])

    normalTime = findFraction(l.time, r.time - l.time, time)
    if (r.easing) normalTime = lerpEasing(r.easing, normalTime)

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
    let simpleArr = structuredClone(anim1)
    let complexArr: ComplexKeyframesAny = []

    if (isSimple(anim1) && isSimple(anim2)) complexArr = complexifyArray(anim2)
    else if (!isSimple(anim1) && isSimple(anim2)) {
        simpleArr = structuredClone(anim2)
        complexArr = structuredClone(anim1) as ComplexKeyframesAny
    } else if (!isSimple(anim1) && !isSimple(anim2)) {
        console.error(`[${anim1}] and [${anim2}] are unable to combine!`)
    } else {
        complexArr = structuredClone(anim2) as ComplexKeyframesAny
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
    animFreq ??= 1 / 32
    animation.pos ??= [0, 0, 0]
    animation.rot ??= [0, 0, 0]
    animation.scale ??= [1, 1, 1]

    const dataAnim = new AnimationInternals.AbstractAnimation()
    dataAnim.position = structuredClone(animation.pos)
    dataAnim.rotation = structuredClone(animation.rot)
    dataAnim.scale = structuredClone(animation.scale)

    const data = {
        pos: <number[][]> [],
        rot: <number[][]> [],
        scale: <number[][]> [],
    }

    function getDomain(arr: RawKeyframesAny) {
        let newArr = complexifyArray(arr)
        newArr = newArr.sort((a, b) =>
            new Keyframe(a).time - new Keyframe(b).time
        )
        let min = 1
        let max = 0
        newArr.forEach((x) => {
            const time = new Keyframe(x).time
            if (time < min) min = time
            if (time > max) max = time
        })
        return { min: min, max: max }
    }

    const posDomain = getDomain(animation.pos)
    const rotDomain = getDomain(animation.rot)
    const scaleDomain = getDomain(animation.scale)

    const totalMin = floorTo(
        getDomain([[posDomain.min], [rotDomain.min], [scaleDomain.min]]).min,
        animFreq,
    )
    const totalMax = ceilTo(
        getDomain([[posDomain.max], [rotDomain.max], [scaleDomain.max]]).max,
        animFreq,
    )

    for (let i = totalMin; i <= totalMax; i += animFreq) {
        const keyframe = {
            pos: dataAnim.get('position', i)! as Vec3,
            rot: dataAnim.get('rotation', i)! as Vec3,
            scale: dataAnim.get('scale', i)! as Vec3,
            time: i,
        } satisfies TransformKeyframe

        if (forKeyframe) forKeyframe(keyframe)

        data.pos.push([...keyframe.pos, keyframe.time])
        data.rot.push([...keyframe.rot, keyframe.time])
        data.scale.push([...keyframe.scale, keyframe.time])
    }

    dataAnim.position = data.pos as KeyframesVec3
    dataAnim.rotation = data.rot as KeyframesVec3
    dataAnim.scale = data.scale as KeyframesVec3

    dataAnim.optimize(undefined, animOptimizer)

    return {
        pos: dataAnim.position as RawKeyframesVec3,
        rot: dataAnim.rotation as RawKeyframesVec3,
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
    const keyframes: Keyframe[] = []
    ;(animation as ComplexKeyframesAbstract<T>).forEach((x, i) => {
        const k = new Keyframe(structuredClone(x))
        k.time = 1 - k.time
        keyframes[animation.length - 1 - i] = k
    })

    for (let i = keyframes.length - 1; i >= 0; i--) {
        const current = keyframes[i]

        if (current.easing) {
            if (current.easing && !current.easing.includes('InOut')) {
                if (current.easing.includes('In')) {
                    current.easing = current.easing.replace('In', 'Out') as EASE
                } else if (current.easing.includes('Out')) {
                    current.easing = current.easing.replace('Out', 'In') as EASE
                }
            }

            const last = keyframes[i + 1]
            last.easing = current.easing
            arrRemove(current.data, current.getFlagIndex('ease', false))
        }
    }

    return keyframes.map((x) => x.data) as RawKeyframesAbstract<T>
}

/**
 * Safely iterate through an array of keyframes.
 * @param keyframes Keyframes to iterate.
 * @param fn Function to run on each keyframe.
 */
export function iterateKeyframes<T extends NumberTuple>(
    keyframes: RawKeyframesAbstract<T>,
    fn: (values: KeyframesAbstract<T>, index: number) => void,
) {
    // TODO: Lookup point def
    if (typeof keyframes === 'string') return

    const newKeyframes = complexifyArray(keyframes)
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
    const output: Keyframe[] = []

    iterateKeyframes(animation, (x) => {
        const k = new Keyframe(structuredClone(x))
        k.time = k.time / 2
        output.push(k)
    })

    iterateKeyframes(reversedAnim, (x) => {
        const k = new Keyframe(x)
        k.time = k.time / 2 + 0.5
        output.push(k)
    })

    return output.map((x) => x.data) as ComplexKeyframesAbstract<T>
}
