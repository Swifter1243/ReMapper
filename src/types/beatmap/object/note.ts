import { ColorNote } from '../../../internals/beatmap/object/gameplay_object/color_note.ts'
import { Bomb } from '../../../internals/beatmap/object/gameplay_object/bomb.ts'
import { Arc } from '../../../internals/beatmap/object/gameplay_object/arc.ts'
import { Chain } from '../../../internals/beatmap/object/gameplay_object/chain.ts'
import { bsmap } from '../../../deps.ts'

/** All internal note classes. */
export type AnyNote = ColorNote | Bomb | Arc | Chain

export type IV3Note = bsmap.v3.IColorNote | bsmap.v3.IBombNote

/** Convert AnyNoteLiteral to it's class counterpart. */
export type AnyNoteLiteralMap = {
    'ColorNote': ColorNote
    'Bomb': Bomb
    'Arc': Arc
    'Chain': Chain
}

/** All note types as strings. */
export type AnyNoteLiteral = keyof AnyNoteLiteralMap
