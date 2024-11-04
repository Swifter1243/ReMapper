import { Track } from '../../../../../utils/animation/track.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDeclareCullingTexture } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructorTrack} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import type { AbstractDifficulty } from '../../../abstract_beatmap.ts'

export class DeclareCullingTexture extends CustomEvent<
    never,
    IDeclareCullingTexture
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<DeclareCullingTexture>,
    ) {
        super(difficulty, params)
        this.type = 'DeclareCullingTexture'
        this.id = params.id ?? DeclareCullingTexture.defaults.id
        this.track = new Track(params.track)
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

    static override defaults: JsonObjectDefaults<DeclareCullingTexture> = {
        id: '',
        track: new Track(),
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.declareCullingTextureEvents as this[]
    }

    override fromJsonV3(json: IDeclareCullingTexture): this {
        this.id = getDataProp(json.d, 'id') ?? DeclareCullingTexture.defaults.id
        this.track = new Track(getDataProp(json.d, 'track'))
        this.whitelist = getDataProp(json.d, 'whitelist')
        this.depthTexture = getDataProp(json.d, 'depthTexture')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw new Error('DeclareCullingTexture is only supported in V3!')
    }

    toJsonV3(prune?: boolean): IDeclareCullingTexture {
        if (!this.track.value) {
            throw new Error('track is undefined, which is required for DeclareCullingTexture!')
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id,
                track: this.track.value,
                depthTexture: this.depthTexture,
                whitelist: this.whitelist,
                ...this.unsafeData,
            },
            t: 'DeclareCullingTexture',
        } satisfies IDeclareCullingTexture
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('DeclareCullingTexture is only supported in V3!')
    }
}
