import { bsmap } from '../deps.ts'

import * as AnimationInternals from '../internals/animation.ts'
import * as EnvironmentInternals from '../internals/environment.ts'

import { animateTrack } from './custom_event.ts'
import {
    AnimationKeys,
    EASE,
    RawKeyframesAny,
} from '../types/animation_types.ts'
import {GeometryMaterial, GeoType, Lookup} from '../types/environment_types.ts'
import { activeDiffGet } from '../data/beatmap_handler.ts'
import { combineAnimations } from "../animation/animation_utils.ts";
import { copy } from '../utils/general.ts'

let envCount = 0

export class Environment extends EnvironmentInternals.BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentID,
    bsmap.v3.IChromaEnvironmentID
> {
    push(clone = true): void {
        activeDiffGet().environment.push(clone ? copy(this) : this)
    }

    /**
     * Environment object for ease of creation and additional tools.
     * @param id The object name to look up in the environment.
     * @param lookupMethod The method of looking up the object name in the environment.
     */
    constructor(id?: string, lookupMethod: Lookup | undefined = undefined) {
        super()
        id ??= ''
        lookupMethod ??= 'Contains'
        this.id = id
        this.lookupMethod = lookupMethod
    }

    /** The object name to look up in the environment. */
    id: string
    /** The method of looking up the object name in the environment. */
    lookupMethod: Lookup

    toJson(v3: true): bsmap.v3.IChromaEnvironmentID
    toJson(v3: false): bsmap.v2.IChromaEnvironmentID
    toJson(
        v3: boolean,
    ): bsmap.v2.IChromaEnvironmentID | bsmap.v3.IChromaEnvironmentID {
        if (v3) {
            return {
                id: this.id,
                lookupMethod: this.lookupMethod,
                active: this.active,
                components: {
                    ILightWithId: {
                        lightID: this.lightsID,
                        type: this.lightsType,
                    },
                    ...this.components,
                },
                duplicate: this.duplicate,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track?.value as string,
            } satisfies bsmap.v3.IChromaEnvironmentID
        }

        if (this.components) throw 'Components are not supported in v2'

        return {
            _id: this.id,
            _lookupMethod: this.lookupMethod,
            _active: this.active,
            _duplicate: this.duplicate,
            _lightID: this.lightsID,
            _localPosition: this.localPosition,
            _localRotation: this.localRotation,
            _position: this.position,
            _rotation: this.rotation,
            _scale: this.scale,
            _track: this.track?.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentID
    }
}

export class Geometry extends EnvironmentInternals.BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentGeometry,
    bsmap.v3.IChromaEnvironmentGeometry
> {
    push(clone = true): void {
        activeDiffGet().geometry.push(clone ? copy(this) : this)
    }

    /**
     * Geometry object for ease of creation and additional tools.
     * @param type The geometry shape type.
     * @param material The material on this geometry object.
     */
    constructor(type?: GeoType, material?: GeometryMaterial | string) {
        super()
        type ??= 'Cube'
        material ??= {
            shader: 'Standard',
        }
        this.type = type
        this.material = material
    }

    /** The geometry shape type. */
    type: GeoType
    /** The material on this geometry object. */
    material: GeometryMaterial | string
    /** Whether this geometry object has collision. */
    collision?: boolean

    toJson(v3: true): bsmap.v3.IChromaEnvironmentGeometry
    toJson(v3: false): bsmap.v2.IChromaEnvironmentGeometry
    toJson(
        v3: boolean,
    ):
        | bsmap.v2.IChromaEnvironmentGeometry
        | bsmap.v3.IChromaEnvironmentGeometry {
        if (v3) {
            return {
                geometry: {
                    material: this.material,
                    type: this.type,
                    collision: this.collision,
                },
                active: this.active,
                components: {
                    ILightWithId: {
                        lightID: this.lightsID,
                        type: this.lightsType,
                    },
                    ...this.components,
                },
                duplicate: this.duplicate,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track?.value as string,
            } satisfies bsmap.v3.IChromaEnvironmentGeometry
        }

        return {
            _geometry: {
                _material: typeof this.material === 'string' ? this.material : {
                    _shader: this.material?.shader,
                    _color: this.material?.color,
                    _shaderKeywords: this.material?.shaderKeywords,
                },
                _type: this.type,
                _collision: this.collision,
            },
            _active: this.active,
            _duplicate: this.duplicate,
            _lightID: this.lightsID,
            _localPosition: this.localPosition,
            _localRotation: this.localRotation,
            _position: this.position,
            _rotation: this.rotation,
            _scale: this.scale,
            _track: this.track?.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentGeometry
    }
}

/**
 * Targets any environment objects in a group and animates them based on their original transforms.
 * @param group The group to target.
 * @param time The time of the animation.
 * @param animation Callback for the animation that will be used.
 * @param duration Duration of the animation.
 * @param easing Easing on the animation.
 */
export function animateEnvGroup(
    group: string,
    time: number,
    animation: (animation: AnimationInternals.EnvironmentAnimation) => void,
    duration?: number,
    easing?: EASE,
) {
    const environmentCombined = activeDiffGet()
        .environemntEnhancementsCombined()

    for (const x of environmentCombined) {
        if (x.group === group) {
            const newAnimation = new AnimationInternals.AbstractAnimation()
            animation(newAnimation)

            if (!x.track.value) {
                x.track.value = `environment_${envCount}`
                envCount++
            }

            const event = animateTrack(time, x.track.value)
            if (duration) event.duration = duration
            if (easing) event.ease = easing

            Object.keys(newAnimation.properties).forEach((key) => {
                event.animate.properties[key] = newAnimation.properties[key]
                // TODO: Rework
                const prop = (x as any)[key]
                if (prop) {
                    event.animate.properties[key] = combineAnimations(
                        event.animate.properties[key]! as RawKeyframesAny,
                        prop,
                        key as AnimationKeys,
                    )
                }
            })

            event.push()
        }
    }
}

/**
 * Targets any environment objects in a track and animates them based on their original transforms.
 * @param track The track to target.
 * @param time The time of the animation.
 * @param animation Callback for the animation that will be used.
 * @param duration Duration of the animation.
 * @param easing Easing on the animation.
 */
export function animateEnvTrack(
    track: string,
    time: number,
    animation: (animation: AnimationInternals.EnvironmentAnimation) => void,
    duration?: number,
    easing?: EASE,
) {
    const environmentCombined = activeDiffGet()
        .environemntEnhancementsCombined()

    for (const x of environmentCombined) {
        if (x.track.value === track) {
            const newAnimation = new AnimationInternals.AbstractAnimation()
            animation(newAnimation)

            const event = animateTrack(time, x.track.value)
            if (duration) event.duration = duration
            if (easing) event.ease = easing

            Object.keys(newAnimation.properties).forEach((key) => {
                event.animate.properties[key] = newAnimation.properties[key]
                const prop = (x as any)[key]
                if (prop) {
                    event.animate.properties[key] = combineAnimations(
                        event.animate.properties[key] as RawKeyframesAny,
                        prop,
                        key as AnimationKeys,
                    )
                }
            })

            event.push()
        }
    }
}
