/** An internal tool for inverting defined booleans, while ignoring undefined. */
export function importInvertedBoolean(bool: boolean | undefined) {
    return bool !== undefined ? !bool : undefined
}

/** An internal tool for inverting defined booleans, and setting them to undefined if they're equal to their "default value". */
export function exportInvertedBoolean(
    bool: boolean | undefined,
    defaultValue: boolean,
) {
    const invert = importInvertedBoolean(bool)
    return defaultBoolean(invert, defaultValue)
}

/** An internal tool to set a boolean to undefined if it's equal to a "default value". */
export function defaultBoolean(
    bool: boolean | undefined,
    defaultValue: boolean,
) {
    return bool === defaultValue ? undefined : bool
}

/** Get a property from a customData object, while mutating the object to remove that property. */
export function getCDProp<
    T extends Record<string, unknown>,
    K extends keyof T,
>(
    obj: { customData?: T; _customData?: T },
    prop: K,
) {
    if (obj._customData && obj._customData[prop] !== undefined) {
        const result = obj._customData[prop]
        delete obj._customData[prop]
        return result as T[K]
    }

    if (obj.customData && obj.customData[prop] !== undefined) {
        const result = obj.customData[prop]
        delete obj.customData[prop]
        return result as T[K]
    }

    return undefined
}
