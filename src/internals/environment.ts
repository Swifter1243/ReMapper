import { bsmap } from '../deps.ts'
import {
    Fields,
    GeometryMaterial,
    GeoType,
    JsonWrapper,
    Lookup,
    Replace,
    TrackValue,
    Vec3,
} from '../types/mod.ts'

import { Track } from '../animation/track.ts'

import { activeDiffGet } from '../data/beatmap_handler.ts'
import { copy } from '../utils/general.ts'

export type AbstractEnvironment = BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentBase,
    bsmap.v3.IChromaEnvironmentBase
>

export type EnvironmentReplacements = {
    track?: TrackValue | Track
}

export type ExcludedEnvironmentFields<
    Class,
    Replacement = EnvironmentReplacements,
> = Replace<Partial<Fields<Class>>, Replacement>

export abstract class BaseEnvironmentEnhancement<
    TV2 extends bsmap.v2.IChromaEnvironmentBase,
    TV3 extends bsmap.v3.IChromaEnvironmentBase,
> implements JsonWrapper<TV2, TV3> {
    /** Push this environment/geometry object to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void

    /**
     * Note object for ease of creation.
     * @param time Time this note will be hit.
     * @param type The color of the note.
     * @param direction The direction the note will be cut.
     * @param x The lane of the note.
     * @param y The vertical row of the note.
     */
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
        this.localPosition = fields.localPosition
        this.localRotation = fields.localRotation
        this.track = fields.track instanceof Track
            ? fields.track
            : new Track(fields.track)

        this.components = fields.components
        this.group = fields.group
        this.lightsID = fields.lightsID
        this.lightsType = fields.lightsType
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

    components?: TV3['components']

    /** Group used with "animateEnvGroup". Not saved to the difficulty. */
    group?: unknown

    lightsID?: number
    lightsType?: number

    abstract toJson(v3: true): TV3
    abstract toJson(v3: false): TV2
    abstract toJson(v3: boolean): TV3 | TV2
}

export class Environment extends BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentID,
    bsmap.v3.IChromaEnvironmentID
> {
    push(clone = true): void {
        activeDiffGet().environment.push(clone ? copy(this) : this)
    }

    /**
     * Environment object for ease of creation and additional tools.
     * @param id The object name to look up in the environment.
     * @param lookupMethod The method of looking up the object name in the environment.
     */
    constructor(
        fields: ExcludedEnvironmentFields<Environment>,
    ) {
        super(fields)
        this.id = fields.id ?? ''
        this.lookupMethod = fields.lookupMethod ?? 'Contains'
    }

    /** The object name to look up in the environment. */
    id: string
    /** The method of looking up the object name in the environment. */
    lookupMethod: Lookup

    toJson(v3: true): bsmap.v3.IChromaEnvironmentID
    toJson(v3: false): bsmap.v2.IChromaEnvironmentID
    toJson(
        v3: boolean,
    ): bsmap.v2.IChromaEnvironmentID | bsmap.v3.IChromaEnvironmentID {
        if (v3) {
            return {
                id: this.id,
                lookupMethod: this.lookupMethod,
                active: this.active,
                components: {
                    ILightWithId: {
                        lightID: this.lightsID,
                        type: this.lightsType,
                    },
                    ...this.components,
                },
                duplicate: this.duplicate,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track?.value as string,
            } satisfies bsmap.v3.IChromaEnvironmentID
        }

        if (this.components) throw 'Components are not supported in v2'

        return {
            _id: this.id,
            _lookupMethod: this.lookupMethod,
            _active: this.active,
            _duplicate: this.duplicate,
            _lightID: this.lightsID,
            _localPosition: this.localPosition,
            _localRotation: this.localRotation,
            _position: this.position,
            _rotation: this.rotation,
            _scale: this.scale,
            _track: this.track?.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentID
    }
}

export class Geometry extends BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentGeometry,
    bsmap.v3.IChromaEnvironmentGeometry
> {
    push(clone = true): void {
        activeDiffGet().geometry.push(clone ? copy(this) : this)
    }

    /**
     * Geometry object for ease of creation and additional tools.
     * @param type The geometry shape type.
     * @param material The material on this geometry object.
     */
    constructor(
        fields: ExcludedEnvironmentFields<Geometry>,
    ) {
        super(fields)

        this.type = fields.type ?? 'Cube'
        this.material = fields.material ?? {
            shader: 'Standard',
        }
        this.collision = fields.collision
    }

    /** The geometry shape type. */
    type: GeoType
    /** The material on this geometry object. */
    material: GeometryMaterial | string
    /** Whether this geometry object has collision. */
    collision?: boolean

    toJson(v3: true): bsmap.v3.IChromaEnvironmentGeometry
    toJson(v3: false): bsmap.v2.IChromaEnvironmentGeometry
    toJson(
        v3: boolean,
    ):
        | bsmap.v2.IChromaEnvironmentGeometry
        | bsmap.v3.IChromaEnvironmentGeometry {
        if (v3) {
            return {
                geometry: {
                    material: this.material,
                    type: this.type,
                    collision: this.collision,
                },
                active: this.active,
                components: {
                    ILightWithId: {
                        lightID: this.lightsID,
                        type: this.lightsType,
                    },
                    ...this.components,
                },
                duplicate: this.duplicate,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track?.value as string,
            } satisfies bsmap.v3.IChromaEnvironmentGeometry
        }

        return {
            _geometry: {
                _material: typeof this.material === 'string' ? this.material : {
                    _shader: this.material?.shader,
                    _color: this.material?.color,
                    _shaderKeywords: this.material?.shaderKeywords,
                },
                _type: this.type,
                _collision: this.collision,
            },
            _active: this.active,
            _duplicate: this.duplicate,
            _lightID: this.lightsID,
            _localPosition: this.localPosition,
            _localRotation: this.localRotation,
            _position: this.position,
            _rotation: this.rotation,
            _scale: this.scale,
            _track: this.track?.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentGeometry
    }
}
