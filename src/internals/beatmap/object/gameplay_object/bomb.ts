import { bsmap } from "../../../../deps.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {animationV3toV2} from "../../../../utils/animation/json.ts";

import {BaseNote} from "./base_note.ts";
import {exportInvertedBoolean, simplifyWorldRotation} from "../../../../utils/beatmap/json.ts";
import {GameplayObjectConstructor} from "../../../../types/beatmap/object/gameplay_object.ts";
import {AbstractDifficulty} from "../../abstract_difficulty.ts";

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
    constructor(
        parentDifficulty: AbstractDifficulty,
        fields: GameplayObjectConstructor<Bomb>,
    ) {
        super(parentDifficulty, fields)
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.bombs as this[]
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
                noteJumpMovementSpeed: this.getForcedNJS(),
                noteJumpStartBeatOffset: this.getForcedOffset(),
                uninteractable: this.uninteractable,
                localRotation: this.localRotation,
                color: this.chromaColor,
                coordinates: this.coordinates,
                track: this.track.value,
                worldRotation: simplifyWorldRotation(this.worldRotation),
                link: this.link,
                disableBadCutDirection: this.disableBadCutDirection,
                disableBadCutSpeed: this.disableBadCutSpeed,
                disableBadCutSaberType: this.disableBadCutSaberType,
                disableDebris: this.disableDebris,
                ...this.unsafeCustomData,
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
                _noteJumpMovementSpeed: this.getForcedNJS(),
                _noteJumpStartBeatOffset: this.getForcedOffset(),
                _interactable: this.uninteractable,
                _fake: this.fake,
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: simplifyWorldRotation(this.worldRotation),
                _track: this.track.value,
                _disableNoteGravity: this.disableNoteGravity,
                _disableNoteLook: this.disableNoteLook,
                _disableSpawnEffect: this.disableSpawnEffect,
                ...this.unsafeCustomData,
            },
        } satisfies bsmap.v2.INote
        return prune ? objectPrune(output) : output
    }
}