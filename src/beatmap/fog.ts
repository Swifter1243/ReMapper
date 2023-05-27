// deno-lint-ignore-file no-extra-semi
import * as CustomEventInternals from '../internals/customEvent.ts'
import { animateComponent } from './custom_event.ts'
import { ComplexKeyframesLinear, KeyframesLinear } from '../data/types.ts'

import { baseEnvironmentTrack, getBaseEnvironment } from './beatmap.ts'
import { BloomFogEnvironment } from '../data/environment_types.ts'

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
    fog: (bfe: AnyFog) => void,
    time?: number,
    duration?: number,
    event?: (event: CustomEventInternals.AnimateComponent) => void,
) {
    let isStatic = true

    if (
        time !== undefined || duration !== undefined || event ||
        fogInitialized
    ) {
        isStatic = false
    }

    const anyFog: AnyFog = {}
    fog(anyFog)

    Object.entries(anyFog).forEach((x) => {
        if (typeof x[1] !== 'number') isStatic = false
    })

    if (isStatic) {
        const env = getBaseEnvironment()
        env.components ??= {}
        env.components.BloomFogEnvironment = anyFog as BloomFogEnvironment<
            number
        >
        env.push()
        fogInitialized = true
    } else {
        baseEnvironmentTrack('fog')

        const fogEvent = animateComponent(time ?? 0, 'fog', duration)

        Object.entries(anyFog).forEach((x) => {
            // TODO: what?
            if (typeof x[1] === 'number') {
                ;(anyFog as any)[x[0]] = [x[1]]
            }
        })

        fogEvent.fog = anyFog as BloomFogEnvironment<KeyframesLinear>
        if (event) event(fogEvent)
        fogEvent.push()
    }
}
