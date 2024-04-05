import { bsmap } from '../deps.ts'

import { NoteCut, NoteType } from '../data/constants.ts'
import { getActiveDifficulty } from '../data/beatmap_handler.ts'

import { getJumps } from '../utils/math.ts'
import { isEmptyObject } from '../utils/json.ts'

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
import {
    AnimationPropertiesV2,
    AnimationPropertiesV3,
    jsonToAnimation,
    NoteAnimationData,
    ObjectAnimationData,
} from './animation.ts'
import { TrackValue } from '../types/animation_types.ts'
import { jsonPrune } from '../mod.ts'
import { getInfoDat } from '../data/info_file.ts'

/** An internal tool for inverting defined booleans, while ignoring undefined. */
export function importInvertedBoolean(bool: boolean | undefined) {
    return bool !== undefined ? !bool : undefined
}

/** An internal tool for inverting defined booleans, and setting them to undefined if they're equal to their "default value". */
export function exportInvertedBoolean(
    bool: boolean | undefined,
    defaultValue: boolean,
) {
    const invert = importInvertedBoolean(bool)
    return defaultBoolean(invert, defaultValue)
}

/** An internal tool to set a boolean to undefined if it's equal to a "default value". */
export function defaultBoolean(
    bool: boolean | undefined,
    defaultValue: boolean,
) {
    return bool === defaultValue ? undefined : bool
}

/** Get a property from a customData object, while mutating the object to remove that property. */
export function getCDProp<
    T extends Record<string, unknown>,
    K extends keyof T,
>(
    obj: { customData?: T; _customData?: T },
    prop: K,
) {
    if (obj._customData && obj._customData[prop] !== undefined) {
        const result = obj._customData[prop]
        delete obj._customData[prop]
        return result as T[K]
    }

    if (obj.customData && obj.customData[prop] !== undefined) {
        const result = obj.customData[prop]
        delete obj.customData[prop]
        return result as T[K]
    }

    return undefined
}

/** Properties to replace on constructor objects for gameplay objects. */
export type ObjectReplacements = {
    track?: TrackValue | Track
}

/** Get fields of a class, while replacing and excluding certain fields. */
export type ExcludedObjectFields<
    Class,
    Replacement = ObjectReplacements,
    Exclusion = ExcludeObjectFields,
> = Omit<
    Replace<Partial<Fields<Class>>, Replacement>,
    keyof Exclusion
>

