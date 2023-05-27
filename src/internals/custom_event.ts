import { bsmap } from '../deps.ts'
import {
    EASE,
    KeyframesLinear,
    TrackValue,
} from '../types/animation_types.ts'
import {
    BloomFogEnvironment,
    Components,
    ILightWithId,
    TubeBloomPrePassLight,
} from '../types/environment_types.ts'
import { activeDiffGet } from '../data/beatmap_handler.ts'
import { Track } from '../animation/track.ts'
import { AbstractAnimation, BaseAnimation } from './animation.ts'
import {Fields, TJson} from "../types/util_types.ts";
import {JsonWrapper} from "../types/beatmap_types.ts";
import { copy } from '../utils/general.ts'

export abstract class BaseCustomEvent<
    TV2 extends bsmap.v2.ICustomEvent,
    TV3 extends bsmap.v3.ICustomEvent,
> implements JsonWrapper<TV2, TV3> {
    time = 0
    type = ''
    data: TJson = {}

    constructor(time: number | Fields<BaseCustomEvent<TV2, TV3>>) {
        if (typeof time === 'object') {
            Object.assign(this, time)
        } else {
            this.time = time
        }
    }

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        activeDiffGet().customEvents.push(clone ? copy(this) : this)
        return this
    }

    abstract toJson(v3: true): TV3
    abstract toJson(v3: false): TV2
    abstract toJson(v3: boolean): TV2 | TV3
}

export class AnimateTrack extends BaseCustomEvent<
    bsmap.v2.ICustomEventAnimateTrack,
    bsmap.v3.ICustomEventAnimateTrack
> {
    toJson(v3: true): bsmap.v3.ICustomEventAnimateTrack
    toJson(v3: false): bsmap.v2.ICustomEventAnimateTrack
    toJson(
        v3: boolean,
    ): bsmap.v2.ICustomEventAnimateTrack | bsmap.v3.ICustomEventAnimateTrack {
        if (!this.track.value) throw 'Track cannot be null!'

        if (v3) {
            return {
                b: this.time,
                d: {
                    // color: this.animate.color as bsmap.ColorPointDefinition[],
                    // time: this.animate.time as bsmap.PercentPointDefinition[],
                    // dissolve: this.animate.dissolve as bsmap.PercentPointDefinition[],
                    // dissolveArrow: this.animate
                    //   .dissolveArrow as bsmap.PercentPointDefinition[],
                    // interactable: this.animate
                    //   .uninteractable as bsmap.PercentPointDefinition[], // TODO: fixup
                    // localRotation: this.animate
                    //   .localRotation as bsmap.Vector3PointDefinition[],
                    // position: this.animate.position as bsmap.Vector3PointDefinition[],
                    // rotation: this.animate.rotation as bsmap.Vector3PointDefinition[],
                    // scale: this.animate.scale as bsmap.Vector3PointDefinition[],

                    repeat: this.repeat,
                    easing: this.ease,
                    track: this.track.value,
                    duration: this.duration,
                    ...this.data,
                    ...this.animate.toJson(v3),
                },
                t: 'AnimateTrack',
            } satisfies bsmap.v3.ICustomEventAnimateTrack
        }

        if (this.repeat) {
            console.log(
                'Repeat is unsupported in v2 at the moment, may be implemented later',
            )
        }

        return {
            _time: this.time,
            _data: {
                // _color: this.animate.color as bsmap.ColorPointDefinition[],
                // _time: this.animate.time as bsmap.PercentPointDefinition[],
                // _dissolve: this.animate.dissolve as bsmap.PercentPointDefinition[],
                // _dissolveArrow: this.animate
                //   .dissolveArrow as bsmap.PercentPointDefinition[],
                // _interactable: this.animate
                //   .uninteractable as bsmap.PercentPointDefinition[], // TODO: fixup
                // _localRotation: this.animate
                //   .localRotation as bsmap.Vector3PointDefinition[],
                // _position: this.animate.position as bsmap.Vector3PointDefinition[],
                // _rotation: this.animate.rotation as bsmap.Vector3PointDefinition[],
                // _scale: this.animate.scale as bsmap.Vector3PointDefinition[],

                _easing: this.ease,
                _track: this.track.value,
                _duration: this.duration,
                ...this.data,
                ...this.animate.toJson(v3),
            },
            _type: 'AnimateTrack',
        } satisfies bsmap.v2.ICustomEventAnimateTrack
    }
    /** The animation of this event. */
    animate: AbstractAnimation

    track: Track = new Track()

    ease?: EASE

    /** The amount of times to repeat this event. */
    repeat?: number

    /**
     * Animate a track.
     * @param json The json to import.
     * @param track Track(s) to effect.
     * @param duration The duration of the animation.
     * @param animation The animation properties to replace.
     * @param easing The easing on this event's animation.
     */
    constructor(params: {
        time: number
        track?: TrackValue
        duration?: number
        animation?: BaseAnimation
        easing?: EASE
    }) {
        super(params.time)
        this.type = 'AnimateTrack'
        this.animate = new AbstractAnimation(this.duration)
        if (params.track) this.track.value = params.track
        if (params.duration) this.duration = params.duration
        if (params.animation) {
            this.animate.properties = copy(
                params.animation.properties,
            )
        }
        if (params.easing) this.ease = params.easing
    }

    /** The duration of the animation. */
    get duration() {
        return this.animate.duration
    }

    set duration(value: number) {
        this.data.duration = value
    }
}

