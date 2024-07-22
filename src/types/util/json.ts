import { Fields } from './class.ts'

/**
 * Represents the fields of an object type excluding specified properties.
 * @typeparam T - The input type.
 * @typeparam V - The custom properties type.
 */
export type ObjectFields<T extends { customData: V }, V = T['customData']> =
    & Omit<Omit<Fields<T>, 'isModded'>, 'customData'>
    & {
        customData?: T['customData']
    }

/** Represents a JSON properties type. */
export type TJson = Record<string, unknown>
