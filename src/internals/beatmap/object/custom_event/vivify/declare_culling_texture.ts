import { Track } from '../../../../../utils/animation/track.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDeclareCullingTexture } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructorTrack} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {DefaultFields} from "../../../../../types/beatmap/object/object.ts";

export class DeclareCullingTexture extends CustomEvent<
    never,
    IDeclareCullingTexture
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructorTrack<DeclareCullingTexture>,
    ) {
        super(params)
        this.type = 'DeclareCullingTexture'
        this.id = params.id ?? DeclareCullingTexture.defaults.id
        this.track = params.track instanceof Track ? params.track : new Track(params.track)
        this.whitelist = params.whitelist
        this.depthTexture = params.depthTexture
    }

    /** Name of the culling mask, this is what you must name your sampler in your shader. */
    id: string
    /** Name(s) of your track(s). Everything on the track(s) will be added to this mask. */
    track: Track
    /** When true, will cull everything but the selected tracks. Default = false. */
    whitelist?: boolean
    /** When true, write depth texture to "'name'_Depth". Default = false. */
    depthTexture?: boolean

    static defaults: DefaultFields<DeclareCullingTexture> = {
        id: '',
        track: new Track(),
        ...super.defaults
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.declareCullingTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: IDeclareCullingTexture): this {
        this.id = getDataProp(json.d, 'id') ?? DeclareCullingTexture.defaults.id
        this.track = new Track(getDataProp(json.d, 'track'))
        this.whitelist = getDataProp(json.d, 'whitelist')
        this.depthTexture = getDataProp(json.d, 'depthTexture')
        return super.fromJsonV3(json);
    }

    fromJsonV2(_json: never): this {
        throw 'DeclareCullingTexture is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IDeclareCullingTexture {
        if (!this.track.value) {
            throw 'track is undefined, which is required for DeclareCullingTexture!'
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id,
                track: this.track.value,
                depthTexture: this.depthTexture,
                whitelist: this.whitelist,
                ...this.data,
            },
            t: 'DeclareCullingTexture',
        } satisfies IDeclareCullingTexture
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'DeclareCullingTexture is only supported in V3!'
    }
}
