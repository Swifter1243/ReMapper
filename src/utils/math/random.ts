import {lerp} from "./lerp.ts";
import {roundTo} from "./rounding.ts";

/**
 * Gives a random number in the given range.
 * @param start Minimum value.
 * @param end Maximum value.
 * @param roundResult If defined, result will be rounded to nearest multiple of this number.
 */
export function random(start: number, end: number, roundResult?: number) {
    const result = lerp(start, end, Math.random())
    return roundResult ? roundTo(result, roundResult) : result
}

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
/**
 * Returns a unique random function per integer seed
 */
export function seededRandom(seed: number) {
    return (min: number, max: number) => {
        seed += 0x6D2B79F5
        const r = hashInteger(seed)
        return lerp(min, max, r)
    }
}

/**
 * Returns a random number between 0 and 1 given an input seed integer.
 */
export function hashInteger(seed: number) {
    let t = seed + 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
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
