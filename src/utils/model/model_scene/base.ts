import { getActiveDifficulty } from '../../../data/active_difficulty.ts'
import { GroupObjectTypes, ModelGroup } from '../../../types/model/model_scene/group.ts'
import { AnimationSettings, optimizeKeyframes } from '../../animation/optimizer.ts'
import { Vec3 } from '../../../types/math/vector.ts'
import { Environment } from '../../../internals/beatmap/object/environment/environment.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { AnimatedObjectInput, ObjectInput } from '../../../types/model/model_scene/input.ts'
import { AnimatedOptions } from '../../../types/model/model_scene/option.ts'
import { ModelObject, ReadonlyModel } from '../../../types/model/object.ts'
import { InnerKeyframeVec3, RawKeyframesVec3 } from '../../../types/animation/keyframe/vec3.ts'
import { complexifyKeyframes } from '../../animation/keyframe/complexity.ts'
import { copy } from '../../object/copy.ts'
import { applyAnchor, combineRotations, combineTransforms } from '../../math/transform.ts'
import { positionUnityToNoodle } from '../../beatmap/object/environment/unit_conversion.ts'
import {mirrorAnimation, reverseAnimation} from '../../animation/time_warp.ts'
import { parseFilePath } from '../../file.ts'
import { getModel } from '../file.ts'
import { TransformKeyframe } from '../../../types/animation/bake.ts'
import { bakeAnimation } from '../../animation/bake.ts'
import { iterateKeyframes } from '../../animation/keyframe/iterate.ts'
import { DeepReadonly } from '../../../types/util/mutability.ts'

export abstract class ModelScene<I, O> {
    protected static modelSceneCount = 0
    static defaultGroupKey = 'default_group'

    protected groups = <Record<string, ModelGroup>> {}

    /** Settings for the optimizer on each animation event.
     * The animations will attempt to be optimized, removing visually redundant points.
     * This controls various parameters about how harshly the algorithm will target changes.
     */
    animationSettings = new AnimationSettings()

    /** The unique ID of this model scene, used for tracks.
     * If multiple model scenes are used, this ID is used so the track names don't conflict.
     */
    readonly ID: number

    /** If the scene is instantiated with `animate` and the first switch is not at a time of 0, `initializePositions` determines whether the first switch will be initialized at beat 0 and held in place until it is animated. */
    initializeObjects = true

    /** Whether this scene has been instantiated. */
    private instantiated = false

    protected readonly modelInput: I

    constructor(input: I) {
        this.modelInput = input
        this.ID = ModelScene.modelSceneCount
        ModelScene.modelSceneCount++
    }

    /** Instantiate the model scene given object inputs. Your difficulty will await this process before saving. */
    async instantiate() {
        this.ensureNotInstantiated()

        if (Object.values(this.groups).length === 0) {
            throw 'ModelScene has no groups, which is redundant as no objects will be represented.'
        }

        return await getActiveDifficulty().runAsync(async () => await this._instantiate())
    }

    protected abstract _instantiate(): Promise<O>

    protected static createYeetDef() {
        getActiveDifficulty().pointDefinitions.yeet = [0, -69420, 0]
    }

    /** Get a group from this ModelScene's internal group collection */
    getGroup(key: string): DeepReadonly<ModelGroup> {
        return this.groups[key]
    }

    /** Get the default group from this ModelScene */
    getDefaultGroup(): DeepReadonly<ModelGroup> {
        return this.groups[ModelScene.defaultGroupKey]
    }

    private pushGroup(
        key: string,
        object?: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
        changeGroup?: (group: ModelGroup) => void,
    ) {
        const group: ModelGroup = {}
        if (object) {
            if (object instanceof Environment) object.duplicate = 1
            if (
                object instanceof Geometry &&
                typeof object.material !== 'string'
            ) {
                group.defaultMaterial = object.material
            }
            object.position = [0, -69420, 0]
            group.object = object
        }
        if (scale) group.scale = scale
        if (anchor) group.anchor = anchor
        if (rotation) group.rotation = rotation
        if (changeGroup) changeGroup(group)
        this.groups[key as string] = group
    }

    /**
     * When the model is instantiated, model objects with no "group" key will invoke this object to represent it
     * @param object The object to spawn.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     * @see groups
     */
    setDefaultGroup(
        object: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
    ) {
        this.pushGroup(ModelScene.defaultGroupKey, object, scale, anchor, rotation)
    }

