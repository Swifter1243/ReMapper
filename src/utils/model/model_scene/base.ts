import { ModelGroup, ModelGroupObjectFactory } from '../../../types/model/model_scene/group.ts'
import { optimizePoints } from '../../animation/optimizer.ts'
import { Vec3 } from '../../../types/math/vector.ts'
import { AnimatedModelInput, ModelInput } from '../../../types/model/model_scene/input.ts'
import { AnimatedOptions } from '../../../types/model/model_scene/option.ts'
import { ModelObject, ReadonlyModel } from '../../../types/model/object.ts'
import { InnerPointVec3, RawPointsVec3 } from '../../../types/animation/points/vec3.ts'
import { complexifyPoints } from '../../animation/points/complexity.ts'
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
import { AbstractDifficulty } from '../../../internals/beatmap/abstract_difficulty.ts'
import { Environment } from '../../../internals/beatmap/object/environment/environment.ts'

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

        if (Object.values(settings.groups).length === 0) {
            throw new Error('ModelScene has no groups, which is redundant as no objects will be represented.')
        }

        this.settings = settings
        this.modelPromise = this._createModelPromise(input)
    }

    protected abstract _createModelPromise(input: I): M
    protected abstract _instantiate(difficulty: AbstractDifficulty): Promise<O>

    /** Instantiate the model scene given object inputs. Your difficulty will await this process before saving. */
    async instantiate(difficulty: AbstractDifficulty) {
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
        function doStatic(k: RawPointsVec3): Vec3 {
            return typeof k[0] === 'object' ? [k[0][0], k[0][1], k[0][2]] : k as Vec3
        }

        obj.position = doStatic(obj.position)
        obj.rotation = doStatic(obj.rotation)
        obj.scale = doStatic(obj.scale)
    }

    protected static getFirstValues(points: DeepReadonly<RawPointsVec3>) {
        const complexTransform = complexifyPoints(copy(points))[0]
        return [
            complexTransform[0],
            complexTransform[1],
            complexTransform[2],
        ] as Vec3
    }

    protected getGroupDefaultMaterialKey(groupKey: string) {
        return `modelScene${this.ID}_${groupKey}_material`
    }

    protected instantiateGroupObject(difficulty: AbstractDifficulty, factory: ModelGroupObjectFactory, groupKey: string) {
        const object = factory(difficulty)

        if (object instanceof Environment) { // Environment
            object.duplicate = 1
        } else { // Geometry
            const defaultMaterial = this.settings.groups[groupKey].defaultMaterial
            if (defaultMaterial) {
                if (typeof defaultMaterial === 'string') {
                    object.material = defaultMaterial
                }
                else {
                    const materialKey = this.getGroupDefaultMaterialKey(groupKey)
                    difficulty.geometryMaterials[materialKey] = defaultMaterial
                    object.material = materialKey
                }
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
                    throw new Error(`Group '${groupKey}' is in model object, but ModelScene has no corresponding group!`)
                }
                return
            }

            if (!group.object) {
                if (trackGroups.has(groupKey)) {
                    throw new Error(`Track group '${groupKey}' was referenced by multiple model objects in a model, when track groups should only represent one!`)
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
            if (options.reverseAnimation) {
                o.position = reverseAnimation(o.position)
                o.rotation = reverseAnimation(o.rotation)
                o.scale = reverseAnimation(o.scale)
            }

            // Loop animation
            if (options.mirrorAnimation) {
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
            inputPath,
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
                    throw new Error(`Group '${groupKey}' is in model object, but ModelScene has no corresponding group!`)
                }
                return
            }

            if (!group.object) {
                if (trackGroups.has(groupKey)) {
                    throw new Error(`Track group '${groupKey}' was referenced by multiple model objects in a model, when track groups should only represent one!`)
                }
                trackGroups.add(groupKey)
            }

            if (options.static) {
                ModelScene.makeModelObjectStatic(x)
            }

            // Making points a consistent array format
            const position = complexifyPoints(x.position)
            const rotation = complexifyPoints(x.rotation)
            const scale = complexifyPoints(x.scale)

            // Applying transformation to each points
            function getVec3(point: InnerPointVec3): Vec3 {
                return [point[0], point[1], point[2]]
            }

            if (position.length !== rotation.length || rotation.length !== scale.length) {
                throw new Error('Animated model data expected uniform length for scale, position, and rotation animations')
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
            x.position = optimizePoints(position, this.settings.animationSettings.optimizeSettings)
            x.rotation = optimizePoints(rotation, this.settings.animationSettings.optimizeSettings)
            x.scale = optimizePoints(scale, this.settings.animationSettings.optimizeSettings)

            // Reverse animation
            if (options.reverseAnimation) {
                x.position = reverseAnimation(x.position)
                x.rotation = reverseAnimation(x.rotation)
                x.scale = reverseAnimation(x.scale)
            }

            // Loop animation
            if (options.mirrorAnimation) {
                x.position = mirrorAnimation(x.position)
                x.rotation = mirrorAnimation(x.rotation)
                x.scale = mirrorAnimation(x.scale)
            }
        })

        return objects
    }
}
