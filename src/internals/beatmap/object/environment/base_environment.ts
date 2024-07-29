import { bsmap } from '../../../../deps.ts'
import { ExcludedEnvironmentFields } from '../../../../types/beatmap/object/environment.ts'
import { Track } from '../../../../utils/animation/track.ts'
import { Vec3 } from '../../../../types/math/vector.ts'
import { JsonWrapper } from '../../../../types/beatmap/json_wrapper.ts'
import { Fields } from '../../../../types/util/class.ts'

/** The base abstract Environment Enhancement class which is inherited by Environment and Geometry. */
export abstract class BaseEnvironmentEnhancement<
    TV2 extends bsmap.v2.IChromaEnvironmentBase,
    TV3 extends bsmap.v3.IChromaEnvironmentBase,
> implements JsonWrapper<TV2, TV3> {
    protected constructor(
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

    /** The track class for this object.
     * Please read the properties of this class to see how it works.
     */
    track: Track
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
    /** V3 only. Allows you to use heck's component system. See https://github.com/Aeroluna/Heck/wiki/Environment#components. */
    components?: TV3['components']
    /** If defined, will fill out the ILightWithId component using this ID. In V2, this will just use the _lightID property. */
    lightID?: number
    /** V3 only. If defined, will fill out the ILightWithId component using this type. */
    lightType?: number

    /** Default values for initializing class fields */
    static defaults: Fields<
        BaseEnvironmentEnhancement<bsmap.v2.IChromaEnvironmentBase, bsmap.v3.IChromaEnvironmentBase>
    > = {
        track: new Track(),
    }

    fromJsonV3(json: TV3): this {
        this.duplicate = json.duplicate
        this.active = json.active
        this.scale = json.scale
        this.position = json.position
        this.rotation = json.rotation
        this.localPosition = json.localPosition
        this.localRotation = json.localRotation
        this.track = new Track(json.track)
        this.components = json.components
        this.lightID = json.components?.ILightWithId?.lightID
        this.lightType = json.components?.ILightWithId?.type
        return this
    }

    fromJsonV2(json: TV2): this {
        this.duplicate = json._duplicate
        this.active = json._active
        this.scale = json._scale
        this.position = json._position
        this.rotation = json._rotation
        this.localPosition = json._localPosition
        this.localRotation = json._localRotation
        this.track = new Track(json._track)
        return this
    }

    abstract toJsonV2(prune?: boolean): TV2
    abstract toJsonV3(prune?: boolean): TV3

    /** Push this environment/geometry object to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void
}
