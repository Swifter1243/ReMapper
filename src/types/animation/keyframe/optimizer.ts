import {InnerKeyframeBoundless} from './boundless.ts'

export type KeyframeInfo = {
    readonly values: ReadonlyArray<number>
    readonly time: number
    readonly hasFlags: boolean
    readonly original: InnerKeyframeBoundless
}

// pointC is undefined if array is size 2
// return true to remove point
/**
 * Function for an Optimizer.
 */
export type OptimizeFunction = (
    pointA: KeyframeInfo,
    pointB: KeyframeInfo,
    pointC: KeyframeInfo | undefined,
) => KeyframeInfo | undefined