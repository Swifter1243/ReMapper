import { activeDiff, getActiveDiff, settings } from "../data/beatmap_handler.ts";
import { bsmap } from "../deps.ts";
import { copy } from "../utils/general.ts";
import { jsonPrune } from "../utils/json.ts";
import { animationToJson } from "./animation.ts";
import { BaseNote, ExcludedObjectFields, defaultBoolean, exportInvertedBoolean } from "./object.ts";

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
    /**
     * Bomb object for ease of creation.
     * @param beat The time this bomb will reach the player.
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
        getActiveDiff().bombs.push(clone ? copy(this) : this)
        return this
    }

    // TODO: Move to base note class
    toJson(v3: true, prune?: boolean): bsmap.v3.IBombNote
    toJson(v3: false, prune?: boolean): bsmap.v2.INote
    toJson(v3 = true, prune = true): bsmap.v2.INote | bsmap.v3.IBombNote {
        const diff = activeDiff
        const NJS = this.NJS
        let offset = this.offset

        if (diff && settings.forceJumpsForNoodle && this.isGameplayModded) {
            offset ??= diff.offset
        }

        if (v3) {
            const output = {
                b: this.beat,
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
                    noteJumpMovementSpeed: NJS,
                    noteJumpStartBeatOffset: offset,
                    uninteractable: exportInvertedBoolean(this.interactable, false),
                    localRotation: this.localRotation,
                    color: this.color,
                    coordinates: this.coordinates,
                    track: this.track.value,
                    worldRotation: this.worldRotation,
                    spawnEffect: defaultBoolean(this.spawnEffect, true),
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
                _interactable: defaultBoolean(this.interactable, true),
                _fake: defaultBoolean(this.fake, false),
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.worldRotation,
                _track: this.track.value,
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
                ...this.customData,
            },
        } as bsmap.v2.INote
        return prune ? jsonPrune(output) : output
    }
}