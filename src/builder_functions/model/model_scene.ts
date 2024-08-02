import { GroupObjectTypes } from '../../types/model/model_scene/group.ts'
import { Vec3 } from '../../types/math/vector.ts'
import { StaticModelScene } from '../../utils/model/model_scene/static.ts'
import {AnimatedModelScene} from "../../utils/model/model_scene/animated.ts";

/**
 * Creates a static environment/geometry scene from model objects
 * @param object Object to spawn on model objects with no track.
 * @param scale The scale multiplier for the spawned object previously mentioned.
 * @param anchor The anchor offset for the spawned object previously mentioned.
 * @param rotation The rotation offset for the spawned object previously mentioned.
 */
export function staticModelScene(
    object?: GroupObjectTypes,
    scale?: Vec3,
    anchor?: Vec3,
    rotation?: Vec3,
) {
    return new StaticModelScene(object, scale, anchor, rotation)
}

/**
 * Creates an animated environment/geometry scene from model objects
 * @param object Object to spawn on model objects with no track.
 * @param scale The scale multiplier for the spawned object previously mentioned.
 * @param anchor The anchor offset for the spawned object previously mentioned.
 * @param rotation The rotation offset for the spawned object previously mentioned.
 */
export function animatedModelScene(
    object?: GroupObjectTypes,
    scale?: Vec3,
    anchor?: Vec3,
    rotation?: Vec3,
) {
    return new AnimatedModelScene(object, scale, anchor, rotation)
}