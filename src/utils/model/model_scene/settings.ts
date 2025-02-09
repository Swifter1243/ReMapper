import { AnimationSettings } from '../../animation/optimizer.ts'
import { ModelGroup, ModelGroupObjectFactory } from '../../../types/model/model_scene/group.ts'
import { DeepReadonly } from '../../../types/util/mutability.ts'
import { Transform } from '../../../types/math/transform.ts'
import { EnvironmentModelPiece } from '../../../types/model/model_scene/piece.ts'
import { environment } from '../../../builder_functions/beatmap/object/environment/environment.ts'
import { ModelScene } from './base.ts'
import { AbstractDifficulty } from '../../../internals/beatmap/abstract_difficulty.ts'
import { RawGeometryMaterial} from "../../../types/beatmap/object/environment.ts";

export class ModelSceneSettings {
    /** Throw when a model has groups that aren't represented. */
    throwOnMissingGroup = true

    /** If the scene is instantiated with `animate` and the first switch is not at a time of 0, `initializePositions` determines whether the first switch will be initialized at beat 0 and held in place until it is animated. */
    shouldInitializeObjects = true

    /** Settings for the optimizer on each animation event.
     * The animations will attempt to be optimized, removing visually redundant points.
     * This controls various parameters about how harshly the algorithm will target changes.
     */
    animationSettings = new AnimationSettings()

    groups: Record<string, ModelGroup> = {}

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
        object: ModelGroupObjectFactory,
        transform?: DeepReadonly<Transform>,
        defaultMaterial: RawGeometryMaterial = { shader: 'Standard' },
    ) {
        this.groups[key as string] = {
            object,
            transform,
            defaultMaterial
        }
    }

    /**
     * When the model is instantiated, model objects with no "group" key will invoke this object to represent it
     * @param object The object to spawn.
     * @param transform The transform applied to the spawned object.
     * @param defaultMaterial If you provide Geometry, you may set the default material.
     * @see groups
     */
    setDefaultObjectGroup(
        object: ModelGroupObjectFactory,
        transform?: DeepReadonly<Transform>,
        defaultMaterial?: RawGeometryMaterial,
    ): void
    setDefaultObjectGroup(
        modelPiece: EnvironmentModelPiece,
    ): void
    setDefaultObjectGroup(
        ...params: [
            object: ModelGroupObjectFactory,
            transform?: DeepReadonly<Transform>,
            defaultMaterial?: RawGeometryMaterial,
        ] | [
            modelPiece: EnvironmentModelPiece,
        ]
    ): void {
        if (typeof params[0] === 'function') {
            const [object, transform, defaultMaterial] = params

            this.pushObjectGroup(ModelScene.defaultGroupKey, object, transform, defaultMaterial)
        } else {
            const [modelPiece] = params

            this.pushObjectGroup(ModelScene.defaultGroupKey, (difficulty) =>
                environment(difficulty as AbstractDifficulty, {
                    id: modelPiece.id,
                    lookupMethod: modelPiece.lookupMethod,
                }), modelPiece.transform)
        }
    }

    /**
     * When the model is instantiated, model objects with the matching "group" key will invoke this object to represent it
     * @param group The group key for objects to identify they are part of this group.
     * @param object The object to spawn.
     * @param transform The transform applied to the spawned object.
     * @param defaultMaterial If you provide Geometry, you may set the default material.
     */
    setObjectGroup(
        group: string,
        object: ModelGroupObjectFactory,
        transform?: DeepReadonly<Transform>,
        defaultMaterial?: RawGeometryMaterial,
    ): void
    setObjectGroup(
        group: string,
        modelPiece: EnvironmentModelPiece
    ): void
    setObjectGroup(
        ...params: [
            group: string,
            object: ModelGroupObjectFactory,
            transform?: DeepReadonly<Transform>,
            defaultMaterial?: RawGeometryMaterial,
        ] | [
            group: string,
            modelPiece: EnvironmentModelPiece,
        ]
    ): void {
        if (typeof params[1] === 'function') {
            const [group, object, transform, defaultMaterial] = params

            this.pushObjectGroup(group, object, transform, defaultMaterial)
        } else {
            const [group, modelPiece] = params

            this.pushObjectGroup(group, (difficulty) =>
                environment(difficulty as AbstractDifficulty, {
                    id: modelPiece.id,
                    lookupMethod: modelPiece.lookupMethod,
                }), modelPiece.transform)
        }
    }

    /** Remove the default material on an object group, causing each Geometry object to have a unique material.
     * WARNING: Only do this if you know what you're doing, because this means each geometry object instantiated from this group will have its own draw call. */
    removeObjectGroupDefaultMaterial(group: string) {
        this.groups[group].defaultMaterial = undefined
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
}
