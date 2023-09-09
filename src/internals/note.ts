import { bsmap } from '../deps.ts'

import { AnchorMode, NoteCut, NoteType } from '../data/constants.ts'
import { activeDiffGet } from '../data/beatmap_handler.ts'

import {
    BaseGameplayObject,
    BaseSliderObject,
    ExcludedObjectFields,
} from './object.ts'
import { Vec2 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import { animationToJson, NoteAnimationData } from './animation.ts'

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
        this.flip = fields.flip
        this.noteGravity = fields.noteGravity
        this.noteLook = fields.noteLook
        this.spawnEffect = fields.spawnEffect
    }

    declare animation: NoteAnimationData

    /** Specifies an initial position the note will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
    noteGravity?: boolean
    /** Whether this note will look at the player. */
    noteLook?: boolean
    /** Whether this note will have a spawn effect. */
    spawnEffect?: boolean

    /**
     * Push this note to the difficulty.
     * @param fake Whether this note will be pushed to the fakeNotes array.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void
}

export class Note extends BaseNote<bsmap.v3.IColorNote> {
    /**
     * Note object for ease of creation.
     * @param time Time this note will be hit.
     * @param type The color of the note.
     * @param direction The direction the note will be cut.
     * @param x The lane of the note.
     * @param y The vertical row of the note.
     */
    constructor(
        fields: ExcludedObjectFields<Note>,
    ) {
        super(fields)
        this.type = fields.type ?? 0
        this.direction = fields.direction ?? 0
        this.angleOffset = fields.angleOffset ?? 0
    }

    /** The color of the note. */
    type: NoteType
    /** The direction the note will be cut. */
    direction: NoteCut
    /** The angle added to the note's rotation. */
    angleOffset: number

    /**
     * Push this note to the difficulty.
     * @param fake Whether this note will be pushed to the fakeNotes array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        activeDiffGet().notes.push(clone ? copy(this) : this)
        return this
    }

    toJson(v3: true): bsmap.v3.IColorNote
    toJson(v3: false): bsmap.v2.INote
    toJson(v3 = true): bsmap.v2.INote | bsmap.v3.IColorNote {
        if (v3) {
            return {
                a: Math.round(this.angleOffset),
                b: this.time,
                c: this.type,
                d: this.direction,
                x: this.lineIndex,
                y: this.lineLayer,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    flip: this.flip,
                    disableNoteGravity: this.noteGravity !== undefined
                        ? !this.noteGravity
                        : undefined,
                    disableNoteLook: this.noteLook !== undefined
                        ? !this.noteLook
                        : undefined,
                    spawnEffect: this.spawnEffect,
                    color: this.color,
                    coordinates: this.coordinates,
                    localRotation: this.localRotation,
                    noteJumpMovementSpeed: this.localNJS,
                    noteJumpStartBeatOffset: this.localOffset,
                    track: this.track.value,
                    uninteractable: this.interactable !== undefined
                        ? !this.interactable
                        : undefined,
                    worldRotation: this.rotation,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IColorNote
        }

        return {
            _cutDirection: this.direction,
            _lineIndex: this.lineIndex,
            _lineLayer: this.lineLayer,
            _time: this.time,
            _type: this.type,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _flip: this.flip,
                _disableNoteGravity: this.noteGravity !== undefined
                    ? !this.noteGravity
                    : undefined,
                _disableNoteLook: this.noteLook !== undefined
                    ? !this.noteLook
                    : undefined,
                _disableSpawnEffect: this.spawnEffect !== undefined
                    ? !this.spawnEffect
                    : undefined,
                _color: this.color,
                _position: this.coordinates,
                _localRotation: this.localRotation,
                _noteJumpMovementSpeed: this.localNJS,
                _noteJumpStartBeatOffset: this.localOffset,
                _track: this.track.value,
                _interactable: this.interactable,
                _rotation: this.rotation,
                _fake: this.fake,
                _cutDirection: this.angleOffset, //?
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
    }
}

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
    /**
     * Bomb object for ease of creation.
     * @param time The time this bomb will reach the player.
     * @param x The lane of the note.
     * @param y The vertical row of the note.
     */
    // time = 0, x = 0, y = 0
    constructor(
        fields: ExcludedObjectFields<Bomb>,
    ) {
        super(fields)
    }

    /**
     * Push this bomb to the difficulty.
     * @param fake Whether this bomb will be pushed to the fakeBombs array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        activeDiffGet().bombs.push(clone ? copy(this) : this)
        return this
    }

    // TODO: Move to base note class
    toJson(v3: true): bsmap.v3.IBombNote
    toJson(v3: false): bsmap.v2.INote
    toJson(v3 = true): bsmap.v2.INote | bsmap.v3.IBombNote {
        if (v3) {
            return {
                b: this.time,
                x: this.lineIndex,
                y: this.lineLayer,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    flip: this.flip,
                    disableNoteLook: !this.noteLook,
                    disableNoteGravity: !this.noteGravity,

                    spawnEffect: this.spawnEffect,

                    ...this.customData,
                },
            } satisfies bsmap.v3.IBombNote
        }

        return {
            _cutDirection: 0,
            _lineIndex: this.lineIndex,
            _lineLayer: this.lineLayer,
            _time: this.time,
            _type: 3,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _flip: this.flip,
                _disableNoteGravity: !this.noteGravity,
                _disableNoteLook: !this.noteLook,
                _disableSpawnEffect: !this.spawnEffect,
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
    }
}

export class Chain extends BaseSliderObject<bsmap.v3.IChain> {
    /**
     * Chain object for ease of creation.
     * @param time The time this chain will be hit.
     * @param tailTime The time that the tail of the chain reaches the player.
     * @param type The color of the chain.
     * @param direction The cut direction of the chain.
     * @param x The lane of the chain.
     * @param y The vertical row of the chain.
     * @param tailX The lane of the chain's tail.
     * @param tailY The vertical row of the chain's tail.
     * @param links The amount of links in the chain.
     */
    constructor(
        fields: ExcludedObjectFields<Chain>,
    ) {
        super(fields as ExcludedObjectFields<Chain>)
        this.links = fields.links ?? 4
        this.squish = fields.squish ?? 0
        this.flip = fields.flip
        this.noteGravity = fields.noteGravity
        this.noteLook = fields.noteLook
    }

    /**
     * Push this chain to the difficulty.
     * @param fake Whether this chain will be pushed to the fakeChains array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        activeDiffGet().chains.push(clone ? copy(this) : this)
        return this
    }

    toJson(v3: true): bsmap.v3.IChain
    toJson(v3: false): never
    toJson(v3 = true): bsmap.v3.IChain {
        if (!v3) throw 'V2 is not supported for chains'

        return {
            b: this.time,
            c: this.type,
            d: this.headDirection,
            sc: this.links,
            s: this.squish,
            tb: this.tailTime,
            tx: this.tailX,
            ty: this.tailY,
            x: this.lineIndex,
            y: this.lineLayer,
            customData: {
                animation: animationToJson(this.animation, v3),
                color: this.color,
                coordinates: this.coordinates,
                tailCoordinates: this.tailCoordinates,
                flip: this.flip,
                noteJumpMovementSpeed: this.localNJS,
                noteJumpStartBeatOffset: this.localOffset,
                uninteractable: !this.interactable,
                localRotation: this.localRotation,
                disableNoteGravity: !this.noteGravity,
                disableNoteLook: !this.noteLook,
                track: this.track.value,
                worldRotation: this.rotation,
                ...this.customData,
            },
        } satisfies bsmap.v3.IChain
    }

    /** The amount of links in the chain. */
    links: number
    /** An interpolation or extrapolation of the path between the head and tail. */
    squish: number
    /** Specifies an initial position the chain will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
    noteGravity?: boolean
    /** Whether this chain will look at the player. */
    noteLook?: boolean
}