    /**
     * When the model is instantiated, model objects with the matching "group" key will invoke this object to represent it
     * @param group The group key for objects to identify they are part of this group.
     * @param object The object to spawn.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    setObjectGroup(
        group: string,
        object: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
    ) {
        this.pushGroup(group, object, scale, anchor, rotation)
    }

    /**
     * When the model is instantiated, model objects with a "group" key matching this track will invoke an AnimateTrack event with the same track name to represent it.
     * @param track Track to target for and animate, also the group key.
     * @param scale The scale multiplier for the object previously mentioned.
     * @param anchor The anchor offset for the object previously mentioned.
     * @param rotation The rotation offset for the object previously mentioned.
     * @param disappearWhenAbsent Make the object on this track disappear when no ModelObject with the corresponding track exists.
     */
    setTrackGroup(
        track: string,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
        disappearWhenAbsent = true,
    ) {
        this.pushGroup(track, undefined, scale, anchor, rotation, (x) => {
            x.disappearWhenAbsent = disappearWhenAbsent
        })
    }

    /**
     * Spawn every object in a group with a unique material.
     * Allows colors from models to be applied to geometry.
     * Should be used with caution as it creates a unique material per object.
     * @param group The group to enable unique materials on. Leave undefined to effect base group.
     */
    enableModelColors(group?: string) {
        const groupObj = this.groups[group as string]
        if (!groupObj && !group) throw `There are no groups on this scene!`
        if (!groupObj) throw `The group ${group} doesn't exist!`
        this.groups[group as string].defaultMaterial = undefined
    }

    private static makeModelObjectStatic(obj: ModelObject) {
        const doStatic = (k: RawKeyframesVec3) => typeof k[0] === 'object' ? [k[0][0], k[0][1], k[0][2]] as Vec3 : k as Vec3

        obj.position = doStatic(obj.position)
        obj.rotation = doStatic(obj.rotation)
        obj.scale = doStatic(obj.scale)
    }

    protected static getFirstValues(keyframes: DeepReadonly<RawKeyframesVec3>) {
        const complexTransform = complexifyKeyframes(copy(keyframes))[0]
        return [
            complexTransform[0],
            complexTransform[1],
            complexTransform[2],
        ] as Vec3
    }

    protected getPieceTrack = (
        object: undefined | GroupObjectTypes,
        track: string,
        index: number,
    ) => object ? `modelScene${this.ID}_${track}_${index}` : track

    protected ensureNotInstantiated() {
        if (this.instantiated) {
            throw "You can't instantiate a scene using the same ModelScene multiple times."
        }
        this.instantiated = true
    }

    protected async getObjects(input: AnimatedObjectInput) {
        const isNested = typeof input === 'object' && !Array.isArray(input)
        if (isNested) {
            const animatedOptions = input as AnimatedOptions
            return await this.getObjectsFromInput(animatedOptions.input, animatedOptions)
        } else {
            const objectInput = input as ObjectInput
            return await this.getObjectsFromInput(objectInput, {} as AnimatedOptions)
        }
    }

    private async getObjectsFromInput(
        objectInput: ObjectInput,
        options: AnimatedOptions,
    ) {
        if (typeof objectInput === 'string') {
            return await this.getObjectsFromString(objectInput, options)
        } else {
            return this.getObjectsFromArray(objectInput, options)
        }
    }

    private getObjectsFromArray(
        objectInput: ReadonlyModel,
        options: AnimatedOptions,
    ): ReadonlyModel {
        const outputObjects: ModelObject[] = []
        if (options.objects) options.objects(objectInput)
        const v3 = getActiveDifficulty().v3
        objectInput.forEach((x) => {
            const group = this.groups[x.group ?? ModelScene.defaultGroupKey]
            if (!group) return

            const o = copy(x) as ModelObject

            if (options.static) {
                ModelScene.makeModelObjectStatic(o)
            }

            function getBakedTransform(transform: TransformKeyframe) {
                if (options.transform) {
                    const combined = combineTransforms(transform, options.transform, options.transform.anchor)
                    transform.position = combined.position
                    transform.rotation = combined.rotation
                    transform.scale = combined.scale
                }

                transform.position = applyAnchor(transform.position, transform.rotation, transform.scale, group.anchor ?? [0, 0, 0] as Vec3)
            }

            const shouldBake = (group.anchor && options.bake !== false && !options.static) ||
                options.bake === true ||
                options.transform !== undefined
            if (shouldBake) {
                // Baking animation
                const bakedCube: ModelObject = bakeAnimation(x, getBakedTransform, this.animationSettings)

                if (!v3) {
                    positionUnityToNoodle(bakedCube.position)
                }

                o.position = bakedCube.position
                o.rotation = bakedCube.rotation
                o.scale = bakedCube.scale
            }

            if (group.rotation) {
                iterateKeyframes(o.rotation, (y) => {
                    const newRotation = combineRotations([y[0], y[1], y[2]], group.rotation!)
                    Object.assign(y, newRotation)
                })
            }

            if (group.scale) {
                iterateKeyframes(o.scale, (y) => {
                    y[0] *= (group.scale!)[0]
                    y[1] *= (group.scale!)[1]
                    y[2] *= (group.scale!)[2]
                })
            }

            // Reverse animation
            if (options.reverse) {
                o.position = reverseAnimation(o.position)
                o.rotation = reverseAnimation(o.rotation)
                o.scale = reverseAnimation(o.scale)
            }

            // Loop animation
            if (options.mirror) {
                o.position = mirrorAnimation(o.position)
                o.rotation = mirrorAnimation(o.rotation)
                o.scale = mirrorAnimation(o.scale)
            }

            outputObjects.push(o)
        })

        return outputObjects
    }

