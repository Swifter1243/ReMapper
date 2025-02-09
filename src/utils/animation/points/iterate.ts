import { complexifyPoints, simplifyPoints } from './complexity.ts'

import {ComplexPointsAbstract, RawPointsAbstract} from "../../../types/animation/points/abstract.ts";
import {NumberTuple} from "../../../types/util/tuple.ts";

/**
 * Safely iterate through an array of points.
 * @param points Points to iterate.
 * @param fn Function to run on each point.
 */
export function iteratePoints<T extends NumberTuple>(
    points: RawPointsAbstract<T>,
    fn: (values: ComplexPointsAbstract<T>[0], index: number) => void,
) {
    const newPoints = complexifyPoints<T>(points)
    newPoints.forEach((x, i) => fn(x, i))
    const newSimplePoints = simplifyPoints(newPoints)
    newSimplePoints.forEach((x, i) => (points[i] = x))
    points.length = newSimplePoints.length
}
