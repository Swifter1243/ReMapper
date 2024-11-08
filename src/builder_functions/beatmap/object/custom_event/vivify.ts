import { CAMERA_CLEAR_FLAGS, DEPTH_TEX_MODE, QUALITY_SETTINGS, RENDERING_SETTINGS, XR_SETTINGS } from '../../../../types/vivify/setting.ts'

import { EASE } from '../../../../types/animation/easing.ts'
import { TrackValue } from '../../../../types/animation/track.ts'
import { FILEPATH } from '../../../../types/beatmap/file.ts'
import { MaterialProperty } from '../../../../types/vivify/material.ts'
import { AnimatorProperty } from '../../../../types/vivify/animator.ts'
import { SetMaterialProperty } from '../../../../internals/beatmap/object/custom_event/vivify/set_material_property.ts'
import { SetGlobalProperty } from '../../../../internals/beatmap/object/custom_event/vivify/set_global_property.ts'
import { Blit } from '../../../../internals/beatmap/object/custom_event/vivify/blit.ts'
import { CreateCamera } from '../../../../internals/beatmap/object/custom_event/vivify/declare_culling_texture.ts'
import { DeclareRenderTexture } from '../../../../internals/beatmap/object/custom_event/vivify/declare_render_texture.ts'
import { InstantiatePrefab } from '../../../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts'
import { DestroyObject } from '../../../../internals/beatmap/object/custom_event/vivify/destroy_object.ts'
import { SetAnimatorProperty } from '../../../../internals/beatmap/object/custom_event/vivify/set_animator_property.ts'
import { SetCameraProperty } from '../../../../internals/beatmap/object/custom_event/vivify/set_camera_property.ts'
import { AssignObjectPrefab } from '../../../../internals/beatmap/object/custom_event/vivify/assign_object_prefab.ts'
import { SetRenderingSettings } from '../../../../internals/beatmap/object/custom_event/vivify/set_rendering_setting.ts'
import { ColorVec } from '../../../../types/math/vector.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/**
 * Set properties on a material.
 */
export function setMaterialProperty(
    ...params:
        | ConstructorParameters<typeof SetMaterialProperty>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            asset: string,
            properties: MaterialProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new SetMaterialProperty(
            ...params as ConstructorParameters<
                typeof SetMaterialProperty
            >,
        )
    }

    const [parentDifficulty, beat, asset, properties, duration, easing] = params

    return new SetMaterialProperty(parentDifficulty, {
        beat,
        asset,
        properties,
        duration,
        easing,
    })
}

/**
 * Allows setting global properties that persist even after the map ends.
 */
export function setGlobalProperty(
    ...params:
        | ConstructorParameters<typeof SetGlobalProperty>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            properties: MaterialProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new SetGlobalProperty(
            ...params as ConstructorParameters<
                typeof SetGlobalProperty
            >,
        )
    }

    const [parentDifficulty, beat, properties, duration, easing] = params

    return new SetGlobalProperty(parentDifficulty, {
        beat,
        properties,
        duration,
        easing,
    })
}

/**
 * Assigns a material to the camera and allows you to call a SetMaterialProperty from within.
 */
export function blit(
    ...params:
        | ConstructorParameters<typeof Blit>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            asset?: string,
            duration?: number,
            properties?: MaterialProperty[],
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new Blit(
            ...params as ConstructorParameters<
                typeof Blit
            >,
        )
    }

    const [parentDifficulty, beat, asset, duration, properties, easing] = params

    return new Blit(parentDifficulty, {
        beat,
        asset,
        duration,
        properties,
        easing,
    })
}

/**
 * Creates an additional camera that will render to the desired texture. Useful for creating a secondary texture where a certain track is culled.
 */
export function createCamera(
    ...params:
        | ConstructorParameters<
            typeof CreateCamera
        >
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            id: string,
            texture?: string,
            depthTexture?: string
        ]
) {
    if (typeof params[1] === 'object') {
        return new CreateCamera(
            ...params as ConstructorParameters<
                typeof CreateCamera
            >,
        )
    }

    const [parentDifficulty, beat, id, texture, depthTexture] = params

    return new CreateCamera(parentDifficulty, {
        beat,
        id,
        texture,
        depthTexture
    })
}

