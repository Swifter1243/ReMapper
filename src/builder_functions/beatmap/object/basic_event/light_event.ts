import { EventGroup } from '../../../../constants/basic_event.ts'
import { LightEvent } from '../../../../internals/beatmap/object/basic_event/light_event.ts'
import { LightParameters } from '../../../../types/beatmap/object/basic_event.ts'
import {AbstractDifficulty} from "../../../../internals/beatmap/abstract_difficulty.ts";

function fixupParams<TG extends LightEvent['type']>(
    group: TG,
    ...params: LightParameters
): ConstructorParameters<typeof LightEvent> {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return [diff, obj]
    }

    const [parentDifficulty, beat, value, floatValue] = params

    return [parentDifficulty, {
        beat: beat,
        unsafeCustomData: {},
        floatValue,
        value,
        type: group,
    }] satisfies ConstructorParameters<typeof LightEvent>
}

/** The bare minimum light event */
export function lightEvent(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        type?: number,
        value?: number,
        floatValue?: number,
    ] | ConstructorParameters<typeof LightEvent>
): LightEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new LightEvent(diff,{
            ...obj,
        })
    }
    const [parentDifficulty, beat, type, value, floatValue] = params

    return new LightEvent(parentDifficulty, {
        beat,
        type,
        value,
        floatValue,
    })
}

/** Controls the back lasers. (Type 0) */
export function backLasers(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.BACK_LASERS, ...params),
    )
}

/** Controls the ring lights. (Type 1) */
export function ringLights(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.RING_LIGHTS, ...params),
    )
}

/** Controls the left lasers. (Type 2) */
export function leftLasers(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.LEFT_LASERS, ...params),
    )
}

/** Controls the right lasers. (Type 3) */
export function rightLasers(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.RIGHT_LASERS, ...params),
    )
}

/** Controls the center lasers. (Type 4) */
export function centerLasers(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.CENTER_LASERS, ...params),
    )
}

/** Controls the extra left lasers in some environments. (Type 6) */
export function extraLeft(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.LEFT_EXTRA, ...params),
    )
}

/** Controls the extra right lasers in some environments. (Type 7) */
export function extraRight(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.RIGHT_EXTRA, ...params),
    )
}

/** Controls the left lasers in the Billie environment. (Type 10) */
export function billieLeft(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.BILLIE_LEFT, ...params),
    )
}

/** Controls the right lasers in the Billie environment. (Type 11) */
export function billieRight(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.BILLIE_RIGHT, ...params),
    )
}

/** Controls the outer left tower height in the Gaga environment. (Type 18) */
export function gagaLeft(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.GAGA_LEFT, ...params),
    )
}

/** Controls the outer left tower height in the Gaga environment. (Type 19) */
export function gagaRight(...params: LightParameters) {
    return new LightEvent(
        ...fixupParams(EventGroup.GAGA_RIGHT, ...params),
    )
}