export class Arc extends BaseSliderObject<bsmap.v3.IArc> {
    /**
     * Arc object for ease of creation.
     * @param time The time this arc will be hit.
     * @param tailTime The time that the tail of the arc reaches the player.
     * @param type The color of the arc.
     * @param headDirection The cut direction of the head of the arc.
     * @param tailDirection The cut direction of the tail of the arc.
     * @param x The lane of the arc.
     * @param y The vertical row of the arc.
     * @param tailX The lane of the arc's tail.
     * @param tailY The vertical row of the arc's tail.
     */
    constructor(
        fields: ExcludedObjectFields<Arc>,
    ) {
        super(fields as ExcludedObjectFields<Arc>)
        this.tailDirection = fields.tailDirection ?? NoteCut.DOT
        this.headLength = fields.headLength ?? 0
        this.tailLength = fields.tailLength ?? 0
        this.anchorMode = fields.anchorMode ?? AnchorMode.STRAIGHT
        this.flip = fields.flip
        this.noteGravity = fields.noteGravity
    }

    toJson(v3: true): bsmap.v3.IArc
    toJson(v3: false): never
    toJson(v3 = true): bsmap.v3.IArc {
        if (!v3) throw 'V2 is not supported for chains'

        return {
            b: this.time,
            c: this.type,
            d: this.headDirection,

            m: this.anchorMode,
            mu: this.headLength,
            tmu: this.tailLength,
            tc: this.tailDirection,

            tb: this.tailTime,
            tx: this.tailX,
            ty: this.tailY,
            x: this.lineIndex,
            y: this.lineLayer,
            customData: {
                animation: animationToJson(this.animation, v3),
                color: this.color,
                coordinates: this.coordinates,
                tailCoordinates: this.tailCoordinates,
                flip: this.flip,
                noteJumpMovementSpeed: this.localNJS,
                noteJumpStartBeatOffset: this.localOffset,
                uninteractable: !this.interactable,
                localRotation: this.localRotation,
                disableNoteGravity: !this.noteGravity,
                track: this.track.value,
                worldRotation: this.rotation,
                ...this.customData,
            },
        } satisfies bsmap.v3.IArc
    }

    /**
     * Push this arc to the difficulty
     */
    push(clone = true) {
        activeDiffGet().arcs.push(clone ? copy(this) : this)
        return this
    }

    /** The cut direction of the tail of the arc. */
    tailDirection: NoteCut
    /** Multiplier for the distance the start of the arc shoots outward. */
    headLength: number
    /** Multiplier for the distance the end of the arc shoots outward. */
    tailLength: number
    /** How the arc curves from the head to the midpoint. */
    anchorMode: AnchorMode
    /** Specifies an initial position the arc will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
    noteGravity?: boolean
}
