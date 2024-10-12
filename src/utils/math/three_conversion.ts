import {three} from '../../deps.ts'
import {toDegrees, toRadians} from "./degrees_radians.ts";
import {isNegativeZero} from "./check.ts";
import {Vec3} from "../../types/math/vector.ts";

/**
 * Converts a quaternion to a euler rotation.
 * @param q Input quaternion.
 */
export function eulerFromQuaternion(q: three.Quaternion) {
    const euler = new three.Euler(0, 0, 0, 'YXZ').setFromQuaternion(q).toArray()
    const vector = [euler[0], euler[1], euler[2]].map((x) => isNegativeZero(x) ? 0 : x) as Vec3
    return toDegrees(vector)
}

/**
 * Converts a three number array to three Vector3.
 * @param v Array to convert.
 */
export function toThreeVec3(v: Readonly<Vec3>) {
    return new three.Vector3(...v)
}
/**
 * Converts a three number array to three Euler.
 * @param v Array to convert.
 */
export function toThreeEuler(v: Readonly<Vec3>) {
    return new three.Euler(...toRadians(v as Vec3), 'YXZ')
}
/**
 * Converts a three number array to three Quaternion.
 * @param v Array to convert.
 */
export function toThreeQuaternion(v: Readonly<Vec3>) {
    return new three.Quaternion().setFromEuler(toThreeEuler(v))
}

/**
 * Convert three Vector3 and Euler classes to a three number array.
 * @param v Vector or Euler to convert.
 */
export function threeClassToArray(v: three.Vector3 | three.Euler): Vec3 {
    return [v.x, v.y, v.z]
}