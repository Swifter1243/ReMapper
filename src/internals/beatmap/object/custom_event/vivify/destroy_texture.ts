import { TrackValue } from '../../../../../types/animation/track.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import {IDestroyTexture} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";
import {CustomEventConstructorTrack} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";

export class DestroyTexture extends CustomEvent<
    never,
    IDestroyTexture
> {
    constructor(
        params: CustomEventConstructorTrack<
            DestroyTexture,
            { id?: TrackValue | Track }
        >,
    ) {
        super(params)
        this.type = 'DestroyTexture'
        this.id = params.id instanceof Track ? params.id : new Track(params.id)
    }

    /** Names(s) of textures to destroy. */
    id: Track

    static override defaults: JsonObjectDefaults<DestroyTexture> = {
        id: new Track(),
        ...super.defaults
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.destroyTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    override fromJsonV3(json: IDestroyTexture): this {
        this.id = new Track(getDataProp(json.d, 'id'))
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw 'DestroyTexture is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IDestroyTexture {
        if (!this.id.value) {
            throw 'id is undefined, which is required for DestroyTexture!'
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id.value,
                ...this.data,
            },
            t: 'DestroyTexture',
        } satisfies IDestroyTexture
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'DestroyTexture is only supported in V3!'
    }
}
