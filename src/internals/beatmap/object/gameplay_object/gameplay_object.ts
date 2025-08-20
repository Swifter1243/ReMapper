import { Track } from '../../../../utils/animation/track.ts'
import { animationV2ToV3 } from '../../../../utils/animation/json.ts'
import { BeatmapObject } from '../object.ts'
import { ColorVec, Vec2, Vec3 } from '../../../../types/math/vector.ts'
import { getCDProp, importInvertedBoolean } from '../../../../utils/beatmap/json.ts'
import {
    GameplayObjectConstructor,
    GameplayObjectDefaults,
    GameplayObjectGetters,
    GameplayObjectSetters,
    IV2GameplayObject,
    IV3GameplayObject,
} from '../../../../types/beatmap/object/gameplay_object.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { settings } from '../../../../data/settings.ts'
import { BeatmapObjectConstructor } from '../../../../types/beatmap/object/object.ts'
import {
    getJumps,
    getOffsetFromHalfJumpDuration,
    getOffsetFromJumpDistance,
    getOffsetFromReactionTime, getReactionTime
} from "../../../../utils/beatmap/object/jumps.ts";
import {AbstractDifficulty} from "../../abstract_difficulty.ts";
import { ObjectPathAnimationData } from '../../../../types/animation/properties/object.ts'

export abstract class BeatmapGameplayObject<
    TV2 extends IV2GameplayObject = IV2GameplayObject,
    TV3 extends IV3GameplayObject = IV3GameplayObject,
