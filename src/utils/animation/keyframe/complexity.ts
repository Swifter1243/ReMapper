// deno-lint-ignore-file
import {
    DeepReadonly,
    InnerKeyframeBoundless,
    NumberTuple,
    RawKeyframesAbstract,
    RuntimePointDefinitionBoundless
} from "../../../types/mod.ts";
import {getKeyframeTimeIndex} from "./get.ts";
import {ComplexKeyframesAbstract} from "../../../types/animation/keyframe/abstract.ts";

/**
 * Checks if value is an array of keyframes.
 * @param array The keyframe or array of keyframes.
 */
export function areKeyframesSimple(
    array: DeepReadonly<RuntimePointDefinitionBoundless>,
) {
    if (array.length === 0) return false // empty complex array
    return typeof array[0] !== 'object'
}

/**
 * Ensures that this value is in the format of an array of keyframes.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The keyframe or array of keyframes.
 */
export function complexifyKeyframes<T extends NumberTuple>(
    array: DeepReadonly<RawKeyframesAbstract<T>> | RawKeyframesAbstract<T>,
): ComplexKeyframesAbstract<T> {
    if (!areKeyframesSimple(array as RawKeyframesAbstract<T>)) {
        return array as ComplexKeyframesAbstract<T>
    }
    return [[...array, 0]] as ComplexKeyframesAbstract<T>
}

/**
 * If possible, isolate an array of keyframes with one keyframe.
 * For example if you input [[x,y,z,0]], it would be converted to [x,y,z].
 * @param array The array of keyframes.
 */
export function simplifyKeyframes<T extends NumberTuple>(
    array: RawKeyframesAbstract<T>,
): RawKeyframesAbstract<T> {
    if (array.length <= 1 && !areKeyframesSimple(array)) {
        const keyframe = array[0] as InnerKeyframeBoundless
        const keyframeTimeIndex = getKeyframeTimeIndex(keyframe)
        const keyframeTime = keyframe[keyframeTimeIndex]
        if (keyframeTime === 0) {
            return keyframe.slice(0, keyframeTimeIndex) as RawKeyframesAbstract<T>
        }
    }
    return array
}