export class AssignPathAnimation extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignPathAnimation,
    bsmap.v3.ICustomEventAssignPathAnimation
> {
    toJson(v3: true): bsmap.v3.ICustomEventAssignPathAnimation
    toJson(v3: false): bsmap.v2.ICustomEventAssignPathAnimation
    toJson(
        v3: boolean,
    ):
        | bsmap.v2.ICustomEventAssignPathAnimation
        | bsmap.v3.ICustomEventAssignPathAnimation {
        if (!this.track.value) throw 'Track cannot be null!'

        if (v3) {
            return {
                b: this.time,
                d: {
                    // color: this.animate.color as bsmap.ColorPointDefinition[],
                    // dissolve: this.animate.dissolve as bsmap.PercentPointDefinition[],
                    // dissolveArrow: this.animate
                    //   .dissolveArrow as bsmap.PercentPointDefinition[],
                    // interactable: this.animate
                    //   .uninteractable as bsmap.PercentPointDefinition[], // TODO: fixup
                    // localRotation: this.animate
                    //   .localRotation as bsmap.Vector3PointDefinition[],
                    // position: this.animate.position as bsmap.Vector3PointDefinition[],
                    // rotation: this.animate.rotation as bsmap.Vector3PointDefinition[],
                    // scale: this.animate.scale as bsmap.Vector3PointDefinition[],

                    easing: this.ease,
                    track: this.track.value,
                    ...this.data,
                    ...this.animate.toJson(v3),
                },
                t: 'AssignPathAnimation',
            } satisfies bsmap.v3.ICustomEventAssignPathAnimation
        }

        return {
            _time: this.time,
            _data: {
                // _color: this.animate.color as bsmap.ColorPointDefinition[],
                // _dissolve: this.animate.dissolve as bsmap.PercentPointDefinition[],
                // _dissolveArrow: this.animate
                //   .dissolveArrow as bsmap.PercentPointDefinition[],
                // _interactable: this.animate
                //   .uninteractable as bsmap.PercentPointDefinition[], // TODO: fixup
                // _localRotation: this.animate
                //   .localRotation as bsmap.Vector3PointDefinition[],
                // _position: this.animate.position as bsmap.Vector3PointDefinition[],
                // _rotation: this.animate.rotation as bsmap.Vector3PointDefinition[],
                // _scale: this.animate.scale as bsmap.Vector3PointDefinition[],

                _easing: this.ease,
                _track: this.track.value,
                ...this.data,
                ...this.animate.toJson(v3),
            },
            _type: 'AssignPathAnimation',
        } satisfies bsmap.v2.ICustomEventAssignPathAnimation
    }
    /** The animation of this event. */
    animate: AbstractAnimation

    track: Track = new Track()

    ease?: EASE

    /**
     * Animate objects on a track across their lifespan.
     * @param json The json to import.
     * @param track Track(s) to effect.
     * @param duration The time to transition from a previous path to this one.
     * @param animation The animation properties to replace.
     * @param easing The easing on this event's animation.
     */
    constructor(params: {
        time: number
        track?: TrackValue
        duration?: number
        animation?: BaseAnimation
        easing?: EASE
    }) {
        super(params.time)
        this.type = 'AnimateTrack'
        this.animate = new AbstractAnimation(this.duration)
        if (params.track) this.track.value = params.track
        if (params.duration) this.duration = params.duration
        if (params.animation) {
            this.animate.properties = copy(
                params.animation.properties,
            )
        }
        if (params.easing) this.ease = params.easing
    }

    /** The time to transition from a previous path to this one. */
    get duration() {
        return this.animate.duration
    }

    set duration(value: number) {
        this.animate.duration = value
    }
}

export class AssignTrackParent extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignTrackParent,
    bsmap.v3.ICustomEventAssignTrackParent
