import { complexifyArray, Keyframe, KeyframesAny, simplifyArray } from "./animation";
import { copy } from "./general";

function areArrayElementsIdentical<T>(enumerable1: T[], enumerable2: T[]): boolean {
    if (enumerable1.length != enumerable2.length) {
        return false;
    }

    for (let i = 0; i < enumerable1.length; i++) {
        const element1 = enumerable1[i];
        const element2 = enumerable2[i];

        // TODO: String equality?
        if (element1 !== element2) {
            return false;
        }
    }

    return true;
}

// threshold is the minimum difference for contrast
// e.g 0.2 threshold means difference must be 0.2 or greater
function areFloatsSimilar(enumerable1: number[], enumerable2: number[], threshold: number) {
    if (enumerable1.length != enumerable2.length) {
        throw new Error(`Arrays are not matching lengths. First: ${enumerable1.length} Second: ${enumerable2.length}`);
    }

    for (let i = 0; i < enumerable1.length; i++) {
        const element1 = enumerable1[i];
        const element2 = enumerable2[i];

        if (Math.abs(element1 - element2) >= threshold) {
            return false;
        }
    }

    return true;
}

function arePointSimilar(a: Keyframe, b: Keyframe, differenceThreshold: number, timeDifferenceThreshold: number) {
    // Both points are identical
    return areFloatsSimilar(a.values, b.values, differenceThreshold)
        // time difference is small
        && Math.abs(a.time - b.time) <= timeDifferenceThreshold
}

