import { StaticModelScene } from '../../utils/model/model_scene/static.ts'
import { AnimatedModelScene } from '../../utils/model/model_scene/animated.ts'
import { StaticModelInput } from '../../types/model/model_scene/input.ts'
import { SceneSwitch } from '../../types/model/model_scene/scene_switch.ts'
import { AnimatedModelInput } from '../../types/model/model_scene/input.ts'

export const modelScene = {
    /**
     * Creates a static environment/geometry scene from model objects
     * @param input A static model.
     */
    static(input: StaticModelInput) {
        return new StaticModelScene(input)
    },
    /**
     * Creates an animated environment/geometry scene from model objects
     * @param input An animated model.
     * @param duration The duration of the animation.
     * @param start When to start the animation. Defaults to beat 0.
     * @param getSwitch Get the SceneSwitch information being used to construct the AnimatedModelScene.
     */
    singleAnimated(input: AnimatedModelInput, start: number, duration: number, getSwitch?: (sceneSwitch: SceneSwitch) => void) {
        const sceneSwitch: SceneSwitch = {
            beat: start,
            animationDuration: duration,
            model: input,
        }
        if (getSwitch) getSwitch(sceneSwitch)
        return new AnimatedModelScene([sceneSwitch])
    },
    /**
     * Creates an animated environment/geometry scene from model objects, switches scenes at different times.
     * @param switches A collection of models at different times.
     */
    multipleAnimated(switches: SceneSwitch[]) {
        return new AnimatedModelScene(switches)
    },
}
