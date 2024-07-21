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
