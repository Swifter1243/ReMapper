import { TrackValue } from '../../../../../types/animation/track.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDestroyPrefab } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { Fields } from '../../../../../types/util/class.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'

import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { CustomEvent } from '../base/custom_event.ts'

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

    /** ID(s) of prefab to destroy. */
    id: Track

    static defaults: Fields<DestroyPrefab> = {
        id: new Track(),
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.destroyPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: IDestroyPrefab): this {
        this.id = new Track(getDataProp(json.d, 'id'))
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'DestroyPrefab is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IDestroyPrefab {
        if (!this.id.value) {
            throw 'id is undefined, which is required for DestroyPrefab!'
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id.value,
                ...this.data,
            },
            t: 'DestroyPrefab',
        } satisfies IDestroyPrefab
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'DestroyPrefab is only supported in V3!'
    }
}
