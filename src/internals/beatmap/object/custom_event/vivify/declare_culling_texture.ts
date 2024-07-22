import {
    CustomEvent,
    CustomEventConstructorTrack,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDeclareCullingTexture } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'

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
        this.id = params.id ?? ''
        this.track = params.track instanceof Track ? params.track : new Track(params.track)
        if (params.whitelist) this.whitelist = params.whitelist
        if (params.depthTexture) this.depthTexture = params.depthTexture
    }

    /** Name of the culling mask, this is what you must name your sampler in your shader. */
    id: string
    /** Name(s) of your track(s). Everything on the track(s) will be added to this mask. */
    track: Track
    /** When true, will cull everything but the selected tracks. Default = false. */
    whitelist?: boolean
    /** When true, write depth texture to "'name'_Depth". Default = false. */
    depthTexture?: boolean

    push(clone = true) {
        getActiveDifficulty().customEvents.declareCullingTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IDeclareCullingTexture, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IDeclareCullingTexture
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DeclareCullingTexture>

        if (!v3) throw 'DeclareCullingTexture is only supported in V3!'

        const obj = json as IDeclareCullingTexture

        const params = {
            depthTexture: getDataProp(obj.d, 'depthTexture'),
            id: getDataProp(obj.d, 'id'),
            track: new Track(getDataProp(obj.d, 'track')),
            whitelist: getDataProp(obj.d, 'whitelist'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IDeclareCullingTexture
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DeclareCullingTexture is only supported in V3!'

        if (!this.id) {
            throw 'id is undefined, which is required for DeclareCullingTexture!'
        }
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
}
