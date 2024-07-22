import { ColorNote } from '../../../internals/beatmap/object/gameplay_object/color_note.ts'
import { Bomb } from '../../../internals/beatmap/object/gameplay_object/bomb.ts'
import { Arc } from '../../../internals/beatmap/object/gameplay_object/arc.ts'
import { Chain } from '../../../internals/beatmap/object/gameplay_object/chain.ts'

/** All internal note classes. */
export type AnyNote = ColorNote | Bomb | Arc | Chain

/** Convert AnyNoteLiteral to it's class counterpart. */
export type AnyNoteLiteralMap = {
    'ColorNote': ColorNote
    'Bomb': Bomb
    'Arc': Arc
    'Chain': Chain
}

/** All note types as strings. */
export type AnyNoteLiteral = keyof AnyNoteLiteralMap