/**
 * Declare a RenderTexture to be used anywhere.
 * They are set as a global variable and can be accessed by declaring a sampler named what you put in "name".
 * Depth texture can be obtained by adding the suffix "_Depth" to your sampler.
 */
export function declareRenderTexture(
    ...params:
        | ConstructorParameters<
            typeof DeclareRenderTexture
        >
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            id: string,
            width?: number,
            height?: number,
        ]
) {
    if (typeof params[1] === 'object') {
        return new DeclareRenderTexture(
            ...params as ConstructorParameters<
                typeof DeclareRenderTexture
            >,
        )
    }

    const [parentDifficulty, beat, id, width, height] = params

    return new DeclareRenderTexture(parentDifficulty, {
        beat,
        id,
        width,
        height,
    })
}

/**
 * Instantiate a chosen prefab into the scene.
 */
export function instantiatePrefab(
    ...params:
        | ConstructorParameters<
            typeof InstantiatePrefab
        >
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            asset: FILEPATH,
            id?: string,
            track?: TrackValue,
        ]
) {
    if (typeof params[1] === 'object') {
        return new InstantiatePrefab(
            ...params as ConstructorParameters<
                typeof InstantiatePrefab
            >,
        )
    }

    const [parentDifficulty, beat, asset, id, track] = params

    return new InstantiatePrefab(parentDifficulty, {
        beat,
        asset,
        id,
        track,
    })
}

/** Destroys a prefab or multiple prefabs in the scene. */
export function destroyObject(
    ...params:
        | ConstructorParameters<
            typeof DestroyObject
        >
        | [
            parentDifficulty: AbstractDifficulty,
            beat?: number,
            id?: TrackValue,
        ]
) {
    if (typeof params[1] === 'object') {
        return new DestroyObject(
            ...params as ConstructorParameters<
                typeof DestroyObject
            >,
        )
    }

    const [parentDifficulty, beat, id] = params

    return new DestroyObject(parentDifficulty, {
        beat,
        id,
    })
}

/**
 * Searches a prefab for animator components and sets properties.
 */
export function setAnimatorProperty(
    ...params:
        | ConstructorParameters<typeof SetAnimatorProperty>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            id: string,
            properties: AnimatorProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new SetAnimatorProperty(
            ...params as ConstructorParameters<
                typeof SetAnimatorProperty
            >,
        )
    }

    const [parentDifficulty, beat, id, properties, duration, easing] = params

    return new SetAnimatorProperty(parentDifficulty, {
        beat,
        id,
        properties,
        duration,
        easing,
    })
}

/** Set properties on the camera. */
export function setCameraProperty(
    ...params:
        | ConstructorParameters<typeof SetCameraProperty>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            depthTextureMode?: DEPTH_TEX_MODE[],
            clearFlags?: CAMERA_CLEAR_FLAGS,
            backgroundColor?: ColorVec,
        ]
) {
    if (typeof params[1] === 'object') {
        return new SetCameraProperty(
            ...params as ConstructorParameters<
                typeof SetCameraProperty
            >,
        )
    }

    const [parentDifficulty, beat, depthTextureMode, clearFlags, backgroundColor] = params

    return new SetCameraProperty(parentDifficulty, {
        beat,
        depthTextureMode,
        clearFlags,
        backgroundColor,
    })
}

/** Replaces objects in the map with prefabs. */
export function assignObjectPrefab(
    ...params: ConstructorParameters<typeof AssignObjectPrefab>
) {
    return new AssignObjectPrefab(
        ...params as ConstructorParameters<
            typeof AssignObjectPrefab
        >,
    )
}

/** Set settings for the rendering. */
export function setRenderingSettings(
    ...params:
        | ConstructorParameters<typeof SetRenderingSettings>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            renderSettings?: Partial<RENDERING_SETTINGS>,
            qualitySettings?: Partial<QUALITY_SETTINGS>,
            xrSettings?: Partial<XR_SETTINGS>,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new SetRenderingSettings(
            ...params as ConstructorParameters<
                typeof SetRenderingSettings
            >,
        )
    }

    const [parentDifficulty, beat, renderSettings, qualitySettings, xrSettings, duration, easing] = params

    return new SetRenderingSettings(parentDifficulty, {
        beat,
        renderSettings,
        qualitySettings,
        xrSettings,
        duration,
        easing,
    })
}
