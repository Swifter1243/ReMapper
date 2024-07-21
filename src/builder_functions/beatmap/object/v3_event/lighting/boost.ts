import {BoostEvent} from "../../../internals/v3_event/lighting/boost.ts";

/** Switches the color palette in the lighting_v3. */
export function boost(
    ...params: [
        beat: number,
        boost: boolean,
    ] | ConstructorParameters<typeof BoostEvent>
): BoostEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BoostEvent({
            ...obj,
        })
    }
    const [beat, boost] = params

    return new BoostEvent({
        beat,
        boost,
    })
}
