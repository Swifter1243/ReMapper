import { OnlyNumbersOptional } from '../../types/util/object.ts'
import { EPSILON } from '../../data/constants/math.ts'

/**
 * Allows you to filter through an array of objects with a min and max property.
 * @param min Minimum (inclusive) allowed value of the property.
 * @param max Maximum (exclusive) allowed value of the property.
 * @param objects Array of objects to check.
 * @param property What property to check for.
 */
export function filterObjectsByProperty<T extends OnlyNumbersOptional<T>>(
    objects: T[],
    min: number,
    max: number,
    property: keyof T,
) {
    const passedObjects: T[] = []

    objects.forEach((obj) => {
        if (obj[property] + EPSILON >= min && obj[property] < max) {
            passedObjects.push(obj)
        }
    })

    return passedObjects
}
