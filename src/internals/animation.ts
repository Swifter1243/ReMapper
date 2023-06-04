/** Contains subclasses for animation related classes. */

import { bsmap } from '../deps.ts'

import {
    complexifyArray,
    getValuesAtTime,
    simplifyArray,
} from '../animation/animation_utils.ts'
import {
    optimizeAnimation,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'

import {
    ComplexKeyframesAny,
    PointDefinitionAny,
    PointDefinitionLinear,
    PointDefinitionVec3,
    PointDefinitionVec4,
RawKeyframesAny,
} from '../types/animation_types.ts'
import { JsonWrapper } from '../types/beatmap_types.ts'
import { RMLog } from '../general.ts'
import { getKeyframeTime, getKeyframeTimeIndex } from "../animation/keyframe.ts";

type AnimateV2 = Required<bsmap.v2.IAnimation>['_animation']
type AnimateV3 = Required<bsmap.v3.IAnimation>['animation']

type AnimationRecord =
    & AnimateV3
    & Record<string, PointDefinitionAny | undefined>
type AnimationUnsafeProperties = keyof AnimateV3 | keyof AnimateV2

/** Bare minimum animation class. */
export class BaseAnimation implements JsonWrapper<AnimateV2, AnimateV3> {
    properties: AnimationRecord = {}

    /**
     * The time in each keyframe is divided by the length.
     * Don't specify to use a range between 0 and 1.
     */
    duration: number

    constructor(duration?: number, data?: BaseAnimation['properties']) {
        this.duration = duration ?? 1
        this.properties = data ?? this.properties
    }

    filteredCustomProperties(v3: boolean) {
        return Object.fromEntries(
            Object.entries(this.properties).filter(([k, v]) => {
                if (v3 && k.startsWith('_')) return false
                if (!v3 && !k.startsWith('_')) return false

                return true
            }),
        )
    }

    toJson(v3: true): AnimateV3
    toJson(v3: false): AnimateV2
    toJson(v3: boolean): AnimateV2 | AnimateV3 {
        const color = this.properties['color']! as bsmap.ColorPointDefinition[]
        const definitePosition = this
            .properties['definitePosition'] as bsmap.Vector3PointDefinition[]
        const dissolve = this
            .properties['dissolve'] as bsmap.PercentPointDefinition[]
        const dissolveArrow = this
            .properties['dissolveArrow'] as bsmap.PercentPointDefinition[]
        const interactable = this
            .properties['interactable'] as bsmap.PercentPointDefinition[]
        const localRotation = this
            .properties['localRotation'] as bsmap.Vector3PointDefinition[]
        const offsetPosition = this
            .properties['offsetPosition'] as bsmap.Vector3PointDefinition[]
        const offsetRotation = this
            .properties['offsetRotation'] as bsmap.Vector3PointDefinition[]
        const scale = this.properties['scale'] as bsmap.Vector3PointDefinition[]
        const time = this.properties['time'] as bsmap.PercentPointDefinition[]

        const filteredProperties = this.filteredCustomProperties(v3)

        if (v3) {
            return {
                color: color,
                definitePosition: definitePosition,
                dissolve: dissolve,
                dissolveArrow: dissolveArrow,
                interactable: interactable, // TODO: Fixup, invert
                localRotation: localRotation,
                offsetPosition: offsetPosition,
                offsetRotation: offsetRotation,
                scale: scale,
                time: time,
                ...filteredProperties,
            } satisfies AnimateV3
        }

        return {
            _color: color,
            _definitePosition: definitePosition,
            _dissolve: dissolve,
            _dissolveArrow: dissolveArrow,
            _interactable: interactable, // TODO: Fixup
            _localRotation: localRotation,
            _position: offsetPosition,
            _rotation: offsetRotation,
            _scale: scale,
            _time: time,
            ...filteredProperties,
        } satisfies AnimateV2
    }

    /**
     * Clear animation data.
     * @param property The property to clear.
     * Leave undefined to clear everything in this animation.
     */
    clear<T extends string = AnimationUnsafeProperties>(property?: T) {
        if (property !== undefined) delete this.properties[property]
        else {
            Object.keys(this.properties).forEach((x) => {
                delete this.properties[x]
            })
        }
    }

    /**
     * Set a property's animations.
     * @param property The property to set.
     * @param value The value of the property.
     * @param process Whether the value should be processed. E.g. sort by time.
     */
    set<T extends string = AnimationUnsafeProperties>(
        property: T,
        value: PointDefinitionAny | undefined,
        process = true,
    ) {
        if (typeof value === 'string' || !process) {
            this.properties[property] = value
            return
        }

        if (!value) {
            this.properties[property] = value
            return
        }

        this.properties[property] = value
        // this.properties[property] = simplifyArray(
        //     this.convert(complexifyArray(value)).sort(
        //         (a: ComplexKeyframeValuesUnsafe, b: ComplexKeyframeValuesUnsafe) =>
        //             new Keyframe(a).time - new Keyframe(b).time,
        //     ),
        // )
    }

    /**
     * Get a property's animations.
     * @param property The property to get.
     * @param time Option to get the values of a property at a certain time.
     * Time can be in length of animation or between 0 and 1 if negative.
     * Can be left undefined.
     */
    get<T extends string = AnimationUnsafeProperties>(
        property: T,
        time?: number,
    ): PointDefinitionAny | undefined {
        const prop = this.properties[property]
        if (!prop) return undefined

        if (time === undefined || typeof prop === 'string') {
            return prop
        }

        time = this.convertTime(time)
        return getValuesAtTime(property, prop, time)
    }

    /**
     * Add keyframes to a property, also sorts by time and makes optimizations if possible.
     * @param property The property to add to.
     * @param value What keyframes to add.
     */
    add<T extends string = AnimationUnsafeProperties>(
        property: T,
        value: RawKeyframesAny,
    ) {
        if (typeof value === 'string') {
            this.properties[property] = value
            return
        }

        const prop = this.properties[property]

        if (!prop) {
            this.properties[property] = value
            return
        }

        if (typeof prop === 'string') {
            throw 'Does not support point definitions!'
        }

        const convertedValue: ComplexKeyframesAny = this.convert(complexifyArray(value))
        const concatArray: ComplexKeyframesAny = [...convertedValue, ...complexifyArray(prop)] //convertedValue.concat(complexifyArray(prop))
        const newValue = 
            concatArray.sort((a, b) =>
                getKeyframeTime(a) - getKeyframeTime(b)
            )
        
        this.properties[property] = newValue
    }

    /**
     * Remove similar values to cut down on keyframe count.
     * @param property Optimize only a single property, or set to undefined to optimize all.
     * @param settings Options for the optimizer. Optional.
     */
    optimize<T extends string = AnimationUnsafeProperties>(
        property?: T,
        settings: OptimizeSettings = new OptimizeSettings(),
    ) {
        if (property === undefined) {
            const keys = Object.keys(this.properties)

            keys.forEach((key) => {
                const oldArray = this.get(key)
                if (!Array.isArray(oldArray)) return

                const oldCount = oldArray.length

                const print = settings.performance_log
                settings.performance_log = false

                this.set(key, optimizeAnimation(oldArray, settings))

                const newCount = this.get(key)!.length

                settings.performance_log = print
                if (print && newCount !== oldCount) {
                    RMLog(
                        `Optimized ${key} ${oldCount} -> ${newCount} (reduced ${
                            (
                                100 -
                                (newCount / oldCount) * 100
                            ).toFixed(2)
                        }%) points`,
                    )
                }
            })
        } else {
            this.set(property, optimizeAnimation(this.get(property), settings))
        }
    }

    private convert(value: ComplexKeyframesAny) {
        return value.map((x) => {
            const time = getKeyframeTimeIndex(x)
            x[time] = this.convertTime(x[time] as number)
            return x
        }) as ComplexKeyframesAny
    }

    private convertTime(time: number) {
        if (time >= 0) return time / this.duration
        else return time * -1
    }
}

interface ObjectAnimationData {
    position: PointDefinitionVec3 | undefined
    definitePosition: PointDefinitionVec3 | undefined
    rotation: PointDefinitionVec3 | undefined
    localRotation: PointDefinitionVec3 | undefined
    scale: PointDefinitionVec3 | undefined
    dissolve: PointDefinitionLinear | undefined
    uninteractable: PointDefinitionLinear | undefined
    time: PointDefinitionLinear | undefined
    color: PointDefinitionVec4 | undefined
}

class ObjectAnimation extends BaseAnimation implements ObjectAnimationData {
    /** Adds to the position of the object. */
    get position() {
        return this.get('offsetPosition') as PointDefinitionVec3
    }
    set position(value: PointDefinitionVec3) {
        this.set('offsetPosition', value)
    }

    /** Sets the absolute position of the object. */
    get definitePosition() {
        return this.get('definitePosition') as PointDefinitionVec3
    }
    set definitePosition(value: PointDefinitionVec3) {
        this.set('definitePosition', value)
    }
    /** Rotates the object around the world origin. */
    get rotation() {
        return this.get('offsetWorldRotation') as PointDefinitionVec3
    }
    set rotation(value: PointDefinitionVec3) {
        this.set('offsetWorldRotation', value)
    }
    /** Rotates the object around it's anchor point. */
    get localRotation() {
        return this.get('localRotation') as PointDefinitionVec3
    }
    set localRotation(value: PointDefinitionVec3) {
        this.set('localRotation', value)
    }
    /** Scales the object. */
    get scale() {
        return this.get('scale') as PointDefinitionVec3
    }
    set scale(value: PointDefinitionVec3) {
        this.set('scale', value)
    }
    /** Controls the dissolve shader on the object.
     * 0 means invisible, 1 means visible.
     */
    get dissolve() {
        return this.get('dissolve') as PointDefinitionLinear
    }
    set dissolve(value: PointDefinitionLinear) {
        this.set('dissolve', value)
    }
    /** Controls the color of the object. */
    get color() {
        return this.get('color') as PointDefinitionVec4
    }

    set color(value: PointDefinitionVec4) {
        this.set('color', value)
    }
    /** Controls whether the object is interactable.
     * 0 = interactable, 1 means uninteractable.
     */
    get uninteractable() {
        return this.get('uninteractable') as PointDefinitionLinear
    }
    set uninteractable(value: PointDefinitionLinear) {
        this.set('uninteractable', value)
    }
    /** Controls the time value for other animations. */
    get time() {
        return this.get('time') as PointDefinitionLinear
    }
    set time(value: PointDefinitionLinear) {
        this.set('time', value)
    }
}

interface NoteAnimationData extends ObjectAnimationData {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow: PointDefinitionLinear | undefined
}

/** Animation specifically for note objects. */
export class NoteAnimation extends ObjectAnimation
    implements NoteAnimationData {
    /** Controls the dissolve shader on the object.
     * 0 means invisible, 1 means visible.
     * For note objects.
     */
    get dissolveArrow() {
        return this.get('dissolveArrow') as PointDefinitionLinear
    }
    set dissolveArrow(value: PointDefinitionLinear | undefined) {
        this.set('dissolveArrow', value)
    }
}

/** Animation specifically for wall objects. */
export class WallAnimation extends ObjectAnimation {}

interface EnvironmentAnimationData {
    /** The position of the object in world space. */
    position: PointDefinitionVec3 | undefined
    /** The position of the object relative to it's parent. */
    localPosition: PointDefinitionVec3 | undefined
    /** The rotation of the object in world space. */
    rotation: PointDefinitionVec3 | undefined
    /** The rotation of the object relative to it's parent. */
    localRotation: PointDefinitionVec3 | undefined
    /** The scale of the object. */
    scale: PointDefinitionVec3 | undefined
}

/** Animation specifically for environment objects. */
export class EnvironmentAnimation extends BaseAnimation {
    /** The position of the object in world space. */
    get position() {
        return this.get('position') as PointDefinitionVec3
    }
    set position(value: PointDefinitionVec3 | undefined) {
        this.set('position', value)
    }
    /** The rotation of the object in world space. */
    get rotation() {
        return this.get('rotation') as PointDefinitionVec3
    }
    set rotation(value: PointDefinitionVec3 | undefined) {
        this.set('rotation', value)
    }
    /** The position of the object relative to it's parent. */
    get localPosition() {
        return this.get('localPosition') as PointDefinitionVec3
    }
    set localPosition(value: PointDefinitionVec3 | undefined) {
        this.set('localPosition', value)
    }
    /** The rotation of the object relative to it's parent. */
    get localRotation() {
        return this.get('localRotation') as PointDefinitionVec3
    }
    set localRotation(value: PointDefinitionVec3 | undefined) {
        this.set('localRotation', value)
    }
    /** The scale of the object. */
    get scale() {
        return this.get('scale') as PointDefinitionVec3
    }
    set scale(value: PointDefinitionVec3 | undefined) {
        this.set('scale', value)
    }
}

/** Animation that can apply to any object. */
export class AbstractAnimation extends BaseAnimation
    implements
        EnvironmentAnimationData,
        NoteAnimationData,
        ObjectAnimationData {
    /** The position of the object in world space. */
    get position() {
        return this.get('position') as PointDefinitionVec3
    }
    set position(value: PointDefinitionVec3 | undefined) {
        this.set('position', value)
    }
    /** The rotation of the object in world space. */
    get rotation() {
        return this.get('rotation') as PointDefinitionVec3
    }
    set rotation(value: PointDefinitionVec3 | undefined) {
        this.set('rotation', value)
    }
    /** The position of the object relative to it's parent. */
    get localPosition() {
        return this.get('localPosition') as PointDefinitionVec3
    }
    set localPosition(value: PointDefinitionVec3 | undefined) {
        this.set('localPosition', value)
    }
    /** The rotation of the object relative to it's parent. */
    get localRotation() {
        return this.get('localRotation') as PointDefinitionVec3
    }
    set localRotation(value: PointDefinitionVec3 | undefined) {
        this.set('localRotation', value)
    }
    /** The scale of the object. */
    get scale() {
        return this.get('scale') as PointDefinitionVec3
    }
    set scale(value: PointDefinitionVec3 | undefined) {
        this.set('scale', value)
    }

    /** Controls the dissolve shader on the object.
     * 0 means invisible, 1 means visible.
     * For note objects.
     */
    get dissolveArrow() {
        return this.get('dissolveArrow') as PointDefinitionLinear
    }
    set dissolveArrow(value: PointDefinitionLinear | undefined) {
        this.set('dissolveArrow', value)
    }

    /** Adds to the position of the object. */
    get offsetPosition() {
        return this.get('offsetPosition') as PointDefinitionVec3
    }
    set offsetPposition(value: PointDefinitionVec3) {
        this.set('offsetPosition', value)
    }

    /** Sets the absolute position of the object. */
    get definitePosition() {
        return this.get('definitePosition') as PointDefinitionVec3
    }
    set definitePosition(value: PointDefinitionVec3) {
        this.set('definitePosition', value)
    }
    /** Rotates the object around the world origin. */
    get offsetWorldRotation() {
        return this.get('offsetWorldRotation') as PointDefinitionVec3
    }
    set offsetWorldRotation(value: PointDefinitionVec3) {
        this.set('offsetWorldRotation', value)
    }
    /** Controls the dissolve shader on the object.
     * 0 means invisible, 1 means visible.
     */
    get dissolve() {
        return this.get('dissolve') as PointDefinitionLinear
    }
    set dissolve(value: PointDefinitionLinear) {
        this.set('dissolve', value)
    }
    /** Controls the color of the object. */
    get color() {
        return this.get('color') as PointDefinitionVec4
    }

    set color(value: PointDefinitionVec4) {
        this.set('color', value)
    }
    /** Controls whether the object is interactable.
     * 0 = interactable, 1 means uninteractable.
     */
    get uninteractable() {
        return this.get('uninteractable') as PointDefinitionLinear
    }
    set uninteractable(value: PointDefinitionLinear) {
        this.set('uninteractable', value)
    }
    /** Controls the time value for other animations. */
    get time() {
        return this.get('time') as PointDefinitionLinear
    }
    set time(value: PointDefinitionLinear) {
        this.set('time', value)
    }
}