/// <summary>
///
/// </summary>
/// <param name="startPoint"></param>
/// <param name="middlePoint"></param>
/// <param name="endPoint"></param>
/// <param name="middleSlope"></param>
/// <param name="endSlope"></param>
/// <param name="middleYIntercepts"></param>
/// <param name="endYIntercepts"></param>
/// <param name="skip"></param>
/// <returns>true if similar</returns>
function ComparePointsSlope(startPoint: Keyframe, middlePoint: Keyframe, endPoint: Keyframe,
    // pass in array to reuse and avoid allocations
    middleSlope: number[], endSlope: number[],
    middleYIntercepts: number[], endYIntercepts: number[],

    timeDifferenceThreshold: number, differenceThreshold: number, yInterceptDifferenceThreshold: number): { similar: boolean, skip: boolean } {
    // skip these points because time difference is too small
    if (Math.abs(startPoint.time - endPoint.time) <= timeDifferenceThreshold ||
        Math.abs(startPoint.time - middlePoint.time) <= timeDifferenceThreshold ||
        Math.abs(middlePoint.time - endPoint.time) <= timeDifferenceThreshold) {
        return { skip: true, similar: false };
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

    // Skip points where their easing or smoothness is different,
    // which would allow for middlePoint to cause a non-negligible difference
    if (endPoint.easing != middlePoint.easing || endPoint.spline != middlePoint.spline) {
        return { skip: true, similar: false };
    }

    // Skip points that are identical with large time differences
    // used for keyframe pause
    if (Math.abs(endPoint.time - middlePoint.time) > differenceThreshold && areFloatsSimilar(endPoint.values, middlePoint.values, differenceThreshold)) {
        return { skip: true, similar: false };
    }

    SlopeOfPoint(startPoint, endPoint, endSlope);
    SlopeOfPoint(startPoint, middlePoint, middleSlope);

    GetYIntercept(middlePoint, middleSlope, middleYIntercepts);
    GetYIntercept(endPoint, endSlope, endYIntercepts);

    // example point data
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
        areFloatsSimilar(middleYIntercepts, endYIntercepts, yInterceptDifferenceThreshold) &&
        // Both points are identical
        areFloatsSimilar(middleSlope, endSlope, differenceThreshold);

    return {
        skip: false,
        similar: similar
    }

}

function GetYIntercept(pointData: Keyframe, slopeArray: number[], yIntercepts: number[]) {
    for (let i = 0; i < slopeArray.length; i++) {
        const slope = slopeArray[i];
        const x = pointData.values[i];
        const y = pointData.time;

        //y = mx + b
        // solve for y
        // b = y - mx
        const yIntercept = y - (slope * x);
        yIntercepts[i] = yIntercept;
    }
}

function SlopeOfPoint(a: Keyframe, b: Keyframe, slopes: number[]) {
    const yDiff = b.time - a.time;

    for (let i = 0; i < b.values.length; i++) {
        const xDiff = b.values[i] - a.values[i];
        if (xDiff === 0 || yDiff === 0) {
            slopes[i] = 0;
        }
        else {
            slopes[i] = yDiff / xDiff;
        }
    }
}

// pointC is undefined if array is size 2
// return true to remove point
export type OptimizeFunction = (pointA: Keyframe, pointB: Keyframe, pointC: Keyframe | undefined) => Keyframe | undefined;

// https://github.com/ErisApps/OhHeck/blob/ae8d02bf6bf2ec8545c2a07546c6844185b97f1c/OhHeck.Core/Analyzer/Lints/Animation/DuplicatePointData.cs
function optimizeDuplicates(pointA: Keyframe, pointB: Keyframe, pointC: Keyframe | undefined): Keyframe | undefined {
    if (pointC === undefined) {
        // array is size 2
        return areArrayElementsIdentical(pointA.values, pointB.values) ? pointA : undefined;
    }

    // [[0,2, 0.2], [0, 2, 0.5], [0, 2, 1]]
    // removes the middle point
    // ignores time
    const middlePointUnnecessary = areArrayElementsIdentical(pointA.values, pointB.values) && areArrayElementsIdentical(pointB.values, pointC.values);

    return middlePointUnnecessary ? pointB : undefined;
}

// TODO: Configure threshold
// https://github.com/ErisApps/OhHeck/blob/ae8d02bf6bf2ec8545c2a07546c6844185b97f1c/OhHeck.Core/Analyzer/Lints/Animation/SimilarPointData.cs
function optimizeSimilarPoints(pointA: Keyframe, pointB: Keyframe, pointC: Keyframe | undefined, settings: OptimizeSimilarPointsSettings): Keyframe | undefined {
    // The minimum difference for considering not similar
    const differenceThreshold = settings.differenceThreshold;
    const timeDifferenceThreshold = settings.timeDifferenceThreshold;


    // ignore points who have different easing or smoothness since those can
    // be considered not similar even with small time differences
    if (pointA.easing !== pointB.easing || pointA.spline !== pointB.spline || (pointC !== undefined && (pointB.spline !== pointC.spline || pointB.easing !== pointC.easing))) {
        return undefined;
    }

    if (pointC === undefined) {
        // array is size 2
        return arePointSimilar(pointA, pointB, differenceThreshold, timeDifferenceThreshold) ? pointA : undefined;
    }

    // [[0,2, 0.2], [0, 2, 0.5], [0, 2, 1]]
    // removes the middle point
    // ignores time
    const middlePointUnnecessary = arePointSimilar(pointA, pointB, differenceThreshold, timeDifferenceThreshold) && arePointSimilar(pointB, pointC, differenceThreshold, timeDifferenceThreshold);

    return middlePointUnnecessary ? pointB : undefined;
}

// TODO: Configure threshold
// https://github.com/ErisApps/OhHeck/blob/ae8d02bf6bf2ec8545c2a07546c6844185b97f1c/OhHeck.Core/Analyzer/Lints/Animation/SimilarPointDataSlope.cs
function optimizeSimilarPointsSlope(pointA: Keyframe, pointB: Keyframe, pointC: Keyframe | undefined, settings: OptimizeSimilarPointsSlopeSettings): Keyframe | undefined {
    if (pointC === undefined) {
        // array is size 2
        return undefined;
    }

    // ignore points who have different easing or smoothness since those can
    // be considered not similar even with small time differences
    if (pointA.easing !== pointB.easing || pointA.spline !== pointB.spline || pointB.spline !== pointC.spline || pointB.easing !== pointC.easing) {
        return undefined;
    }

    // The minimum difference for considering not similar
    // These numbers at quick glance seem to be fairly reliable, nice
    // however they should be configurable or looked at later
    const differenceThreshold = settings.differenceThreshold;
    const timeDifferenceThreshold = settings.timeDifferenceThreshold;
    const yInterceptDifferenceThreshold = settings.yInterceptDifferenceThreshold;


    // reuse the same arrays because performance
    // less memory allocations
    // TODO: move to parameter
    const dummyArrays: number[][] = [[], [], [], []]

    // [[0,2, 0.2], [0, 2, 0.5], [0, 2, 1]]
    // removes the middle point
    // ignores time
    const middlePointUnnecessary = ComparePointsSlope(pointA, pointB, pointC, dummyArrays[0], dummyArrays[1], dummyArrays[2], dummyArrays[3], timeDifferenceThreshold, differenceThreshold, yInterceptDifferenceThreshold)
    return middlePointUnnecessary.similar ? pointB : undefined;
}

/**
 * Settings for the "optimizeSimilarPoints" optimizing function, starts at default values.
 */
export class OptimizeSimilarPointsSettings {
    differenceThreshold = 1;
    timeDifferenceThreshold = 0.03;
}

/**
 * Settings for the "optimizeSimilarPointsSlope" optimizing function, starts at default values.
 */
export class OptimizeSimilarPointsSlopeSettings {
    // The minimum difference for considering not similar
    // These numbers at quick glance seem to be fairly reliable, nice
    // however they should be configurable or looked at later
    differenceThreshold = 0.03;
    timeDifferenceThreshold = 0.025;
    yInterceptDifferenceThreshold = 0.5;
}

/**
 * Settings for the animation optimizer, starts at default values.
 */
export class OptimizeSettings {
    // false or undefined to disable these settings
    passes = 1;
    optimizeDuplicates: boolean | undefined = true; // false or undefined to disable
    optimizeSimilarPoints: OptimizeSimilarPointsSettings | undefined = new OptimizeSimilarPointsSettings();
    optimizeSimilarPointsSlope: OptimizeSimilarPointsSlopeSettings | undefined = new OptimizeSimilarPointsSlopeSettings();
    additionalOptimizers: OptimizeFunction[] | undefined = undefined;
}

function optimizeKeyframes(keyframes: Keyframe[], optimizeSettings: OptimizeSettings): Keyframe[] {
    const newKeyframes = keyframes.sort((a, b) => a.time - b.time);

    const optimizers: OptimizeFunction[] = [...optimizeSettings.additionalOptimizers ?? []]

    if (optimizeSettings.optimizeDuplicates) optimizers.push(optimizeDuplicates);
    if (optimizeSettings.optimizeSimilarPoints) optimizers.push((a, b, c) => optimizeSimilarPoints(a, b, c, optimizeSettings.optimizeSimilarPoints))
    if (optimizeSettings.optimizeSimilarPoints) optimizers.push((a, b, c) => optimizeSimilarPointsSlope(a, b, c, optimizeSettings.optimizeSimilarPointsSlope))

    const toRemove: (Keyframe | undefined)[] = []

    for (let pass = 0; pass < optimizeSettings.passes; pass++) {
        if (newKeyframes.length === 2) {
            toRemove.push(...optimizers.map((optimizerFn) => optimizerFn(newKeyframes[0], newKeyframes[1], undefined)))
        }

        for (let i = 1; i < newKeyframes.length - 1; i++) {
            const pointA = newKeyframes[i - 1];
            const pointB = newKeyframes[i]
            const pointC = newKeyframes[i + 1];

            toRemove.push(...optimizers.map((optimizerFn) => optimizerFn(pointA, pointB, pointC)))
        }
    }

    // get unique redundant points and none undefined
    const toRemoveUnique: Keyframe[] = [];
    toRemove.forEach((e) => {
        // only add items that are not undefined and not in the array already
        if (e !== undefined && !toRemoveUnique.some(otherP => e !== otherP)) {
            toRemoveUnique.push(e)
        }
    })

    // probably slow but JS is weird for removing items at specific indexes, oh well
    return newKeyframes.filter(p => !toRemoveUnique.some(otherP => p === otherP))
}

/**
 * Optimizes animations, removing unnecessary points.
 * @param {KeyframesAny} animation keyframe or array of keyframes to optimize. 
 * @param {OptimizeSettings} settings settings for the optimizer.
 * @returns {KeyframesAny}
 */
export function optimizeAnimation(animation: KeyframesAny, settings: OptimizeSettings): KeyframesAny {
    const keyframes: Keyframe[] = copy(complexifyArray(animation)).map(x => new Keyframe(x));

    // not enough points to optimize
    if (keyframes.length <= 2) return simplifyArray(keyframes.map(x => x.data) as KeyframesAny);

    return simplifyArray(optimizeKeyframes(keyframes, settings).map(x => x.data) as KeyframesAny);
}
