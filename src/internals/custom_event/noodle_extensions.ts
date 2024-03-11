import { Track } from '../../animation/track.ts'
import { getActiveDifficulty } from '../../data/beatmap_handler.ts'
import { bsmap } from '../../deps.ts'
import { EASE } from '../../types/animation_types.ts'
import { copy } from '../../utils/general.ts'
import { jsonPrune } from '../../utils/json.ts'
import { AnimationPropertiesV3, animationToJson } from '../animation.ts'
import { ExcludedObjectFields } from '../object.ts'
import {
    BaseCustomEvent,
    CustomEventConstructorTrack,
    CustomEventExclusions,
    CustomEventSubclassFields,
    getDataProp,
} from './base.ts'

export class AssignPathAnimation extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignPathAnimation,
    bsmap.v3.ICustomEventAssignPathAnimation
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructorTrack<AssignPathAnimation>,
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
        getActiveDifficulty().customEvents.assignPathAnimationEvents.push(
            clone ? copy(this) : this,
        )
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
        type Params = CustomEventSubclassFields<AssignPathAnimation>

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
                b: this.beat,
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
            _time: this.beat,
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
        params: CustomEventConstructorTrack<AssignTrackParent>,
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
        getActiveDifficulty().customEvents.assignTrackParentEvents.push(
            clone ? copy(this) : this,
        )
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
        type Params = CustomEventSubclassFields<AssignTrackParent>

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
                b: this.beat,
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
            _time: this.beat,
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
        if (params.target) this.target = params.target
    }

    /** Track the player will be assigned to. */
    track: string
    target?: bsmap.PlayerObject

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.assignPlayerTrackEvents.push(
            clone ? copy(this) : this,
        )
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
        type Params = CustomEventSubclassFields<AssignPlayerToTrack>

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
                b: this.beat,
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
            _time: this.beat,
            _type: 'AssignPlayerToTrack',
        } satisfies bsmap.v2.ICustomEventAssignPlayerToTrack
        return prune ? jsonPrune(output) : output
    }
}
