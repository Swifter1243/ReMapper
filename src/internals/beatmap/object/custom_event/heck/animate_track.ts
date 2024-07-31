import { CustomEvent } from '../base/custom_event.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { AnimationPropertiesV3 } from '../../../../../types/animation/properties/properties.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { animationV2ToV3, animationV3toV2 } from '../../../../../utils/animation/json.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'
import { DefaultFields } from '../../../../../types/beatmap/object/object.ts'

export class AnimateTrack extends CustomEvent<
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
        this.track = new Track(params.track)
        this.animation = params.animation ?? copy(AnimateTrack.defaults.animation)
        this.duration = params.duration
        this.easing = params.easing
        this.repeat = params.repeat
    }

    /** The track of this event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** The animation of this event. */
    animation: AnimationPropertiesV3
    /** Duration of the animation. */
    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE
    /** The amount of times to repeat this event. */
    repeat?: number

    static defaults: DefaultFields<AnimateTrack> = {
        animation: {},
        track: new Track(),
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.animateTrackEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: bsmap.v3.ICustomEventAnimateTrack): this {
        this.track = new Track(getDataProp(json.d, 'track'))
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        this.repeat = getDataProp(json.d, 'repeat')
        this.animation = { ...json.d } as unknown as AnimationPropertiesV3
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.ICustomEventAnimateTrack): this {
        this.track = new Track(getDataProp(json._data, '_track'))
        this.duration = getDataProp(json._data, '_duration')
        this.easing = getDataProp(json._data, '_easing')
        this.animation = animationV2ToV3(json._data)
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEventAnimateTrack {
        if (!this.track.value) throw 'Track cannot be null!'

        const output = {
            b: this.beat,
            d: {
                repeat: this.repeat,
                easing: this.easing,
                track: this.track.value,
                duration: this.duration,
                ...this.data,
                ...this.animation as bsmap.v3.IAnimation,
            },
            t: 'AnimateTrack',
        } satisfies bsmap.v3.ICustomEventAnimateTrack
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.ICustomEventAnimateTrack {
        if (!this.track.value) throw 'Track cannot be null!'

        if (this.repeat) {
            console.log('Repeat is unsupported in v2')
        }

        const output = {
            _time: this.beat,
            _data: {
                _easing: this.easing,
                _track: this.track.value,
                _duration: this.duration,
                ...this.data,
                ...animationV3toV2(this.animation),
            },
            _type: 'AnimateTrack',
        } satisfies bsmap.v2.ICustomEventAnimateTrack
        return prune ? objectPrune(output) : output
    }
}
