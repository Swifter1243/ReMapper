// deno-lint-ignore-file
import {RuntimePointDefinitionBoundless} from '../types/animation.ts'
import type {DeepReadonly,} from '../types/mod.ts'

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

