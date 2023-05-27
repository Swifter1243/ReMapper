// deno-lint-ignore-file no-extra-semi
import { three } from '../deps.ts'
import * as easings from '../data/easings.ts'
import { EASE } from '../types/animation_types.ts'

import { arrAdd, arrMul, arrSubtract, toArr } from './array_utils.ts'
import { Bounds, Transform, Vec3 } from '../types/data_types.ts'
import { copy } from './general.ts'

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
    if (easing !== undefined) fraction = lerpEasing(easing, fraction)
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
    if (easing !== undefined) fraction = lerpEasing(easing, fraction)
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
    if (easing !== undefined) fraction = lerpEasing(easing, fraction)
    const q1 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(start), 'YXZ'),
    )
    const q2 = new three.Quaternion().setFromEuler(
        new three.Euler(...toRadians(end), 'YXZ'),
    )
    q1.slerp(q2, fraction)
    return rotFromQuaternion(q1)
}

/**
 * Converts a quaternion to a euler rotation.
 * @param q Input quaternion.
 */
export function rotFromQuaternion(q: three.Quaternion) {
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
export function lerpEasing(easing: EASE, value: number) {
    if (easing === 'easeLinear' || easing === undefined) return value
    if (easing === 'easeStep') return value === 1 ? 1 : 0
    return easings[easing](value, 0, 1, 1)
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
export function rand(start: number, end: number, roundResult?: number) {
    const result = Math.random() * (end - start) + start
    return roundResult ? round(result, roundResult) : result
}

/**
 * Rounds a number to the nearest multiple of another number.
 * @param input Number to round.
 * @param number Number to round to.
 */
export const round = (input: number, number: number) =>
    Math.round(input / number) * number

/**
 * Floors a number to the nearest multiple of another number.
 * @param input Number to floor.
 * @param number Number to floor to.
 */
export const floorTo = (input: number, number: number) =>
    Math.floor(input / number) * number

/**
 * Ceils a number to the nearest multiple of another number.
 * @param input Number to ceil.
 * @param number Number to ceil to.
 */
export const ceilTo = (input: number, number: number) =>
    Math.ceil(input / number) * number

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
export function getDist(A: Vec3, B: Vec3) {
    const deltaX = B[0] - A[0]
    const deltaY = B[1] - A[1]
    const deltaZ = B[2] - A[2]
    const sum = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
    return Math.sqrt(sum)
}

/**
 * Rotates a point around a mathematical anchor, [0,0,0] by default.
 * @param point Point to rotate.
 * @param rotation Rotation to apply.
 * @param anchor Location of the rotation anchor.
 */
export function rotatePoint(
    point: Vec3,
    rotation: Vec3,
    anchor: Vec3 = [0, 0, 0],
) {
    const mathRot = toRadians(rotation)
    const vector = toVec3(arrAdd(point, arrMul(anchor, -1))).applyEuler(
        new three.Euler(...mathRot, 'YXZ'),
    )
    return arrAdd(toArr(vector), anchor) as Vec3
}

/**
 * Rotate a vector, starts downwards.
 * @param rotation Rotation to apply.
 * @param length Length of the vector.
 */
export function rotateVector(rotation: Vec3, length: number) {
    return rotatePoint([0, -length, 0], rotation)
}

/**
 * Convert an array of numbers from degrees to radians.
 * @param values Input array of numbers.
 */
export function toRadians<T extends number[] | []>(values: T) {
    return values.map((x) => x * (Math.PI / 180)) as T
}

/**
 * Convert an array of numbers from radians to degrees.
 * @param values Input array of numbers.
 */
export function toDegrees<T extends number[] | []>(values: T) {
    return values.map((x) => x * (180 / Math.PI)) as T
}

/**
 * Converts a three number array to three Vector3.
 * @param v Array to convert.
 */
export const toVec3 = (v: Vec3) => new three.Vector3(...v)

/**
 * Converts a three number array to three Euler.
 * @param v Array to convert.
 */
export const toEuler = (v: Vec3) => new three.Euler(...toRadians(v), 'YXZ')

/**
 * Converts a three number array to three Quaternion.
 * @param v Array to convert.
 */
export const toQuaternion = (v: Vec3) =>
    new three.Quaternion().setFromEuler(toEuler(v))

/**
 * Takes a transformation and converts it to matrix.
 * @param transform Transform to convert.
 */
export function getMatrixFromTransform(transform: Transform) {
    const m = new three.Matrix4()
    const pos = transform.pos ?? [0, 0, 0]
    const rot = transform.rot ?? [0, 0, 0]
    const scale = transform.scale ?? [1, 1, 1]
    m.compose(toVec3(pos), toQuaternion(rot), toVec3(scale))
    return m
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
    const rot = rotFromQuaternion(q)
    return {
        pos: toArr(pos),
        rot: rot,
        scale: toArr(scale),
    }
}

/**
 * Applies 2 transformations to each other.
 * @param target Input transformation.
 * @param transform Transformation to apply.
 * @param anchor
 * @returns
 */
export function combineTransforms(
    target: Transform,
    transform: Transform,
    anchor: Vec3 = [0, 0, 0],
) {
    target = copy(target)
    transform = copy(transform)

    target.pos ??= [0, 0, 0]
    target.pos = arrSubtract(target.pos, anchor)

    const targetM = getMatrixFromTransform(target)
    const transformM = getMatrixFromTransform(transform)
    targetM.premultiply(transformM)
    target = getTransformFromMatrix(targetM)

    return {
        pos: target.pos as Vec3,
        rot: target.rot as Vec3,
        scale: target.scale as Vec3,
    }
}

/**
 * Gets information about the bounding box of a box or a bunch of boxes.
 * @param boxes Can be one box or an array of boxes.
 */
export function getBoxBounds(boxes: Transform | Transform[]): Bounds {
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
            c = arrAdd(c, pos)

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
export const getSeconds = (decimals = 2) =>
    setDecimals(performance.now() / 1000, decimals)

/**
 * Get jump related info.
 * @param NJS Note jump speed.
 * @param offset Note offset.
 * @param BPM Song BPM.
 * @returns Returns an object; {halfDur, dist}.
 * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
 * Jump Duration is the time in beats that the object will be jumping for.
 * This function will output half of this, so it will end when the note is supposed to be hit.
 * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
 */
export function getJumps(NJS: number, offset: number, BPM: number) {
    const startHJD = 4
    const maxHJD = 18 - 0.001
    const oneBeatDur = 60 / BPM

    let halfDur = startHJD
    const num2 = NJS * oneBeatDur
    let num3 = num2 * halfDur
    while (num3 > maxHJD) {
        halfDur /= 2
        num3 = num2 * halfDur
    }
    halfDur += offset
    if (halfDur < 0.25) halfDur = 0.25

    const jumpDur = halfDur * 2 * oneBeatDur
    const jumpDist = NJS * jumpDur

    return { halfDur: halfDur, dist: jumpDist }
}
