import { bsmap } from '../deps.ts'

import { NoteCut, NoteType } from '../data/constants.ts'
import { getActiveDiff } from '../data/beatmap_handler.ts'

import {
    BaseNote,
    defaultBoolean,
    ExcludedObjectFields,
    exportInvertedBoolean,
} from './object.ts'
import { copy } from '../utils/general.ts'
import { animationToJson } from './animation.ts'
import { SubclassExclusiveProps } from '../mod.ts'

export { Bomb } from './bomb.ts'
export { Arc } from './arc.ts'
export { Chain } from './chain.ts'

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
        getActiveDiff().notes.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.IColorNote, v3: true): this
    fromJson(json: bsmap.v2.INote, v3: false): this
    fromJson(json: bsmap.v3.IColorNote | bsmap.v2.INote, v3: boolean): this {
        type Params = SubclassExclusiveProps<
            Note,
            BaseNote<bsmap.v3.IColorNote | bsmap.v3.IBombNote>
        >

        if (v3) {
            const obj = json as bsmap.v3.IColorNote

            const params = {
                type: obj.c,
                direction: obj.d,
                angleOffset: obj.a,
            } satisfies Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.INote

            const params = {
                type: obj._type,
                direction: obj._cutDirection,
            } satisfies Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
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
                x: this.x,
                y: this.y,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    flip: this.flip,
                    disableNoteGravity: exportInvertedBoolean(
                        this.noteGravity,
                        false,
                    ),
                    disableNoteLook: exportInvertedBoolean(
                        this.noteLook,
                        false,
                    ),
                    spawnEffect: defaultBoolean(this.spawnEffect, true),
                    color: this.color,
                    coordinates: this.coordinates,
                    localRotation: this.localRotation,
                    noteJumpMovementSpeed: this.NJS,
                    noteJumpStartBeatOffset: this.offset,
                    track: this.track.value,
                    uninteractable: exportInvertedBoolean(
                        this.interactable,
                        false,
                    ),
                    worldRotation: this.rotation,
                    link: this.link,
                    disableBadCutDirection: exportInvertedBoolean(
                        this.directionBadCut,
                        false,
                    ),
                    disableBadCutSpeed: exportInvertedBoolean(
                        this.speedBadCut,
                        false,
                    ),
                    disableBadCutSaberType: exportInvertedBoolean(
                        this.saberTypeBadCut,
                        false,
                    ),
                    disableDebris: exportInvertedBoolean(this.debris, false),
                    ...this.customData,
                },
            } satisfies bsmap.v3.IColorNote
        }

        return {
            _cutDirection: this.direction,
            _lineIndex: this.x,
            _lineLayer: this.y,
            _time: this.time,
            _type: this.type,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _flip: this.flip,
                _disableNoteGravity: exportInvertedBoolean(
                    this.noteGravity,
                    false,
                ),
                _disableNoteLook: exportInvertedBoolean(
                    this.noteLook,
                    false,
                ),
                _disableSpawnEffect: exportInvertedBoolean(
                    this.spawnEffect,
                    false,
                ),
                _color: this.color,
                _position: this.coordinates,
                _localRotation: this.localRotation,
                _noteJumpMovementSpeed: this.NJS,
                _noteJumpStartBeatOffset: this.offset,
                _track: this.track.value,
                _interactable: defaultBoolean(this.interactable, true),
                _rotation: this.rotation,
                _fake: defaultBoolean(this.fake, false),
                _cutDirection: this.angleOffset, //?
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
    }
}
