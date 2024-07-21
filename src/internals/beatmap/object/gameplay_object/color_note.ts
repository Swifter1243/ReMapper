import { bsmap } from '../../../../deps.ts'

import {activeDifficulty, getActiveDifficulty} from "../../../../data/active_difficulty.ts";
import {animationToJson} from "../../../../utils/animation/json.ts";
import {NoteColor, NoteCut} from "../../../../data/constants/note.ts";
import {defaultBoolean, exportInvertedBoolean} from "../../../../utils/beatmap/object.ts";
import {ExcludedObjectFields} from "../../../../types/beatmap/object/object.ts";

import {BaseNote} from "./base_note.ts";
import { copy } from '../../../../utils/object/copy.ts'
import { SubclassExclusiveProps } from '../../../../types/util.ts'
import { settings } from '../../../../data/settings.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'

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
                    disableNoteGravity: defaultBoolean(this.disableNoteGravity, false),
                    disableNoteLook: defaultBoolean(this.disableNoteLook, false),
                    spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, true),
                    color: this.color,
                    coordinates: this.coordinates,
                    localRotation: this.localRotation,
                    noteJumpMovementSpeed: NJS,
                    noteJumpStartBeatOffset: offset,
                    track: this.track.value,
                    uninteractable: defaultBoolean(this.uninteractable, false),
                    worldRotation: this.worldRotation,
                    link: this.link,
                    disableBadCutDirection: defaultBoolean(this.disableBadCutDirection, false),
                    disableBadCutSpeed: defaultBoolean(this.disableBadCutSpeed, false),
                    disableBadCutSaberType: defaultBoolean(this.disableBadCutSaberType, false),
                    disableDebris: defaultBoolean(this.disableDebris, false),
                    ...this.customData,
                },
            } satisfies bsmap.v3.IColorNote
            return prune ? objectPrune(output) : output
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
                _disableNoteGravity: defaultBoolean(this.disableNoteGravity, false),
                _disableNoteLook: defaultBoolean(this.disableNoteLook, false),
                _disableSpawnEffect: defaultBoolean(this.disableSpawnEffect, false),
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
        return prune ? objectPrune(output) : output
    }
}
