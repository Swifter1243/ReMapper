import { ExcludeTypes } from './object.ts'

// deno-lint-ignore ban-types
type ExcludeFunctionPropertyNames<T> = ExcludeTypes<T, Function>

// https://stackoverflow.com/questions/61272153/typescript-keyof-exclude-methods
/**
 * Represents the fields of a given object type excluding methods (functions).
 * @typeparam T - The input type.
 */
export type Fields<T> = ExcludeFunctionPropertyNames<T>

/**
 * Represents exclusive properties of a subclass compared to its superclass.
 * @typeparam Subclass - The subclass type.
 * @typeparam Class - The superclass type.
 */
export type SubclassExclusiveProps<Subclass, Class> = {
    [K in Exclude<keyof Subclass, keyof Class>]: Subclass[K]
}
