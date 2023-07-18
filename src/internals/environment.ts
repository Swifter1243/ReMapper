import { bsmap } from '../deps.ts'
import { Track } from '../animation/track.ts'
import {Vec3} from "../types/data_types.ts";
import {JsonWrapper} from "../types/beatmap_types.ts";

export type AbstractEnvironment = BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentBase,
    bsmap.v3.IChromaEnvironmentBase
>

export abstract class BaseEnvironmentEnhancement<
    TV2 extends bsmap.v2.IChromaEnvironmentBase,
    TV3 extends bsmap.v3.IChromaEnvironmentBase,
> implements JsonWrapper<TV2, TV3> {
    /** Push this environment/geometry object to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void

    /** How many times to duplicate this object. */
    duplicate?: number
    /** Whether this object is enabled. */
    active?: boolean
    /** The scale of this object. */
    scale?: Vec3
    /** The worldspace position of this object. */
    position?: Vec3
    /** The position of this object relative to it's parent. */
    localPosition?: Vec3
    /** The worldspace rotation of this object. */
    rotation?: Vec3
    /** The rotation of this object relative to it's parent. */
    localRotation?: Vec3
    /** The track class for this object.
     * Please read the properties of this class to see how it works.
     */
    track: Track = new Track()

    components?: TV3['components']

    /** Group used with "animateEnvGroup". Not saved to the difficulty. */
    group?: unknown

    lightsID?: number
    lightsType?: number

    abstract toJson(v3: true): TV3
    abstract toJson(v3: false): TV2
    abstract toJson(v3: boolean): TV3 | TV2
}
