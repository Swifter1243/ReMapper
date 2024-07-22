import {three} from '../../deps.ts'
import {toDegrees, toRadians} from "./degrees_radians.ts";
import {isNegativeZero} from "./check.ts";
import {Vec3} from "../../types/math/vector.ts";

/**
 * Converts a quaternion to a euler rotation.
 * @param q Input quaternion.
 */
export function eulerFromQuaternion(q: three.Quaternion) {
    let euler = new three.Euler(0, 0, 0, 'YXZ').setFromQuaternion(q)
        .toArray() as number[]
    euler.pop()
    euler = euler.map((x) => isNegativeZero(x) ? 0 : x)
    euler = toDegrees(euler)
    return euler as Vec3
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
export const toThreeEuler = (v: Readonly<Vec3>) => new three.Euler(...toRadians(v as Vec3), 'YXZ')
/**
 * Converts a three number array to three Quaternion.
 * @param v Array to convert.
 */
export const toThreeQuaternion = (v: Readonly<Vec3>) =>
    new three.Quaternion().setFromEuler(toThreeEuler(v))

/**
 * Convert three Vector3 and Euler classes to a three number array.
 * @param v Vector or Euler to convert.
 */
export const threeClassToArray = (v: three.Vector3 | three.Euler) => [v.x, v.y, v.z] as Vec3