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

export class AssignPathAnimation extends CustomEvent<
    bsmap.v2.ICustomEventAssignPathAnimation,
    bsmap.v3.ICustomEventAssignPathAnimation
> {
    constructor(
        params: CustomEventConstructorTrack<AssignPathAnimation>,
    ) {
        super(params)
        this.type = 'AssignPathAnimation'
        this.animation = params.animation ?? copy(AssignPathAnimation.defaults.animation)
        this.track = params.track instanceof Track ? params.track : new Track(params.track)
        this.duration = params.duration
        this.easing = params.easing
    }

    /** The animation of this event. */
    animation: AnimationPropertiesV3
    /** The track of this event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** Duration of the animation. */
    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE

    static defaults: DefaultFields<AssignPathAnimation> = {
        animation: {},
        track: new Track(),
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.assignPathAnimationEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: bsmap.v3.ICustomEventAssignPathAnimation): this {
        this.track = new Track(getDataProp(json.d, 'track'))
        // @ts-ignore 2322
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        this.animation = { ...json.d } as unknown as AnimationPropertiesV3
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.ICustomEventAssignPathAnimation): this {
        this.track = new Track(getDataProp(json._data, '_track'))
        // @ts-ignore 2322
        this.duration = getDataProp(json._data, '_duration')
        this.easing = getDataProp(json._data, '_easing')
        this.animation = animationV2ToV3(json._data)
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEventAssignPathAnimation {
        if (!this.track.value) throw 'Track cannot be null!'

        const output = {
            b: this.beat,
            d: {
                easing: this.easing,
                track: this.track.value,
                // @ts-ignore 2322
                duration: this.duration,
                ...this.data,
                ...this.animation as bsmap.v3.IAnimation,
            },
            t: 'AssignPathAnimation',
        } satisfies bsmap.v3.ICustomEventAssignPathAnimation
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.ICustomEventAssignPathAnimation {
        if (!this.track.value) throw 'Track cannot be null!'

        const output = {
            _time: this.beat,
            _data: {
                _easing: this.easing,
                _track: this.track.value,
                // @ts-ignore 2322
                _duration: this.duration,
                ...this.data,
                ...animationV3toV2(this.animation),
            },
            _type: 'AssignPathAnimation',
        } satisfies bsmap.v2.ICustomEventAssignPathAnimation
        return prune ? objectPrune(output) : output
    }
}
