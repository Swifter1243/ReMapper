import {setDecimals} from "./math/rounding.ts";

/**
 * Get the amount of seconds in the script.
 * @param decimals Amount of decimals in returned number.
 */
export const getRuntimeSeconds = (decimals = 2) => setDecimals(performance.now() / 1000, decimals)
/**
 * Log a message as ReMapper, displaying seconds.
 * @param message Message to log.
 */
export const RMLog = (message: string) =>
    console.log(`[ReMapper: ${getRuntimeSeconds()}s] ` + message)
/**
 * Log an error as ReMapper, displaying seconds.
 * @param message Error to log.
 */
export const RMError = (message: string) =>
    console.log('\x1b[31m%s\x1b[0m', `[ReMapper: ${getRuntimeSeconds()}s] ` + message)
