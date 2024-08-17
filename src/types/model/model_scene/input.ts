import { AnimatedOptions, StaticOptions } from './option.ts'
import { FILEPATH } from '../../beatmap/file.ts'
import { ReadonlyModel } from '../object.ts'

/** Allowed options for providing properties to a ModelScene. */
export type ModelInput = FILEPATH | ReadonlyModel

/** Allowed inputs for the "static" method in ModelScene. */
export type StaticModelInput = ModelInput | StaticOptions

/** Allowed inputs for the "animate" method in ModelScene. */
export type AnimatedModelInput = ModelInput | AnimatedOptions
