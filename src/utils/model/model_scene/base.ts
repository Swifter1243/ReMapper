import { getActiveDifficulty } from '../../../data/active_difficulty.ts'
import { GroupObjectTypes, ModelGroup } from '../../../types/model/model_scene/group.ts'
import { AnimationSettings, optimizeKeyframes } from '../../animation/optimizer.ts'
import { Vec3 } from '../../../types/math/vector.ts'
import { Environment } from '../../../internals/beatmap/object/environment/environment.ts'
import { AnimatedObjectInput, ObjectInput } from '../../../types/model/model_scene/input.ts'
import { AnimatedOptions } from '../../../types/model/model_scene/option.ts'
import { ModelObject, ReadonlyModel } from '../../../types/model/object.ts'
import { InnerKeyframeVec3, RawKeyframesVec3 } from '../../../types/animation/keyframe/vec3.ts'
import { complexifyKeyframes } from '../../animation/keyframe/complexity.ts'
import { copy } from '../../object/copy.ts'
import { combineTransforms } from '../../math/transform.ts'
import { positionUnityToNoodle } from '../../beatmap/object/environment/unit_conversion.ts'
import { mirrorAnimation, reverseAnimation } from '../../animation/time_warp.ts'
import { parseFilePath } from '../../file.ts'
import { getModel } from '../file.ts'
import { TransformKeyframe } from '../../../types/animation/bake.ts'
import { bakeAnimation } from '../../animation/bake.ts'
import { DeepReadonly } from '../../../types/util/mutability.ts'
import { Transform } from '../../../types/math/transform.ts'
import { EnvironmentModelPiece } from '../../../types/model/model_scene/piece.ts'
import { environment } from '../../../builder_functions/beatmap/object/environment/environment.ts'
import {BaseEnvironmentEnhancement} from "../../../internals/beatmap/object/environment/base_environment.ts";

export abstract class ModelScene<I, O> {
    protected static modelSceneCount = 0
    static defaultGroupKey = 'default_group'

    // hash -> name
    private static cachedModels: Record<string, string> = {}

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

    protected static getModelNameFromHash(hash: string) {
        if (this.cachedModels[hash]) {
            return this.cachedModels[hash]
        }

        const length = Object.values(this.cachedModels).length
        const name = `model_scene_model_${length}`
        this.cachedModels[hash] = name
        return name
    }

    /** Get a group from this ModelScene's internal group collection */
    getGroup(key: string): DeepReadonly<ModelGroup> {
        return this.groups[key]
    }

    /** Get the default group from this ModelScene */
    getDefaultGroup(): DeepReadonly<ModelGroup> {
        return this.groups[ModelScene.defaultGroupKey]
    }

    private pushObjectGroup(
        key: string,
        object: GroupObjectTypes,
        transform?: DeepReadonly<Transform>,
    ) {
        const group: ModelGroup = {
            object,
            transform,
        }

        if (object instanceof Environment) object.duplicate = 1
        else if (typeof object.material !== 'string') {
            group.defaultMaterial = object.material
        }

        this.groups[key as string] = group
    }

    /**
     * When the model is instantiated, model objects with no "group" key will invoke this object to represent it
     * @param object The object to spawn.
     * @param transform The transform applied to the spawned object.
     * @see groups
     */
    setDefaultGroup(
        object: GroupObjectTypes,
        transform?: DeepReadonly<Transform>,
    ): void
    setDefaultGroup(
        modelPiece: EnvironmentModelPiece,
    ): void
    setDefaultGroup(
        ...params: [
            object: GroupObjectTypes,
            transform?: DeepReadonly<Transform>,
        ] | [modelPiece: EnvironmentModelPiece]
    ): void {
        if (params[0] instanceof BaseEnvironmentEnhancement) {
            const [object, transform] = params

            this.pushObjectGroup(ModelScene.defaultGroupKey, object, transform)
        } else {
            const [modelPiece] = params

            const object = environment({
                id: modelPiece.id,
                lookupMethod: modelPiece.lookupMethod,
            })
            this.pushObjectGroup(ModelScene.defaultGroupKey, object, modelPiece.transform)
        }
    }

