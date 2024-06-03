import { activeDifficulty, getActiveDifficulty, settings } from "../data/beatmap_handler.ts";
import { bsmap } from "../deps.ts";
import { copy } from "../utils/general.ts";
import { jsonPrune } from "../utils/json.ts";
import { animationToJson } from "./animation.ts";
import { BaseNote, ExcludedObjectFields, defaultBoolean, exportInvertedBoolean } from "./object.ts";

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
    constructor(
        fields: ExcludedObjectFields<Bomb>,
    ) {
        super(fields)
    }

    push(clone = true) {
        getActiveDifficulty().bombs.push(clone ? copy(this) : this)
        return this
    }

    // TODO: Move to base note class
    toJson(v3: true, prune?: boolean): bsmap.v3.IBombNote
    toJson(v3: false, prune?: boolean): bsmap.v2.INote
    toJson(v3 = true, prune = true): bsmap.v2.INote | bsmap.v3.IBombNote {
        const diff = activeDifficulty
        const NJS = this.noteJumpSpeed
        let offset = this.noteJumpOffset

        if (diff && settings.forceJumpsForNoodle && this.isGameplayModded) {
            offset ??= diff.noteJumpOffset
        }

        if (v3) {
            const output = {
                b: this.beat,
                x: this.x,
                y: this.y,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    flip: this.flip,
                    disableNoteGravity: this.disableNoteGravity,
                    disableNoteLook: this.disableNoteLook,
                    spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, false),
                    noteJumpMovementSpeed: NJS,
                    noteJumpStartBeatOffset: offset,
                    uninteractable: this.uninteractable,
                    localRotation: this.localRotation,
                    color: this.color,
                    coordinates: this.coordinates,
                    track: this.track.value,
                    worldRotation: this.worldRotation,
                    link: this.link,
                    disableBadCutDirection: this.disableBadCutDirection,
                    disableBadCutSpeed: this.disableBadCutSpeed,
                    disableBadCutSaberType: this.disableBadCutSaberType,
                    disableDebris: this.disableDebris,
                    ...this.customData,
                },
            } as bsmap.v3.IBombNote
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _cutDirection: 0,
            _lineIndex: this.x,
            _lineLayer: this.y,
            _time: this.beat,
            _type: 3,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _flip: this.flip,
                _color: this.color,
                _noteJumpMovementSpeed: NJS,
                _noteJumpStartBeatOffset: offset,
                _interactable: this.uninteractable,
                _fake: defaultBoolean(this.fake, false),
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.worldRotation,
                _track: this.track.value,
                _disableNoteGravity: this.disableNoteGravity,
                _disableNoteLook: this.disableNoteLook,
                _disableSpawnEffect: this.disableSpawnEffect,
                ...this.customData,
            },
        } as bsmap.v2.INote
        return prune ? jsonPrune(output) : output
    }
}