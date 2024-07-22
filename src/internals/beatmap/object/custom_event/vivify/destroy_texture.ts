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
import {IDestroyTexture} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";

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

    push(clone = true) {
        getActiveDifficulty().customEvents.destroyTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IDestroyTexture, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IDestroyTexture
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DestroyTexture>

        if (!v3) throw 'DestroyTexture is only supported in V3!'

        const obj = json as IDestroyTexture

        const params = {
            id: new Track(getDataProp(obj.d, 'id')),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IDestroyTexture
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DestroyTexture is only supported in V3!'

        if (!this.id) {
            throw 'id is undefined, which is required for DestroyTexture!'
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id.value ?? '',
                ...this.data,
            },
            t: 'DestroyTexture',
        } satisfies IDestroyTexture
        return prune ? objectPrune(output) : output
    }
}
