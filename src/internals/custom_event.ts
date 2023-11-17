import { bsmap } from '../deps.ts'
import { EASE, PointDefinitionLinear } from '../types/animation_types.ts'
import {
    ILightWithId,
    TubeBloomPrePassLight,
} from '../types/environment_types.ts'
import { getActiveDiff } from '../data/beatmap_handler.ts'
import { Track } from '../animation/track.ts'
import { Fields, SubclassExclusiveProps, TJson } from '../types/util_types.ts'
import { JsonWrapper } from '../types/beatmap_types.ts'
import { copy } from '../utils/general.ts'
import { AnimationPropertiesV3, animationToJson } from './animation.ts'
import { ExcludedObjectFields, ObjectReplacements } from './object.ts'
import { jsonPrune } from '../utils/json.ts'

type CustomEventExclusions = {
    type: never
}

function getDataProp<
    T,
    K extends keyof T,
>(
    obj: T,
    prop: K,
) {
    if (obj[prop] !== undefined) {
        const result = obj[prop]
        delete obj[prop]
        return result as T[K]
    }

    return undefined
}

export abstract class BaseCustomEvent<
    TV2 extends bsmap.v2.ICustomEvent,
    TV3 extends bsmap.v3.ICustomEvent,
> implements JsonWrapper<TV2, TV3> {
    time: number
    type: string
    data: TJson

    constructor(fields: Partial<Fields<BaseCustomEvent<TV2, TV3>>>) {
        this.time = fields.time ?? 0
        this.type = fields.type ?? ''
        this.data = fields.data ?? {}
    }

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): BaseCustomEvent<TV2, TV3>

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<BaseCustomEvent<TV2, TV3>>

        if (v3) {
            const obj = json as TV3

            const params = {
                time: obj.b,
                data: obj.d as unknown as TJson,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                time: obj._time,
                data: obj._type as unknown as TJson,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: boolean, prune?: boolean): TV2 | TV3
}

export class AnimateTrack extends BaseCustomEvent<
    bsmap.v2.ICustomEventAnimateTrack,
    bsmap.v3.ICustomEventAnimateTrack
