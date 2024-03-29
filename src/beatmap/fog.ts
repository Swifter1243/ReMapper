import { BloomFogEnvironment } from '../types/environment_types.ts'
import { bsmap, ComplexKeyframesLinear, getActiveDifficulty } from '../mod.ts'

// TODO: Maybe make this a difficulty based thing?
export type AnyFog = BloomFogEnvironment<
    number | ComplexKeyframesLinear | string
>

export class FogEvent {
    fog: AnyFog
    beat?: number
    duration?: number

    /** Abstracted fog event. */
    constructor(animation: AnyFog, beat?: number, duration?: number) {
        this.fog = animation
        if (beat) this.beat = beat
        if (duration) this.duration = duration
    }

    /** Turns the internal fog component that can use single numbers for static keyframes and turns it into the version read by the beatmap, which only accepts point definitions or arrays. */
    complexifyFog(v3 = true) {
        const obj = {} as Record<string, unknown>

        Object.entries(this.fog).map(([key, value]) => {
            const newValue = typeof value === 'number' ? [value] : value
            obj[v3 ? key : `_${key}`] = newValue
        }) 
        
        return obj as BloomFogEnvironment<ComplexKeyframesLinear | string>
    }

    /** Export for V3.
     * If static, returns an environment statement for the base environment.
     * If animated, returns an AnimateComponent event.
     */
    exportV3() {
        const isStatic = !(
            this.beat ||
            this.duration ||
            Object.values(this.fog).some((x) => typeof x !== 'number')
        )

        if (isStatic) {
            return {
                id: '[0]Environment',
                lookupMethod: 'EndsWith',
                components: {
                    BloomFogEnvironment: this.fog,
                },
            } as bsmap.v3.IChromaEnvironment
        }

        return {
            b: this.beat ?? 0,
            t: 'AnimateComponent',
            d: {
                duration: this.duration,
                track: 'ReMapper_Fog',
                BloomFogEnvironment: this.complexifyFog(),
            },
        } as bsmap.v3.ICustomEventAnimateComponent
    }

    /** Export for V2 into an AnimateTrack event. */
    exportV2() {
        return {
            _time: this.beat ?? 0,
            _type: 'AnimateTrack',
            _data: {
                _track: 'ReMapper_Fog',
                _duration: this.duration,
                ...this.complexifyFog(false)
            }
        } as bsmap.v2.ICustomEventAnimateTrack
    }
}

type Overload1 = [
    AnyFog & {
        beat?: number
        duration?: number
    },
]

type Overload2 = [
    beat: number,
    params: AnyFog & {
        duration?: number
    },
]

type Overload3 = [
    beat: number,
    duration: number,
    params: AnyFog,
]

export function adjustFog(
    ...params: Overload1
): void
export function adjustFog(
    ...params: Overload2
): void
export function adjustFog(
    ...params: Overload3
): void

/** Adjust fog, agnostic of version. */
export function adjustFog(
    ...params:
        | Overload1
        | Overload2
        | Overload3
) {
    if (typeof params[0] === 'object') {
        const obj = (params as Overload1)[0]

        getActiveDifficulty().fogEvents.push(
            new FogEvent(obj, obj.beat, obj.duration),
        )

        delete obj.beat
        delete obj.duration
    } else if (params.length === 2) {
        const obj = params as Overload2

        getActiveDifficulty().fogEvents.push(
            new FogEvent(obj[1], obj[0]),
        )

        delete obj[1].duration
    } else {
        const obj = params as Overload3

        getActiveDifficulty().fogEvents.push(
            new FogEvent(obj[2], obj[0], obj[1]),
        )
    }
}