    /**
     * When the model is instantiated, model objects with the matching "group" key will invoke this object to represent it
     * @param group The group key for objects to identify they are part of this group.
     * @param object The object to spawn.
     * @param transform The transform applied to the spawned object.
     */
    setObjectGroup(
        group: string,
        object: GroupObjectTypes,
        transform?: DeepReadonly<Transform>,
    ): void
    setObjectGroup(
        group: string,
        modelPiece: EnvironmentModelPiece,
    ): void
    setObjectGroup(
        ...params: [
            group: string,
            object: GroupObjectTypes,
            transform?: DeepReadonly<Transform>,
        ] | [
            group: string,
            modelPiece: EnvironmentModelPiece,
        ]
    ): void {
        if (params[1] instanceof BaseEnvironmentEnhancement) {
            const [group, object, transform] = params

            this.pushObjectGroup(group, object, transform)
        } else {
            const [group, modelPiece] = params

            const object = environment({
                id: modelPiece.id,
                lookupMethod: modelPiece.lookupMethod,
            })
            this.pushObjectGroup(group, object, modelPiece.transform)
        }
    }

    /**
     * When the model is instantiated, model objects with a "group" key matching this track will invoke an AnimateTrack event with the same track name to represent it.
     * @param track Track to target for and animate, also the group key.
     * @param transform The transform applied to the object.
     * @param disappearWhenAbsent Make the object on this track disappear when no ModelObject with the corresponding track exists.
     */
    setTrackGroup(
        track: string,
        transform?: DeepReadonly<Transform>,
        disappearWhenAbsent = true,
    ) {
        this.groups[track] = {
            object: undefined,
            transform,
            disappearWhenAbsent,
        }
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
        function doStatic(k: RawKeyframesVec3): Vec3 {
            return typeof k[0] === 'object' ? [k[0][0], k[0][1], k[0][2]] : k as Vec3
        }

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

            function applyGroupTransform(transform: TransformKeyframe) {
                const combined = combineTransforms(group.transform!, transform)
                transform.position = combined.position
                transform.rotation = combined.rotation
                transform.scale = combined.scale
            }

            const shouldBake = (group.transform && options.bake !== false) || options.bake
            if (shouldBake) {
                // Baking animation
                const bakedCube: ModelObject = bakeAnimation(x, group.transform ? applyGroupTransform : undefined, this.animationSettings)

                o.position = bakedCube.position
                o.rotation = bakedCube.rotation
                o.scale = bakedCube.scale
            }

            if (!v3) {
                positionUnityToNoodle(o.position)
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
        const hash = JSON.stringify([
            options,
            onCache,
            this.groups,
            this.animationSettings.toData(),
            getActiveDifficulty().v3,
        ]).replaceAll('"', '')

        const name = ModelScene.getModelNameFromHash(hash)
        const model = await getModel(inputPath, name, (objects) => this.processFileObjects(objects, options), hash)
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
            const position = complexifyKeyframes(x.position)
            const rotation = complexifyKeyframes(x.rotation)
            const scale = complexifyKeyframes(x.scale)

            // Applying transformation to each keyframe
            function getVec3(keyframe: InnerKeyframeVec3): Vec3 {
                return [keyframe[0], keyframe[1], keyframe[2]]
            }

            if (position.length !== rotation.length || rotation.length !== scale.length) {
                throw 'Animated model data expected uniform length for scale, position, and rotation animations'
            }

            for (let i = 0; i < position.length; i++) {
                let transform = {
                    position: getVec3(position[i]),
                    rotation: getVec3(rotation[i]),
                    scale: getVec3(scale[i]),
                }

                if (group.transform) {
                    transform = combineTransforms(group.transform, transform)
                }

                if (!v3) {
                    positionUnityToNoodle(transform.position)
                }

                position[i] = [...transform.position, position[i][3]]
                rotation[i] = [...transform.rotation, rotation[i][3]]
                scale[i] = [...transform.scale, scale[i][3]]
            }

            // Optimizing object (also simplifies it)
            x.position = optimizeKeyframes(position, this.animationSettings.optimizeSettings)
            x.rotation = optimizeKeyframes(rotation, this.animationSettings.optimizeSettings)
            x.scale = optimizeKeyframes(scale, this.animationSettings.optimizeSettings)

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