> {
    /**
     * Animate a track.
     */
    constructor(
        params: ExcludedObjectFields<
            AnimateTrack,
            ObjectReplacements,
            CustomEventExclusions
        >,
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

    duration: number

    track: Track = new Track('')

    easing?: EASE

    /** The amount of times to repeat this event. */
    repeat?: number

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().animateTracks.push(clone ? copy(this) : this)
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
        type Params = Fields<
            SubclassExclusiveProps<
                AnimateTrack,
                BaseCustomEvent<
                    bsmap.v2.ICustomEvent,
                    bsmap.v3.ICustomEvent
                >
            >
        >

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
                b: this.time,
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
            _time: this.time,
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

export class AssignPathAnimation extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignPathAnimation,
    bsmap.v3.ICustomEventAssignPathAnimation
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: ExcludedObjectFields<
            AssignPathAnimation,
            ObjectReplacements,
            CustomEventExclusions
        >,
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
    }

    /** The animation of this event. */
    animation: AnimationPropertiesV3

    duration: number

    track: Track = new Track('')

    easing?: EASE

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().assignPathAnimations.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.ICustomEventAssignPathAnimation, v3: true): this
    fromJson(json: bsmap.v2.ICustomEventAssignPathAnimation, v3: false): this
    fromJson(
        json:
            | bsmap.v2.ICustomEventAssignPathAnimation
            | bsmap.v3.ICustomEventAssignPathAnimation,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                AssignPathAnimation,
                BaseCustomEvent<
                    bsmap.v2.ICustomEvent,
                    bsmap.v3.ICustomEvent
                >
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.ICustomEventAssignPathAnimation

            const params = {
                // @ts-ignore 2322
                duration: getDataProp(obj.d, 'duration') as number,
                easing: getDataProp(obj.d, 'easing'),
                track: new Track(getDataProp(obj.d, 'track')),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.ICustomEventAssignPathAnimation

            const params = {
                // @ts-ignore 2322
                duration: getDataProp(obj._data, '_duration') as number,
                easing: getDataProp(obj._data, '_easing'),
                track: new Track(getDataProp(obj._data, '_track')),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ICustomEventAssignPathAnimation
    toJson(v3: false, prune?: boolean): bsmap.v2.ICustomEventAssignPathAnimation
    toJson(
        v3: boolean,
        prune = true,
    ):
        | bsmap.v2.ICustomEventAssignPathAnimation
        | bsmap.v3.ICustomEventAssignPathAnimation {
        if (this.track.value === undefined) throw 'Track cannot be null!'

        if (v3) {
            const output = {
                b: this.time,
                d: {
                    // @ts-ignore 2322
                    duration: this.duration,
                    easing: this.easing,
                    track: this.track.value,
                    ...this.data,
                    ...animationToJson(this.animation, v3),
                },
                t: 'AssignPathAnimation',
            } satisfies bsmap.v3.ICustomEventAssignPathAnimation
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _time: this.time,
            _data: {
                // @ts-ignore 2322
                _duration: this.duration,
                _easing: this.easing,
                _track: this.track.value,
                ...this.data,
                ...animationToJson(this.animation, v3),
            },
            _type: 'AssignPathAnimation',
        } satisfies bsmap.v2.ICustomEventAssignPathAnimation
        return prune ? jsonPrune(output) : output
    }
}

export class AssignTrackParent extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignTrackParent,
    bsmap.v3.ICustomEventAssignTrackParent
> {
    /**
     * Assign tracks to a parent track.
     */
    constructor(
        params: ExcludedObjectFields<
            AssignTrackParent,
            ObjectReplacements,
            CustomEventExclusions
        >,
    ) {
        super(params)
        this.childrenTracks = params.childrenTracks ?? []
        this.parentTrack = params.parentTrack ?? ''
        this.worldPositionStays = params.worldPositionStays
    }

    /** Children tracks to assign. */
    childrenTracks: string[]
    /** Name of the parent track. */
    parentTrack: string

    /** Modifies the transform of children objects to remain in the same place relative to world space. */
    worldPositionStays?: boolean

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().assignTrackParents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.ICustomEventAssignTrackParent, v3: true): this
    fromJson(json: bsmap.v2.ICustomEventAssignTrackParent, v3: false): this
    fromJson(
        json:
            | bsmap.v2.ICustomEventAssignTrackParent
            | bsmap.v3.ICustomEventAssignTrackParent,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                AssignTrackParent,
                BaseCustomEvent<
                    bsmap.v2.ICustomEvent,
                    bsmap.v3.ICustomEvent
                >
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.ICustomEventAssignTrackParent

            const params = {
                childrenTracks: getDataProp(obj.d, 'childrenTracks'),
                parentTrack: getDataProp(obj.d, 'parentTrack'),
                worldPositionStays: getDataProp(obj.d, 'worldPositionStays'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.ICustomEventAssignTrackParent

            const params = {
                childrenTracks: getDataProp(obj._data, '_childrenTracks'),
                parentTrack: getDataProp(obj._data, '_parentTrack'),
                worldPositionStays: getDataProp(
                    obj._data,
                    '_worldPositionStays',
                ),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ICustomEventAssignTrackParent
    toJson(v3: false, prune?: boolean): bsmap.v2.ICustomEventAssignTrackParent
    toJson(
        v3: boolean,
        prune = true,
    ):
        | bsmap.v2.ICustomEventAssignTrackParent
        | bsmap.v3.ICustomEventAssignTrackParent {
        if (v3) {
            const output = {
                b: this.time,
                d: {
                    childrenTracks: this.childrenTracks,
                    parentTrack: this.parentTrack,
                    worldPositionStays: this.worldPositionStays,
                    ...this.data,
                },
                t: 'AssignTrackParent',
            } satisfies bsmap.v3.ICustomEventAssignTrackParent
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _data: {
                _childrenTracks: this.childrenTracks,
                _parentTrack: this.parentTrack,
                _worldPositionStays: this.worldPositionStays,
                ...this.data,
            },
            _time: this.time,
            _type: 'AssignTrackParent',
        } satisfies bsmap.v2.ICustomEventAssignTrackParent
        return prune ? jsonPrune(output) : output
    }
}

export class AssignPlayerToTrack extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignPlayerToTrack,
    bsmap.v3.ICustomEventAssignPlayerToTrack
> {
    /**
     * Assigns the player to a track.
     */
    constructor(
        params: ExcludedObjectFields<
            AssignPlayerToTrack,
            // deno-lint-ignore ban-types
            {},
            CustomEventExclusions
        >,
    ) {
        super(params)
        this.track = params.track ?? ''
        if (this.target) this.target = params.target
    }

    /** Track the player will be assigned to. */
    track: string
    target?: bsmap.PlayerObject

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().assignPlayerTracks.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.ICustomEventAssignPlayerToTrack, v3: true): this
    fromJson(json: bsmap.v2.ICustomEventAssignPlayerToTrack, v3: false): this
    fromJson(
        json:
            | bsmap.v2.ICustomEventAssignPlayerToTrack
            | bsmap.v3.ICustomEventAssignPlayerToTrack,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                AssignPlayerToTrack,
                BaseCustomEvent<
                    bsmap.v2.ICustomEvent,
                    bsmap.v3.ICustomEvent
                >
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.ICustomEventAssignPlayerToTrack

            const params = {
                track: getDataProp(obj.d, 'track'),
                target: getDataProp(obj.d, 'target'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.ICustomEventAssignPlayerToTrack

            const params = {
                track: getDataProp(obj._data, '_track'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ICustomEventAssignPlayerToTrack
    toJson(v3: false, prune?: boolean): bsmap.v2.ICustomEventAssignPlayerToTrack
    toJson(
        v3: boolean,
        prune = true,
    ):
        | bsmap.v2.ICustomEventAssignPlayerToTrack
        | bsmap.v3.ICustomEventAssignPlayerToTrack {
        if (v3) {
            const output = {
                b: this.time,
                d: {
                    track: this.track!,
                    target: this.target,
                    ...this.data,
                },
                t: 'AssignPlayerToTrack',
            } satisfies bsmap.v3.ICustomEventAssignPlayerToTrack
            return prune ? jsonPrune(output) : output
        }

        if (this.target) {
            console.log(
                'Target is unsupported in v2 at the moment, may be implemented later',
            )
        }

        const output = {
            _data: {
                _track: this.track!,
                ...this.data,
            },
            _time: this.time,
            _type: 'AssignPlayerToTrack',
        } satisfies bsmap.v2.ICustomEventAssignPlayerToTrack
        return prune ? jsonPrune(output) : output
    }
}

export class AnimateComponent
    extends BaseCustomEvent<never, bsmap.v3.ICustomEventAnimateComponent> {
    /**
     * Animate components on a track.
     * @param json Json to import.
     * @param track Track(s) to effect.
     * @param duration Duration of the animation.
     * @param easing The easing on the animation.
     */
    constructor(
        params: ExcludedObjectFields<
            AnimateComponent,
            ObjectReplacements,
            CustomEventExclusions
        >,
    ) {
        super(params)
        this.type = 'AnimateComponent'
        if (params.track) {
            this.track = params.track instanceof Track
                ? params.track
                : new Track(params.track)
        }
        this.duration = params.duration
        this.easing = params.easing

        this.lightID = params.lightID ?? {}
        this.lightMultiplier = params.lightMultiplier ?? {}
    }

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    track = new Track('')

    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE
    /** The "ILightWithId" component to animate. */
    lightID: ILightWithId<PointDefinitionLinear> = {}
    /** The "TubeBloomPrePassLight component to animate." */
    lightMultiplier: TubeBloomPrePassLight<PointDefinitionLinear> = {}

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().animateComponents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.ICustomEventAnimateComponent, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json: never | bsmap.v3.ICustomEventAnimateComponent,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                AnimateComponent,
                BaseCustomEvent<
                    bsmap.v2.ICustomEvent,
                    bsmap.v3.ICustomEvent
                >
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.ICustomEventAnimateComponent

            const params = {
                duration: getDataProp(obj.d, 'duration'),
                easing: getDataProp(obj.d, 'easing'),
                fog: getDataProp(obj.d, 'BloomFogEnvironment'),
                // @ts-ignore 2322
                lightID: getDataProp(obj.d, 'ILightWithID'),
                lightMultiplier: getDataProp(obj.d, 'TubeBloomPrePassLight'),
                track: new Track(getDataProp(obj.d, 'track')),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }

        throw 'V2 not supported for animating components'
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ICustomEventAnimateComponent
    toJson(v3: false, prune?: boolean): never
    toJson(v3 = true, prune = true): bsmap.v3.ICustomEventAnimateComponent {
        if (!v3) {
            throw 'V2 not supported for animating components'
        }

        if (this.track.value === undefined) throw 'Track cannot be null!'

        const output = {
            b: this.time,
            t: 'AnimateComponent',
            d: {
                duration: this.duration ?? 0,
                track: this.track.value as string,
                easing: this.easing,
                TubeBloomPrePassLight: {
                    colorAlphaMultiplier: this
                        .lightMultiplier as bsmap.FloatPointDefinition[],
                    bloomFogIntensityMultiplier: undefined!,
                },
                // @ts-ignore 2322
                ILightWithId: {
                    lightID: this.lightID?.lightID,
                    type: this.lightID?.type,
                },
                ...this.data,
            },
        } satisfies bsmap.v3.ICustomEventAnimateComponent
        return prune ? jsonPrune(output) : output
    }
}

export class AbstractCustomEvent extends BaseCustomEvent<
    bsmap.v2.ICustomEvent,
    bsmap.v3.ICustomEvent
> {
    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().abstractCustomEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.ICustomEvent, v3: true): this
    fromJson(json: bsmap.v2.ICustomEvent, v3: false): this
    fromJson(
        json: bsmap.v2.ICustomEvent | bsmap.v3.ICustomEvent,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                AbstractCustomEvent,
                BaseCustomEvent<
                    bsmap.v2.ICustomEvent,
                    bsmap.v3.ICustomEvent
                >
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.ICustomEvent

            const params = {
                type: obj.t,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as bsmap.v2.ICustomEvent

            const params = {
                type: obj._type,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    toJson(v3: true, prune?: boolean | undefined): bsmap.v3.ICustomEvent
    toJson(v3: false, prune?: boolean | undefined): bsmap.v2.ICustomEvent
    toJson(v3: boolean, prune?: boolean | undefined) {
        if (v3) {
            const result = {
                b: this.time,
                t: this.type as bsmap.v3.ICustomEvent['t'],
                d: this.data as unknown as bsmap.v3.ICustomEvent['d'],
            } as bsmap.v3.ICustomEvent
            return prune ? jsonPrune(result) : result
        }

        const result = {
            _time: this.time,
            _type: this.type as bsmap.v2.ICustomEvent['_type'],
            _data: this.data as unknown as bsmap.v2.ICustomEvent['_data'],
        } as bsmap.v2.ICustomEvent
        return prune ? jsonPrune(result) : result
    }
}
