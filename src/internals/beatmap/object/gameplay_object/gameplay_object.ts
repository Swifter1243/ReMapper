import {ExcludedObjectFields} from '../../../../types/beatmap/object/object.ts'
import {Track} from '../../../../utils/animation/track.ts'
import {getActiveDifficulty} from '../../../../data/active_difficulty.ts'
import {
    getJumps,
    getOffsetFromHalfJumpDuration,
    getOffsetFromJumpDistance,
    getOffsetFromReactionTime,
    getReactionTime,
} from '../../../../utils/math/beatmap.ts'
import {getActiveInfo} from '../../../../data/active_info.ts'
import {jsonToAnimation} from '../../../../utils/animation/json.ts'
import {BeatmapObject} from '../object.ts'
import {bsmap} from '../../../../deps.ts'
import {ColorVec, Vec2, Vec3} from "../../../../types/math/vector.ts";
import {AnimationPropertiesV2, AnimationPropertiesV3} from "../../../../types/animation/properties/properties.ts";
import {ObjectAnimationData} from "../../../../types/animation/properties/object.ts";
import {SubclassExclusiveProps} from "../../../../types/util/class.ts";
import {getCDProp, importInvertedBoolean} from "../../../../utils/beatmap/json.ts";

export abstract class BeatmapGameplayObject<
    TV2 extends bsmap.v2.INote | bsmap.v2.IObstacle,
    TV3 extends bsmap.v3.IGridObject,
> extends BeatmapObject<TV2, TV3> {
    constructor(
        obj: ExcludedObjectFields<BeatmapGameplayObject<TV2, TV3>>,
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
        this.uninteractable = obj.uninteractable
        this.track = obj.track instanceof Track ? obj.track : new Track(obj.track)
        this.color = obj.color

        if (obj.life !== undefined) {
            this.life = obj.life
        }
        if (obj.lifeStart !== undefined) {
            this.lifeStart = obj.lifeStart
        }
        if (obj.reactionTime !== undefined) {
            this.reactionTime = obj.reactionTime
        }
        if (obj.jumpDistance !== undefined) {
            this.jumpDistance = obj.jumpDistance
        }
        if (obj.halfJumpDuration !== undefined) {
            this.halfJumpDuration = obj.halfJumpDuration
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
    /** Whether this object is uninteractable with the player. */
    uninteractable?: boolean
    /** The track of this object.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** The chroma color of the object. */
    color?: ColorVec
    /** The animation object on the object. */
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
    get halfJumpDuration() {
        return getJumps(
            this.implicitNoteJumpSpeed,
            this.implicitNoteJumpOffset,
            getActiveInfo()._beatsPerMinute,
        ).halfDuration
    }
    set halfJumpDuration(value: number) {
        this.noteJumpOffset = getOffsetFromHalfJumpDuration(
            value,
            this.implicitNoteJumpSpeed,
            getActiveInfo()._beatsPerMinute,
        )
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
     */
    get jumpDistance() {
        return getJumps(
            this.implicitNoteJumpSpeed,
            this.implicitNoteJumpOffset,
            getActiveInfo()._beatsPerMinute,
        ).jumpDistance
    }
    set jumpDistance(value: number) {
        this.noteJumpOffset = getOffsetFromJumpDistance(
            value,
            this.implicitNoteJumpSpeed,
            getActiveInfo()._beatsPerMinute,
        )
    }

    /** This is the amount of time in milliseconds the player has to react from the object spawning. */
    get reactionTime() {
        return getReactionTime(
            this.implicitNoteJumpSpeed,
            this.implicitNoteJumpOffset,
            getActiveInfo()._beatsPerMinute,
        )
    }
    set reactionTime(value: number) {
        this.noteJumpOffset = getOffsetFromReactionTime(
            value,
            this.implicitNoteJumpSpeed,
            getActiveInfo()._beatsPerMinute,
        )
    }

    /** This is the position the note will spawn in, e.g. when it's "jump" starts. */
    get spawnPositionZ() {
        return this.jumpDistance / 2 + 1
    }

    /** This is the position the note will despawn, e.g. when it's "jump" ends. */
    get despawnPositionZ() {
        return this.jumpDistance * -0.25 + 1
    }

    /** The total duration of the object in beats.
     * Calculated based on the beats per minute, and the note jump speed.
     */
    get life() {
        return this.halfJumpDuration * 2
    }
    set life(value: number) {
        if (value < 0.25) {
            console.log(
                'Warning: The lifespan of a note has a minimum of 0.25 beats.',
            )
        }
        this.noteJumpOffset = getOffsetFromHalfJumpDuration(
            value / 2,
            this.implicitNoteJumpSpeed,
            getActiveInfo()._beatsPerMinute,
        )
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
        if (this.uninteractable) return true
        return false
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = SubclassExclusiveProps<
            ExcludedObjectFields<BeatmapGameplayObject<TV2, TV3>>,
            BeatmapObject<TV2, TV3>
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                x: obj.x ?? 0,
                y: obj.y ?? 0,

                animation: getCDProp(obj, 'animation') as AnimationPropertiesV3 ?? {},
                color: getCDProp(obj, 'color') as ColorVec,
                coordinates: getCDProp(obj, 'coordinates'),
                uninteractable: getCDProp(obj, 'uninteractable'),
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
                uninteractable: importInvertedBoolean(
                    getCDProp(obj, '_interactable'),
                ),
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

