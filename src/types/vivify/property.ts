/** Property type mostly used for Vivify custom events. */
export type Property<T, V> = {
    /** Name of the property. */
    id: string
    /** Type of the property. */
    type: T
    /** Value to set the property to. */
    value: V
}
