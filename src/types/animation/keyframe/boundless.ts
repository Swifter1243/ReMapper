import {
    ComplexKeyframesAbstract,
    PointDefinitionAbstract,
    RawKeyframesAbstract,
} from './abstract.ts'

/** Keyframe or array of keyframes with any number of values. Allows point definitions.
 * `[[..., time]...]` or `[...]`
 */
export type PointDefinitionBoundless = PointDefinitionAbstract<number[]>
/** Array of keyframes with any number of values. `[[... ,time]...]` */
export type ComplexKeyframesBoundless = ComplexKeyframesAbstract<number[]>
/** Single keyframe with any number of values. `[..., time]` */
export type InnerKeyframeBoundless = ComplexKeyframesBoundless[0]
/** Keyframe or array of keyframes with any number of values.
 * `[[..., time]...]` or `[...]`
 */
export type RawKeyframesBoundless = RawKeyframesAbstract<number[]>
