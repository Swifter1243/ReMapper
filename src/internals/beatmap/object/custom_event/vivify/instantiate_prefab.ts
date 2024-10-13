import { objectPrune } from '../../../../../utils/object/prune.ts'
import {IInstantiatePrefab} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";
import {Vec3} from "../../../../../types/math/vector.ts";
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class InstantiatePrefab extends CustomEvent<
    never,
    IInstantiatePrefab
> {
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructor<InstantiatePrefab>,
    ) {
        super(difficulty, params)
        this.type = 'InstantiatePrefab'
        this.asset = params.asset ?? InstantiatePrefab.defaults.asset
        this.id = params.id
        this.track = params.track
        this.position = params.position
        this.localPosition = params.localPosition
        this.rotation = params.rotation
        this.localRotation = params.localRotation
        this.scale = params.scale
    }

    /** File path to the desired prefab. */
    asset: string
    /** Unique id for referencing prefab later. Random id will be given by default. */
    id?: string
    /** Track to animate prefab transform. */
    track?: string
    /** Set position. */
    position?: Vec3
    /** Set localPosition. */
    localPosition?: Vec3
    /** Set rotation (in euler angles). */
    rotation?: Vec3
    /** Set localRotation (in euler angles). */
    localRotation?: Vec3
    /** Set scale. */
    scale?: Vec3

    static override defaults: JsonObjectDefaults<InstantiatePrefab> = {
        asset: '',
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.instantiatePrefabEvents as this[]
    }

    override fromJsonV3(json: IInstantiatePrefab): this {
        this.asset = getDataProp(json.d, 'asset') ?? InstantiatePrefab.defaults.asset
        this.id = getDataProp(json.d, 'id')
        this.track = getDataProp(json.d, 'track')
        this.position = getDataProp(json.d, 'position')
        this.localPosition = getDataProp(json.d, 'localPosition')
        this.rotation = getDataProp(json.d, 'rotation')
        this.localRotation = getDataProp(json.d, 'localRotation')
        this.scale = getDataProp(json.d, 'scale')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw 'InstantiatePrefab is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IInstantiatePrefab {
        const output = {
            b: this.beat,
            d: {
                asset: this.asset,
                id: this.id,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track,
                ...this.data,
            },
            t: 'InstantiatePrefab',
        } satisfies IInstantiatePrefab
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'InstantiatePrefab is only supported in V3!'
    }
}
