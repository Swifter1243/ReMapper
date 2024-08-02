import { getActiveDifficulty } from '../../../data/active_difficulty.ts'
import { GroupObjectTypes, ModelGroup } from '../../../types/model/model_scene/group.ts'
import { AnimationSettings, optimizeKeyframes } from '../../animation/optimizer.ts'
import { SceneObjectInfo } from '../../../types/model/model_scene/scene_object_info.ts'
import { Vec3 } from '../../../types/math/vector.ts'
import { Environment } from '../../../internals/beatmap/object/environment/environment.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { AnimatedObjectInput, ObjectInput } from '../../../types/model/model_scene/input.ts'
import { AnimatedOptions } from '../../../types/model/model_scene/option.ts'
import { ModelObject, ReadonlyModel } from '../../../types/model/object.ts'
import { RawKeyframesVec3 } from '../../../types/animation/keyframe/vec3.ts'
import { complexifyKeyframes } from '../../animation/keyframe/complexity.ts'
import { copy } from '../../object/copy.ts'
import {applyAnchor, combineRotations, combineTransforms} from '../../math/transform.ts'
import { positionUnityToNoodle } from '../../beatmap/object/environment/unit_conversion.ts'
import { mirrorAnimation } from '../../animation/time_warp.ts'
import { parseFilePath } from '../../file.ts'
import { getModel } from '../file.ts'
import { TransformKeyframe } from '../../../types/animation/bake.ts'
import { bakeAnimation } from '../../animation/bake.ts'
import { iterateKeyframes } from '../../animation/keyframe/iterate.ts'
import { DeepReadonly } from '../../../types/util/mutability.ts'

export abstract class ModelScene<I, O> {
    protected static modelSceneCount = 0

    /** All the "groups" stored in this model.
     * When the model properties is passed, if any model objects have a track that match the name of this group, an animation event will be placed for them.
     */
    groups = <Record<string, ModelGroup>> {}
    /** Settings for the optimizer on each animation event.
     * The animations will attempt to be optimized, removing visually redundant points.
     * This controls various parameters about how harshly the algorithm will target changes.
     */
    animationSettings = new AnimationSettings()
    /** The unique ID of this model scene, used for tracks.
     * If multiple model scenes are used, this ID is used so the track names don't conflict.
     */
    ID: number
    /** The info outputted from instantiating object properties from `static` or `animate`, for each group.
     * @see this.groups
     */
    sceneObjectInfo = <Record<string, SceneObjectInfo>> {}
    /** If the scene is instantiated with `animate` and the first switch is not at a time of 0, `initializePositions` determines whether the first switch will be initialized at beat 0 and held in place until it is animated. */
    initializeObjects = true
    /** Whether this scene has been instantiated. */
    private instantiated = false

    /**
     * Handler for representing object properties as part of the environment.
     * @param object Object to spawn on model objects with no track.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    constructor(
        object?: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
    ) {
        if (object) this.pushGroup(undefined, object, scale, anchor, rotation)
        this.ID = ModelScene.modelSceneCount
        ModelScene.modelSceneCount++
    }

    /** Instantiate the model scene given object inputs. Your difficulty will await this process before saving. */
    async run(input: I) {
        this.ensureNotInstantiated()
        return await getActiveDifficulty().runAsync(async () => await this._run(input))
    }

    protected abstract _run(input: I): Promise<O>

    protected static createYeetDef() {
        getActiveDifficulty().pointDefinitions.yeet = [0, -69420, 0]
    }

