import {AnimatedObjectInput} from './input.ts'
import {AnimateTrack} from "../../../internals/beatmap/object/custom_event/heck/animate_track.ts";

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
    /** Runs on each event that moves objects in this switch. */
    forEvent?: (event: AnimateTrack, objects: number) => void
}
