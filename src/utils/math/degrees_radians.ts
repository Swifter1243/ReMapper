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
