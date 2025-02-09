/** A type that can be used to prefer a tuple on an array of numbers. */
export type NumberTuple = number[] | []

/** Create a tuple of type T with a given size. */
export type TupleOfSize<T, Size extends number> = number extends Size ? T[] : DefiniteTupleOf<T, Size>

type DefiniteTupleOf<T, Size extends number, R extends unknown[] = []> = R['length'] extends Size ? R : DefiniteTupleOf<T, Size, [...R, T]>