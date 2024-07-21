import {lerp} from "./lerp.ts";
import {round} from "./rounding.ts";

/**
 * Gives a random number in the given range.
 * @param start Minimum value.
 * @param end Maximum value.
 * @param roundResult If defined, result will be rounded to nearest multiple of this number.
 */
export function random(start: number, end: number, roundResult?: number) {
    const result = Math.random() * (end - start) + start
    return roundResult ? round(result, roundResult) : result
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
/**
 * Returns a unique random function per seed
 */
export function seededRandom(seed: number) {
    return (min: number, max: number) => {
        const r = hash1D(seed)
        return lerp(min, max, r)
    }
}

/**
 * Returns a random number given an input seed number.
 */
export function hash1D(seed: number) {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    const r = ((t ^ t >>> 14) >>> 0) / 4294967296
    return r
}

/** Returns a random number given an input seed string. */
export function hashString(str: string) {
    let hash = 2166136261n // FNV offset basis
    const prime = 16777619n // FNV prime

    for (let i = 0; i < str.length; i++) {
        hash ^= BigInt(str.charCodeAt(i)) // XOR the current byte into the hash
        hash *= prime // Multiply by the prime
    }

    return Number(hash % 1000000n) / 1000000
}
