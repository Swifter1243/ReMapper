import { KeyframeFlag, TimeValue } from './keyframe.ts'

/** Helper type for single keyframes. `[...]` */
export type InnerKeyframeAbstract<T extends unknown[]> =
    | [...T]
    | [...T, KeyframeFlag]
    | [...T, KeyframeFlag, KeyframeFlag]
    | [...T, KeyframeFlag, KeyframeFlag, KeyframeFlag]

/** Helper type for complex keyframes. `[[...], [...], [...]]` */
export type ComplexKeyframesAbstract<T extends number[]> = InnerKeyframeAbstract<
    [...T, TimeValue]
>[]

/** Helper type for raw keyframes. `[...] | [[...], [...], [...]]` */
export type RawKeyframesAbstract<T extends number[]> =
    | ComplexKeyframesAbstract<T>
    | T

/** Helper type for keyframe arrays. */
export type PointDefinitionAbstract<T extends number[]> =
    | RawKeyframesAbstract<T>
    | string
