import {GroupObjectTypes, ModelGroup, ModelGroupObjectFactory} from '../../../types/model/model_scene/group.ts'
import { optimizeKeyframes } from '../../animation/optimizer.ts'
import { Vec3 } from '../../../types/math/vector.ts'
import { AnimatedModelInput, ModelInput } from '../../../types/model/model_scene/input.ts'
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
import { ModelSceneSettings } from './settings.ts'
import {AbstractDifficulty} from "../../../internals/beatmap/abstract_beatmap.ts";
import { Environment } from '../../../internals/beatmap/object/environment/environment.ts'
import {Geometry} from "../../../internals/beatmap/object/environment/geometry.ts";

export abstract class ModelScene<I, M, O> {
    protected static modelSceneCount = 0
    static readonly defaultGroupKey = 'default_group'

    // hash -> name
    private static cachedModels: Record<string, string> = {}

    /** The unique ID of this model scene, used for tracks.
     * If multiple model scenes are used, this ID is used so the track names don't conflict.
     */
    readonly ID: number

    protected readonly modelPromise: M
    protected readonly settings: ModelSceneSettings

    constructor(settings: ModelSceneSettings, input: I) {
        this.ID = ModelScene.modelSceneCount++
        this.settings = settings
        this.modelPromise = this._createModelPromise(input)
    }

    protected abstract _createModelPromise(input: I): M
    protected abstract _instantiate(difficulty: AbstractDifficulty): Promise<O>

    /** Instantiate the model scene given object inputs. Your difficulty will await this process before saving. */
    async instantiate(difficulty: AbstractDifficulty) {
        if (Object.values(this.settings.groups).length === 0) {
            throw 'ModelScene has no groups, which is redundant as no objects will be represented.'
        }

        return await difficulty.runAsync(async () => await this._instantiate(difficulty))
    }

    protected static createYeetDef(difficulty: AbstractDifficulty) {
        difficulty.pointDefinitions.yeet = [0, -69420, 0]
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

    protected instantiateGroupObject(difficulty: AbstractDifficulty, group: ModelGroup, factory: ModelGroupObjectFactory) {
        const object = factory(difficulty)

        if (object instanceof Environment) { // Environment
            object.duplicate = 1
        }
        else { // Geometry
            if (typeof object.material !== 'string' && !this.settings.allowUniqueMaterials) {
                group.defaultMaterial ??= object.material
            }
        }

        return object
    }

    protected getPieceTrack = (
        group: ModelGroup,
        track: string,
        index: number,
    ) => group.object ? `modelScene${this.ID}_${track}_${index}` : track

    protected async getObjects(input: AnimatedModelInput) {
        const isNested = typeof input === 'object' && !Array.isArray(input)
        if (isNested) {
            const animatedOptions = input as AnimatedOptions
            return await this.getObjectsFromInput(animatedOptions.input, animatedOptions)
        } else {
            const objectInput = input as ModelInput
            return await this.getObjectsFromInput(objectInput, {} as AnimatedOptions)
        }
    }

    private async getObjectsFromInput(
        objectInput: ModelInput,
        options: AnimatedOptions,
    ) {
        if (typeof objectInput === 'string') {
            return await this.getObjectsFromString(objectInput, options)
        } else {
            return this.getObjectsFromArray(objectInput, options)
        }
    }

    private getObjectsFromArray(
        objects: ReadonlyModel,
        options: AnimatedOptions,
    ): ReadonlyModel {
        if (options.objects) options.objects(objects)
        const outputObjects: ModelObject[] = []
        const trackGroups = new Set<string>()

        objects.forEach((x) => {
            const groupKey = x.group ?? ModelScene.defaultGroupKey
            const group = this.settings.groups[groupKey]

            if (!group) {
                if (this.settings.throwOnMissingGroup) {
                    throw `Group '${groupKey}' is in model object, but ModelScene has no corresponding group!`
                }
                return
            }

            if (!group.object) {
                if (trackGroups.has(groupKey)) {
                    throw `Track group '${groupKey}' was referenced by multiple model objects in a model, when track groups should only represent one!`
                }
                trackGroups.add(groupKey)
            }

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
                const bakedCube: ModelObject = bakeAnimation(
                    x,
                    group.transform ? applyGroupTransform : undefined,
                    this.settings.animationSettings,
                )

                o.position = bakedCube.position
                o.rotation = bakedCube.rotation
                o.scale = bakedCube.scale
            }

            if (group.useNoodleUnits) {
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
            this.settings.groups,
            this.settings.animationSettings.toData(),
        ]).replaceAll('"', '')

        const name = ModelScene.getModelNameFromHash(hash)
        const model = await getModel(inputPath, name, (objects) => this.processFileObjects(objects, options), hash)
        if (options.objects) options.objects(model)
        return model
    }

    private processFileObjects(
        objects: ModelObject[],
        options: AnimatedOptions,
    ) {
        if (options.onCache) options.onCache(objects)
        const trackGroups = new Set<string>()

        objects.forEach((x) => {
            const groupKey = x.group ?? ModelScene.defaultGroupKey
            const group = this.settings.groups[groupKey]

            if (!group) {
                if (this.settings.throwOnMissingGroup) {
                    throw `Group '${groupKey}' is in model object, but ModelScene has no corresponding group!`
                }
                return
            }

            if (!group.object) {
                if (trackGroups.has(groupKey)) {
                    throw `Track group '${groupKey}' was referenced by multiple model objects in a model, when track groups should only represent one!`
                }
                trackGroups.add(groupKey)
            }

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

                if (group.useNoodleUnits) {
                    positionUnityToNoodle(transform.position)
                }

                position[i] = [...transform.position, position[i][3]]
                rotation[i] = [...transform.rotation, rotation[i][3]]
                scale[i] = [...transform.scale, scale[i][3]]
            }

            // Optimizing object (also simplifies it)
            x.position = optimizeKeyframes(position, this.settings.animationSettings.optimizeSettings)
            x.rotation = optimizeKeyframes(rotation, this.settings.animationSettings.optimizeSettings)
            x.scale = optimizeKeyframes(scale, this.settings.animationSettings.optimizeSettings)

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

        return objects
    }
}
