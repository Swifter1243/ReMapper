import { AnimatedOptions, StaticOptions } from './option.ts'
import { FILEPATH } from '../../beatmap/file.ts'
import { ReadonlyModel } from '../object.ts'

/** Allowed options for providing properties to a ModelScene. */
export type ObjectInput = FILEPATH | ReadonlyModel

/** Allowed inputs for the "static" method in ModelScene. */
export type StaticObjectInput = ObjectInput | StaticOptions

/** Allowed inputs for the "animate" method in ModelScene. */
export type AnimatedObjectInput = ObjectInput | AnimatedOptions
