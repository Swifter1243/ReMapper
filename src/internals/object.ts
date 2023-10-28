import { bsmap } from '../deps.ts'

import { NoteCut, NoteType } from '../data/constants.ts'
import { getActiveDiff, info } from '../data/beatmap_handler.ts'

import { getJumps } from '../utils/math.ts'
import { isEmptyObject, jsonRemove } from '../utils/json.ts'

import { Track } from '../animation/track.ts'
import {
    Fields,
    ObjectFields,
    Replace,
    SubclassExclusiveProps,
    TJson,
} from '../types/util_types.ts'
import { ColorVec, Vec2, Vec3 } from '../types/data_types.ts'
import { JsonWrapper } from '../types/beatmap_types.ts'
import { copy } from '../utils/general.ts'
import {
    AnimationPropertiesV2,
    AnimationPropertiesV3,
    jsonToAnimation,
    NoteAnimationData,
ObjectAnimationData,
} from './animation.ts'
import { TrackValue } from '../types/animation_types.ts'

export function importInvertedBoolean(bool: boolean | undefined) {
    return bool !== undefined ? !bool : undefined
}

export function exportInvertedBoolean(
    bool: boolean | undefined,
    defaultValue: boolean,
) {
    const invert = importInvertedBoolean(bool)
    return defaultBoolean(invert, defaultValue)
}

export function defaultBoolean(
    bool: boolean | undefined,
    defaultValue: boolean,
) {
    return bool === defaultValue ? undefined : bool
}

export type ObjectReplacements = {
    track?: TrackValue | Track
}

export type ExcludedObjectFields<Class, Replacement = ObjectReplacements> =
    Omit<
        Replace<Partial<Fields<Class>>, Replacement>,
        keyof ExcludeObjectFields
    >

export type ExcludeObjectFields = {
    implicitNJS: never
    implicitOffset: never
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

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = ObjectFields<BaseObject<TV2, TV3>>

        // TODO: Import custom data, exclude fields imported

        if (v3) {
            const obj = json as TV3

            const params = {
                time: obj.b,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                time: obj._time,
            } as Params

            Object.assign(this, params)
        }

        return this
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

        if (obj.life !== undefined) {
            this.life = obj.life
        }
        if (obj.lifeStart !== undefined) {
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
    animation: ObjectAnimationData

    /** The note jump speed of the object. Refers to the difficulty if undefined. */
    get implicitNJS() {
        return this.NJS ?? getActiveDiff().NJS
    }

    /** The spawn offset of the object. Refers to the difficulty if undefined. */
    get implicitOffset() {
        return this.offset ?? getActiveDiff().offset
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Duration is the time in beats that the object will be jumping for.
     * This function will output half of this, so it will end when the note is supposed to be hit.
     */
    get halfJumpDur() {
        return getJumps(
            this.implicitNJS,
            this.implicitOffset,
            info._beatsPerMinute,
        ).halfDur
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
     */
    get jumpDist() {
        return getJumps(
            this.implicitNJS,
            this.implicitOffset,
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
        const defaultJumps = getJumps(this.implicitNJS, 0, info._beatsPerMinute)
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

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = SubclassExclusiveProps<
            ExcludedObjectFields<BaseGameplayObject<TV2, TV3>>,
            BaseObject<TV2, TV3>
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                x: obj.x,
                y: obj.y,

                animation: obj.customData?.animation as AnimationPropertiesV3,
                color: obj.customData?.color as ColorVec,
                coordinates: obj.customData?.coordinates,
                interactable: importInvertedBoolean(
                    obj.customData?.uninteractable,
                ),
                localRotation: obj.customData?.localRotation,
                rotation: typeof obj.customData?.worldRotation === 'number'
                    ? [0, obj.customData.worldRotation, 0]
                    : obj.customData?.worldRotation,
                track: new Track(obj.customData?.track),
                NJS: obj.customData?.noteJumpMovementSpeed,
                offset: obj.customData?.noteJumpStartBeatOffset,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as TV2

            const params = {
                x: obj._lineIndex,

                animation: jsonToAnimation(
                    obj._customData?._animation as AnimationPropertiesV2 ?? {},
                ),
                color: obj._customData?._color as ColorVec,
                coordinates: obj._customData?._position,
                interactable: obj._customData?._interactable,
                localRotation: obj._customData?._localRotation,
                rotation: typeof obj._customData?._rotation === 'number'
                    ? [0, obj._customData._rotation, 0]
                    : obj._customData?._rotation,
                track: new Track(obj._customData?._track),
                NJS: obj._customData?._noteJumpMovementSpeed,
                offset: obj._customData?._noteJumpStartBeatOffset,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
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

    fromJson(json: TV3, v3: true): this
    fromJson(json: bsmap.v2.INote, v3: false): this
    fromJson(json: TV3 | bsmap.v2.INote, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                BaseNote<TV3>,
                BaseGameplayObject<bsmap.v2.INote, TV3>
            >
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                flip: obj.customData?.flip,

                noteLook: importInvertedBoolean(
                    obj.customData?.disableNoteLook,
                ),
                noteGravity: importInvertedBoolean(
                    obj.customData?.disableNoteGravity,
                ),
                spawnEffect: obj.customData?.spawnEffect,

                debris: importInvertedBoolean(obj.customData?.disableDebris),
                // TODO: Badcut on bombs is incorrect.
                speedBadCut: importInvertedBoolean(
                    obj.customData?.disableBadCutSpeed,
                ),
                directionBadCut: importInvertedBoolean(
                    obj.customData?.disableBadCutDirection,
                ),
                saberTypeBadCut: importInvertedBoolean(
                    obj.customData?.disableBadCutSaberType,
                ),
                link: obj.customData?.link,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.INote

            const params = {
                flip: obj._customData?._flip,

                noteLook: importInvertedBoolean(
                    obj._customData?._disableNoteLook,
                ),
                noteGravity: importInvertedBoolean(
                    obj._customData?._disableNoteGravity,
                ),
                spawnEffect: importInvertedBoolean(
                    obj._customData?._disableSpawnEffect,
                ),
                fake: obj._customData?._fake,
            } as Params

            // Walls in V2 don't have a "y" property
            this.y = obj._lineLayer

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }
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

    declare animation: NoteAnimationData

    fromJson(json: TV3, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: never | TV3, v3: boolean): this {
        if (!v3) throw 'V2 is not supported for slider notes'

        type Params = Fields<
            SubclassExclusiveProps<
                BaseSliderObject<TV3>,
                BaseGameplayObject<never, TV3>
            >
        >

        const obj = json as TV3

        const params = {
            type: obj.c,

            headDirection: obj.d,
            tailCoordinates: obj.customData?.tailCoordinates,
            tailTime: obj.tb,
            tailX: obj.tx,
            tailY: obj.ty,
        } satisfies Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }
}
