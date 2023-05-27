import {bsmap} from "../deps.ts";

import {activeDiffGet} from "../data/beatmap_handler.ts";

import {wallAnimation} from "../animation/animation.ts";


import {BaseGameplayObject} from "./object.ts";
import {Fields} from "../types/util_types.ts";
import {Vec3} from "../types/data_types.ts";

export class Wall
    extends BaseGameplayObject<bsmap.v2.IObstacle, bsmap.v3.IObstacle> {
    toJson(v3: true): bsmap.v3.IObstacle
    toJson(v3: false): bsmap.v2.IObstacle
    toJson(v3: boolean): bsmap.v2.IObstacle | bsmap.v3.IObstacle {
        if (v3) {
            return {
                b: this.time,
                d: this.duration,
                h: this.height,
                w: this.width,
                x: this.lineIndex,
                y: this.lineLayer,
                customData: {
                    animation: this.animation.toJson(v3),
                    size: this.scale,
                    noteJumpMovementSpeed: this.localNJS,
                    noteJumpStartBeatOffset: this.localBeatOffset,
                    localRotation: this.localRotation,
                    coordinates: this.coordinates,
                    worldRotation: this.rotation,
                    track: this.track.value,
                    color: this.color,
                    uninteractable: !(this.interactable ?? false),
                    fake: this.fake ?? true,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IObstacle
        }

        return {
            _duration: this.duration,
            _lineIndex: this.lineIndex,
            _time: this.time,
            _type: 0,
            _width: this.width,
            _customData: {
                _animation: this.animation.toJson(v3),
                _scale: this.scale,
                _noteJumpMovementSpeed: this.localNJS,
                _noteJumpStartBeatOffset: this.localBeatOffset,
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.rotation,
                _track: this.track.value,
                _color: this.color,
                _interactable: this.interactable ?? false,
                _fake: this.fake ?? true,
                ...this.customData,
            },
        } satisfies bsmap.v2.IObstacle
    }

    constructor(
        fields: Partial<Fields<Wall>>,
    ) {
        super(fields, wallAnimation())
    }

    /**
     * Push this wall to the difficulty.
     * @param fake Whether this wall will be pushed to the fakeWalls array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        activeDiffGet().walls.push(clone ? structuredClone(this) : this)
        return this
    }

    /** The duration of the wall. */
    duration = 0
    /** The height of the wall. */
    height = 1
    /** The width of the wall. */
    width = 1
    /** The scale of the wall. */
    scale?: Vec3

    get life() {
        return this.halfJumpDur * 2 + this.duration
    }

    get lifeStart() {
        return this.time - this.halfJumpDur
    }

    set life(value: number) {
        this.duration = value - (this.halfJumpDur * 2)
    }

    set lifeStart(value: number) {
        this.time = value + this.halfJumpDur
    }
}