import { bsmap } from '../../../../deps.ts'
import { ExcludedEnvironmentFields } from '../../../../types/beatmap/object/environment.ts'
import {Track} from "../../../../utils/animation/track.ts";
import {Vec3} from "../../../../types/math/vector.ts";
import {JsonWrapper} from "../../../../types/beatmap/json_wrapper.ts";
import {Fields} from "../../../../types/util/class.ts";

/** The base abstract Environment Enhancement class which is inherited by Environment and Geometry. */
export abstract class BaseEnvironmentEnhancement<
    TV2 extends bsmap.v2.IChromaEnvironmentBase,
    TV3 extends bsmap.v3.IChromaEnvironmentBase,
> implements JsonWrapper<TV2, TV3> {
    /** Push this environment/geometry object to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void

    constructor(
        fields:
            & ExcludedEnvironmentFields<BaseEnvironmentEnhancement<TV2, TV3>>
            & {
                components?: TV3['components']
            },
    ) {
        this.duplicate = fields.duplicate
        this.active = fields.active
        this.scale = fields.scale
        this.position = fields.position
        this.rotation = fields.rotation
        this.localPosition = fields.localPosition
        this.localRotation = fields.localRotation
        this.track = fields.track instanceof Track ? fields.track : new Track(fields.track)

        this.components = fields.components
        this.lightID = fields.lightID
        this.lightType = fields.lightType
    }

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
    /** V3 only. Allows you to use heck's component system. See https://github.com/Aeroluna/Heck/wiki/Environment#components. */
    components?: TV3['components']
    /** If defined, will fill out the ILightWithId component using this ID. In V2, this will just use the _lightID property. */
    lightID?: number
    /** V3 only. If defined, will fill out the ILightWithId component using this type. */
    lightType?: number

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<BaseEnvironmentEnhancement<TV2, TV3>>

        // TODO: Import custom properties, exclude fields imported

        if (v3) {
            const obj = json as TV3

            const params = {
                track: new Track(obj.track),
                active: obj.active,
                duplicate: obj.duplicate,
                lightID: obj.components?.ILightWithId?.lightID,
                lightType: obj.components?.ILightWithId?.type,
                localPosition: obj.localPosition,
                localRotation: obj.localRotation,
                position: obj.position,
                rotation: obj.rotation,
                scale: obj.scale,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                track: new Track(obj._track),
                active: obj._active,
                duplicate: obj._duplicate,
                lightID: obj._lightID,
                localPosition: obj._localPosition,
                localRotation: obj._localRotation,
                position: obj._position,
                rotation: obj._rotation,
                scale: obj._scale,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: boolean, prune?: boolean): TV3 | TV2
}
