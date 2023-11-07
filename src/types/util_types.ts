export type MapTypes<T, U, V> =
    & ExcludeTypes<T, U>
    & {
        [K in keyof T]: T[K] extends U ? V : never
    }[keyof T]

export type MapRecursiveTypes<T, U, V> =
    & ExcludeTypes<T, U>
    & {
        [K in keyof T]: T[K] extends U ? V
            : (T[K] extends object ? MapRecursiveTypes<T[K], U, V> : never)
    }[keyof T]

export type FilterTypes<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? K : never
    }[keyof T]
>

export type ExcludeTypes<T, U> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends U ? never : K
    }[keyof T]
>

// deno-lint-ignore ban-types
type ExcludeFunctionPropertyNames<T> = ExcludeTypes<T, Function>

// https://stackoverflow.com/questions/61272153/typescript-keyof-exclude-methods
export type Fields<T> = ExcludeFunctionPropertyNames<T>

export type OnlyNumbers<T> = FilterTypes<T, number>

export type OnlyNumbersOptional<T> = FilterTypes<T, number | undefined>

/** A type that can be used to prefer a tuple on an array of numbers. */
export type NumberTuple = number[] | []

export type ObjectFields<T extends { customData: V }, V = T['customData']> =
    & Omit<Omit<Fields<T>, 'isModded'>, 'customData'>
    & {
        customData?: T['customData']
    }

/** Type for Json data. */
export type TJson = Record<string, unknown>

// export type AnimationInput<T extends BaseAnimation> = {
//     animation?: T | T["properties"]
// }

/** Replace the keys of one type with another */
export type Replace<T, N> = Omit<T, keyof N> & N

export type SingleMutable<T> = { -readonly [P in keyof T]: T[P] }

export type Mutable<T> = SingleMutable<SingleMutable<T>[]>[0]

export type DeepMutable<T> = {
    -readonly [P in keyof T]: T[P] extends (infer R)[] ? DeepMutable<R>[]
        : T[P] extends ReadonlyArray<infer R> ? DeepMutable<R>[]
        // deno-lint-ignore ban-types
        : T[P] extends Function ? T[P]
        : T[P] extends object ? DeepMutable<T[P]>
        : T[P]
}

export type DeepReadonly<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type SubclassExclusiveProps<Subclass, Class> = {
    [K in Exclude<keyof Subclass, keyof Class>]: Subclass[K]
}
