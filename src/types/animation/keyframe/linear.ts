import {
    ComplexKeyframesAbstract,
    PointDefinitionAbstract,
    RawKeyframesAbstract,
} from './abstract.ts'

/** Keyframe or array of keyframes with 1 value. Allows point definitions.
 * `[[x, time]...]` or `[x]` or `string`.
 */
export type PointDefinitionLinear = PointDefinitionAbstract<[number]>
/** Array of keyframes with 1 value. `[[x, time]...]` */
export type ComplexKeyframesLinear = ComplexKeyframesAbstract<[number]>
/** Single keyframe with 1 value. `[x, time]` */
export type InnerKeyframeLinear = ComplexKeyframesLinear[0]
/** Keyframe or array of keyframes with 1 value.
 * `[[x,time]...]` or `[x]`
 */
export type RawKeyframesLinear = RawKeyframesAbstract<[number]>
