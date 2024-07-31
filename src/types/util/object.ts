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

/**
 * Represents a type where the keys of one type are replaced with keys of another type.
 * @typeparam T - The input type.
 * @typeparam N - The type whose keys will replace keys of the input type.
 */
export type Replace<T, N> = Omit<T, keyof N> & N

type FilterUnique<A, B> = {
    [K in keyof A]: K extends keyof B ? never : K;
}[keyof A];

/**
 * Represents a type where the keys only exist on type A compared to type B.
 */
export type UniqueTypes<A, B> = Pick<A, FilterUnique<A, B>>;