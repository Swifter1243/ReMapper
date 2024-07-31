import { bsmap } from "../../../../deps.ts";
import {copy} from "../../../../utils/object/copy.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {getActiveDifficulty} from "../../../../data/active_difficulty.ts";
import {animationV3toV2} from "../../../../utils/animation/json.ts";

import {BaseNote} from "./base_note.ts";
import {exportInvertedBoolean} from "../../../../utils/beatmap/json.ts";
import {GameplayObjectConstructor} from "../../../../types/beatmap/object/gameplay_object.ts";

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
    constructor(
        fields: GameplayObjectConstructor<Bomb>,
    ) {
        super(fields)
    }

    push(clone = true) {
        getActiveDifficulty().bombs.push(clone ? copy(this) : this)
        return this
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBombNote {
        const output = {
            b: this.beat,
            x: this.x,
            y: this.y,
            customData: {
                animation: this.animation as bsmap.v3.IAnimation['animation'],
                flip: this.flip,
                disableNoteGravity: this.disableNoteGravity,
                disableNoteLook: this.disableNoteLook,
                spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, true),
                noteJumpMovementSpeed: this.noteJumpSpeed,
                noteJumpStartBeatOffset: this.getForcedOffset(),
                uninteractable: this.uninteractable,
                localRotation: this.localRotation,
                color: this.chromaColor,
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
        } satisfies bsmap.v3.IBombNote
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.INote {
        const output = {
            _cutDirection: 0,
            _lineIndex: this.x,
            _lineLayer: this.y,
            _time: this.beat,
            _type: 3,
            _customData: {
                _animation: animationV3toV2(this.animation),
                _flip: this.flip,
                _color: this.chromaColor,
                _noteJumpMovementSpeed: this.noteJumpSpeed,
                _noteJumpStartBeatOffset: this.getForcedOffset(),
                _interactable: this.uninteractable,
                _fake: this.fake,
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.worldRotation,
                _track: this.track.value,
                _disableNoteGravity: this.disableNoteGravity,
                _disableNoteLook: this.disableNoteLook,
                _disableSpawnEffect: this.disableSpawnEffect,
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
        return prune ? objectPrune(output) : output
    }
}