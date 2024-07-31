/**
 * Converts an array of Json objects to a class counterpart.
 * Used internally in Difficulty to import Json.
 * @param array Array to convert.
 * @param target Class to convert to. Must have "import" function.
 * @param callback Optional function to run on each converted class.
 */
export function arrayJSONToClass<T>(
    array: T[],
    target: { new (): T },
    callback?: (obj: T) => void,
) {
    if (array === undefined) return
    for (let i = 0; i < array.length; i++) {
        // deno-lint-ignore no-explicit-any
        array[i] = (new target() as any).import(array[i])
        if (callback) callback(array[i])
    }
}

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
    obj: { customData?: T, _customData?: T },
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

/** Get a property from the "properties" object in a CustomEvent.
 * This deletes whatever's accessed, so that the values transferred into the class aren't left in the properties object.
 */
export function getDataProp<
    T,
    K extends keyof T,
>(
    obj: T,
    prop: K,
) {
    if (obj[prop] !== undefined) {
        const result = obj[prop]
        delete obj[prop]
        return result as T[K]
    }

    return undefined
}