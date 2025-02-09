import { ColorVec } from './math/vector.ts'

/** Types associated to each color format. */
export type ColorTypes = {
    'RGB': ColorVec
    'HSV': ColorVec
    'HEX': string
}
/** Color formats. */
export type ColorFormat = keyof ColorTypes

/** All supported color types. */
export type Color = ColorTypes[ColorFormat]
