import { getPointTimeIndex } from './points/get.ts'
import { complexifyPoints, simplifyPoints } from './points/complexity.ts'
import { RawPointsAbstract } from '../../types/animation/points/abstract.ts'
import { ComplexPointsBoundless, InnerPointBoundless } from '../../types/animation/points/boundless.ts'
import { NumberTuple } from '../../types/util/tuple.ts'
import { PointInfo, OptimizeFunction } from '../../types/animation/points/optimizer.ts'

function areArrayElementsIdentical<T>(
    enumerable1: readonly T[],
    enumerable2: readonly T[],
): boolean {
    if (enumerable1.length !== enumerable2.length) {
        return false
    }

    for (let i = 0; i < enumerable1.length; i++) {
        const element1 = enumerable1[i]
        const element2 = enumerable2[i]

        // TODO: String equality?
        if (element1 !== element2) {
            return false
        }
    }

    return true
}

// returns false if the delta
// threshold is the minimum difference for contrast
// e.g 0.2 threshold means difference must be 0.2 or greater
function areFloatsSimilar(
    enumerable1: readonly number[],
    enumerable2: readonly number[],
    threshold: number,
) {
    if (enumerable1.length !== enumerable2.length) {
        throw new Error(
            `Arrays are not matching lengths. First: ${enumerable1.length} Second: ${enumerable2.length}`,
        )
    }

    for (let i = 0; i < enumerable1.length; i++) {
        const element1 = enumerable1[i]
        const element2 = enumerable2[i]

        if (Math.abs(element1 - element2) >= threshold) {
            return false
        }
    }

    return true
}

function arePointSimilar(
    a: PointInfo,
    b: PointInfo,
    differenceThreshold: number,
    timeDifferenceThreshold: number,
) {
    // Both points are identical
    return areFloatsSimilar(a.values, b.values, differenceThreshold) &&
        // time difference is small
        // points are not similar if the delta of a.time and b.time are GREATER than timeDifferenceThreshold
        Math.abs(a.time - b.time) <= timeDifferenceThreshold
}

function ComparePointsSlope(
    startPoint: PointInfo,
    middlePoint: PointInfo,
    endPoint: PointInfo,
    // pass in array to reuse and avoid allocations
    middleSlope: number[],
    endSlope: number[],
    middleYIntercepts: number[],
    endYIntercepts: number[],
    timeDifferenceThreshold: number,
    differenceThreshold: number,
    yInterceptDifferenceThreshold: number,
): { similar: boolean; skip: boolean } {
    // skip these points because time difference is too small
    if (
        Math.abs(startPoint.time - endPoint.time) <= timeDifferenceThreshold ||
        Math.abs(startPoint.time - middlePoint.time) <=
            timeDifferenceThreshold ||
        Math.abs(middlePoint.time - endPoint.time) <= timeDifferenceThreshold
    ) {
        return { skip: true, similar: false }
    }

    // TODO: Yeet, it's sorted by time I'm stupid
    // skip points if non-linear time
    // to ignore points where time bounces between pointA and pointC
    // example: [[0, 0, 0.5], [0, 0.5, 0.3], [0, -1, 0]]
    // if previous point time is greater than or equal to the 3rd point == if middle point time is lesser than or equal to endPoint time
    // if ((startPoint.Time >= middlePoint.Time) != (middlePoint.Time >= endPoint.Time))
    // {
    // 	return false;
    // }

    // Skip points that are identical with large time differences
    // used for points pause
    if (
        Math.abs(endPoint.time - middlePoint.time) > differenceThreshold &&
        areFloatsSimilar(
            endPoint.values,
            middlePoint.values,
            differenceThreshold,
        )
    ) {
        return { skip: true, similar: false }
    }

    SlopeOfPoint(startPoint, endPoint, endSlope)
    SlopeOfPoint(startPoint, middlePoint, middleSlope)

    GetYIntercept(middlePoint, middleSlope, middleYIntercepts)
    GetYIntercept(endPoint, endSlope, endYIntercepts)

    // example point properties
    // "_name":"colorWave","_points":[
    // [1,1,1,1,0],
    // [0,0,4,1,0.125],
    // [0,0.5,2,1,0.25],
    // [0,0,1,1,0.375],
    // [1,1,2,1,0.5],
    // [0,0,4,1,0.625],
    // [0,0.25,2,1,0.75],
    // [0.1,0.2,1,1,0.875],
    // [2,2,2,2,1]
    // ]}

    const similar =
        // The points slope apply on the same Y intercept
        areFloatsSimilar(
            middleYIntercepts,
            endYIntercepts,
            yInterceptDifferenceThreshold,
        ) &&
        // Both points are identical
        areFloatsSimilar(middleSlope, endSlope, differenceThreshold)

    return {
        skip: false,
        similar: similar,
    }
}

