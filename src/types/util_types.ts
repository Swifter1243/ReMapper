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

/**
 * Represents a filtered subset of a type based on a specified type condition.
 * @typeparam T - The input type.
 * @typeparam U - The type to filter by.
 */
export type FilterTypes<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? K : never
    }[keyof T]
>

/**
 * Represents a subset of a type excluding elements of a specified type.
 * @typeparam T - The input type.
 * @typeparam U - The type to exclude.
 */
export type ExcludeTypes<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? never : K
    }[keyof T]
>

// deno-lint-ignore ban-types
type ExcludeFunctionPropertyNames<T> = ExcludeTypes<T, Function>

// https://stackoverflow.com/questions/61272153/typescript-keyof-exclude-methods
/**
 * Represents the fields of a given object type excluding methods (functions).
 * @typeparam T - The input type.
 */
export type Fields<T> = ExcludeFunctionPropertyNames<T>

/**
 * Represents a filtered subset of a type containing only number properties.
 * @typeparam T - The input type.
 */
export type OnlyNumbers<T> = FilterTypes<T, number>

/**
 * Represents a filtered subset of a type containing only number or undefined properties.
 * @typeparam T - The input type.
 */
export type OnlyNumbersOptional<T> = FilterTypes<T, number | undefined>

/** A type that can be used to prefer a tuple on an array of numbers. */
export type NumberTuple = number[] | []

/**
 * Represents the fields of an object type excluding specified properties.
 * @typeparam T - The input type.
 * @typeparam V - The custom data type.
 */
export type ObjectFields<T extends { customData: V }, V = T['customData']> =
    & Omit<Omit<Fields<T>, 'isModded'>, 'customData'>
    & {
        customData?: T['customData']
    }

/** Represents a JSON data type. */
export type TJson = Record<string, unknown>

/**
 * Represents a type where the keys of one type are replaced with keys of another type.
 * @typeparam T - The input type.
 * @typeparam N - The type whose keys will replace keys of the input type.
 */
export type Replace<T, N> = Omit<T, keyof N> & N

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

/**
 * Represents exclusive properties of a subclass compared to its superclass.
 * @typeparam Subclass - The subclass type.
 * @typeparam Class - The superclass type.
 */
export type SubclassExclusiveProps<Subclass, Class> = {
    [K in Exclude<keyof Subclass, keyof Class>]: Subclass[K]
}
