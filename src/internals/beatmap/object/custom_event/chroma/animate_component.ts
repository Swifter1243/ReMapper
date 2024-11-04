import { CustomEvent } from '../base/custom_event.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'
import { Track } from '../../../../../utils/animation/track.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { BloomFogEnvironment, TubeBloomPrePassLight } from '../../../../../types/beatmap/object/environment.ts'
import { DifficultyPointsLinear } from '../../../../../types/animation/points/linear.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'
import { JsonObjectDefaults } from '../../../../../types/beatmap/object/object.ts'
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class AnimateComponent extends CustomEvent<never, bsmap.v3.ICustomEventAnimateComponent> {
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<AnimateComponent>,
    ) {
        super(difficulty, params)
        this.type = 'AnimateComponent'
        this.track = new Track(params.track)
        this.duration = params.duration
        this.easing = params.easing
        this.lightMultiplier = params.lightMultiplier ?? copy(AnimateComponent.defaults.lightMultiplier)
        this.fog = params.fog ?? copy(AnimateComponent.defaults.fog)
    }

    /** The track of this event.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** The "TubeBloomPrePassLight component to animate." */
    lightMultiplier: TubeBloomPrePassLight<DifficultyPointsLinear>
    /** The "BloomFogEnvironment component to animate." */
    fog: BloomFogEnvironment<DifficultyPointsLinear>
    /** Duration of the animation. */
    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE

    static override defaults: JsonObjectDefaults<AnimateComponent> = {
        lightMultiplier: {},
        fog: {},
        track: new Track(),
        ...super.defaults,
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.animateComponentEvents as this[]
    }

    override fromJsonV3(json: bsmap.v3.ICustomEventAnimateComponent): this {
        this.track = new Track(getDataProp(json.d, 'track'))
        this.duration = getDataProp(json.d, 'duration') ?? AnimateComponent.defaults.duration
        this.easing = (getDataProp(json.d, 'easing') ?? AnimateComponent.defaults.easing) as EASE | undefined
        this.lightMultiplier = getDataProp(json.d, 'TubeBloomPrePassLight') as typeof this.lightMultiplier | undefined ??
            copy(AnimateComponent.defaults.lightMultiplier)
        this.fog = getDataProp(json.d, 'BloomFogEnvironment') as typeof this.fog | undefined ?? copy(AnimateComponent.defaults.fog)
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
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
                ...this.unsafeData,
            },
        } satisfies bsmap.v3.ICustomEventAnimateComponent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'V2 not supported for animating components'
    }
}
