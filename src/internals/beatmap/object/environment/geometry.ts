import {BaseEnvironmentEnhancement} from './base_environment.ts'
import {ExcludedEnvironmentFields, GeometryMaterial, GeoType} from '../../../../types/beatmap/object/environment.ts'
import { bsmap } from '../../../../deps.ts'
import {copy} from "../../../../utils/object/copy.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {getActiveDifficulty} from "../../../../data/active_difficulty.ts";
import {JsonObjectDefaults} from "../../../../types/beatmap/object/object.ts";

export class Geometry extends BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentGeometry,
    bsmap.v3.IChromaEnvironmentGeometry
> {

    constructor(
        fields: ExcludedEnvironmentFields<Geometry>,
    ) {
        super(fields)
        this.type = fields.type ?? Geometry.defaults.type
        this.material = fields.material ?? copy(Geometry.defaults.material)
        this.collision = fields.collision
    }

    /** The geometry shape type. */
    type: GeoType
    /** The material on this geometry object. */
    material: GeometryMaterial | string
    /** Whether this geometry object has collision. */
    collision?: boolean

    static override defaults: JsonObjectDefaults<Geometry> = {
        type: 'Cube',
        material: {
            shader: 'Standard',
        },
        ...super.defaults,
    }

    override fromJsonV3(json: bsmap.v3.IChromaEnvironmentGeometry): this {
        this.type = (json.geometry.type ?? Geometry.defaults.type) as GeoType
        this.material = json.geometry.material as GeometryMaterial | undefined ?? copy(Geometry.defaults.material)
        this.collision = json.geometry.collision
        return super.fromJsonV3(json);
    }

    override fromJsonV2(json: bsmap.v2.IChromaEnvironmentGeometry): this {
        this.type = (json._geometry._type ?? Geometry.defaults.type) as GeoType
        this.material = json._geometry._material as GeometryMaterial | undefined ?? copy(Geometry.defaults.material)
        this.collision = json._geometry._collision
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IChromaEnvironmentGeometry {
        const output = {
            geometry: {
                material: this.material,
                type: this.type,
                collision: this.collision,
            },
            active: this.active,
            components: {
                ILightWithId: {
                    lightID: this.lightID,
                    type: this.lightType,
                },
                ...this.components,
            },
            duplicate: this.duplicate,
            localPosition: this.localPosition,
            localRotation: this.localRotation,
            position: this.position,
            rotation: this.rotation,
            scale: this.scale,
            track: this.track.value as string,
        } satisfies bsmap.v3.IChromaEnvironmentGeometry
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IChromaEnvironmentGeometry {
        const output = {
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
            _lightID: this.lightID,
            _localPosition: this.localPosition,
            _localRotation: this.localRotation,
            _position: this.position,
            _rotation: this.rotation,
            _scale: this.scale,
            _track: this.track.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentGeometry
        return prune ? objectPrune(output) : output
    }

    push(clone = true): void {
        getActiveDifficulty().geometry.push(clone ? copy(this) : this)
    }
}
