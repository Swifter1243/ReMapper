import { NumberTuple } from '../../../types/util.ts'
import { ComplexKeyframesAbstract, RawKeyframesAbstract } from '../../../types/animation.ts'
import { complexifyKeyframes, simplifyKeyframes } from './complexity.ts'

/**
 * Safely iterate through an array of keyframes.
 * @param keyframes Keyframes to iterate.
 * @param fn Function to run on each keyframe.
 */
export function iterateKeyframes<T extends NumberTuple>(
    keyframes: RawKeyframesAbstract<T>,
    fn: (values: ComplexKeyframesAbstract<T>[0], index: number) => void,
) {
    // TODO: Lookup point def
    if (typeof keyframes === 'string') return

    const newKeyframes = complexifyKeyframes<T>(keyframes)
    newKeyframes.forEach((x, i) => fn(x, i))
    const newSimpleKeyframes = simplifyKeyframes(newKeyframes)
    newSimpleKeyframes.forEach((x, i) => (keyframes[i] = x))
    keyframes.length = newSimpleKeyframes.length
}
