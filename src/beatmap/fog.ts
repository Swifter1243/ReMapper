import { BloomFogEnvironment } from '../types/environment_types.ts'
import { bsmap, ComplexKeyframesLinear, getActiveDiff } from '../mod.ts'

// TODO: Maybe make this a difficulty based thing?
export type AnyFog = BloomFogEnvironment<
    number | ComplexKeyframesLinear | string
>

export class FogEvent {
    fog: AnyFog
    time?: number
    duration?: number

    constructor(animation: AnyFog, time?: number, duration?: number) {
        this.fog = animation
        if (time) this.time = time
        if (duration) this.duration = duration
    }

    complexifyFog(v3 = true) {
        const obj = {} as Record<string, unknown>

        Object.entries(this.fog).map(([key, value]) => {
            const newValue = typeof value === 'number' ? [value] : value
            obj[v3 ? key : `_${key}`] = newValue
        }) 
        
        return obj as BloomFogEnvironment<ComplexKeyframesLinear | string>
    }

    exportV3() {
        const isStatic = !(
            this.time ||
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
            b: this.time ?? 0,
            t: 'AnimateComponent',
            d: {
                duration: this.duration,
                track: 'ReMapper_Fog',
                BloomFogEnvironment: this.complexifyFog(),
            },
        } as bsmap.v3.ICustomEventAnimateComponent
    }

    exportV2() {
        return {
            _time: this.time ?? 0,
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
        time?: number
        duration?: number
    },
]

type Overload2 = [
    time: number,
    params: AnyFog & {
        duration?: number
    },
]

type Overload3 = [
    time: number,
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

export function adjustFog(
    ...params:
        | Overload1
        | Overload2
        | Overload3
) {
    if (typeof params[0] === 'object') {
        const obj = (params as Overload1)[0]

        getActiveDiff().fogEvents.push(
            new FogEvent(obj, obj.time, obj.duration),
        )

        delete obj.time
        delete obj.duration
    } else if (params.length === 2) {
        const obj = params as Overload2

        getActiveDiff().fogEvents.push(
            new FogEvent(obj[1], obj[0]),
        )

        delete obj[1].duration
    } else {
        const obj = params as Overload3

        getActiveDiff().fogEvents.push(
            new FogEvent(obj[2], obj[0], obj[1]),
        )
    }
}