    private async getObjectsFromString(objectInput: string, options: AnimatedOptions) {
        const inputPath = (await parseFilePath(objectInput, '.rmmodel')).path
        const onCache = options.onCache ? options.onCache.toString() : undefined
        const hashObjects: unknown[] = [
            options,
            onCache,
            this.groups,
            this.animationSettings.toData(),
            getActiveDifficulty().v3,
        ]

        const model = await getModel(
            inputPath,
            `modelScene${this.ID}_${inputPath}`,
            (objects) => this.processFileObjects(objects, options),
            hashObjects,
        )
        if (options.objects) options.objects(model)
        return model
    }

    private processFileObjects(
        fileObjects: ModelObject[],
        options: AnimatedOptions,
    ) {
        const v3 = getActiveDifficulty().v3
        if (options.onCache) options.onCache(fileObjects)
        fileObjects.forEach((x) => {
            const group = this.groups[x.group ?? ModelScene.defaultGroupKey]
            if (!group) return

            if (options.static) {
                ModelScene.makeModelObjectStatic(x)
            }

            // Making keyframes a consistent array format
            x.position = complexifyKeyframes(x.position)
            x.rotation = complexifyKeyframes(x.rotation)
            x.scale = complexifyKeyframes(x.scale)

            // Applying transformation to each keyframe
            function getVec3(keyframe: InnerKeyframeVec3): Vec3 {
                return [keyframe[0], keyframe[1], keyframe[2]]
            }

            for (let i = 0; i < x.position.length; i++) {
                const transform = {
                    position: getVec3(x.position[i]),
                    rotation: getVec3(x.rotation[i]),
                    scale: getVec3(x.scale[i])
                }

                if (group.anchor) {
                    transform.position = applyAnchor(
                        transform.position as Vec3,
                        transform.rotation as Vec3,
                        transform.scale as Vec3,
                        group.anchor,
                    )
                }

                if (group.rotation) {
                    transform.rotation = combineRotations(transform.rotation, group.rotation)
                }

                if (group.scale) {
                    transform.scale[0] *= group.scale[0]
                    transform.scale[1] *= group.scale[1]
                    transform.scale[2] *= group.scale[2]
                }

                if (!v3) {
                    positionUnityToNoodle(transform.position)
                }

                if (options.transform) {
                    const combined = combineTransforms(transform, options.transform, options.transform.anchor)
                    transform.position = combined.position
                    transform.rotation = combined.rotation
                    transform.scale = combined.scale
                }

                x.position[i] = [...transform.position, x.position[i][3]]
                x.rotation[i] = [...transform.rotation, x.rotation[i][3]]
                x.scale[i] = [...transform.scale, x.scale[i][3]]
            }

            // Optimizing object
            x.position = optimizeKeyframes(x.position, this.animationSettings.optimizeSettings)
            x.rotation = optimizeKeyframes(x.rotation, this.animationSettings.optimizeSettings)
            x.scale = optimizeKeyframes(x.scale, this.animationSettings.optimizeSettings)

            // Reverse animation
            if (options.reverse) {
                x.position = reverseAnimation(x.position)
                x.rotation = reverseAnimation(x.rotation)
                x.scale = reverseAnimation(x.scale)
            }

            // Loop animation
            if (options.mirror) {
                x.position = mirrorAnimation(x.position)
                x.rotation = mirrorAnimation(x.rotation)
                x.scale = mirrorAnimation(x.scale)
            }
        })

        return fileObjects
    }
}