> {
    toJson(v3: true): bsmap.v3.ICustomEventAssignTrackParent
    toJson(v3: false): bsmap.v2.ICustomEventAssignTrackParent
    toJson(
        v3: boolean,
    ):
        | bsmap.v2.ICustomEventAssignTrackParent
        | bsmap.v3.ICustomEventAssignTrackParent {
        if (v3) {
            return {
                b: this.time,
                d: {
                    childrenTracks: this.childrenTracks,
                    parentTrack: this.parentTrack,
                    worldPositionStays: this.worldPositionStays,
                },
                t: 'AssignTrackParent',
            } satisfies bsmap.v3.ICustomEventAssignTrackParent
        }

        return {
            _data: {
                _childrenTracks: this.childrenTracks,
                _parentTrack: this.parentTrack,
                _worldPositionStays: this.worldPositionStays,
            },
            _time: this.time,
            _type: 'AssignTrackParent',
        } satisfies bsmap.v2.ICustomEventAssignTrackParent
    }
    /**
     * Assign tracks to a parent track.
     * @param json Json to import.
     * @param childrenTracks Children tracks to assign.
     * @param parentTrack Name of the parent track.
     * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
     */
    constructor(params: {
        time: number
        childrenTracks: string[]
        parentTrack: string
        worldPositionStays?: boolean
    }) {
        super(params.time)
        this.childrenTracks = params.childrenTracks
        this.parentTrack = params.parentTrack
        this.worldPositionStays = params.worldPositionStays
    }

    /** Children tracks to assign. */
    childrenTracks: string[]
    /** Name of the parent track. */
    parentTrack: string

    /** Modifies the transform of children objects to remain in the same place relative to world space. */
    worldPositionStays?: boolean
}

export class AssignPlayerToTrack extends BaseCustomEvent<
    bsmap.v2.ICustomEventAssignPlayerToTrack,
    bsmap.v3.ICustomEventAssignPlayerToTrack
> {
    /**
     * Assigns the player to a track.
     * @param json Json to import.
     * @param track Track the player will be assigned to.
     */
    constructor(time: number, track?: string) {
        super(time)
        this.track = track
    }

    /** Track the player will be assigned to. */
    track?: string

    toJson(v3: true): bsmap.v3.ICustomEventAssignPlayerToTrack
    toJson(v3: false): bsmap.v2.ICustomEventAssignPlayerToTrack
    toJson(
        v3: boolean,
    ):
        | bsmap.v2.ICustomEventAssignPlayerToTrack
        | bsmap.v3.ICustomEventAssignPlayerToTrack {
        if (v3) {
            return {
                b: this.time,
                d: {
                    track: this.track!,
                },
                t: 'AssignPlayerToTrack',
            } satisfies bsmap.v3.ICustomEventAssignPlayerToTrack
        }

        return {
            _data: {
                _track: this.track!,
            },
            _time: this.time,
            _type: 'AssignPlayerToTrack',
        } satisfies bsmap.v2.ICustomEventAssignPlayerToTrack
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
    constructor(params: {
        time: number
        track?: TrackValue
        duration?: number
        easing?: EASE
        components: Components<KeyframesLinear>
    }) {
        super(params.time)
        this.type = 'AnimateComponent'
        this.track.value = params.track
        this.duration = params.duration
        this.easing = params.easing

        this.fog = params.components.BloomFogEnvironment ?? {}
        this.lightID = params.components.ILightWithId ?? {}
        this.lightMultiplier = params.components.TubeBloomPrePassLight ?? {}
    }

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    track = new Track()

    duration?: number
    /** The easing on this event's animation. */
    easing?: EASE
    /** The "ILightWithId" component to animate. */
    lightID: ILightWithId<KeyframesLinear> = {}
    /** The "BloomFogEnvironment" component to animate. */
    fog: BloomFogEnvironment<KeyframesLinear> = {}
    /** The "TubeBloomPrePassLight component to animate." */
    lightMultiplier: TubeBloomPrePassLight<KeyframesLinear> = {}

    toJson(v3: true): bsmap.v3.ICustomEventAnimateComponent
    toJson(v3: false): never
    toJson(v3: boolean): bsmap.v3.ICustomEventAnimateComponent {
        if (!v3) {
            throw 'V2 not supported for animating components'
        }

        return {
            b: this.time,
            t: 'AnimateComponent',
            d: {
                duration: this.duration ?? 0,
                track: this.track.value as string,
                easing: this.easing,
                TubeBloomPrePassLight: {
                    colorAlphaMultiplier: this
                        .lightMultiplier as bsmap.PercentPointDefinition[],
                    bloomFogIntensityMultiplier: undefined!,
                },
                BloomFogEnvironment: {
                    attenuation: this.fog
                        ?.attenuation as bsmap.PercentPointDefinition[],
                    height: this.fog?.height as bsmap.PercentPointDefinition[],
                    offset: this.fog?.offset as bsmap.PercentPointDefinition[],
                    startY: this.fog?.startY as bsmap.PercentPointDefinition[],
                },
                // @ts-ignore 2322
                ILightWithId: {
                    lightID: this.lightID?.lightID,
                    type: this.lightID?.type,
                },
            },
        } satisfies bsmap.v3.ICustomEventAnimateComponent
    }
}
