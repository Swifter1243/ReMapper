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
                    disableNoteGravity: defaultBoolean(this.disableNoteGravity, false),
                    disableNoteLook: defaultBoolean(this.disableNoteLook, false),
                    spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, true),
                    noteJumpMovementSpeed: NJS,
                    noteJumpStartBeatOffset: offset,
                    uninteractable: defaultBoolean(this.uninteractable, false),
                    localRotation: this.localRotation,
                    color: this.color,
                    coordinates: this.coordinates,
                    track: this.track.value,
                    worldRotation: this.worldRotation,
                    link: this.link,
                    disableBadCutDirection: defaultBoolean(this.disableBadCutDirection, false),
                    disableBadCutSpeed: defaultBoolean(this.disableBadCutSpeed, false),
                    disableBadCutSaberType: defaultBoolean(this.disableBadCutSaberType, false),
                    disableDebris: defaultBoolean(this.disableDebris, false),
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
                _interactable: exportInvertedBoolean(this.uninteractable, true),
                _fake: defaultBoolean(this.fake, false),
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.worldRotation,
                _track: this.track.value,
                _disableNoteGravity: defaultBoolean(this.disableNoteGravity, false),
                _disableNoteLook: defaultBoolean(this.disableNoteLook, false),
                _disableSpawnEffect: defaultBoolean(this.disableSpawnEffect, false),
                ...this.customData,
            },
        } as bsmap.v2.INote
        return prune ? jsonPrune(output) : output
    }
}