import { Vec3 } from '../../types/math/vector.ts'

/**
 * Convert an array of numbers from degrees to radians.
 * @param values Input array of numbers.
 */
export function toRadians(values: number): number
export function toRadians(values: Readonly<Vec3>): Vec3
export function toRadians(values: Readonly<Vec3> | number) {
    function toRadNum(x: number) {
        return x * (Math.PI / 180)
    }

    if (typeof values === 'number') {
        return toRadNum(values) as number
    }

    return values.map(toRadNum) as Vec3
}

/**
 * Convert an array of numbers from radians to degrees.
 * @param values Input array of numbers.
 */
export function toDegrees(values: number): number
export function toDegrees(values: Readonly<Vec3>): Vec3
export function toDegrees(values: Readonly<Vec3> | number) {
    function toDegreesNum(x: number) {
        return x * (180 / Math.PI)
    }

    if (typeof values === 'number') {
        return toDegreesNum(values) as number
    }

    return values.map(toDegreesNum) as Vec3
}
