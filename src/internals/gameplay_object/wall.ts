import { bsmap } from '../../deps.ts'

import {
    settings,
} from '../../data/settings.ts'

import {
    BaseGameplayObject,
    defaultBoolean,
    ExcludedObjectFields,
    exportInvertedBoolean,
    getCDProp,
} from '../object.ts'
import { Vec3 } from '../../types/data.ts'
import { Fields, SubclassExclusiveProps } from '../../types/util.ts'
import { setWallWorldTransform } from '../../model/mod.ts'
import { AnimatedTransform } from '../../types/data.ts'
import { AnimationSettings } from '../../animation/mod.ts'
import {copy} from "../../utils/object/copy.ts";
import {objectPrune} from "../../utils/object/prune.ts";
import {activeDifficulty, getActiveDifficulty} from "../../data/active_difficulty.ts";
import {animationToJson} from "../../utils/animation/json.ts";

export class Wall
    extends BaseGameplayObject<bsmap.v2.IObstacle, bsmap.v3.IObstacle> {
    constructor(
        fields: ExcludedObjectFields<Wall>,
    ) {
        super(fields)

        this.duration = fields.duration ?? 0
        this.height = fields.height ?? 1
        this.width = fields.width ?? 1
        this.size = fields.size
        this.fake = fields.fake ?? false

        if (fields.life !== undefined) {
            this.life = fields.life
        }
        if (fields.lifeStart !== undefined) {
            this.lifeStart = fields.lifeStart
        }
    }

    /**
     * Push this wall to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().walls.push(clone ? copy(this) : this)
        return this
    }

    /** Set the transform of this wall in world space. */
    setWorldTransform(
        transform: AnimatedTransform,
        animationSettings = new AnimationSettings(),
    ) {
        setWallWorldTransform(this, transform, animationSettings)
    }

    get life() {
        return this.halfJumpDuration * 2 + this.duration
    }
    set life(value: number) {
        const life = value - this.duration

        if (life < 0.25) {
            this.duration = 0
            super.life = value
        } else {
            super.life = life
        }
    }

    get lifeStart() {
        return this.beat - this.halfJumpDuration
    }
    set lifeStart(value: number) {
        this.beat = value + this.halfJumpDuration
    }

    /** The duration of the wall. */
    duration!: number
    /** The height of the wall. */
    height: number
    /** The width of the wall. */
    width: number
    /** The scale of the wall. */
    size?: Vec3
    /** Moves the note to the separate fake note array on save. */
    fake?: boolean

    get isGameplayModded() {
        if (super.isGameplayModded) return true
        if (this.size) return true
        if (this.fake) return true
        return false
    }

    fromJson(json: bsmap.v3.IObstacle, v3: true): this
    fromJson(json: bsmap.v2.IObstacle, v3: false): this
    fromJson(json: bsmap.v2.IObstacle | bsmap.v3.IObstacle, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                Wall,
                BaseGameplayObject<bsmap.v2.IObstacle, bsmap.v3.IObstacle>
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IObstacle

            const params = {
                duration: obj.d ?? 0,
                height: obj.h,
                size: getCDProp(obj, 'size'),
                width: obj.w ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IObstacle

            const params = {
                duration: obj._duration ?? 0,
                size: getCDProp(obj, '_scale'),
                width: obj._width ?? 0,
                fake: getCDProp(obj, '_fake'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IObstacle
    toJson(v3: false, prune?: boolean): bsmap.v2.IObstacle
    toJson(v3 = true, prune = true): bsmap.v2.IObstacle | bsmap.v3.IObstacle {
        const diff = activeDifficulty
        const NJS = this.noteJumpSpeed
        let offset = this.noteJumpOffset

        if (diff && settings.forceJumpsForNoodle && this.isGameplayModded) {
            offset ??= diff.noteJumpOffset
        }

        if (v3) {
            const output = {
                b: this.beat,
                d: this.duration,
                h: this.height,
                w: this.width,
                x: this.x,
                y: this.y,
                customData: {
                    animation: animationToJson(this.animation, v3),
                    size: this.size,
                    noteJumpMovementSpeed: NJS,
                    noteJumpStartBeatOffset: offset,
                    localRotation: this.localRotation,
                    coordinates: this.coordinates,
                    worldRotation: this.worldRotation,
                    track: this.track.value,
                    color: this.color,
                    uninteractable: defaultBoolean(this.uninteractable, false),
                    fake: defaultBoolean(this.fake, false),
                    ...this.customData,
                },
            } satisfies bsmap.v3.IObstacle
            return prune ? objectPrune(output) : output
        }

        const output = {
            _duration: this.duration,
            _lineIndex: this.x,
            _time: this.beat,
            _type: 0,
            _width: this.width,
            _customData: {
                _animation: animationToJson(this.animation, v3),
                _scale: this.size,
                _noteJumpMovementSpeed: NJS,
                _noteJumpStartBeatOffset: offset,
                _localRotation: this.localRotation,
                _position: this.coordinates,
                _rotation: this.worldRotation,
                _track: this.track.value,
                _color: this.color,
                _interactable: exportInvertedBoolean(this.uninteractable, true),
                _fake: defaultBoolean(this.fake, false),
                ...this.customData,
            },
        } satisfies bsmap.v2.IObstacle
        return prune ? objectPrune(output) : output
    }
}
