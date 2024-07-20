import { Track } from '../../animation/track.ts'
import { getActiveDifficulty } from '../../data/beatmap_handler.ts'
import { bsmap } from '../../deps.ts'
import { EASE } from '../../types/animation.ts'
import { copy } from '../../utils/general.ts'
import { jsonPrune } from '../../utils/json.ts'
import { AnimationPropertiesV3, animationToJson } from '../../data/animation.ts'
import {
    BaseCustomEvent,
    CustomEventConstructorTrack,
    CustomEventSubclassFields,
    getDataProp,
} from './base.ts'

export class AnimateTrack extends BaseCustomEvent<
    bsmap.v2.ICustomEventAnimateTrack,
    bsmap.v3.ICustomEventAnimateTrack
> {
    /**
     * Animate a track.
     */
    constructor(
        params: CustomEventConstructorTrack<AnimateTrack>,
    ) {
        super(params)
        this.type = 'AnimateTrack'
        this.animation = params.animation ?? {}
        this.duration = params.duration ?? 0
        if (params.track) {
            this.track = params.track instanceof Track
                ? params.track
                : new Track(params.track)
        }
        if (params.easing) this.easing = params.easing
        if (params.repeat) this.repeat = params.repeat
    }

    /** The animation of this event. */
    animation: AnimationPropertiesV3
    /** Duration of the animation. */
    duration: number
    /** The track of this event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track = new Track('')
    /** The easing on this event's animation. */
    easing?: EASE
    /** The amount of times to repeat this event. */
    repeat?: number

    push(clone = true) {
        getActiveDifficulty().customEvents.animateTrackEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: bsmap.v3.ICustomEventAnimateTrack, v3: true): this
    fromJson(json: bsmap.v2.ICustomEventAnimateTrack, v3: false): this
    fromJson(
        json:
            | bsmap.v2.ICustomEventAnimateTrack
            | bsmap.v3.ICustomEventAnimateTrack,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<AnimateTrack>

        if (v3) {
            const obj = json as bsmap.v3.ICustomEventAnimateTrack

            const params = {
                duration: getDataProp(obj.d, 'duration'),
                easing: getDataProp(obj.d, 'easing'),
                repeat: getDataProp(obj.d, 'repeat'),
                track: new Track(getDataProp(obj.d, 'track')),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.ICustomEventAnimateTrack

            const params = {
                duration: getDataProp(obj._data, '_duration'),
                easing: getDataProp(obj._data, '_easing'),
                track: new Track(getDataProp(obj._data, '_track')),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ICustomEventAnimateTrack
    toJson(v3: false, prune?: boolean): bsmap.v2.ICustomEventAnimateTrack
    toJson(
        v3: boolean,
        prune = true,
    ): bsmap.v2.ICustomEventAnimateTrack | bsmap.v3.ICustomEventAnimateTrack {
        if (this.track.value === undefined) throw 'Track cannot be null!'

        if (v3) {
            const output = {
                b: this.beat,
                d: {
                    repeat: this.repeat,
                    easing: this.easing,
                    track: this.track.value,
                    duration: this.duration,
                    ...this.data,
                    ...animationToJson(this.animation, v3),
                },
                t: 'AnimateTrack',
            } satisfies bsmap.v3.ICustomEventAnimateTrack
            return prune ? jsonPrune(output) : output
        }

        if (this.repeat) {
            console.log(
                'Repeat is unsupported in v2 at the moment, may be implemented later',
            )
        }

        const output = {
            _time: this.beat,
            _data: {
                _easing: this.easing,
                _track: this.track.value,
                _duration: this.duration,
                ...this.data,
                ...animationToJson(this.animation, v3),
            },
            _type: 'AnimateTrack',
        } satisfies bsmap.v2.ICustomEventAnimateTrack
        return prune ? jsonPrune(output) : output
    }
}
