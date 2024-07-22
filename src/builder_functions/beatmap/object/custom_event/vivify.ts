import {DEPTH_TEX_MODE, RENDER_SETTING,} from '../../../../types/vivify/setting.ts'

import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";
import {FILEPATH} from "../../../../types/beatmap/file.ts";
import {MaterialProperty} from "../../../../types/vivify/material.ts";
import {AnimatorProperty} from "../../../../types/vivify/animator.ts";
import {SetMaterialProperty} from "../../../../internals/beatmap/object/custom_event/vivify/set_material_property.ts";
import {SetGlobalProperty} from "../../../../internals/beatmap/object/custom_event/vivify/set_global_property.ts";
import {Blit} from "../../../../internals/beatmap/object/custom_event/vivify/blit.ts";
import {
    DeclareCullingTexture
} from "../../../../internals/beatmap/object/custom_event/vivify/declare_culling_texture.ts";
import {DeclareRenderTexture} from "../../../../internals/beatmap/object/custom_event/vivify/declare_render_texture.ts";
import {DestroyTexture} from "../../../../internals/beatmap/object/custom_event/vivify/destroy_texture.ts";
import {InstantiatePrefab} from "../../../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {DestroyPrefab} from "../../../../internals/beatmap/object/custom_event/vivify/destroy_prefab.ts";
import {SetAnimatorProperty} from "../../../../internals/beatmap/object/custom_event/vivify/set_animator_property.ts";
import {SetCameraProperty} from "../../../../internals/beatmap/object/custom_event/vivify/set_camera_property.ts";
import {AssignTrackPrefab} from "../../../../internals/beatmap/object/custom_event/vivify/assign_track_prefab.ts";
import {SetRenderSetting} from "../../../../internals/beatmap/object/custom_event/vivify/set_render_setting.ts";

/**
 * Set properties on a material.
 */
export function setMaterialProperty(
    ...params:
        | ConstructorParameters<typeof SetMaterialProperty>
        | [
            beat: number,
            asset: string,
            properties: MaterialProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new SetMaterialProperty(
            ...params as ConstructorParameters<
                typeof SetMaterialProperty
            >,
        )
    }

    const [beat, asset, properties, duration, easing] = params

    return new SetMaterialProperty(
        {
            beat,
            asset,
            properties,
            duration,
            easing,
        },
    )
}

/**
 * Allows setting global properties that persist even after the map ends.
 */
export function setGlobalProperty(
    ...params:
        | ConstructorParameters<typeof SetGlobalProperty>
        | [
            beat: number,
            properties: MaterialProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new SetGlobalProperty(
            ...params as ConstructorParameters<
                typeof SetGlobalProperty
            >,
        )
    }

    const [beat, properties, duration, easing] = params

    return new SetGlobalProperty(
        {
            beat,
            properties,
            duration,
            easing,
        },
    )
}

/**
 * Assigns a material to the camera and allows you to call a SetMaterialProperty from within.
 */
export function blit(
    ...params:
        | ConstructorParameters<typeof Blit>
        | [
            beat: number,
            asset?: string,
            duration?: number,
            properties?: MaterialProperty[],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new Blit(
            ...params as ConstructorParameters<
                typeof Blit
            >,
        )
    }

    const [beat, asset, duration, properties, easing] = params

    return new Blit(
        {
            beat,
            asset,
            duration,
            properties,
            easing,
        },
    )
}

/**
 * Declares a culling mask where selected tracks are culled.
 * Vivify will automatically create a texture for you to sample from your shader
 */
export function declareCullingTexture(
    ...params:
        | ConstructorParameters<
            typeof DeclareCullingTexture
        >
        | [
            beat: number,
            id: string,
            track: TrackValue,
            whitelist?: boolean,
        ]
) {
    if (typeof params[0] === 'object') {
        return new DeclareCullingTexture(
            ...params as ConstructorParameters<
                typeof DeclareCullingTexture
            >,
        )
    }

    const [beat, id, track, whitelist] = params

    return new DeclareCullingTexture(
        {
            beat,
            id,
            track,
            whitelist,
        },
    )
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
            beat: number,
            id: string,
            width?: number,
            height?: number,
        ]
) {
    if (typeof params[0] === 'object') {
        return new DeclareRenderTexture(
            ...params as ConstructorParameters<
                typeof DeclareRenderTexture
            >,
        )
    }

    const [beat, id, width, height] = params

    return new DeclareRenderTexture(
        {
            beat,
            id,
            width,
            height,
        },
    )
}

