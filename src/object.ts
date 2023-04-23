// deno-lint-ignore-file
import { Track } from './animation.ts'
import { activeDiffGet, info, TJson } from './beatmap.ts'
import { NoteType } from './constants.ts'
import { bsmap } from './deps.ts'
import {
    ColorType,
    copy,
    getJumps,
    isEmptyObject,
    jsonCheck,
    jsonGet,
    jsonPrune,
    jsonRemove,
    jsonSet,
    Vec2,
    Vec3,
} from './general.ts'
import { NoteAnimation, WallAnimation } from './internals/animation.ts'
import { noteAnimation } from './mod.ts'
import { Fields, JsonWrapper } from './types.ts'

export type ObjectFields<T extends { customData: V }, V = T['customData']> =
    & Omit<Fields<T>, 'customData'>
    & {
        customData?: T['customData']
    }

export abstract class BaseObject<
    TV2 extends bsmap.v2.IBaseObject,
    TV3 extends bsmap.v3.IBaseObject,
> implements JsonWrapper<TV2, TV3> {
    /** The time that this object is scheduled for. */
    time: number = 0
    /** Any community made data on this object. */
    customData: TV2['_customData'] | TV3['customData'] = {}

    constructor(
        obj: ObjectFields<BaseObject<TV2, TV3>> | Record<string, unknown>,
    ) {
        Object.assign(this, obj)
    }

    /** Checks if the object has modded properties. */
    isModded() {
        return this.customData && !isEmptyObject(this.customData)
    }

    abstract toJson(v3: true): TV3
    abstract toJson(v3: false): TV2
    abstract toJson(v3: boolean): TV2 | TV3
}

export abstract class BaseGameplayObject<
    TV2 extends bsmap.v2.INote | bsmap.v2.IObstacle,
    TV3 extends
        | bsmap.v3.IColorNote
        | bsmap.v3.IBombNote
        | bsmap.v3.IBaseSlider
        | bsmap.v3.IObstacle,
> // | bsmap.v3.IGridObject,
    extends BaseObject<TV2, TV3> {
    constructor(
        obj: Partial<Fields<BaseGameplayObject<TV2, TV3>>>,
        animation: WallAnimation | NoteAnimation,
    ) {
        super(obj)
        this.animation = animation
    }

    lineIndex = 0
    lineLayer = 0

    fake?: boolean

    coordinates?: Vec2

    /** The rotation added to an object around the world origin. */
    rotation?: Vec3
    /** The rotation added to an object around it's anchor point. */
    localRotation?: Vec3

    localNJS?: number
    localBeatOffset?: number

    /** Whether this object is interactable. */
    interactable?: boolean

    /** The track class for this event.
     * @see Track
     */
    track = new Track()

    /** The chroma color of the object. */
    color?: ColorType

    /** The animation json on the object. */
    animation: NoteAnimation | WallAnimation

    get NJS() {
        return this.localNJS ?? activeDiffGet().NJS
    }

    /** The note offset of an object. */
    get offset() {
        return this.localBeatOffset ?? activeDiffGet().offset
    }

    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Duration is the time in beats that the object will be jumping for.
     * This function will output half of this, so it will end when the note is supposed to be hit.
     */
    get halfJumpDur() {
        return getJumps(this.NJS, this.offset, info._beatsPerMinute).halfDur
    }
    /**
     * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
     * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
     */
    get jumpDist() {
        return getJumps(this.NJS, this.offset, info._beatsPerMinute).dist
    }
    /** The lifespan of the object. */
    get life() {
        return this.halfJumpDur * 2
    }
    /** The time of the start of the object's lifespan. */
    get lifeStart() {
        return this.time - this.life / 2
    }

    set life(value: number) {
        if (value < 0.25) {
            console.log(
                'Warning: The lifespan of a note has a minimum of 0.25 beats.',
            )
        }
        const defaultJumps = getJumps(this.NJS, 0, info._beatsPerMinute)
        this.localBeatOffset = (value - 2 * defaultJumps.halfDur) / 2
    }
    set lifeStart(value: number) {
        this.time = value + this.life / 2
    }

    isModded() {
        if (this.customData === undefined) return false
        return !isEmptyObject(this.customData)
    }

    isGameplayModded() {
        if (this.customData === undefined) return false
        const customData = copy(this.customData)
        jsonRemove(customData, 'color')
        jsonRemove(customData, 'spawnEffect')
        jsonRemove(customData, 'animation.color')
        jsonPrune(customData)
        return !isEmptyObject(customData)
    }
}

export abstract class BaseSliderObject<TV3 extends bsmap.v3.IBaseSlider>
    extends BaseGameplayObject<never, TV3> {
    /** The color of the object. */
    type: NoteType = NoteType.RED
    /** The cut direction of the head. */
    headDirection: number = 0
    /** The time the tail arrives at the player. */
    tailTime: number = 0
    /** The lane of the tail. */
    tailX: number = 0
    /** The vertical row of the tail. */
    tailY: number = 0

    /** The position of the tail. */
    tailCoordinates?: Vec2

    constructor(obj: Fields<BaseSliderObject<TV3>>) {
        super(obj, noteAnimation())
    }
}