function GetYIntercept(
    pointData: PointInfo,
    slopeArray: number[],
    yIntercepts: number[],
) {
    for (let i = 0; i < slopeArray.length; i++) {
        const slope = slopeArray[i]
        const x = pointData.values[i]
        //y = mx + b
        // solve for y
        // b = y - mx
        yIntercepts[i] = pointData.time - (slope * x)
    }
}

function SlopeOfPoint(
    a: PointInfo,
    b: PointInfo,
    slopes: number[],
) {
    const yDiff = b.time - a.time

    for (let i = 0; i < b.values.length; i++) {
        const xDiff = b.values[i] - a.values[i]
        if (xDiff === 0 || yDiff === 0) {
            slopes[i] = 0
        } else {
            slopes[i] = yDiff / xDiff
        }
    }
}

// https://github.com/ErisApps/OhHeck/blob/ae8d02bf6bf2ec8545c2a07546c6844185b97f1c/OhHeck.Core/Analyzer/Lints/Animation/DuplicatePointData.cs
function optimizeDuplicates(
    pointA: PointInfo,
    pointB: PointInfo,
    pointC: PointInfo | undefined,
): PointInfo | undefined {
    if (pointC === undefined) {
        // array is size 2
        return areArrayElementsIdentical(pointA.values, pointB.values) ? pointA : undefined
    }

    // [[0,2, 0.2], [0, 2, 0.5], [0, 2, 1]]
    // removes the middle point
    // ignores time
    const middlePointUnnecessary = areArrayElementsIdentical(pointA.values, pointB.values) &&
        areArrayElementsIdentical(pointB.values, pointC.values)

    return middlePointUnnecessary ? pointB : undefined
}

// TODO: Configure threshold
// https://github.com/ErisApps/OhHeck/blob/ae8d02bf6bf2ec8545c2a07546c6844185b97f1c/OhHeck.Core/Analyzer/Lints/Animation/SimilarPointData.cs
function optimizeSimilarPoints(
    pointA: PointInfo,
    pointB: PointInfo,
    pointC: PointInfo | undefined,
    settings: OptimizeSimilarPointsSettings,
): PointInfo | undefined {
    // The minimum difference for considering not similar
    const differenceThreshold = settings.differenceThreshold
    const timeDifferenceThreshold = settings.timeDifferenceThreshold

    // ignore points who have flags (easings/splines)
    if (pointA.hasFlags || pointB.hasFlags || pointC?.hasFlags) {
        return undefined
    }

    if (pointC === undefined) {
        // array is size 2
        return arePointSimilar(
                pointA,
                pointB,
                differenceThreshold,
                timeDifferenceThreshold,
            )
            ? pointA
            : undefined
    }

    // [[0,2, 0.2], [0, 2, 0.5], [0, 2, 1]]
    // removes the middle point
    // ignores time
    const middlePointUnnecessary = arePointSimilar(
        pointA,
        pointB,
        differenceThreshold,
        timeDifferenceThreshold,
    ) &&
        arePointSimilar(
            pointB,
            pointC,
            differenceThreshold,
            timeDifferenceThreshold,
        )

    // console.log(`similar ${middlePointUnnecessary} a: ${pointA.values} b: ${pointB.values} c: ${pointC.values}`)

    return middlePointUnnecessary ? pointB : undefined
}

