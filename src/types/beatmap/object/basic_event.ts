import { LightEvent } from '../../../internals/beatmap/object/basic_event/light_event.ts'
import { AbstractDifficulty } from '../../../internals/beatmap/abstract_difficulty.ts'

export type LightParameters =
    | [
        parentDifficulty: AbstractDifficulty,
        beat?: LightEvent['beat'],
        value?: LightEvent['value'],
        floatValue?: LightEvent['floatValue'],
    ]
    | [
        parentDifficulty: AbstractDifficulty,
        data: Omit<
            ConstructorParameters<typeof LightEvent>[1],
            'type'
        >,
    ]
export type LightColorLiteral = 'Red' | 'Blue' | 'White'
