/**
 * Represents a mutable version of a given type.
 * @typeparam T - The input type.
 */
export type SingleMutable<T> = { -readonly [P in keyof T]: T[P] }

/**
 * Represents a mutable version of an array of a given type.
 * @typeparam T - The input type.
 */
export type Mutable<T> = SingleMutable<SingleMutable<T>[]>[0]

/**
 * Represents a recursively mutable version of a given type.
 * @typeparam T - The input type.
 */
export type DeepMutable<T> = {
    -readonly [P in keyof T]: T[P] extends (infer R)[] ? DeepMutable<R>[]
        : T[P] extends ReadonlyArray<infer R> ? DeepMutable<R>[]
        // deno-lint-ignore ban-types
        : T[P] extends Function ? T[P]
        : T[P] extends object ? DeepMutable<T[P]>
        : T[P]
}

/**
 * Represents a recursively readonly version of a given type.
 * @typeparam T - The input type.
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}
