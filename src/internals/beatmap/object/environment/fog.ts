import { bsmap } from '../../../../deps.ts'
import { ComplexKeyframesLinear } from '../../../../types/animation/keyframe/linear.ts'
import { BloomFogEnvironment } from '../../../../types/beatmap/object/environment.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { FOG_TRACK } from '../../../../constants/fog.ts'
import { BeatmapArrayMember } from '../../../../types/beatmap/beatmap_array_member.ts'
import { AbstractDifficulty } from '../../abstract_beatmap.ts'

// TODO: Maybe make this a difficulty based thing?
export type AnyFog = BloomFogEnvironment<
    number | ComplexKeyframesLinear | string
>

export class FogEvent extends BeatmapArrayMember<AbstractDifficulty> {
    fog: AnyFog
    beat?: number
    duration?: number

    /** Abstracted fog event. */
    constructor(difficulty: AbstractDifficulty, animation: AnyFog, beat?: number, duration?: number) {
        super(difficulty)
        this.fog = animation
        if (beat) this.beat = beat
        if (duration) this.duration = duration
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.fogEvents as this[]
    }

    /** Turns the internal fog component that can use single numbers for static keyframes and turns it into the version read by the beatmap, which only accepts point definitions or arrays. */
    complexifyFog(v3 = true) {
        const obj = {} as Record<string, unknown>

        Object.entries(this.fog).map(([key, value]) => {
            obj[v3 ? key : `_${key}`] = typeof value === 'number' ? [value] : value
        })

        return obj as BloomFogEnvironment<ComplexKeyframesLinear | string>
    }

    /** Export for V3.
     * If static, returns an environment statement for the base environment.
     * If animated, returns an AnimateComponent event.
     */
    exportV3(prune?: boolean) {
        const isStatic = !(
            this.beat ||
            this.duration ||
            Object.values(this.fog).some((x) => typeof x !== 'number')
        )

        if (isStatic) {
            const result = {
                id: '[0]Environment',
                lookupMethod: 'EndsWith',
                components: {
                    BloomFogEnvironment: this.fog as BloomFogEnvironment<number>,
                },
            } satisfies bsmap.v3.IChromaEnvironment
            return prune ? objectPrune(result) : result
        }

        const result = {
            b: this.beat ?? 0,
            t: 'AnimateComponent',
            d: {
                duration: this.duration!, // duration can be undefined here... why do I have to do this
                track: FOG_TRACK,
                BloomFogEnvironment: this.complexifyFog() as bsmap.v3.ICustomEventAnimateComponent['d']['BloomFogEnvironment'],
            },
        } satisfies bsmap.v3.ICustomEventAnimateComponent
        return prune ? objectPrune(result) : result
    }

    /** Export for V2 into an AnimateTrack event. */
    exportV2(prune?: boolean) {
        const result = {
            _time: this.beat ?? 0,
            _type: 'AnimateTrack',
            _data: {
                _track: FOG_TRACK,
                _duration: this.duration,
                ...this.complexifyFog(false),
            },
        } satisfies bsmap.v2.ICustomEventAnimateTrack
        return prune ? objectPrune(result) : result
    }
}
