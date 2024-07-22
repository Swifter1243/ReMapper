import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import {IInstantiatePrefab} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";
import {Vec3} from "../../../../../types/math/vector.ts";

export class InstantiatePrefab extends CustomEvent<
    never,
    IInstantiatePrefab
> {
    constructor(
        params: CustomEventConstructor<InstantiatePrefab>,
    ) {
        super(params)
        this.type = 'InstantiatePrefab'
        this.asset = params.asset ?? ''
        if (params.id) this.id = params.id
        if (params.track) this.track = params.track
        if (params.position) this.position = params.position
        if (params.localPosition) this.localPosition = params.localPosition
        if (params.rotation) this.rotation = params.rotation
        if (params.localRotation) this.localRotation = params.localRotation
        if (params.scale) this.scale = params.scale
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

    push(clone = true) {
        getActiveDifficulty().customEvents.instantiatePrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IInstantiatePrefab, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IInstantiatePrefab
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<InstantiatePrefab>

        if (!v3) throw 'InstantiatePrefab is only supported in V3!'

        const obj = json as IInstantiatePrefab

        const params = {
            asset: getDataProp(obj.d, 'asset'),
            id: getDataProp(obj.d, 'id'),
            localPosition: getDataProp(obj.d, 'localPosition'),
            localRotation: getDataProp(obj.d, 'localRotation'),
            position: getDataProp(obj.d, 'position'),
            rotation: getDataProp(obj.d, 'rotation'),
            scale: getDataProp(obj.d, 'scale'),
            track: getDataProp(obj.d, 'track'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IInstantiatePrefab
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'InstantiatePrefab is only supported in V3!'

        if (!this.asset) {
            throw 'asset is undefined, which is required for InstantiatePrefab!'
        }

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
}
