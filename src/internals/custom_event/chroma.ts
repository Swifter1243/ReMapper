import { Track } from '../../animation/track.ts'
import { getActiveDifficulty } from '../../data/beatmap_handler.ts'
import { bsmap } from '../../deps.ts'
import { EASE, PointDefinitionLinear } from '../../types/animation_types.ts'
import {
    ILightWithId,
    TubeBloomPrePassLight,
} from '../../types/environment_types.ts'
import { copy } from '../../utils/general.ts'
import { jsonPrune } from '../../utils/json.ts'
import {
    BaseCustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from './base.ts'

export class AnimateComponent
    extends BaseCustomEvent<never, bsmap.v3.ICustomEventAnimateComponent> {
    /**
     * Animate components on a track.
     * @param json Json to import.
     * @param track Track(s) to effect.
     * @param duration Duration of the animation.
     * @param easing The easing on the animation.
     */
    constructor(
        params: CustomEventConstructor<AnimateComponent>,
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

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    track = new Track('')

    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE
    /** The "ILightWithId" component to animate. */
    lightID: ILightWithId<PointDefinitionLinear> = {}
    /** The "TubeBloomPrePassLight component to animate." */
    lightMultiplier: TubeBloomPrePassLight<PointDefinitionLinear> = {}

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().animateComponents.push(clone ? copy(this) : this)
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
        return prune ? jsonPrune(output) : output
    }
}

export class AbstractCustomEvent extends BaseCustomEvent<
    bsmap.v2.ICustomEvent,
    bsmap.v3.ICustomEvent
> {
    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().abstractCustomEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: bsmap.v3.ICustomEvent, v3: true): this
    fromJson(json: bsmap.v2.ICustomEvent, v3: false): this
    fromJson(
        json: bsmap.v2.ICustomEvent | bsmap.v3.ICustomEvent,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<AbstractCustomEvent>

        if (v3) {
            const obj = json as bsmap.v3.ICustomEvent

            const params = {
                type: obj.t,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as bsmap.v2.ICustomEvent

            const params = {
                type: obj._type,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    toJson(v3: true, prune?: boolean | undefined): bsmap.v3.ICustomEvent
    toJson(v3: false, prune?: boolean | undefined): bsmap.v2.ICustomEvent
    toJson(v3: boolean, prune?: boolean | undefined) {
        if (v3) {
            const result = {
                b: this.beat,
                t: this.type as bsmap.v3.ICustomEvent['t'],
                d: this.data as unknown as bsmap.v3.ICustomEvent['d'],
            } as bsmap.v3.ICustomEvent
            return prune ? jsonPrune(result) : result
        }

        const result = {
            _time: this.beat,
            _type: this.type as bsmap.v2.ICustomEvent['_type'],
            _data: this.data as unknown as bsmap.v2.ICustomEvent['_data'],
        } as bsmap.v2.ICustomEvent
        return prune ? jsonPrune(result) : result
    }
}
