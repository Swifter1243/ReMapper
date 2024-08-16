import { RawGeometryMaterial } from '../../beatmap/object/environment.ts'
import type * as EnvironmentInternals from '../../../internals/beatmap/object/environment/environment.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import {Transform} from "../../math/transform.ts";
import {DeepReadonly} from "../../util/mutability.ts";

/** Objects that are allowed to be spawned with a ModelScene. */
export type GroupObjectTypes =
    | EnvironmentInternals.Environment
    | Geometry

/** A group in a ModelScene.
 * When the model properties is passed, if any model objects have a track that match the name of this group, an animation event will be placed for them.
 */
export type ModelGroup = {
    /** What objects to spawn for each object in this group.
     * If undefined, an existing object with the same track is assumed to exist and will be animated.
     */
    object?: GroupObjectTypes
    /** The transformation applied to objects in this group before positioning it. */
    transform?: DeepReadonly<Transform>
    /** Whether remaining pooled objects in a switch should be moved out of the way.
     * For example, if switch `A` has 40 objects, and switch `B` has 20, should the remaining 20 be moved out of the way?
     */
    disappearWhenAbsent?: boolean
    /** The material that will be applied to objects in this group, if `object` is a geometry object.
     * If undefined, each geometry object will have it's own material. This means each object will be colored from the `color` objects in the input model properties.
     * Though, beware of the fact each geometry object will create it's own draw call, which is bad for performance. If you want colored objects with lots of common colors, making multiple groups is advised.
     */
    defaultMaterial?: RawGeometryMaterial
}
