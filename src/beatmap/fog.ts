// deno-lint-ignore-file no-extra-semi
import * as CustomEventInternals from '../internals/custom_event.ts'
import { animateComponent } from './custom_event.ts'
import {
    ComplexKeyframesLinear,
    PointDefinitionLinear,
} from '../types/animation_types.ts'

import { getBaseEnvironment, setBaseEnvironmentTrack } from './beatmap.ts'
import { BloomFogEnvironment } from '../types/environment_types.ts'

// TODO: Maybe make this a difficulty based thing?
let fogInitialized = false
type AnyFog = BloomFogEnvironment<number | ComplexKeyframesLinear>

/**
 * Edits the base Environment object's fog component.
 * Or spawns an event to animate the fog.
 * @param fog The fog component.
 * @param time The time of the event.
 * @param duration The duration of the animation.
 * @param event The animation event.
 */
export function adjustFog(
    fog: AnyFog,
    time?: number,
    duration?: number,
    event?: (event: CustomEventInternals.AnimateComponent) => void,
) {
    let isStatic = !(
        time !== undefined ||
        duration !== undefined ||
        event ||
        fogInitialized
    )

    Object.entries(fog).forEach((x) => {
        if (typeof x[1] !== 'number') isStatic = false
    })

    if (isStatic) {
        getBaseEnvironment((env) => {
            env.components ??= {}
            env.components.BloomFogEnvironment = fog as BloomFogEnvironment<
                number
            >
        })
        fogInitialized = true
    } else {
        setBaseEnvironmentTrack('fog')

        const fogEvent = animateComponent(time ?? 0, 'fog', duration)

        Object.entries(fog).forEach((x) => {
            // TODO: what?
            if (typeof x[1] === 'number') {
                ;(fog as any)[x[0]] = [x[1]]
            }
        })

        fogEvent.fog = fog as BloomFogEnvironment<PointDefinitionLinear>
        if (event) event(fogEvent)
        fogEvent.push()
    }
}