    private pushGroup(
        key: string | undefined,
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
     * Assign a track in input ModelObjects to spawn and pool new objects.
     * @param track Track to check for.
     * @param object Object to spawn.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    addPrimaryGroups(
        track: string | string[],
        object: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
    ) {
        const tracks = typeof track === 'object' ? track : [track]
        tracks.forEach((t) => {
            this.pushGroup(t, object, scale, anchor, rotation)
        })
    }

    /**
     * Assign a track in input ModelObjects to animate an existing object with identical track name.
     * @param track Track to check for and animate.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     * @param disappearWhenAbsent Make the object on this track disappear when no ModelObject with the corresponding track exists.
     */
    assignObjects(
        track: string | string[],
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
        disappearWhenAbsent = true,
    ) {
        const tracks = typeof track === 'object' ? track : [track]
        tracks.forEach((t) => {
            this.pushGroup(t, undefined, scale, anchor, rotation, (x) => {
                x.disappearWhenAbsent = disappearWhenAbsent
            })
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

    private makeModelObjectStatic(obj: ModelObject) {
        const doStatic = (k: RawKeyframesVec3) => typeof k[0] === 'object' ? [k[0][0], k[0][1], k[0][2]] as Vec3 : k as Vec3

        obj.position = doStatic(obj.position)
        obj.rotation = doStatic(obj.rotation)
        obj.scale = doStatic(obj.scale)
    }

    protected getPieceTrack = (
        object: undefined | GroupObjectTypes,
        track: string,
        index: number,
    ) => object ? `modelScene${this.ID}_${track}_${index}` : track

    protected getFirstValues(keyframes: DeepReadonly<RawKeyframesVec3>) {
        const complexTransform = complexifyKeyframes(copy(keyframes))[0]
        return [
            complexTransform[0],
            complexTransform[1],
            complexTransform[2],
        ] as Vec3
    }

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

        objectInput.forEach((x) => {
            const o = copy(x) as ModelObject

            if (options.static) {
                this.makeModelObjectStatic(o)
            }

            // Getting relevant object transforms
            let scale: Vec3 | undefined
            let anchor: Vec3 | undefined
            let rotation: Vec3 | undefined

            const group = this.groups[x.group as string]
            if (group) {
                if (group.scale) scale = group.scale
                if (group.anchor) anchor = group.anchor
                if (group.rotation) rotation = group.rotation
            }

            function getBakedTransform(transform: TransformKeyframe) {
                if (options.transform) {
                    const combined = combineTransforms(
                        {
                            position: transform.position,
                            rotation: transform.rotation,
                            scale: transform.scale,
                        },
                        options.transform,
                        options.transform.anchor,
                    )
                    transform.position = combined.position
                    transform.rotation = combined.rotation
                    transform.scale = combined.scale
                }

                transform.position = applyAnchor(
                    transform.position,
                    transform.rotation,
                    transform.scale,
                    anchor ?? [0, 0, 0] as Vec3,
                )
            }

            const shouldBake = (anchor && options.bake !== false && !options.static) ||
                options.bake === true ||
                options.transform !== undefined
            if (shouldBake) {
                // Baking animation
                const bakedCube: ModelObject = bakeAnimation(
                    {
                        position: x.position,
                        rotation: x.rotation,
                        scale: x.scale,
                    },
                    getBakedTransform,
                    this.animationSettings,
                )

                if (!getActiveDifficulty().v3) {
                    positionUnityToNoodle(bakedCube.position)
                }

                o.position = bakedCube.position
                o.rotation = bakedCube.rotation
                o.scale = bakedCube.scale
            }

            if (rotation) {
                iterateKeyframes(o.rotation, (y) => {
                    const newRotation = combineRotations([y[0], y[1], y[2]], rotation!)
                    Object.assign(y, newRotation)
                })
            }

            if (scale) {
                iterateKeyframes(o.scale, (y) => {
                    y[0] *= (scale!)[0]
                    y[1] *= (scale!)[1]
                    y[2] *= (scale!)[2]
                })
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
        const processing: unknown[] = [
            options,
            onCache,
            this.groups,
            this.animationSettings.toData(),
            getActiveDifficulty().v3,
        ]

        const model = getModel(
            inputPath,
            `modelScene${this.ID}_${inputPath}`,
            (objects) => this.processFileObjects(objects, options),
            processing,
        )
        if (options.objects) options.objects(await model)
        return model
    }

    private processFileObjects(
        fileObjects: ModelObject[],
        options: AnimatedOptions,
    ) {
        if (options.onCache) options.onCache(fileObjects)
        fileObjects.forEach((x) => {
            if (options.static) {
                this.makeModelObjectStatic(x)
            }

            // Getting relevant object transforms
            let scale: Vec3 | undefined
            let anchor: Vec3 | undefined
            let rotation: Vec3 | undefined

            const group = this.groups[x.group as string]
            if (group) {
                if (group.scale) scale = group.scale
                if (group.anchor) anchor = group.anchor
                if (group.rotation) rotation = group.rotation
            }

            // Making keyframes a consistent array format
            x.position = complexifyKeyframes(x.position)
            x.rotation = complexifyKeyframes(x.rotation)
            x.scale = complexifyKeyframes(x.scale)

            // Applying transformation to each keyframe
            for (let i = 0; i < x.position.length; i++) {
                let objPos = copy(
                    x.position[i],
                ) as number[]
                let objRot = copy(
                    x.rotation[i],
                ) as number[]
                let objScale = copy(
                    x.scale[i],
                ) as number[]
                objPos.pop()
                objRot.pop()
                objScale.pop()

                if (options.transform) {
                    const combined = combineTransforms(
                        {
                            position: objPos as Vec3,
                            rotation: objRot as Vec3,
                            scale: objScale as Vec3,
                        },
                        options.transform,
                        options.transform.anchor,
                    )
                    objPos = combined.position
                    objRot = combined.rotation
                    objScale = combined.scale
                }

                if (anchor) {
                    objPos = applyAnchor(
                        objPos as Vec3,
                        objRot as Vec3,
                        objScale as Vec3,
                        anchor,
                    )
                }

                if (rotation) {
                    objRot = combineRotations(objRot as Vec3, rotation)
                }

                if (scale) {
                    objScale = (objScale as Vec3).map((x, i) => x * (scale as Vec3)[i])
                }

                if (!getActiveDifficulty().v3) {
                    positionUnityToNoodle(objPos as Vec3)
                }

                x.position[i] = [...(objPos as Vec3), x.position[i][3]]
                x.rotation[i] = [...(objRot as Vec3), x.rotation[i][3]]
                x.scale[i] = [
                    ...(objScale as Vec3),
                    x.scale[i][3],
                ]
            }

            // Optimizing object
            x.position = optimizeKeyframes(
                x.position,
                this.animationSettings.optimizeSettings,
            )
            x.rotation = optimizeKeyframes(
                x.rotation,
                this.animationSettings.optimizeSettings,
            )
            x.scale = optimizeKeyframes(
                x.scale,
                this.animationSettings.optimizeSettings,
            )

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