// TODO: Configure threshold
// https://github.com/ErisApps/OhHeck/blob/ae8d02bf6bf2ec8545c2a07546c6844185b97f1c/OhHeck.Core/Analyzer/Lints/Animation/SimilarPointDataSlope.cs
function optimizeSimilarPointsSlope(
    pointA: PointInfo,
    pointB: PointInfo,
    pointC: PointInfo | undefined,
    settings: OptimizeSimilarPointsSlopeSettings,
): PointInfo | undefined {
    if (pointC === undefined) {
        // array is size 2
        return undefined
    }

    // ignore points who have flags (easings/splines)
    if (pointA.hasFlags || pointB.hasFlags || pointC?.hasFlags) {
        return undefined
    }

    // The minimum difference for considering not similar
    // These numbers at quick glance seem to be fairly reliable, nice
    // however they should be configurable or looked at later
    const differenceThreshold = settings.differenceThreshold
    const timeDifferenceThreshold = settings.timeDifferenceThreshold
    const yInterceptDifferenceThreshold = settings.yInterceptDifferenceThreshold

    // reuse the same arrays because performance
    // less memory allocations
    // TODO: move to parameter
    const dummyArrays: number[][] = [[], [], [], []]

    // [[0,2, 0.2], [0, 2, 0.5], [0, 2, 1]]
    // removes the middle point
    // ignores time
    const middlePointUnnecessary = ComparePointsSlope(
        pointA,
        pointB,
        pointC,
        dummyArrays[0],
        dummyArrays[1],
        dummyArrays[2],
        dummyArrays[3],
        timeDifferenceThreshold,
        differenceThreshold,
        yInterceptDifferenceThreshold,
    )
    return middlePointUnnecessary.similar ? pointB : undefined
}

/**
 * Terminology
 * Treshold:   The minimum delta required for points to be retained.
 *             If the delta is LESS than the threshold, the point will be considered for removal
 */

/**
 * Settings for the "optimizeSimilarPoints" optimizing function, starts at default values.
 */
export class OptimizeSimilarPointsSettings {
    active = true
    differenceThreshold = 1
    timeDifferenceThreshold = 0.001

    toData() {
        return [
            this.active,
            this.differenceThreshold,
            this.timeDifferenceThreshold,
        ]
    }
}

/**
 * Settings for the "optimizeSimilarPointsSlope" optimizing function, starts at default values.
 */
export class OptimizeSimilarPointsSlopeSettings {
    // The minimum difference for considering not similar
    // These numbers at quick glance seem to be fairly reliable, nice
    // however they should be configurable or looked at later
    active = true
    differenceThreshold = 0.03
    timeDifferenceThreshold = 0.025
    yInterceptDifferenceThreshold = 0.5

    toData() {
        return [
            this.active,
            this.differenceThreshold,
            this.timeDifferenceThreshold,
            this.yInterceptDifferenceThreshold,
        ]
    }
}

/** Describes settings for functions to handle animations that need to be baked/optimized. */
export class AnimationSettings {
    /** If animation should be baked, how many points to sample. */
    bakeSampleFrequency = 32
    /** Settings to optimize the animation if it gets optimized. */
    optimizeSettings = new OptimizeSettings()

    toData() {
        return [
            this.bakeSampleFrequency,
            this.optimizeSettings.toData(),
        ]
    }
}

/**
 * Settings for the animation optimizer, starts at default values.
 */
export class OptimizeSettings {
    /** Whether to disable optimization altogether. */
    disabled = false
    /** How many times to run all of the optimizers on everything. */
    passes = 5
    /** Whether to log the effectiveness of each optimizer. */
    performanceLog = false
    /** Whether to remove points with the same properties. */
    optimizeDuplicates = true
    /** Remove points that are similar within a given threshold. */
    optimizeSimilarPoints: OptimizeSimilarPointsSettings = new OptimizeSimilarPointsSettings()
    /** Remove points that don't change the curve/slope of the animation. */
    optimizeSimilarPointsSlope: OptimizeSimilarPointsSlopeSettings = new OptimizeSimilarPointsSlopeSettings()
    /** Any additional optimization functions to run. */
    additionalOptimizers: OptimizeFunction[] = []

