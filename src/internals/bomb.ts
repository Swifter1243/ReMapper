import { getActiveDiff } from "../data/beatmap_handler.ts";
import { bsmap } from "../deps.ts";
import { copy } from "../utils/general.ts";
import { animationToJson } from "./animation.ts";
import { BaseNote, ExcludedObjectFields } from "./object.ts";

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
    /**
     * Bomb object for ease of creation.
     * @param time The time this bomb will reach the player.
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
    toJson(v3: true): bsmap.v3.IBombNote
    toJson(v3: false): bsmap.v2.INote
    toJson(v3 = true): bsmap.v2.INote | bsmap.v3.IBombNote {
        if (v3) {
            return {
                b: this.time,
                x: this.x,
                y: this.y,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    flip: this.flip,
                    disableNoteLook: this.noteLook ? undefined : true,
                    disableNoteGravity: this.noteGravity ? undefined : true,
                    spawnEffect: this.spawnEffect ? undefined : false,
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
            } satisfies bsmap.v3.IBombNote
        }

        return {
            _cutDirection: 0,
            _lineIndex: this.x,
            _lineLayer: this.y,
            _time: this.time,
            _type: 3,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _flip: this.flip,
                _disableNoteGravity: this.noteGravity ? undefined : true,
                _disableNoteLook: this.noteLook ? undefined : true,
                _disableSpawnEffect: this.spawnEffect ? undefined : false,
                ...this.customData,
            },
        } satisfies bsmap.v2.INote
    }
}