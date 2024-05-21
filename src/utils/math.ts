// deno-lint-ignore-file
import { three } from '../deps.ts'
import * as easings from '../data/easings.ts'
import { EASE } from '../types/animation_types.ts'

import {
    arrayAdd,
    arrayDivide,
    arrayMultiply,
    arraySubtract,
    threeClassToArray,
} from './array_utils.ts'
import {
    AnimatedTransform,
    Bounds,
    Transform,
    Vec3,
} from '../types/data_types.ts'
import { copy } from './general.ts'
import { DeepReadonly } from '../types/util_types.ts'
import { ModelObject } from '../mod.ts'
import { areKeyframesSimple } from '../animation/keyframe.ts'
import { bakeAnimation } from '../animation/animation_utils.ts'
import { FullAnimatedTransform, RawKeyframesVec3 } from '../types/mod.ts'
import { areArraysEqual } from './array_utils.ts'
import { iterateKeyframes, OptimizeSettings } from '../animation/mod.ts'
import { getKeyframeValuesAtTime } from '../animation/mod.ts'
import { complexifyKeyframes } from '../animation/animation_utils.ts'
import { getAnimatedObjectDomain } from '../animation/animation_utils.ts'
import { Mutable } from '../types/util_types.ts'
import { DeepMutable } from '../types/util_types.ts'

export const EPSILON = 1e-3

/**
 * Interpolates between a start and end value to get a value in between.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerp(
    start: number,
    end: number,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)
    return start + (end - start) * fraction
}

/**
 * Interpolates between a start and end value to get a value in between. Will wrap around 0-1.
 * @param start Start value.
 * @param end End value.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpWrap(
    start: number,
    end: number,
    fraction: number,
    easing?: EASE,
) {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)
    const distance = Math.abs(end - start)

    if (distance <= 0.5) return lerp(start, end, fraction)
    else {
        if (end > start) start += 1
        else start -= 1
        let result = lerp(start, end, fraction)
        if (result < 0) result = 1 + result
        return result % 1
    }
}

/**
 * Interpolates between a start and end rotation to get a rotation in between.
 * @param start Start rotation.
 * @param end End rotation.
 * @param fraction Value to find in between start and end.
 * @param easing Optional easing.
 */
export function lerpRotation(
    start: Vec3,
    end: Vec3,
    fraction: number,
    easing?: EASE,
): Vec3 {
    if (easing !== undefined) fraction = applyEasing(easing, fraction)
    const q1 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(start), 'YXZ'),
    )
    const q2 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(end), 'YXZ'),
    )
    q1.slerp(q2, fraction)
    return eulerFromQuaternion(q1)
}

/**
 * Converts a quaternion to a euler rotation.
 * @param q Input quaternion.
 */
