import { TrackValue } from '../../../../../types/animation/track.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDestroyPrefab } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'

import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { CustomEvent } from '../base/custom_event.ts'
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class DestroyPrefab extends CustomEvent<
    never,
    IDestroyPrefab
> {
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<
            DestroyPrefab,
            { id?: TrackValue | Track }
        >,
    ) {
        super(difficulty, params)
        this.type = 'DestroyPrefab'
        this.id = params.id instanceof Track ? params.id : new Track(params.id)
    }

    /** ID(s) of prefab to destroy. */
    id: Track

    static override defaults: JsonObjectDefaults<DestroyPrefab> = {
        id: new Track(),
        ...super.defaults,
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.destroyPrefabEvents as this[]
    }

    override fromJsonV3(json: IDestroyPrefab): this {
        this.id = new Track(getDataProp(json.d, 'id'))
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw new Error('DestroyPrefab is only supported in V3!')
    }

    toJsonV3(prune?: boolean): IDestroyPrefab {
        if (!this.id.value) {
            throw new Error('id is undefined, which is required for DestroyPrefab!')
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id.value,
                ...this.unsafeData,
            },
            t: 'DestroyPrefab',
        } satisfies IDestroyPrefab
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('DestroyPrefab is only supported in V3!')
    }
}
