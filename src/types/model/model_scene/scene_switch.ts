import {AnimatedModelInput} from './input.ts'

/** A scene switch used in a ModelScene */
export type SceneSwitch = {
    /** Input for the model properties. */
    model: AnimatedModelInput
    /** When the switch happens. */
    beat: number
    /** How long the animation in the input objects happen. */
    animationDuration?: number
    /** The offset added to `beat` which defines when the animation in the input objects happen. */
    animationOffset?: number
    /** Whether to loop the animation, and how many times to loop. */
    loop?: number
}
