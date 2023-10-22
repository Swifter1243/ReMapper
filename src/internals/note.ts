import { bsmap } from '../deps.ts'

import { NoteCut, NoteType } from '../data/constants.ts'
import { getActiveDiff } from '../data/beatmap_handler.ts'

import { BaseGameplayObject, BaseNote, ExcludedObjectFields } from './object.ts'
import { copy } from '../utils/general.ts'
import { animationToJson } from './animation.ts'
import { Bomb } from './bomb.ts'
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
                angleOffset: obj.a
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.INote

            const params = {
                type: obj._type,
                direction: obj._cutDirection,
            } as Params

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
                    disableNoteGravity: this.noteGravity ? undefined : true,
                    disableNoteLook: this.noteLook ? undefined : true,
                    spawnEffect: this.spawnEffect ? undefined : false,
                    color: this.color,
                    coordinates: this.coordinates,
                    localRotation: this.localRotation,
                    noteJumpMovementSpeed: this.NJS,
                    noteJumpStartBeatOffset: this.offset,
                    track: this.track.value,
                    uninteractable: this.interactable ? undefined : true,
                    worldRotation: this.rotation,
                    link: this.link,
                    disableBadCutDirection: this.directionBadCut
                        ? undefined
                        : true,
                    disableBadCutSpeed: this.speedBadCut ? undefined : true,
                    disableBadCutSaberType: this.saberTypeBadCut
                        ? undefined
                        : true,
                    disableDebris: this.debris ? undefined : true,
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
                _disableNoteGravity: this.noteGravity ? undefined : true,
                _disableNoteLook: this.noteLook ? undefined : true,
                _disableSpawnEffect: this.spawnEffect ? undefined : true,
                _color: this.color,
                _position: this.coordinates,
                _localRotation: this.localRotation,
                _noteJumpMovementSpeed: this.NJS,
                _noteJumpStartBeatOffset: this.offset,
                _track: this.track.value,
                _interactable: this.interactable ? undefined : false,
                _rotation: this.rotation,
                _fake: this.fake ? true : undefined,
                _cutDirection: this.angleOffset, //?
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
    }
}
