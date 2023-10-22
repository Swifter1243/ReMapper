import { bsmap } from '../deps.ts'

import { NoteCut, NoteType } from '../data/constants.ts'
import { getActiveDiff, info } from '../data/beatmap_handler.ts'

import { getJumps } from '../utils/math.ts'
import { isEmptyObject, jsonRemove } from '../utils/json.ts'

import { Track } from '../animation/track.ts'
import { Fields, ObjectFields, Replace, TJson } from '../types/util_types.ts'
import { ColorVec, Vec2, Vec3 } from '../types/data_types.ts'
import { JsonWrapper } from '../types/beatmap_types.ts'
import { copy } from '../utils/general.ts'
import { GameplayObjectAnimationData, NoteAnimationData } from './animation.ts'
import { TrackValue } from '../types/animation_types.ts'

export type ObjectReplacements = {
    track?: TrackValue | Track
}

export type ExcludedObjectFields<Class, Replacement = ObjectReplacements> =
    Omit<
        Replace<Partial<Fields<Class>>, Replacement>,
        keyof ExcludeObjectFields
    >

export type ExcludeObjectFields = {
    definiteNJS: never
    definiteOffset: never
    isModded: never
    isGameplayModded: never
    halfJumpDur: never
    jumpDist: never
}

export abstract class BaseObject<
    TV2 extends bsmap.v2.IBaseObject,
    TV3 extends bsmap.v3.IBaseObject,
> implements JsonWrapper<TV2, TV3> {
    /** The time that this object is scheduled for. */
    time: number
    /** Any community made data on this object. */
    customData: TV2['_customData'] | TV3['customData']

    constructor(
        obj: ObjectFields<BaseObject<TV2, TV3>> | Record<string, unknown>,
    ) {
        this.time = (obj.time as number | undefined) ?? 0
        this.customData = obj.customData ?? {}
    }

    /** Checks if the object has modded properties. */
    get isModded() {
        return !isEmptyObject(this.toJson(true).customData)
    }

    abstract toJson(v3: true): TV3
    abstract toJson(v3: false): TV2
    abstract toJson(v3: true): TV2 | TV3
}

export abstract class BaseGameplayObject<
    TV2 extends bsmap.v2.INote | bsmap.v2.IObstacle,
    TV3 extends bsmap.v3.IGridObject,
