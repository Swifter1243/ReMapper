import { Fields } from './class.ts'

/**
 * Represents the fields of an object type excluding specified properties.
 * @typeparam T - The input type.
 * @typeparam V - The custom properties type.
 */
export type ObjectFields<T> = Omit<Fields<T>, 'isModded'>

/** Represents a JSON properties type. */
export type TJson = Record<string, unknown>
