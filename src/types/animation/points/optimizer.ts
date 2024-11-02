import {InnerPointBoundless} from './boundless.ts'

export type PointInfo = {
    readonly values: ReadonlyArray<number>
    readonly time: number
    readonly hasFlags: boolean
    readonly original: InnerPointBoundless
}

// pointC is undefined if array is size 2
// return true to remove point
/**
 * Function for an Optimizer.
 */
export type OptimizeFunction = (
    pointA: PointInfo,
    pointB: PointInfo,
    pointC: PointInfo | undefined,
) => PointInfo | undefined