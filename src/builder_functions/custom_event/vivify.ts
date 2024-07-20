import * as CustomEventInternals from '../../internals/custom_event/mod.ts'
import { EASE, TrackValue } from '../../types/animation.ts'
import {
    AnimatorProperty,
    DEPTH_TEX_MODE,
    MaterialProperty,
    RENDER_SETTING,
} from '../../types/vivify.ts'
import { FILEPATH } from '../../types/beatmap.ts'

/**
 * Set properties on a material.
 * @param asset File path to the material.
 * @param properties Properties to set.
 * @param duration The duration of the animation.
 * @param easing An easing for the animation to follow.
 */
export function setMaterialProperty(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.SetMaterialProperty>
        | [
            beat: number,
            asset: string,
            properties: MaterialProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.SetMaterialProperty(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.SetMaterialProperty
            >,
        )
    }

    const [beat, asset, properties, duration, easing] = params

    return new CustomEventInternals.SetMaterialProperty(
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
 * @param properties Properties to set.
 * @param duration The duration of the animation.
 * @param easing An easing for the animation to follow.
 */
export function setGlobalProperty(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.SetGlobalProperty>
        | [
            beat: number,
            properties: MaterialProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.SetGlobalProperty(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.SetGlobalProperty
            >,
        )
    }

    const [beat, properties, duration, easing] = params

    return new CustomEventInternals.SetGlobalProperty(
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
 * @param asset File path to the material.
 * @param duration The duration of the animation.
 * @param properties Properties to set.
 * @param easing An easing for the animation to follow.
 */
export function blit(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.Blit>
        | [
            beat: number,
            asset?: string,
            duration?: number,
            properties?: MaterialProperty[],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.Blit(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.Blit
            >,
        )
    }

    const [beat, asset, duration, properties, easing] = params

    return new CustomEventInternals.Blit(
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
 * @param id Name of the culling mask, this is what you must name your sampler in your shader.
 * @param track The track(s) to target for culling.
 * @param whitelist Culls everything but the selected tracks.
 */
export function declareCullingTexture(
    ...params:
        | ConstructorParameters<
            typeof CustomEventInternals.DeclareCullingTexture
        >
        | [
            beat: number,
            id: string,
            track: TrackValue,
            whitelist?: boolean,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.DeclareCullingTexture(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.DeclareCullingTexture
            >,
        )
    }

    const [beat, id, track, whitelist] = params

    return new CustomEventInternals.DeclareCullingTexture(
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
 * @param id Name of the depth texture.
 * @param width Exact width for the texture.
 * @param height Exact height for the texture.
 */
export function declareRenderTexture(
    ...params:
        | ConstructorParameters<
            typeof CustomEventInternals.DeclareRenderTexture
        >
        | [
            beat: number,
            id: string,
            width?: number,
            height?: number,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.DeclareRenderTexture(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.DeclareRenderTexture
            >,
        )
    }

    const [beat, id, width, height] = params

    return new CustomEventInternals.DeclareRenderTexture(
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
            typeof CustomEventInternals.DestroyTexture
        >
        | [
            beat: number,
            id: TrackValue,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.DestroyTexture(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.DestroyTexture
            >,
        )
    }

    const [beat, id] = params

    return new CustomEventInternals.DestroyTexture(
        {
            beat,
            id: id as TrackValue,
        },
    )
}

/**
 * Instantiate a chosen prefab into the scene.
 * @param asset File path to the desired prefab.
 * @param id Unique id for referencing prefab later. Random id will be given by default.
 * @param track The track for the prefab.
 */
export function instantiatePrefab(
    ...params:
        | ConstructorParameters<
            typeof CustomEventInternals.InstantiatePrefab
        >
        | [
            beat: number,
            asset: FILEPATH,
            id?: string,
            track?: string,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.InstantiatePrefab(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.InstantiatePrefab
            >,
        )
    }

    const [beat, asset, id, track] = params

    return new CustomEventInternals.InstantiatePrefab(
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
            typeof CustomEventInternals.DestroyPrefab
        >
        | [
            beat: number,
            id: TrackValue,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.DestroyPrefab(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.DestroyPrefab
            >,
        )
    }

    const [beat, id] = params

    return new CustomEventInternals.DestroyPrefab(
        {
            beat,
            id: id as TrackValue,
        },
    )
}

/**
 * Searches a prefab for animator components and sets properties.
 * @param id ID assigned to the prefab.
 * @param properties Properties to set.
 * @param duration The duration of the animation.
 * @param easing An easing for the animation to follow.
 */
export function setAnimatorProperty(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.SetAnimatorProperty>
        | [
            beat: number,
            id: string,
            properties: AnimatorProperty[],
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.SetAnimatorProperty(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.SetAnimatorProperty
            >,
        )
    }

    const [beat, id, properties, duration, easing] = params

    return new CustomEventInternals.SetAnimatorProperty(
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
        | ConstructorParameters<typeof CustomEventInternals.SetCameraProperty>
        | [
            beat: number,
            depthTextureMode: DEPTH_TEX_MODE[],
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.SetCameraProperty(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.SetCameraProperty
            >,
        )
    }

    const [beat, depthTextureMode] = params

    return new CustomEventInternals.SetCameraProperty(
        {
            beat,
            depthTextureMode,
        },
    )
}

/** Replaces all objects on the track with the assigned prefab.
 */
export function assignTrackPrefab(
    ...params: ConstructorParameters<typeof CustomEventInternals.AssignTrackPrefab>
) {
    return new CustomEventInternals.AssignTrackPrefab(
        ...params as ConstructorParameters<
            typeof CustomEventInternals.AssignTrackPrefab
        >,
    )
}

/** Set settings for the rendering. */
export function setRenderSetting(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.SetRenderSetting>
        | [
            beat: number,
            settings: Partial<RENDER_SETTING>,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.SetRenderSetting(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.SetRenderSetting
            >,
        )
    }

    const [beat, settings, duration, easing] = params

    return new CustomEventInternals.SetRenderSetting(
        {
            beat,
            settings,
            duration,
            easing,
        },
    )
}