    toData() {
        return [
            this.disabled,
            this.passes,
            this.performanceLog,
            this.optimizeDuplicates,
            this.optimizeSimilarPoints.toData(),
            this.optimizeSimilarPointsSlope.toData(),
            this.additionalOptimizers,
        ]
    }
}

function getPointInfo(point: InnerPointBoundless) {
    const timeIndex = getPointTimeIndex(point)
    const values = point.slice(0, timeIndex) as number[]
    const time = point[timeIndex] as number
    const hasFlags = point.length > timeIndex + 1
    return {
        values,
        time,
        hasFlags,
        original: point,
    } satisfies PointInfo
}

function optimizePointsInternal(
    points: ComplexPointsBoundless,
    optimizeSettings: OptimizeSettings,
): ComplexPointsBoundless {
    if (optimizeSettings.disabled) return points

    const sortedPoints = points
        .map((x) => getPointInfo(x))
        .sort((a, b) => a.time - b.time)

    const optimizers: OptimizeFunction[] = [...optimizeSettings.additionalOptimizers]

    if (optimizeSettings.optimizeDuplicates) optimizers.push(optimizeDuplicates)
    if (optimizeSettings.optimizeSimilarPoints.active) {
        optimizers.push((a, b, c) =>
            optimizeSimilarPoints(
                a,
                b,
                c,
                optimizeSettings.optimizeSimilarPoints,
            )
        )
    }
    if (optimizeSettings.optimizeSimilarPointsSlope.active) {
        optimizers.push((a, b, c) =>
            optimizeSimilarPointsSlope(
                a,
                b,
                c,
                optimizeSettings.optimizeSimilarPointsSlope,
            )
        )
    }

    if (optimizeSettings.performanceLog) {
        console.log(`Optimizing ${points.length} points`)
    }

    // TODO: Log each optimizer's point removal

    let optimizedPoints = [...sortedPoints]

    for (let pass = 0; pass < optimizeSettings.passes; pass++) {
        const toRemove: (PointInfo | undefined)[] = []

        if (optimizedPoints.length === 2) {
            toRemove.push(
                ...optimizers.map((optimizerFn) =>
                    optimizerFn(
                        optimizedPoints[0],
                        optimizedPoints[1],
                        undefined,
                    )
                ),
            )
        }

        for (let i = 1; i < optimizedPoints.length - 1; i++) {
            const pointA = optimizedPoints[i - 1]
            const pointB = optimizedPoints[i]
            const pointC = optimizedPoints[i + 1]

            toRemove.push(
                ...optimizers.map((optimizerFn) => optimizerFn(pointA, pointB, pointC)),
            )
        }

        // get unique redundant points and none undefined
        const toRemoveUnique: PointInfo[] = []
        toRemove.forEach((e) => {
            // only add items that are not undefined and not in the array already
            if (
                e !== undefined &&
                !toRemoveUnique.some((otherP) => e === otherP)
            ) {
                toRemoveUnique.push(e)
            }
        })

        // probably slow but JS is weird for removing items at specific indexes, oh well
        optimizedPoints = sortedPoints.filter((p) => !toRemoveUnique.some((otherP) => p === otherP))
    }

    if (optimizeSettings.performanceLog) {
        console.log(
            `Optimized to ${optimizedPoints.length} (${optimizedPoints.length / points.length * 100}%) points`,
        )
    }

    return optimizedPoints.map((x) => x.original)
}

/**
 * Optimizes animations, removing unnecessary points.
 * @param animation points or array of points to optimize.
 * @param settings settings for the optimizer.
 * @returns
 */
export function optimizePoints<T extends NumberTuple>(
    animation: RawPointsAbstract<T>,
    settings: OptimizeSettings,
): RawPointsAbstract<T> {
    const points = complexifyPoints<T>(animation)

    if (points.length === 1) {
        return simplifyPoints(animation)
    }

    // not enough points to optimize
    if (points.length <= 2) {
        return points
    }

    return simplifyPoints<T>(optimizePointsInternal(points, settings) as RawPointsAbstract<T>)
}
