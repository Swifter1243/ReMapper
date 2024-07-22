import {BaseEnvironmentEnhancement} from './base_environment.ts'
import {ExcludedEnvironmentFields, GeometryMaterial, GeoType} from '../../../../types/beatmap/object/environment.ts'
import { bsmap } from '../../../../deps.ts'
import {copy} from "../../../../utils/object/copy.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {getActiveDifficulty} from "../../../../data/active_difficulty.ts";
import {SubclassExclusiveProps} from "../../../../types/util/class.ts";

export class Geometry extends BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentGeometry,
    bsmap.v3.IChromaEnvironmentGeometry
> {
    push(clone = true): void {
        getActiveDifficulty().geometry.push(clone ? copy(this) : this)
    }

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

    fromJson(json: bsmap.v3.IChromaEnvironmentGeometry, v3: true): this
    fromJson(json: bsmap.v2.IChromaEnvironmentGeometry, v3: false): this
    fromJson(
        json:
            | bsmap.v2.IChromaEnvironmentGeometry
            | bsmap.v3.IChromaEnvironmentGeometry,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            Geometry,
            BaseEnvironmentEnhancement<
                bsmap.v2.IChromaEnvironmentID,
                bsmap.v3.IChromaEnvironmentID
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IChromaEnvironmentGeometry

            const params = {
                collision: obj.geometry.collision,
                material: obj.geometry.material,
                type: obj.geometry.type,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.IChromaEnvironmentGeometry

            const params = {
                collision: obj._geometry._collision,
                material: obj._geometry._material,
                type: obj._geometry._type,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IChromaEnvironmentGeometry
    toJson(v3: false, prune?: boolean): bsmap.v2.IChromaEnvironmentGeometry
    toJson(
        v3: boolean,
        prune = true,
    ):
        | bsmap.v2.IChromaEnvironmentGeometry
        | bsmap.v3.IChromaEnvironmentGeometry {
        if (v3) {
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
                track: this.track?.value as string,
            } satisfies bsmap.v3.IChromaEnvironmentGeometry
            return prune ? objectPrune(output) : output
        }

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
            _track: this.track?.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentGeometry
        return prune ? objectPrune(output) : output
    }
}
