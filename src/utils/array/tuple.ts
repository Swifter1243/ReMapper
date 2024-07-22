/**
 * Prefer a tuple on a number array
 */
export function vec<T extends readonly number[]>(...params: T) {
    return params as { [K in keyof T]: number }
}