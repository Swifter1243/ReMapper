import {ModelScene} from "../../utils/model/model_scene.ts";

/**
 * Handler for representing object properties as part of the environment.
 * @param object Object to spawn on model objects with no track.
 * @param scale The scale multiplier for the spawned object previously mentioned.
 * @param anchor The anchor offset for the spawned object previously mentioned.
 * @param rotation The rotation offset for the spawned object previously mentioned.
 */
export function modelScene(
    ...params: ConstructorParameters<typeof ModelScene>
): ModelScene {
    return new ModelScene(...params)
}