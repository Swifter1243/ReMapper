import { bsmap } from '../../../../deps.ts'
import { EASE, PointDefinitionLinear } from '../../../../types/animation.ts'
import {
    ILightWithId,
    TubeBloomPrePassLight,
} from '../../../../types/environment.ts'
import {
    BaseCustomEvent,
    CustomEventConstructorTrack,
    CustomEventSubclassFields,
    getDataProp,
} from './base.ts'
import {copy} from "../../../../utils/object/copy.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {Track} from "../../../../utils/animation/track.ts";
import {getActiveDifficulty} from "../../../../data/active_difficulty.ts";

export class AnimateComponent
    extends BaseCustomEvent<never, bsmap.v3.ICustomEventAnimateComponent> {
    constructor(
        params: CustomEventConstructorTrack<AnimateComponent>,
    ) {
        super(params)
        this.type = 'AnimateComponent'
        if (params.track) {
            this.track = params.track instanceof Track
                ? params.track
                : new Track(params.track)
        }
        this.duration = params.duration
        this.easing = params.easing

        this.lightID = params.lightID ?? {}
        this.lightMultiplier = params.lightMultiplier ?? {}
    }

    /** The track of this light_event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track = new Track('')

    /** Duration of the animation. */
    duration?: number
    /** The easing on this light_event's animation. */
    easing?: EASE
    /** The "ILightWithId" component to animate. */
    lightID: ILightWithId<PointDefinitionLinear> = {}
    /** The "TubeBloomPrePassLight component to animate." */
    lightMultiplier: TubeBloomPrePassLight<PointDefinitionLinear> = {}

    /** Push this light_event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.abstractCustomEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: bsmap.v3.ICustomEventAnimateComponent, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json: never | bsmap.v3.ICustomEventAnimateComponent,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<AnimateComponent>

        if (v3) {
            const obj = json as bsmap.v3.ICustomEventAnimateComponent

            const params = {
                duration: getDataProp(obj.d, 'duration'),
                easing: getDataProp(obj.d, 'easing'),
                fog: getDataProp(obj.d, 'BloomFogEnvironment'),
                // @ts-ignore 2322
                lightID: getDataProp(obj.d, 'ILightWithID'),
                lightMultiplier: getDataProp(obj.d, 'TubeBloomPrePassLight'),
                track: new Track(getDataProp(obj.d, 'track')),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }

        throw 'V2 not supported for animating components'
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ICustomEventAnimateComponent
    toJson(v3: false, prune?: boolean): never
    toJson(v3 = true, prune = true): bsmap.v3.ICustomEventAnimateComponent {
        if (!v3) {
            throw 'V2 not supported for animating components'
        }

        if (this.track.value === undefined) throw 'Track cannot be null!'

        const output = {
            b: this.beat,
            t: 'AnimateComponent',
            d: {
                duration: this.duration ?? 0,
                track: this.track.value as string,
                easing: this.easing,
                TubeBloomPrePassLight: {
                    colorAlphaMultiplier: this
                        .lightMultiplier as bsmap.FloatPointDefinition[],
                    bloomFogIntensityMultiplier: undefined!,
                },
                // @ts-ignore 2322
                ILightWithId: {
                    lightID: this.lightID?.lightID,
                    type: this.lightID?.type,
                },
                ...this.data,
            },
        } satisfies bsmap.v3.ICustomEventAnimateComponent
        return prune ? objectPrune(output) : output
    }
}
