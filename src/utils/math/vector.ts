import { Vec3 } from '../../types/data.ts'
import { arrayAdd, arrayDivide, arrayMultiply, arraySubtract } from '../array/operation.ts'
import {threeClassToArray, toThreeVec3} from './three_conversion.ts'
import { three } from '../../deps.ts'
import {toRadians} from "./degrees_radians.ts";

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
