import { bsmap } from '../../../../deps.ts'

import { objectPrune } from '../../../../utils/object/prune.ts'
import { animationV3toV2 } from '../../../../utils/animation/json.ts'
import { BeatmapGameplayObject } from './gameplay_object.ts'
import { AnimationSettings } from '../../../../utils/animation/optimizer.ts'
import { Vec3 } from '../../../../types/math/vector.ts'
import { AnimatedTransform } from '../../../../types/math/transform.ts'
import {exportInvertedBoolean, getCDProp, simplifyWorldRotation} from '../../../../utils/beatmap/json.ts'
import { setWallWorldTransform } from '../../../../utils/beatmap/object/wall/transform.ts'
import { GameplayObjectDefaults, GameplayObjectConstructor } from '../../../../types/beatmap/object/gameplay_object.ts'
import {AbstractDifficulty} from "../../abstract_difficulty.ts";

export class Wall extends BeatmapGameplayObject<bsmap.v2.IObstacle, bsmap.v3.IObstacle> {
    constructor(
        parentDifficulty: AbstractDifficulty,
        fields: GameplayObjectConstructor<Wall>,
    ) {
        super(parentDifficulty, fields)

        this.duration = fields.duration ?? Wall.defaults.duration
        this.height = fields.height ?? Wall.defaults.height
        this.width = fields.width ?? Wall.defaults.width
        this.size = fields.size
        this.fake = fields.fake

        if (fields.life !== undefined) {
            this.life = fields.life
        }
        if (fields.lifeStart !== undefined) {
            this.lifeStart = fields.lifeStart
        }
    }

    /** The duration of the wall. */
    duration: number
    /** The height of the wall. */
    height: number
    /** The width of the wall. */
    width: number
    /** The scale of the wall. */
    size?: Vec3
    /** Moves the note to the separate fake note array on save. */
    fake?: boolean

    static override defaults: GameplayObjectDefaults<Wall> = {
        duration: 1,
        height: 1,
        width: 1,
        ...super.defaults,
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.walls as this[]
    }

    /** Set the transform of this wall in world space. */
    setWorldTransform(
        transform: AnimatedTransform,
        animationSettings = new AnimationSettings(),
    ) {
        setWallWorldTransform(this, transform, animationSettings)
    }

    override get life() {
        return this.halfJumpDuration * 2 + this.duration
    }
    override set life(value: number) {
        const life = value - this.duration

        if (life < 0.25) {
            this.duration = 0
            super.life = value
        } else {
            super.life = life
        }
    }

    override get lifeStart() {
        return this.beat - this.halfJumpDuration
    }
    override set lifeStart(value: number) {
        this.beat = value + this.halfJumpDuration
    }

    override get lifeEnd() {
        return this.beat + this.duration + this.halfJumpDuration
    }
    override set lifeEnd(value: number) {
        this.beat = value - this.duration - this.halfJumpDuration
    }

    override get isGameplayModded() {
        if (this.size) return true
        if (this.fake) return true
        return super.isGameplayModded
    }

    override fromJsonV3(json: bsmap.v3.IObstacle): this {
        this.duration = json.d ?? Wall.defaults.duration
        this.height = json.h ?? Wall.defaults.height
        this.width = json.w ?? Wall.defaults.width
        this.size = getCDProp(json, 'size') as Vec3 | undefined
        return super.fromJsonV3(json)
    }

    override fromJsonV2(json: bsmap.v2.IObstacle): this {
        this.duration = json._duration ?? Wall.defaults.duration
        this.width = json._width ?? Wall.defaults.width
        this.size = getCDProp(json, '_scale') as Vec3 | undefined
        this.fake = getCDProp(json, '_fake')
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IObstacle {
        const output = {
            b: this.beat,
            d: this.duration,
            h: this.height,
            w: this.width,
            x: this.x,
            y: this.y,
            customData: {
                animation: this.animation as bsmap.v3.IAnimation['animation'],
                size: this.size,
                noteJumpMovementSpeed: this.getForcedNJS(),
                noteJumpStartBeatOffset: this.getForcedOffset(),
                localRotation: this.localRotation,
                coordinates: this.coordinates,
                worldRotation: simplifyWorldRotation(this.worldRotation),
                track: this.track.value,
                color: this.chromaColor,
                uninteractable: this.uninteractable,
                fake: this.fake,
                ...this.unsafeCustomData,
            },
        } satisfies bsmap.v3.IObstacle
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IObstacle {
        const output = {
            _duration: this.duration,
            _lineIndex: this.x,
            _time: this.beat,
            _type: 0,
            _width: this.width,
            _customData: {
                _animation: animationV3toV2(this.animation),
                _scale: this.size,
                _noteJumpMovementSpeed: this.getForcedNJS(),
                _noteJumpStartBeatOffset: this.getForcedOffset(),
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: simplifyWorldRotation(this.worldRotation),
                _track: this.track.value,
                _color: this.chromaColor,
                _interactable: exportInvertedBoolean(this.uninteractable, true),
                _fake: this.fake,
                ...this.unsafeCustomData,
            },
        } satisfies bsmap.v2.IObstacle
        return prune ? objectPrune(output) : output
    }
}