> extends BaseObject<TV2, TV3> {
    constructor(
        obj: ExcludedObjectFields<BaseGameplayObject<TV2, TV3>>,
    ) {
        super(obj)
        this.animation = obj.animation ?? {}
        this.x = obj.x ?? 0
        this.y = obj.y ?? 0
        this.coordinates = obj.coordinates
        this.rotation = obj.rotation
        this.localRotation = obj.localRotation
        this.NJS = obj.NJS
        this.offset = obj.offset
        this.interactable = obj.interactable ?? true
        this.track = obj.track instanceof Track
            ? obj.track
            : new Track(obj.track)
        this.color = obj.color
        if (obj.life) {
            this.life = obj.life
        }

        if (obj.lifeStart) {
            this.lifeStart = obj.lifeStart
        }
    }

    x: number
    y: number

    coordinates?: Vec2

    /** The rotation added to an object around the world origin. */
    rotation?: Vec3
    /** The rotation added to an object around it's anchor point. */
    localRotation?: Vec3

    /** The note jump speed of the object. */
    NJS?: number

    /** The spawn offset of the object. */
    offset?: number

    /** Whether this object is interactable. */
    interactable?: boolean

    /** The track class for this event.
     * @see Track
     */
    track: Track

    /** The chroma color of the object. */
    color?: ColorVec

    /** The animation json on the object. */
    animation: GameplayObjectAnimationData

    /** The note jump speed of the object. Refers to the difficulty if undefined. */
    get definiteNJS() {
        return this.NJS ?? getActiveDiff().NJS
    }

    /** The spawn offset of the object. Refers to the difficulty if undefined. */
    get definiteOffset() {
        return this.offset ?? getActiveDiff().offset
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Duration is the time in beats that the object will be jumping for.
     * This function will output half of this, so it will end when the note is supposed to be hit.
     */
    get halfJumpDur() {
        return getJumps(
            this.definiteNJS,
            this.definiteOffset,
            info._beatsPerMinute,
        ).halfDur
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
     */
    get jumpDist() {
        return getJumps(
            this.definiteNJS,
            this.definiteOffset,
            info._beatsPerMinute,
        ).dist
    }

    /** The lifespan of the object. */
    get life() {
        return this.halfJumpDur * 2
    }
    set life(value: number) {
        if (value < 0.25) {
            console.log(
                'Warning: The lifespan of a note has a minimum of 0.25 beats.',
            )
        }
        const defaultJumps = getJumps(this.definiteNJS, 0, info._beatsPerMinute)
        this.offset = (value - 2 * defaultJumps.halfDur) / 2
    }

    /** The time of the start of the object's lifespan. */
    get lifeStart() {
        return this.time - this.life / 2
    }
    set lifeStart(value: number) {
        this.time = value + this.life / 2
    }

    get isGameplayModded() {
        if (!this.isModded) return false
        const customData = copy(this.toJson(true).customData) as TJson
        jsonRemove(customData, 'color')
        jsonRemove(customData, 'spawnEffect')
        jsonRemove(customData, 'animation.color')
        return !isEmptyObject(customData)
    }
}

export abstract class BaseNote<
    TV3 extends bsmap.v3.IColorNote | bsmap.v3.IBombNote,
> extends BaseGameplayObject<bsmap.v2.INote, TV3> {
    /**
     * Note object for ease of creation.
     * @param time Time this note will be hit.
     * @param type The color of the note.
     * @param direction The direction the note will be cut.
     * @param x The lane of the note.
     * @param y The vertical row of the note.
     */
    constructor(
        fields: ExcludedObjectFields<BaseNote<TV3>>,
    ) {
        super(fields as ExcludedObjectFields<BaseNote<TV3>>)
        this.fake = fields.fake ?? false
        this.flip = fields.flip
        this.noteGravity = fields.noteGravity ?? true
        this.noteLook = fields.noteLook ?? true
        this.spawnEffect = fields.spawnEffect ?? true
        this.link = fields.link
        this.directionBadCut = fields.directionBadCut ?? true
        this.speedBadCut = fields.speedBadCut ?? true
        this.saberTypeBadCut = fields.saberTypeBadCut ?? true
        this.debris = fields.debris ?? true
    }

    declare animation: NoteAnimationData

    /** Moves the note to the separate fake note array on save. */
    fake?: boolean
    /** Specifies an initial position the note will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
    noteGravity?: boolean
    /** Whether this note will look at the player. */
    noteLook?: boolean
    /** Whether this note will have a spawn effect. */
    spawnEffect?: boolean
    /** When cut, all notes with the same link string will also be cut. */
    link?: string
    /** The ability to bad cut this note based on direction. */
    directionBadCut?: boolean
    /** The ability to bad cut this note based on speed. */
    speedBadCut?: boolean
    /** The ability to bad cut this note based on saber type. */
    saberTypeBadCut?: boolean
    /** Whether debris shows when this note is hit. */
    debris?: boolean

    /**
     * Push this note to the difficulty.
     * @param fake Whether this note will be pushed to the fakeNotes array.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void
}

export abstract class BaseSliderObject<TV3 extends bsmap.v3.IBaseSlider>
    extends BaseGameplayObject<never, TV3> {
    /** The color of the object. */
    type: NoteType
    /** The cut direction of the head. */
    headDirection: NoteCut
    /** The time the tail arrives at the player. */
    tailTime: number
    /** The lane of the tail. */
    tailX: number
    /** The vertical row of the tail. */
    tailY: number

    /** The position of the tail. */
    tailCoordinates?: Vec2

    constructor(
        obj: ExcludedObjectFields<BaseSliderObject<TV3>>,
    ) {
        super(obj)
        this.type = obj.type ?? NoteType.RED
        this.headDirection = obj.headDirection ?? 0
        this.tailTime = obj.tailTime ?? 0
        this.tailX = obj.tailX ?? 0
        this.tailY = obj.tailY ?? 0
    }
}
