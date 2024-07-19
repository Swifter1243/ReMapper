import { bsmap } from '../deps.ts'
import * as CustomEventInternals from '../internals/custom_event/mod.ts'
import { EASE, TrackValue } from '../types/animation_types.ts'
import { AssignTrackPrefabOptions } from '../types/beatmap_interfaces/vivify_events.ts'
import { FILEPATH } from '../types/beatmap_types.ts'
import { ExcludeTypes } from '../types/mod.ts'
import { TJson } from '../types/util_types.ts'
import { AnimatorProperty, DEPTH_TEX_MODE, MaterialProperty, RENDER_SETTING } from '../types/vivify_types.ts'

export type CustomEvent = CustomEventInternals.BaseCustomEvent

/** Make a custom event with no particular identity. */
export function abstractCustomEvent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AbstractCustomEvent>
        | [
            beat: number,
            type: string,
            data: TJson,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AbstractCustomEvent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AbstractCustomEvent
            >,
        )
    }

    const [beat, type, data] = params

    return new CustomEventInternals.AbstractCustomEvent(
        {
            beat: beat as number,
            type,
            data,
        },
    )
}

/**
 * Animate a track.
 * @param track Track(s) to effect.
 * @param duration The duration of the animation.
 * @param animation The animation properties to replace.
 * @param easing The easing on this event's animation.
 */
export function animateTrack(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AnimateTrack>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: CustomEventInternals.AnimateTrack['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AnimateTrack(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AnimateTrack
            >,
        )
    }

    const [beat, track, duration, animation, easing] = params

    return new CustomEventInternals.AnimateTrack(
        {
            beat: beat as number,
            track: track as TrackValue,
            duration,
            animation,
            easing,
        },
    )
}

/**
 * Animate objects on a track across their lifespan.
 * @param track Track(s) to effect.
 * @param duration The time to transition from a previous path to this one.
 * @param animation The animation properties to replace.
 * @param easing The easing on this event's animation.
 */
export function assignPathAnimation(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignPathAnimation>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: CustomEventInternals.AssignPathAnimation['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignPathAnimation(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignPathAnimation
            >,
        )
    }

    const [beat, track, duration, animation, easing] = params

    return new CustomEventInternals.AssignPathAnimation(
        {
            beat: beat as number,
            track: track as TrackValue,
            duration,
            animation,
            easing,
        },
    )
}

/**
 * Assign tracks to a parent track.
 * @param childrenTracks Children tracks to assign.
 * @param parentTrack Name of the parent track.
 * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
 */
export function assignTrackParent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignTrackParent>
        | [
            beat: number,
            childrenTracks: string[],
            parentTrack: string,
            worldPositionStays?: boolean,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignTrackParent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignTrackParent
            >,
        )
    }

    const [beat, childrenTracks, parentTrack, worldPositionStays] = params

    return new CustomEventInternals.AssignTrackParent(
        {
            beat: beat as number,
            childrenTracks: childrenTracks!,
            parentTrack: parentTrack!,
            worldPositionStays,
        },
    )
}

/**
 * Assigns the player to a track.
 * @param track Track the player will be assigned to.
 * @param target Which component of the player to target.
 */
export function assignPlayerToTrack(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignPlayerToTrack>
        | [
            beat: number,
            track?: string,
            target?: bsmap.PlayerObject,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignPlayerToTrack(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignPlayerToTrack
            >,
        )
    }

    const [beat, track, target] = params

    return new CustomEventInternals.AssignPlayerToTrack(
        {
            beat: beat as number,
            track,
            target,
        },
    )
}

/**
 * Animate components on a track.
 * @param track Track(s) to effect.
 * @param duration Duration of the animation.
 * @param easing The easing on the animation.
 */
export function animateComponent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AnimateComponent>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AnimateComponent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AnimateComponent
            >,
        )
    }

    const [beat, track, duration, easing] = params

    return new CustomEventInternals.AnimateComponent(
        {
            beat: beat as number,
            track,
            duration,
            easing,
        },
    )
}

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
export function assignTrackPrefab(...params: ConstructorParameters<typeof CustomEventInternals.AssignTrackPrefab>) {
    return new CustomEventInternals.AssignTrackPrefab(
        ...params as ConstructorParameters<
            typeof CustomEventInternals.AssignTrackPrefab
        >,
    )
}

type AssignTrackPrefabConstructor<T extends keyof AssignTrackPrefabOptions> = [
    ExcludeTypes<
        ConstructorParameters<typeof CustomEventInternals.AssignTrackPrefab>[0],
        Omit<AssignTrackPrefabOptions, T>
    >,
]

/** Replaces all objects on the track with the assigned prefab.
 * @note File path to the desired prefab to replace notes.
 */
export function assignTrackNote(
    ...params:
        | AssignTrackPrefabConstructor<'note'>
        | [
            beat: number,
            track: string,
            note: string,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignTrackPrefab(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignTrackPrefab
            >,
        )
    }

    const [beat, track, note] = params

    return new CustomEventInternals.AssignTrackPrefab(
        {
            beat,
            track,
            note,
        },
    )
}

/** Replaces all objects on the track with the assigned prefab.
 * @debris File path to the desired prefab to replace debris.
 */
export function assignTrackDebris(
    ...params:
        | AssignTrackPrefabConstructor<'debris'>
        | [
            beat: number,
            track: string,
            debris: string,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignTrackPrefab(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignTrackPrefab
            >,
        )
    }

    const [beat, track, debris] = params

    return new CustomEventInternals.AssignTrackPrefab(
        {
            beat,
            track,
            debris,
        },
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
