import {BloomFogEnvironment} from '../../../../types/beatmap/object/environment.ts'
import {bsmap, ComplexKeyframesLinear} from '../../../../mod.ts'

// TODO: Maybe make this a difficulty based thing?
export type AnyFog = BloomFogEnvironment<
    number | ComplexKeyframesLinear | string
>

export class FogEvent {
    fog: AnyFog
    beat?: number
    duration?: number

    /** Abstracted fog light_event. */
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
     * If animated, returns an AnimateComponent light_event.
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

    /** Export for V2 into an AnimateTrack light_event. */
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

