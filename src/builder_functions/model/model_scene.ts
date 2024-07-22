import {ModelScene} from "../../utils/model/model_scene.ts";
import {GroupObjectTypes} from "../../types/model/model_scene/group.ts";
import {Vec3} from "../../types/math/vector.ts";

/**
 * Handler for representing object properties as part of the environment.
 * @param object Object to spawn on model objects with no track.
 * @param scale The scale multiplier for the spawned object previously mentioned.
 * @param anchor The anchor offset for the spawned object previously mentioned.
 * @param rotation The rotation offset for the spawned object previously mentioned.
 */
export function modelScene(
    object?: GroupObjectTypes,
    scale?: Vec3,
    anchor?: Vec3,
    rotation?: Vec3,
): ModelScene {
    return new ModelScene(object, scale, anchor, rotation);
}