export function eulerFromQuaternion(q: three.Quaternion) {
    let euler = new three.Euler(0, 0, 0, 'YXZ').setFromQuaternion(q)
        .toArray() as number[]
    euler.pop()
    euler = toDegrees(euler)
    return euler as Vec3
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

/**
 * Find value between 0 and 1 from a beginning, length, and a point in time between.
 * @param beginning Start value.
 * @param length Length between start and end value.
 * @param time Value between start and end.
 */
export function findFraction(beginning: number, length: number, time: number) {
    if (length === 0) return 0
    return (time - beginning) / length
}

/**
 * Gives a random number in the given range.
 * @param start Minimum value.
 * @param end Maximum value.
 * @param roundResult If defined, result will be rounded to nearest multiple of this number.
 */
export function random(start: number, end: number, roundResult?: number) {
    const result = Math.random() * (end - start) + start
    return roundResult ? round(result, roundResult) : result
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
/**
 * Returns a unique random function per seed
 */
export function seededRandom(seed: number) {
    return (min: number, max: number) => {
        const r = hash1D(seed)
        return lerp(min, max, r)
    }
}

/**
 * Returns a random number given an input seed number.
 */
export function hash1D(seed: number) {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    const r = ((t ^ t >>> 14) >>> 0) / 4294967296
    return r
}

/** Returns a random number given an input seed string. */
export function hashString(str: string) {
    let hash = 2166136261n // FNV offset basis
    const prime = 16777619n // FNV prime

    for (let i = 0; i < str.length; i++) {
        hash ^= BigInt(str.charCodeAt(i)) // XOR the current byte into the hash
        hash *= prime // Multiply by the prime
    }

    const scaledHash = Number(hash % 1000000n) / 1000000
    return scaledHash
}

/**
 * A modulo operation that is always positive.
 * ```ts
 * const a = -0.3 % 1 // -0.3, negative result
 * const b = positiveMod(-0.3, 1) // 0.7, positive result
 * ```
 */
export function positiveMod(a: number, b: number) {
    return (a % b + b) % b
}

/**
 * Rounds a number to the nearest multiple of another number.
 * @param input Number to round.
 * @param step Number to round to.
 */
export const round = (input: number, step: number) =>
    Math.round(input / step) * step

/**
 * Floors a number to the nearest multiple of another number.
 * @param input Number to floor.
 * @param step Number to floor to.
 */
export const floorTo = (input: number, step: number) =>
    Math.floor(input / step) * step

/**
 * Ceils a number to the nearest multiple of another number.
 * @param input Number to ceil.
 * @param step Number to ceil to.
 */
export const ceilTo = (input: number, step: number) =>
    Math.ceil(input / step) * step

/**
 * Makes a number fit between a min and max value.
 * @param input Input number.
 * @param min Optional minimum value.
 * @param max Optional maximum value.
 */
export function clamp(input: number, min?: number, max?: number) {
    if (max !== undefined && input > max) input = max
    else if (min !== undefined && input < min) input = min
    return input
}

/**
 * Sets the decimal place amount on a number.
 * @param input Input number.
 * @param decimals Amount of decimals.
 */
export function setDecimals(input: number, decimals: number) {
    const multiplier = Math.pow(10, decimals)
    return Math.round(input * multiplier) / multiplier
}

/**
 * Gets the distance between 2 points.
 * @param A First point.
 * @param B Second point.
 */
export function getDistance<T extends readonly [] | readonly number[]>(
    A: T,
    B: { readonly [K in keyof T]: number },
) {
    return magnitude(arraySubtract(A, B))
}

/**
 * Gets the magnitude/length of a vector.
 */
export function magnitude(vector: readonly number[]) {
    let sum = 0
    vector.forEach((x) => sum += x * x)
    return Math.sqrt(sum)
}

/**
 * Gets the dot product between 2 vectors of the same length.
 */
export function dotProduct<T extends readonly [] | readonly number[]>(
    A: T,
    B: { readonly [K in keyof T]: number },
) {
    let sum = 0
    A.forEach((x, i) => sum += x * B[i])
    return sum
}

/**
 * Gets a cross product between two Vec3s.
 */
export function crossProduct(
    A: Readonly<Vec3>,
    B: Readonly<Vec3>,
) {
    const [a, b, c] = A
    const [d, e, f] = B
    return [
        (b * f) - (c * e),
        (c * d) - (a * f),
        (a * e) - (b * d),
    ] as Vec3
}

/**
 * Normalize a vector, making it's magnitude 1.
 */
export function normalize<T extends readonly number[]>(vector: T) {
    return arrayDivide(vector, magnitude(vector))
}

/**
 * Rotates a point around a mathematical anchor, [0,0,0] by default.
 * @param point Point to rotate.
 * @param rotation Rotation to apply.
 * @param anchor Location of the rotation anchor.
 */
export function rotatePoint(
    point: Readonly<Vec3>,
    rotation: Readonly<Vec3>,
    anchor: Readonly<Vec3> = [0, 0, 0],
) {
    const mathRot = toRadians(rotation as Vec3)
    const vector = toThreeVec3(
        arrayAdd(point as Vec3, arrayMultiply(anchor as Vec3, -1)),
    ).applyEuler(
        new three.Euler(...mathRot, 'YXZ'),
    )
    return arrayAdd(threeClassToArray(vector), anchor as Vec3)
}

/**
 * Rotate a vector, starts downwards.
 * @param rotation Rotation to apply.
 * @param length Length of the vector.
 */
export function rotateVector(rotation: Readonly<Vec3>, length: number) {
    return rotatePoint([0, -length, 0], rotation)
}

/**
 * Convert an array of numbers from degrees to radians.
 * @param values Input array of numbers.
 */
export function toRadians(values: number): number
export function toRadians<T extends [] | number[]>(values: Readonly<T>): T
export function toRadians<T extends [] | number[]>(
    values: Readonly<T> | number,
) {
    const toRadNum = (x: number) => x * (Math.PI / 180)

    if (typeof values === 'number') {
        return toRadNum(values) as number
    }

    return values.map(toRadNum) as T
}

/**
 * Convert an array of numbers from radians to degrees.
 * @param values Input array of numbers.
 */
export function toDegrees(values: number): number
export function toDegrees<T extends [] | number[]>(values: Readonly<T>): T
export function toDegrees<T extends [] | number[]>(
    values: Readonly<T> | number,
) {
    const toDegreesNum = (x: number) => x * (180 / Math.PI)

    if (typeof values === 'number') {
        return toDegreesNum(values) as number
    }

    return values.map(toDegreesNum) as T
}

/**
 * Converts a three number array to three Vector3.
 * @param v Array to convert.
 */
export const toThreeVec3 = (v: Readonly<Vec3>) => new three.Vector3(...v)

/**
 * Converts a three number array to three Euler.
 * @param v Array to convert.
 */
export const toThreeEuler = (v: Readonly<Vec3>) =>
    new three.Euler(...toRadians(v as Vec3), 'YXZ')

/**
 * Converts a three number array to three Quaternion.
 * @param v Array to convert.
 */
export const toThreeQuaternion = (v: Readonly<Vec3>) =>
    new three.Quaternion().setFromEuler(toThreeEuler(v))

/**
 * Takes a transformation and converts it to a matrix.
 * @param transform Transform to convert.
 */
export function getMatrixFromTransform(transform: DeepReadonly<Transform>) {
    const m = new three.Matrix4()
    const pos = transform.pos ?? [0, 0, 0]
    const rot = transform.rot ?? [0, 0, 0]
    const scale = transform.scale ?? [1, 1, 1]
    m.compose(toThreeVec3(pos), toThreeQuaternion(rot), toThreeVec3(scale))
    return m
}

/**
 * Get a Matrix4x4 from 3D basis vectors.
 */
export function matrixFromBasisVectors(
    basisX: Readonly<Vec3>,
    basisY: Readonly<Vec3>,
    basisZ: Readonly<Vec3>,
) {
    return new three.Matrix4().set(
        ...[basisX[0], basisY[0], basisZ[0], 0],
        ...[basisX[1], basisY[1], basisZ[1], 0],
        ...[basisX[2], basisY[2], basisZ[2], 0],
        ...[0, 0, 0, 1],
    )
}

/**
 * Takes matrix and converts it to a transformation.
 * @param matrix Matrix to convert.
 */
export function getTransformFromMatrix(matrix: three.Matrix4) {
    const pos = new three.Vector3()
    const q = new three.Quaternion()
    const scale = new three.Vector3()
    matrix.decompose(pos, q, scale)
    const rot = eulerFromQuaternion(q)
    return {
        pos: threeClassToArray(pos),
        rot: rot,
        scale: threeClassToArray(scale),
    }
}

/**
 * Find the rotation from an eye location to a target.
 */
export function lookAt(
    eye: Readonly<Vec3>,
    target: Readonly<Vec3>,
) {
    const forward = normalize(arraySubtract(target, eye))
    let up = [0, 1, 0] as Vec3
    let right = crossProduct(up, forward)
    up = crossProduct(forward, right)
    const m = matrixFromBasisVectors(right, up, forward)
    return getTransformFromMatrix(m).rot
}

/**
 * Apply a matrix transformation to a point
 */
export function applyMatrixToPoint(
    matrix: three.Matrix4,
    point: Readonly<Vec3>,
) {
    return combineTransforms({
        pos: point,
    }, getTransformFromMatrix(matrix)).pos
}

/**
 * Combine 2 rotations. Not commutative.
 */
export function combineRotations(
    target: Readonly<Vec3>,
    rotation: Readonly<Vec3>,
) {
    return combineTransforms({
        rot: target,
    }, {
        rot: rotation,
    }).rot
}

/**
 * Applies 2 transformations to each other.
 * @param target Input transformation.
 * @param transform Transformation to apply.
 * @param anchor
 * @returns
 */
export function combineTransforms(
    target: DeepReadonly<Transform>,
    transform: DeepReadonly<Transform>,
    anchor: Readonly<Vec3> = [0, 0, 0],
) {
    const newTarget = copy(target) as Transform
    const newTransform = copy(transform) as Transform

    newTarget.pos ??= [0, 0, 0]
    newTarget.pos = arraySubtract(newTarget.pos, anchor)

    const targetM = getMatrixFromTransform(newTarget)
    const transformM = getMatrixFromTransform(newTransform)
    targetM.premultiply(transformM)
    const finalTarget = getTransformFromMatrix(targetM)

    const finalPos = arrayAdd(finalTarget.pos, anchor)

    return {
        pos: finalPos,
        rot: finalTarget.rot as Vec3,
        scale: finalTarget.scale as Vec3,
    }
}

export function emulateParent(
    child: DeepReadonly<AnimatedTransform>,
    parent: DeepReadonly<AnimatedTransform>,
    anchor: Readonly<Vec3> = [0, 0, 0],
    animFreq?: number,
    animOptimizer?: OptimizeSettings,
): FullAnimatedTransform {
    animOptimizer ??= new OptimizeSettings()
    animFreq ??= 1 / 32

    enum Complexity {
        DEFAULT,
        SIMPLE,
        ANIMATED,
    }

    function getKeyframeComplexity(
        prop: DeepReadonly<RawKeyframesVec3>,
        defaultVal: DeepReadonly<Vec3>,
    ) {
        if (!areKeyframesSimple(prop)) return Complexity.ANIMATED
        const isDefault = areArraysEqual(prop as DeepReadonly<Vec3>, defaultVal)
        return isDefault ? Complexity.DEFAULT : Complexity.SIMPLE
    }

    function getComplexity(
        obj: DeepReadonly<FullAnimatedTransform>,
    ) {
        return {
            pos: getKeyframeComplexity(obj.pos, [0, 0, 0]),
            rot: getKeyframeComplexity(obj.rot, [0, 0, 0]),
            scale: getKeyframeComplexity(obj.scale, [1, 1, 1]),
        }
    }

    function makeObj(obj: DeepReadonly<AnimatedTransform>) {
        return {
            pos: obj.pos ?? [0, 0, 0],
            rot: obj.rot ?? [0, 0, 0],
            scale: obj.scale ?? [1, 1, 1],
        } as DeepReadonly<FullAnimatedTransform>
    }

    const childObj = makeObj(child)
    const parentObj = makeObj(parent)

    const childComplexity = getComplexity(childObj)
    const parentComplexity = getComplexity(parentObj)

    // Both are completely static
    if (
        childComplexity.pos <= 1 &&
        childComplexity.rot <= 1 &&
        childComplexity.scale <= 1 &&
        parentComplexity.pos <= 1 &&
        parentComplexity.rot <= 1 &&
        parentComplexity.scale <= 1
    ) {
        return combineTransforms(
            child as Transform,
            parent as Transform,
            anchor,
        )
    }

    // Child position is simple, parent is animated
    if (
        childComplexity.pos >= 1 &&
        parentComplexity.pos <= 1 &&
        parentComplexity.rot === Complexity.DEFAULT &&
        parentComplexity.scale === Complexity.DEFAULT
    ) {
        const childPos = copy(childObj.pos) as RawKeyframesVec3
        const parentPos = parentObj.pos as Vec3

        iterateKeyframes(childPos, (x) => {
            x[0] += parentPos[0]
            x[1] += parentPos[1]
            x[2] += parentPos[2]
        })

        return {
            pos: childPos,
            rot: copy(childObj.rot) as RawKeyframesVec3,
            scale: copy(childObj.scale) as RawKeyframesVec3,
        }
    }

    // Parent position is simple, child is animated
    if (
        childComplexity.pos <= 1 &&
        parentComplexity.pos >= 1 &&
        parentComplexity.rot === Complexity.DEFAULT &&
        parentComplexity.scale === Complexity.DEFAULT
    ) {
        const childPos = childObj.pos as Vec3
        const parentPos = copy(parentObj.pos) as RawKeyframesVec3

        iterateKeyframes(parentPos, (x) => {
            x[0] += childPos[0]
            x[1] += childPos[1]
            x[2] += childPos[2]
        })

        return {
            pos: parentPos,
            rot: copy(childObj.rot) as RawKeyframesVec3,
            scale: copy(childObj.scale) as RawKeyframesVec3,
        }
    }

    // looks like we bakin
    const childDomain = getAnimatedObjectDomain(childObj)
    const parentDomain = getAnimatedObjectDomain(parentObj)

    const domain = {
        min: Math.min(childDomain.min, parentDomain.min),
        max: Math.max(childDomain.max, parentDomain.max),
    }

    return bakeAnimation(
        childObj,
        (k) => {
            const parentPos = getKeyframeValuesAtTime(
                'position',
                parentObj.pos,
                k.time,
            )

            const parentRot = getKeyframeValuesAtTime(
                'rotation',
                parentObj.rot,
                k.time,
            )

            const parentScale = getKeyframeValuesAtTime(
                'scale',
                parentObj.scale,
                k.time,
            )

            const t = combineTransforms({
                pos: k.pos,
                rot: k.rot,
                scale: k.scale,
            }, {
                pos: parentPos,
                rot: parentRot,
                scale: parentScale,
            }, anchor)

            Object.assign(k, t)
        },
        animFreq,
        animOptimizer,
        domain,
    )
}

/**
 * Gets information about the bounding box of a box or a bunch of boxes.
 * @param boxes Can be one box or an array of boxes.
 */
export function getBoxBounds(
    boxes: DeepReadonly<Transform> | DeepReadonly<Transform>[],
): Bounds {
    let lowBound: Vec3 | undefined
    let highBound: Vec3 | undefined

    const boxArr = Array.isArray(boxes) ? boxes : [boxes]

    boxArr.forEach((b) => {
        const pos = b.pos ?? [0, 0, 0]
        const rot = b.rot ?? [0, 0, 0]
        const scale = b.scale ?? [1, 1, 1]

        const corners: Vec3[] = [
            [-1, 1, 1],
            [1, 1, 1],
            [-1, -1, 1],
            [1, -1, 1],
            [-1, 1, -1],
            [1, 1, -1],
            [-1, -1, -1],
            [1, -1, -1],
        ]

        corners.forEach((c) => {
            c = c.map((x, i) => (x / 2) * scale[i]) as Vec3
            c = rotatePoint(c, rot)
            c = arrayAdd(c, pos as Vec3)

            if (lowBound === undefined) {
                lowBound = copy(c)
                highBound = copy(c)
                return
            }

            c.forEach((x, i) => {
                if ((lowBound as Vec3)[i] > x) {
                    ;(lowBound as Vec3)[i] = x
                }
                if ((highBound as Vec3)[i] < x) {
                    ;(highBound as Vec3)[i] = x
                }
            })
        })
    })

    const scale = (lowBound as Vec3).map((x, i) =>
        Math.abs(x - (highBound as Vec3)[i])
    ) as Vec3
    const midPoint = (lowBound as Vec3).map((x, i) =>
        lerp(x, (highBound as Vec3)[i], 0.5)
    ) as Vec3

    return {
        lowBound: lowBound as Vec3,
        highBound: highBound as Vec3,
        scale: scale,
        midPoint: midPoint,
    }
}

/**
 * Get the amount of seconds in the script.
 * @param decimals Amount of decimals in returned number.
 */
export const getRuntimeSeconds = (decimals = 2) =>
    setDecimals(performance.now() / 1000, decimals)

/**
 * Get jump related info.
 * @param noteJumpSpeed Note jump speed.
 * @param noteJumpOffset Note offset.
 * @param beatsPerMinute Song BPM.
 * @returns Returns an object; {halfDur, dist}.
 * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
 * Jump Duration is the time in beats that the object will be jumping for.
 * This function will output half of this, so it will end when the note is supposed to be hit.
 * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
 */
export function getJumps(
    noteJumpSpeed: number,
    noteJumpOffset: number,
    beatsPerMinute: number,
) {
    const startHJD = 4
    const maxHJD = 18 - 0.001
    const oneBeatDur = 60 / beatsPerMinute

    let halfDur = startHJD
    const num2 = noteJumpSpeed * oneBeatDur
    let num3 = num2 * halfDur
    while (num3 > maxHJD) {
        halfDur /= 2
        num3 = num2 * halfDur
    }
    halfDur += noteJumpOffset
    if (halfDur < 0.25) halfDur = 0.25

    const jumpDur = halfDur * 2 * oneBeatDur
    const jumpDist = noteJumpSpeed * jumpDur

    return { halfDur: halfDur, dist: jumpDist }
}
