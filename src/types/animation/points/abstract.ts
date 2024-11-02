import { PointFlag, TimeValue } from './components.ts'

/** Helper type for single points. `[...]` */
export type InnerPointAbstract<T extends unknown[]> =
    | [...T]
    | [...T, PointFlag]
    | [...T, PointFlag, PointFlag]
    | [...T, PointFlag, PointFlag, PointFlag]

/** Helper type for complex points. `[[...], [...], [...]]` */
export type ComplexPointsAbstract<T extends number[]> = InnerPointAbstract<
    [...T, TimeValue]
>[]

/** Helper type for raw points. `[...] | [[...], [...], [...]]` */
export type RawPointsAbstract<T extends number[]> =
    | ComplexPointsAbstract<T>
    | T

/** Helper type for points arrays. */
export type DifficultyPointsAbstract<T extends number[]> =
    | RawPointsAbstract<T>
    | string
