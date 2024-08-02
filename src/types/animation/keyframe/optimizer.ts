import {InnerKeyframeBoundless} from './boundless.ts'

export type KeyframeInfo = {
    values: number[]
    time: number
    hasFlags: boolean
    original: InnerKeyframeBoundless
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