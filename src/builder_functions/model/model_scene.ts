import { StaticModelScene } from '../../utils/model/model_scene/static.ts'
import {AnimatedModelScene} from "../../utils/model/model_scene/animated.ts";
import { StaticObjectInput } from '../../types/model/model_scene/input.ts'
import { SceneSwitch } from '../../types/model/model_scene/scene_switch.ts'
import { AnimatedObjectInput } from '../../types/model/model_scene/input.ts'

export const modelScene = {
    /**
     * Creates a static environment/geometry scene from model objects
     * @param input A static model.
     */
    static: (input: StaticObjectInput) => new StaticModelScene(input),
    /**
     * Creates an animated environment/geometry scene from model objects
     * @param input An animated model.
     * @param duration The duration of the animation.
     * @param start When to start the animation. Defaults to beat 0.
     */
    singleAnimated: (input: AnimatedObjectInput, duration: number, start = 0) => {
        return new AnimatedModelScene([{
            beat: start,
            animationDuration: duration,
            model: input
        }])
    },
    /**
     * Creates an animated environment/geometry scene from model objects, switches scenes at different times.
     * @param switches A collection of models at different times.
     */
    multipleAnimated: (switches: SceneSwitch[]) => new AnimatedModelScene(switches)
}