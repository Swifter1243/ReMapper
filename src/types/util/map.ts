import {ExcludeTypes} from "./object.ts";

/**
 * Represents a mapping of types where certain types are replaced with another type.
 * @typeparam T - The input type.
 * @typeparam U - The type to be replaced.
 * @typeparam V - The type to replace with.
 */
export type MapTypes<T, U, V> =
    & ExcludeTypes<T, U>
    & {
        [K in keyof T]: T[K] extends U ? V : never
    }[keyof T]

/**
 * Represents a mapping of types where certain types are replaced recursively with another type.
 * @typeparam T - The input type.
 * @typeparam U - The type to be replaced.
 * @typeparam V - The type to replace with.
 */
export type MapRecursiveTypes<T, U, V> =
    & ExcludeTypes<T, U>
    & {
        [K in keyof T]: T[K] extends U ? V
            : (T[K] extends object ? MapRecursiveTypes<T[K], U, V> : never)
    }[keyof T]