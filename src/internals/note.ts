import { bsmap } from '../deps.ts'

import { NoteCut, NoteColor } from '../data/constants.ts'
import { activeDifficulty, getActiveDifficulty } from '../data/beatmap_handler.ts'

import {
    BaseNote,
    defaultBoolean,
    ExcludedObjectFields,
    exportInvertedBoolean,
} from './object.ts'
import { copy } from '../utils/general.ts'
import { animationToJson } from './animation.ts'
import { jsonPrune, settings, SubclassExclusiveProps } from '../mod.ts'

export { Bomb } from './bomb.ts'
export { Arc } from './arc.ts'
export { Chain } from './chain.ts'

export class ColorNote extends BaseNote<bsmap.v3.IColorNote> {
    constructor(
        fields: ExcludedObjectFields<ColorNote>,
    ) {
        super(fields)
        this.type = fields.type ?? 0
        this.cutDirection = fields.cutDirection ?? 0
        this.angleOffset = fields.angleOffset ?? 0
    }

    /** The color of the note. */
    type: NoteColor
    /** The direction the note will be cut. */
    cutDirection: NoteCut
    /** The angle added to the note's rotation. */
    angleOffset: number

    push(clone = true) {
        getActiveDifficulty().colorNotes.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.IColorNote, v3: true): this
    fromJson(json: bsmap.v2.INote, v3: false): this
    fromJson(json: bsmap.v3.IColorNote | bsmap.v2.INote, v3: boolean): this {
        type Params = SubclassExclusiveProps<
            ColorNote,
            BaseNote<bsmap.v3.IColorNote | bsmap.v3.IBombNote>
        >

        if (v3) {
            const obj = json as bsmap.v3.IColorNote

            const params = {
                type: obj.c ?? 0,
                cutDirection: obj.d ?? 0,
                angleOffset: obj.a ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.INote

            const params = {
                type: obj._type as NoteColor,
                cutDirection: obj._cutDirection,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IColorNote
    toJson(v3: false, prune?: boolean): bsmap.v2.INote
    toJson(v3 = true, prune = true): bsmap.v2.INote | bsmap.v3.IColorNote {
        const diff = activeDifficulty
        const NJS = this.noteJumpSpeed
        let offset = this.noteJumpOffset

        if (diff && settings.forceJumpsForNoodle && this.isGameplayModded) {
            offset ??= diff.noteJumpOffset
        }

        if (v3) {
            const output = {
                a: Math.round(this.angleOffset),
                b: this.beat,
                c: this.type,
                d: this.cutDirection,
                x: this.x,
                y: this.y,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    flip: this.flip,
                    disableNoteGravity: this.disableNoteGravity,
                    disableNoteLook: this.disableNoteLook,
                    spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, false),
                    color: this.color,
                    coordinates: this.coordinates,
                    localRotation: this.localRotation,
                    noteJumpMovementSpeed: NJS,
                    noteJumpStartBeatOffset: offset,
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
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _cutDirection: this.cutDirection,
            _lineIndex: this.x,
            _lineLayer: this.y,
            _time: this.beat,
            _type: this.type,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _flip: this.flip,
                _disableNoteGravity: this.disableNoteGravity,
                _disableNoteLook: this.disableNoteLook,
                _disableSpawnEffect: this.disableSpawnEffect,
                _color: this.color,
                _position: this.coordinates,
                _localRotation: this.localRotation,
                _noteJumpMovementSpeed: NJS,
                _noteJumpStartBeatOffset: offset,
                _track: this.track.value,
                _interactable: exportInvertedBoolean(this.uninteractable, true),
                _rotation: this.worldRotation,
                _fake: defaultBoolean(this.fake, false),
                _cutDirection: this.angleOffset !== 0
                    ? this.angleOffset
                    : undefined,
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
        return prune ? jsonPrune(output) : output
    }
}
