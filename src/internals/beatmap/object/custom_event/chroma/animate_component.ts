import { CustomEvent } from '../base/custom_event.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { BloomFogEnvironment, TubeBloomPrePassLight } from '../../../../../types/beatmap/object/environment.ts'
import { PointDefinitionLinear } from '../../../../../types/animation/keyframe/linear.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'
import { DefaultFields } from '../../../../../types/beatmap/object/object.ts'

export class AnimateComponent extends CustomEvent<never, bsmap.v3.ICustomEventAnimateComponent> {
    constructor(
        params: CustomEventConstructorTrack<AnimateComponent>,
    ) {
        super(params)
        this.type = 'AnimateComponent'
        this.track = params.track instanceof Track ? params.track : new Track(params.track)
        this.duration = params.duration ?? AnimateComponent.defaults.duration
        this.easing = params.easing ?? AnimateComponent.defaults.easing
        this.lightMultiplier = params.lightMultiplier ?? copy(AnimateComponent.defaults.lightMultiplier)
        this.fog = params.fog ?? copy(AnimateComponent.defaults.fog)
    }

    /** The track of this event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** Duration of the animation. */
    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE
    /** The "TubeBloomPrePassLight component to animate." */
    lightMultiplier: TubeBloomPrePassLight<PointDefinitionLinear>
    /** The "BloomFogEnvironment component to animate." */
    fog: BloomFogEnvironment<PointDefinitionLinear>

    static defaults: DefaultFields<AnimateComponent> = {
        lightMultiplier: {},
        fog: {},
        track: new Track(),
        ...super.defaults,
    }

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.abstractCustomEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: bsmap.v3.ICustomEventAnimateComponent): this {
        this.track = new Track(getDataProp(json.d, 'track'))
        this.duration = getDataProp(json.d, 'duration') ?? AnimateComponent.defaults.duration
        this.easing = (getDataProp(json.d, 'easing') ?? AnimateComponent.defaults.easing) as EASE | undefined
        this.lightMultiplier = getDataProp(json.d, 'TubeBloomPrePassLight') as typeof this.lightMultiplier | undefined ??
            copy(AnimateComponent.defaults.lightMultiplier)
        this.fog = getDataProp(json.d, 'BloomFogEnvironment') as typeof this.fog | undefined ?? copy(AnimateComponent.defaults.fog)
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'V2 not supported for animating components'
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEventAnimateComponent {
        if (this.track.value === undefined) throw 'Track cannot be null!'

        const output = {
            b: this.beat,
            t: 'AnimateComponent',
            d: {
                duration: this.duration ?? 0,
                track: this.track.value as string,
                easing: this.easing,
                TubeBloomPrePassLight: this.lightMultiplier as bsmap.v3.ICustomEventAnimateComponent['d']['TubeBloomPrePassLight'],
                BloomFogEnvironment: this.fog as bsmap.v3.ICustomEventAnimateComponent['d']['BloomFogEnvironment'],
                ...this.data,
            },
        } satisfies bsmap.v3.ICustomEventAnimateComponent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'V2 not supported for animating components'
    }
}