> extends BeatmapObject<TV2, TV3> implements GameplayObjectSetters, GameplayObjectGetters {
    constructor(
        parentDifficulty: AbstractDifficulty,
        obj: GameplayObjectConstructor<BeatmapGameplayObject<TV2, TV3>>,
    ) {
        super(parentDifficulty, obj as BeatmapObjectConstructor<BeatmapGameplayObject<TV2, TV3>>)
        this.animation = obj.animation ?? copy(BeatmapGameplayObject.defaults.animation)
        this.x = obj.x ?? BeatmapGameplayObject.defaults.x
        this.y = obj.y ?? BeatmapGameplayObject.defaults.y
        this.track = new Track(obj.track)
        this.coordinates = obj.coordinates
        this.worldRotation = obj.worldRotation
        this.localRotation = obj.localRotation
        this.scale = obj.scale
        this.noteJumpMovementSpeed = obj.noteJumpMovementSpeed
        this.noteJumpStartBeatOffset = obj.noteJumpStartBeatOffset
        this.uninteractable = obj.uninteractable
        this.chromaColor = obj.chromaColor

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
    /** The animation object on the object. */
    animation: ObjectPathAnimationData
    /** The track of this object.
     * Uses a wrapper that simplifies single strings and arrays.
     */
    track: Track
    /** Noodle Extensions offset coordinates for this object on the grid. */
    coordinates?: Vec2
    /** The rotation added to an object around the world origin. */
    worldRotation?: Vec3
    /** The rotation added to an object around it's anchor point. */
    localRotation?: Vec3
    /** The scale of the object. */
    scale?: Vec3
    /** The speed of this object in units (meters) per second. */
    noteJumpMovementSpeed?: number
    /** The offset added to the position where this object "jumps" in. */
    noteJumpStartBeatOffset?: number
    /** Whether this object is uninteractable with the player. */
    uninteractable?: boolean
    /** The chroma color of the object. */
    chromaColor?: ColorVec

    static override defaults: GameplayObjectDefaults<BeatmapGameplayObject> = {
        x: 0,
        y: 0,
        animation: {},
        track: new Track(),
        ...super.defaults,
    }

    /** The speed of this object in units (meters) per second.
     * Refers to the difficulty if undefined. */
    get implicitNoteJumpMovementSpeed() {
        return this.noteJumpMovementSpeed ?? this.parent.difficultyInfo.noteJumpMovementSpeed
    }

    /** The offset added to the position where this object "jumps" in.
     * Refers to the difficulty if undefined. */
    get implicitNoteJumpStartBeatOffset() {
        return this.noteJumpStartBeatOffset ?? this.parent.difficultyInfo.noteJumpStartBeatOffset
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Duration is the time in beats that the object will be jumping for.
     * This function will output half of this, so it will end when the note is supposed to be hit.
     */
    get halfJumpDuration() {
        return getJumps(
            this.implicitNoteJumpMovementSpeed,
            this.implicitNoteJumpStartBeatOffset,
            this.parent.pipeline.info.audio.beatsPerMinute,
        ).halfDuration
    }
    set halfJumpDuration(value: number) {
        this.noteJumpStartBeatOffset = getOffsetFromHalfJumpDuration(
            value,
            this.implicitNoteJumpMovementSpeed,
            this.parent.pipeline.info.audio.beatsPerMinute,
        )
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
     */
    get jumpDistance() {
        return getJumps(
            this.implicitNoteJumpMovementSpeed,
            this.implicitNoteJumpStartBeatOffset,
            this.parent.pipeline.info.audio.beatsPerMinute,
        ).jumpDistance
    }
    set jumpDistance(value: number) {
        this.noteJumpStartBeatOffset = getOffsetFromJumpDistance(
            value,
            this.implicitNoteJumpMovementSpeed,
            this.parent.pipeline.info.audio.beatsPerMinute,
        )
    }

    /** This is the amount of time in milliseconds the player has to react from the object spawning. */
    get reactionTime() {
        return getReactionTime(
            this.implicitNoteJumpMovementSpeed,
            this.implicitNoteJumpStartBeatOffset,
            this.parent.pipeline.info.audio.beatsPerMinute,
        )
    }
    set reactionTime(value: number) {
        this.noteJumpStartBeatOffset = getOffsetFromReactionTime(
            value,
            this.implicitNoteJumpMovementSpeed,
            this.parent.pipeline.info.audio.beatsPerMinute,
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
        this.noteJumpStartBeatOffset = getOffsetFromHalfJumpDuration(
            value / 2,
            this.implicitNoteJumpMovementSpeed,
            this.parent.pipeline.info.audio.beatsPerMinute,
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

    /** The time of the end of the object's lifespan.
     * Calculated based on the beats per minute, and the note jump speed.
     */
    get lifeEnd() {
        return this.beat + this.life / 2
    }
    set lifeEnd(value: number) {
        this.beat = value - this.life / 2
    }

    /** Determines whether this object uses Noodle Extensions features. */
    get isGameplayModded() {
        if (this.coordinates) return true
        if (this.worldRotation) return true
        if (this.localRotation) return true
        if (this.noteJumpMovementSpeed !== undefined) return true
        if (this.noteJumpStartBeatOffset !== undefined) return true
        return !!this.uninteractable;
    }

    protected getForcedOffset() {
        if (settings.forceNoteJumpStartBeatOffset) {
            return this.noteJumpStartBeatOffset ?? this.parent.difficultyInfo.noteJumpStartBeatOffset
        } else {
            return this.noteJumpStartBeatOffset
        }
    }

    protected getForcedNJS() {
        if (settings.forceNoteJumpMovementSpeed) {
            return this.noteJumpMovementSpeed ?? this.parent.difficultyInfo.noteJumpMovementSpeed
        } else {
            return this.noteJumpMovementSpeed
        }
    }

    override fromJsonV3(json: TV3): this {
        this.x = json.x ?? BeatmapGameplayObject.defaults.x
        this.y = json.y ?? BeatmapGameplayObject.defaults.y
        this.animation = getCDProp(json, 'animation') as ObjectPathAnimationData | undefined ?? copy(BeatmapGameplayObject.defaults.animation)
        this.chromaColor = getCDProp(json, 'color') as ColorVec
        this.coordinates = getCDProp(json, 'coordinates')
        this.uninteractable = getCDProp(json, 'uninteractable')
        this.localRotation = getCDProp(json, 'localRotation')
        this.worldRotation = typeof json.customData?.worldRotation === 'number'
            ? [0, getCDProp(json, 'worldRotation'), 0]
            : getCDProp(json, 'worldRotation')
        this.scale = getCDProp(json, 'scale')
        this.track = new Track(getCDProp(json, 'track'))
        this.noteJumpMovementSpeed = getCDProp(json, 'noteJumpMovementSpeed')
        this.noteJumpStartBeatOffset = getCDProp(json, 'noteJumpStartBeatOffset')
        return super.fromJsonV3(json)
    }

    override fromJsonV2(json: TV2): this {
        this.x = json._lineIndex ?? BeatmapGameplayObject.defaults.x
        const animationProp = getCDProp(json, '_animation')
        this.animation = animationProp ? animationV2ToV3(animationProp) : copy(BeatmapGameplayObject.defaults.animation)
        this.chromaColor = getCDProp(json, '_color') as ColorVec
        this.coordinates = getCDProp(json, '_position')
        this.uninteractable = importInvertedBoolean(getCDProp(json, '_interactable'))
        this.localRotation = getCDProp(json, '_localRotation')
        this.worldRotation = typeof json._customData?._rotation === 'number'
            ? [0, getCDProp(json, '_rotation'), 0] as Vec3
            : getCDProp(json, '_rotation') as Vec3
        // No scale in V2
        this.track = new Track(getCDProp(json, '_track'))
        this.noteJumpMovementSpeed = getCDProp(json, '_noteJumpMovementSpeed')
        this.noteJumpStartBeatOffset = getCDProp(json, '_noteJumpStartBeatOffset')
        return super.fromJsonV2(json)
    }
}
