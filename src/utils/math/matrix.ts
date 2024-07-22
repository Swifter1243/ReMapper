import {eulerFromQuaternion, threeClassToArray, toThreeQuaternion, toThreeVec3} from './three_conversion.ts'
import { crossProduct, normalize } from './vector.ts'
import { arraySubtract } from '../array/operation.ts'
import { three } from '../../deps.ts'
import {combineTransforms} from "./transform.ts";
import {Vec3} from "../../types/math/vector.ts";
import {Transform} from "../../types/math/transform.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";

/**
 * Takes a transformation and converts it to a matrix.
 * @param transform Transform to convert.
 */
export function getMatrixFromTransform(transform: DeepReadonly<Transform>) {
    const m = new three.Matrix4()
    const pos = transform.position ?? [0, 0, 0]
    const rot = transform.rotation ?? [0, 0, 0]
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
    const right = crossProduct(up, forward)
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
        position: point,
    }, getTransformFromMatrix(matrix)).position
}
