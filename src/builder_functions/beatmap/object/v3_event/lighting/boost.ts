import { BoostEvent } from '../../../../../internals/beatmap/object/v3_event/lighting/boost.ts'
import { AbstractDifficulty } from '../../../../../internals/beatmap/abstract_difficulty.ts'

/** Switches the color palette in the lighting. */
export function boost(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        boost: boolean,
    ] | ConstructorParameters<typeof BoostEvent>
): BoostEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new BoostEvent(diff, obj)
    }
    const [parentDifficulty, beat, boost] = params

    return new BoostEvent(parentDifficulty, {
        beat,
        boost,
    })
}
