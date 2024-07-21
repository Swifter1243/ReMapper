/** Determines if a number is `-0` (yes that can happen) */
export function isNegativeZero(n: number) {
    const isZero = n === 0
    const isNegative = 1 / n === -Infinity
    return isNegative && isZero
}
