import { bsmap } from '../../../../deps.ts'

import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { animationV3toV2 } from '../../../../utils/animation/json.ts'
import { NoteColor, NoteCut } from '../../../../data/constants/note.ts'
import { BaseNote } from './base_note.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { exportInvertedBoolean } from '../../../../utils/beatmap/json.ts'
import { GameplayObjectDefaults, GameplayObjectConstructor } from '../../../../types/beatmap/object/gameplay_object.ts'

export class ColorNote extends BaseNote<bsmap.v3.IColorNote> {
    constructor(
        fields: GameplayObjectConstructor<ColorNote>,
    ) {
        super(fields)
        this.color = fields.color ?? 0
        this.cutDirection = fields.cutDirection ?? 0
        this.angleOffset = fields.angleOffset ?? 0
    }

    /** The color of the note. */
    color: NoteColor
    /** The direction the note will be cut. */
    cutDirection: NoteCut
    /** The angle added to the note's rotation. */
    angleOffset: number

    static defaults: GameplayObjectDefaults<ColorNote> = {
        color: NoteColor.RED,
        cutDirection: NoteCut.DOWN,
        angleOffset: 0,
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().colorNotes.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: bsmap.v3.IColorNote): this {
        this.color = json.c ?? ColorNote.defaults.color
        this.cutDirection = json.d ?? ColorNote.defaults.cutDirection
        this.angleOffset = json.a ?? ColorNote.defaults.angleOffset
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.INote): this {
        this.color = json._type as NoteColor | undefined ?? ColorNote.defaults.color
        this.cutDirection = json._cutDirection ?? ColorNote.defaults.cutDirection
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IColorNote {
        const output = {
            a: Math.round(this.angleOffset),
            b: this.beat,
            c: this.color,
            d: this.cutDirection,
            x: this.x,
            y: this.y,
            customData: {
                animation: this.animation as bsmap.v3.IAnimation['animation'],
                flip: this.flip,
                disableNoteGravity: this.disableNoteGravity,
                disableNoteLook: this.disableNoteLook,
                spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, true),
                color: this.chromaColor,
                coordinates: this.coordinates,
                localRotation: this.localRotation,
                noteJumpMovementSpeed: this.noteJumpSpeed,
                noteJumpStartBeatOffset: this.getForcedOffset(),
                track: this.track.value,
                uninteractable: this.uninteractable,
                worldRotation: this.worldRotation,
                link: this.link,
                disableBadCutDirection: this.disableBadCutDirection,
                disableBadCutSpeed: this.disableBadCutSpeed,
                disableBadCutSaberType: this.disableBadCutSaberType,
                disableDebris: this.disableDebris,
                ...this.customData,
            },
        } satisfies bsmap.v3.IColorNote
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.INote {
        const output = {
            _cutDirection: this.cutDirection,
            _lineIndex: this.x,
            _lineLayer: this.y,
            _time: this.beat,
            _type: this.color,
            _customData: {
                _animation: animationV3toV2(this.animation),
                _flip: this.flip,
                _disableNoteGravity: this.disableNoteGravity,
                _disableNoteLook: this.disableNoteLook,
                _disableSpawnEffect: this.disableSpawnEffect,
                _color: this.chromaColor,
                _position: this.coordinates,
                _localRotation: this.localRotation,
                noteJumpMovementSpeed: this.noteJumpSpeed,
                noteJumpStartBeatOffset: this.getForcedOffset(),
                _track: this.track.value,
                _interactable: exportInvertedBoolean(this.uninteractable, true),
                _rotation: this.worldRotation,
                _fake: this.fake,
                _cutDirection: this.angleOffset !== 0 ? this.angleOffset : undefined,
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
        return prune ? objectPrune(output) : output
    }
}