/** Fields to exclude on the constructor object for gameplay objects. */
export type ExcludeObjectFields = {
    implicitNoteJumpSpeed: never
    implicitNoteJumpOffset: never
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
    beat: number
    /** Any community made data on this object. */
    customData: TV2['_customData'] | TV3['customData']

    constructor(
        obj: ObjectFields<BaseObject<TV2, TV3>> | Record<string, unknown>,
    ) {
        this.beat = (obj.beat as number | undefined) ?? 0
        this.customData = obj.customData ?? {}
    }

    /** Checks if the object has modded properties. */
    get isModded() {
        return !isEmptyObject(jsonPrune(this.toJson(true).customData as TJson))
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = ObjectFields<BaseObject<TV2, TV3>>

        if (v3) {
            const obj = json as TV3

            const params = {
                beat: obj.b ?? 0,
                customData: obj.customData,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                beat: obj._time ?? 0,
                customData: obj._customData,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: true, prune?: boolean): TV2 | TV3
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
        this.worldRotation = obj.worldRotation
        this.localRotation = obj.localRotation
        this.noteJumpSpeed = obj.noteJumpSpeed
        this.noteJumpOffset = obj.noteJumpOffset
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

    /** The x position of this object on the grid. */
    x: number
    /** The y position of this object on the grid. */
    y: number
    /** Noodle Extensions offset coordinates for this object on the grid. */
    coordinates?: Vec2
    /** The rotation added to an object around the world origin. */
    worldRotation?: Vec3
    /** The rotation added to an object around it's anchor point. */
    localRotation?: Vec3
    /** The speed of this object in units (meters) per second. */
    noteJumpSpeed?: number
    /** The offset added to the position where this object "jumps" in. */
    noteJumpOffset?: number
    /** Whether this object is interactable. */
    interactable?: boolean
    /** The track of this object.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** The chroma color of the object. */
    color?: ColorVec
    /** The animation json on the object. */
    animation: ObjectAnimationData

    /** The speed of this object in units (meters) per second. 
     * Refers to the difficulty if undefined. */
    get implicitNoteJumpSpeed() {
        return this.noteJumpSpeed ?? getActiveDifficulty().noteJumpSpeed
    }

    /** The offset added to the position where this object "jumps" in.
     * Refers to the difficulty if undefined. */
    get implicitNoteJumpOffset() {
        return this.noteJumpOffset ?? getActiveDifficulty().noteJumpOffset
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Duration is the time in beats that the object will be jumping for.
     * This function will output half of this, so it will end when the note is supposed to be hit.
     */
    get halfJumpDur() {
        return getJumps(
            this.implicitNoteJumpSpeed,
            this.implicitNoteJumpOffset,
            getInfoDat()._beatsPerMinute,
        ).halfDur
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
     */
    get jumpDist() {
        return getJumps(
            this.implicitNoteJumpSpeed,
            this.implicitNoteJumpOffset,
            getInfoDat()._beatsPerMinute,
        ).dist
    }

    /** The total duration of the object in beats. 
     * Calculated based on the beats per minute, and the note jump speed.
     */
    get life() {
        return this.halfJumpDur * 2
    }
    set life(value: number) {
        if (value < 0.25) {
            console.log(
                'Warning: The lifespan of a note has a minimum of 0.25 beats.',
            )
        }
        const defaultJumps = getJumps(this.implicitNoteJumpSpeed, 0, getInfoDat()._beatsPerMinute)
        this.noteJumpOffset = (value - 2 * defaultJumps.halfDur) / 2
    }

    /** The time of the start of the object's lifespan. 
     * Calculated based on the beats per minute, and the note jump speed.
    */
    get lifeStart() {
        return this.beat - this.life / 2
    }
    set lifeStart(value: number) {
        this.beat = value + this.life / 2
    }

    /** Determines whether this object uses Noodle Extensions features. */
    get isGameplayModded() {
        if (this.coordinates) return true
        if (this.worldRotation) return true
        if (this.localRotation) return true
        if (this.noteJumpSpeed !== undefined) return true
        if (this.noteJumpOffset !== undefined) return true
        if (this.interactable === false) return true
        return false
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
                x: obj.x ?? 0,
                y: obj.y ?? 0,

                animation: getCDProp(obj, 'animation') as AnimationPropertiesV3 ?? {},
                color: getCDProp(obj, 'color') as ColorVec,
                coordinates: getCDProp(obj, 'coordinates'),
                interactable: importInvertedBoolean(
                    getCDProp(obj, 'uninteractable'),
                ),
                localRotation: getCDProp(obj, 'localRotation'),
                worldRotation: typeof obj.customData?.worldRotation === 'number'
                    ? [0, getCDProp(obj, 'worldRotation'), 0]
                    : getCDProp(obj, 'worldRotation'),
                track: new Track(getCDProp(obj, 'track')),
                noteJumpSpeed: getCDProp(obj, 'noteJumpMovementSpeed'),
                noteJumpOffset: getCDProp(obj, 'noteJumpStartBeatOffset'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as TV2

            const params = {
                x: obj._lineIndex ?? 0,

                animation: jsonToAnimation(
                    getCDProp(obj, '_animation') as AnimationPropertiesV2 ?? {},
                ),
                color: getCDProp(obj, '_color') as ColorVec,
                coordinates: getCDProp(obj, '_position'),
                interactable: getCDProp(obj, '_interactable'),
                localRotation: getCDProp(obj, '_localRotation'),
                worldRotation: typeof obj._customData?._rotation === 'number'
                    ? [0, getCDProp(obj, '_rotation'), 0]
                    : getCDProp(obj, '_rotation'),
                track: new Track(getCDProp(obj, '_track')),
                noteJumpSpeed: getCDProp(obj, '_noteJumpMovementSpeed'),
                noteJumpOffset: getCDProp(obj, '_noteJumpStartBeatOffset'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }
}

export abstract class BaseNote<
    TV3 extends bsmap.v3.IColorNote | bsmap.v3.IBombNote,
> extends BaseGameplayObject<bsmap.v2.INote, TV3> {
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
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void

    get isGameplayModded() {
        if (super.isGameplayModded) return true
        if (this.fake) return true
        if (this.flip) return true
        if (this.noteGravity === false) return true
        if (this.noteLook === false) return true
        if (this.link) return true
        if (this.directionBadCut === false) return true
        if (this.speedBadCut === false) return true
        if (this.saberTypeBadCut === false) return true
        if (this.debris === false) return true
        return false
    }

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
                flip: getCDProp(obj, 'flip'),

                noteLook: importInvertedBoolean(
                    getCDProp(obj, 'disableNoteLook'),
                ),
                noteGravity: importInvertedBoolean(
                    getCDProp(obj, 'disableNoteGravity'),
                ),
                spawnEffect: getCDProp(obj, 'spawnEffect'),

                debris: importInvertedBoolean(getCDProp(obj, 'disableDebris')),
                // TODO: Badcut on bombs is incorrect.
                speedBadCut: importInvertedBoolean(
                    getCDProp(obj, 'disableBadCutSpeed'),
                ),
                directionBadCut: importInvertedBoolean(
                    getCDProp(obj, 'disableBadCutDirection'),
                ),
                saberTypeBadCut: importInvertedBoolean(
                    getCDProp(obj, 'disableBadCutSaberType'),
                ),
                link: getCDProp(obj, 'link'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.INote

            const params = {
                flip: getCDProp(obj, '_flip'),

                noteLook: importInvertedBoolean(
                    getCDProp(obj, '_disableNoteLook'),
                ),
                noteGravity: importInvertedBoolean(
                    getCDProp(obj, '_disableNoteGravity'),
                ),
                spawnEffect: importInvertedBoolean(
                    getCDProp(obj, '_disableSpawnEffect'),
                ),
                fake: getCDProp(obj, '_fake'),
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
    tailBeat: number
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
        this.tailBeat = obj.tailBeat ?? 0
        this.tailX = obj.tailX ?? 0
        this.tailY = obj.tailY ?? 0
    }

    declare animation: NoteAnimationData

    get isGameplayModded() {
        if (super.isGameplayModded) return true
        if (this.tailCoordinates) return true
        return false
    }

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
            type: obj.c ?? 0,

            headDirection: obj.d ?? 0,
            tailCoordinates: getCDProp(obj, 'tailCoordinates'),
            tailBeat: obj.tb ?? 0,
            tailX: obj.tx ?? 0,
            tailY: obj.ty ?? 0,
        } satisfies Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }
}
