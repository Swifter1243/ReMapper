import {
    CustomEvent,
    CustomEventConstructorTrack,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { TrackValue } from '../../../../../types/animation/track.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDestroyPrefab } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'

export class DestroyPrefab extends CustomEvent<
    never,
    IDestroyPrefab
> {
    constructor(
        params: CustomEventConstructorTrack<
            DestroyPrefab,
            { id?: TrackValue | Track }
        >,
    ) {
        super(params)
        this.type = 'DestroyPrefab'
        this.id = params.id instanceof Track ? params.id : new Track(params.id)
    }

    /** Id(s) of prefab to destroy. */
    id: Track

    push(clone = true) {
        getActiveDifficulty().customEvents.destroyPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IDestroyPrefab, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IDestroyPrefab
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DestroyPrefab>

        if (!v3) throw 'DestroyPrefab is only supported in V3!'

        const obj = json as IDestroyPrefab

        const params = {
            id: new Track(getDataProp(obj.d, 'id')),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IDestroyPrefab
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DestroyPrefab is only supported in V3!'

        if (!this.id) {
            throw 'id is undefined, which is required for DestroyPrefab!'
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id.value ?? '',
                ...this.data,
            },
            t: 'DestroyPrefab',
        } satisfies IDestroyPrefab
        return prune ? objectPrune(output) : output
    }
}
