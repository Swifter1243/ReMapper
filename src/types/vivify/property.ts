type GetValues<T> = T[keyof T]

/** Property type mostly used for Vivify custom events. */
export type Property<T extends string, V extends { [K in T]: unknown }> = GetValues<{
    [K in T]: {
        /** Name of the property. */
        id: string
        /** Type of the property. */
        type: K
        /** Value to set the property to. */
        value: V[K]
    }
}>