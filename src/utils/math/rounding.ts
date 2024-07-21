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
export const round = (input: number, step: number) => Math.round(input / step) * step
/**
 * Floors a number to the nearest multiple of another number.
 * @param input Number to floor.
 * @param step Number to floor to.
 */
export const floorTo = (input: number, step: number) => Math.floor(input / step) * step
/**
 * Ceils a number to the nearest multiple of another number.
 * @param input Number to ceil.
 * @param step Number to ceil to.
 */
export const ceilTo = (input: number, step: number) => Math.ceil(input / step) * step

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
