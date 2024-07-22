import { AnimatedObjectInput } from './input.ts'
import type * as CustomEventInternals from '../../../internals/beatmap/object/custom_event/mod.ts'

/** A scene switch used in a ModelScene */
export type SceneSwitch = {
    /** Input for the model properties. */
    model: AnimatedObjectInput
    /** When the switch happens. */
    beat: number
    /** How long the animation in the input objects happen. */
    animationDuration?: number
    /** The offset added to `beat` which defines when the animation in the input objects happen. */
    animationOffset?: number
    /** Runs on each light_event that moves objects in this switch. */
    forEvent?: (event: CustomEventInternals.AnimateTrack, objects: number) => void
}
