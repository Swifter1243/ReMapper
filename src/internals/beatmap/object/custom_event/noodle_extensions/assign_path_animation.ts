import { CustomEvent } from '../base/custom_event.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { animationV2ToV3, animationV3toV2 } from '../../../../../utils/animation/json.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'
import { JsonObjectDefaults } from '../../../../../types/beatmap/object/object.ts'
import type { AbstractDifficulty } from '../../../abstract_difficulty.ts'
import {AssignPathAnimationData} from "../../../../../types/animation/properties/assign_path.ts";

export class AssignPathAnimation extends CustomEvent<
    bsmap.v2.ICustomEventAssignPathAnimation,
    bsmap.v3.ICustomEventAssignPathAnimation
> {
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<AssignPathAnimation>,
    ) {
        super(difficulty, params)
        this.type = 'AssignPathAnimation'
        this.animation = params.animation ?? copy(AssignPathAnimation.defaults.animation)
        this.track = new Track(params.track)
        this.duration = params.duration
        this.easing = params.easing
    }

    /** The animation of this event. */
    animation: AssignPathAnimationData
    /** The track of this event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** Duration of the animation. */
    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE

    static override defaults: JsonObjectDefaults<AssignPathAnimation> = {
        animation: {},
        track: new Track(),
        ...super.defaults,
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.assignPathAnimationEvents as this[]
    }

    override fromJsonV3(json: bsmap.v3.ICustomEventAssignPathAnimation): this {
        this.track = new Track(getDataProp(json.d, 'track'))
        // TODO: bsmap error
        // @ts-ignore 2322
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        this.animation = { ...json.d } as unknown as AssignPathAnimationData
        return super.fromJsonV3(json)
    }

    override fromJsonV2(json: bsmap.v2.ICustomEventAssignPathAnimation): this {
        this.track = new Track(getDataProp(json._data, '_track'))
        // TODO: bsmap error
        // @ts-ignore 2322
        this.duration = getDataProp(json._data, '_duration')
        this.easing = getDataProp(json._data, '_easing')
        this.animation = animationV2ToV3(json._data)
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEventAssignPathAnimation {
        if (!this.track.value) {
            throw new Error('Track cannot be null!')
        }

        const output = {
            b: this.beat,
            d: {
                easing: this.easing,
                track: this.track.value,
                // TODO: bsmap error
                // @ts-ignore 2322
                duration: this.duration,
                ...this.unsafeData,
                ...this.animation as bsmap.v3.IAnimation,
            },
            t: 'AssignPathAnimation',
        } satisfies bsmap.v3.ICustomEventAssignPathAnimation
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.ICustomEventAssignPathAnimation {
        if (!this.track.value) {
            throw new Error('Track cannot be null!')
        }

        const output = {
            _time: this.beat,
            _data: {
                _easing: this.easing,
                _track: this.track.value,
                // TODO: bsmap error
                // @ts-ignore 2322
                _duration: this.duration,
                ...this.unsafeData,
                ...animationV3toV2(this.animation),
            },
            _type: 'AssignPathAnimation',
        } satisfies bsmap.v2.ICustomEventAssignPathAnimation
        return prune ? objectPrune(output) : output
    }
}