/**
 * Destroys a texture.
 * It is important to destroy any textures created through DeclareCullingTexture because the scene will have to be rendered again for each active culling texture. This can also be used for textures created through DeclareRenderTexture to free up memory.
 */
export function destroyTexture(
    ...params:
        | ConstructorParameters<
            typeof DestroyTexture
        >
        | [
            beat: number,
            id: TrackValue,
        ]
) {
    if (typeof params[0] === 'object') {
        return new DestroyTexture(
            ...params as ConstructorParameters<
                typeof DestroyTexture
            >,
        )
    }

    const [beat, id] = params

    return new DestroyTexture(
        {
            beat,
            id: id as TrackValue,
        },
    )
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
            beat: number,
            asset: FILEPATH,
            id?: string,
            track?: string,
        ]
) {
    if (typeof params[0] === 'object') {
        return new InstantiatePrefab(
            ...params as ConstructorParameters<
                typeof InstantiatePrefab
            >,
        )
    }

    const [beat, asset, id, track] = params

    return new InstantiatePrefab(
        {
            beat,
            asset,
            id,
            track,
        },
    )
}

/** Destroys a prefab or multiple prefabs in the scene. */
export function destroyPrefab(
    ...params:
        | ConstructorParameters<
            typeof DestroyPrefab
        >
        | [
            beat: number,
            id: TrackValue,
        ]
) {
    if (typeof params[0] === 'object') {
        return new DestroyPrefab(
            ...params as ConstructorParameters<
                typeof DestroyPrefab
            >,
        )
    }

    const [beat, id] = params

    return new DestroyPrefab(
        {
            beat,
            id: id as TrackValue,
        },
    )
}

/**
 * Searches a prefab for animator components and sets properties.
 */
export function setAnimatorProperty(
    ...params:
        | ConstructorParameters<typeof SetAnimatorProperty>
        | [
            beat: number,
            id: string,
            properties: AnimatorProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new SetAnimatorProperty(
            ...params as ConstructorParameters<
                typeof SetAnimatorProperty
            >,
        )
    }

    const [beat, id, properties, duration, easing] = params

    return new SetAnimatorProperty(
        {
            beat,
            id,
            properties,
            duration,
            easing,
        },
    )
}

/** Set properties on the camera. */
export function setCameraProperty(
    ...params:
        | ConstructorParameters<typeof SetCameraProperty>
        | [
            beat: number,
            depthTextureMode: DEPTH_TEX_MODE[],
        ]
) {
    if (typeof params[0] === 'object') {
        return new SetCameraProperty(
            ...params as ConstructorParameters<
                typeof SetCameraProperty
            >,
        )
    }

    const [beat, depthTextureMode] = params

    return new SetCameraProperty(
        {
            beat,
            depthTextureMode,
        },
    )
}

/** Replaces all objects on the track with the assigned prefab.
 */
export function assignTrackPrefab(
    ...params: ConstructorParameters<typeof AssignTrackPrefab>
) {
    return new AssignTrackPrefab(
        ...params as ConstructorParameters<
            typeof AssignTrackPrefab
        >,
    )
}

/** Set settings for the rendering. */
export function setRenderSetting(
    ...params:
        | ConstructorParameters<typeof SetRenderSetting>
        | [
            beat: number,
            settings: Partial<RENDER_SETTING>,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new SetRenderSetting(
            ...params as ConstructorParameters<
                typeof SetRenderSetting
            >,
        )
    }

    const [beat, settings, duration, easing] = params

    return new SetRenderSetting(
        {
            beat,
            settings,
            duration,
            easing,
        },
    )
}
