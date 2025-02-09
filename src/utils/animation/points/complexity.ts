// deno-lint-ignore-file
import {
    DeepReadonly,
    InnerPointBoundless,
    NumberTuple,
    RawPointsAbstract,
    RuntimeDifficultyPointsBoundless
} from "../../../types/mod.ts";
import {getPointTimeIndex} from "./get.ts";
import {ComplexPointsAbstract} from "../../../types/animation/points/abstract.ts";

/**
 * Checks if value is an array of points.
 * @param array The points or array of points.
 */
export function arePointsSimple(
    array: DeepReadonly<RuntimeDifficultyPointsBoundless>,
) {
    if (array.length === 0) return false // empty complex array
    return typeof array[0] !== 'object'
}

/**
 * Ensures that this value is in the format of an array of points.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The points or array of points.
 */
export function complexifyPoints<T extends NumberTuple>(
    array: DeepReadonly<RawPointsAbstract<T>> | RawPointsAbstract<T>,
): ComplexPointsAbstract<T> {
    if (!arePointsSimple(array as RawPointsAbstract<T>)) {
        return array as ComplexPointsAbstract<T>
    }
    return [[...array, 0]] as ComplexPointsAbstract<T>
}

/**
 * If possible, isolate an array of points with one point.
 * For example if you input [[x,y,z,0]], it would be converted to [x,y,z].
 * @param array The array of points.
 */
export function simplifyPoints<T extends NumberTuple>(
    array: RawPointsAbstract<T>,
): RawPointsAbstract<T> {
    if (array.length <= 1 && !arePointsSimple(array)) {
        const point = array[0] as InnerPointBoundless
        const pointTimeIndex = getPointTimeIndex(point)
        const pointTime = point[pointTimeIndex]
        if (pointTime === 0) {
            return point.slice(0, pointTimeIndex) as RawPointsAbstract<T>
        }
    }
    return array
}