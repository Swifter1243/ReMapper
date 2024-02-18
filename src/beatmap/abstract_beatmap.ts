import { bsmap } from '../deps.ts'

import {
    DIFFNAME,
    DIFFPATH,
    RawGeometryMaterial,
    REQUIRE_MODS,
    SUGGEST_MODS,
    TJson,
} from '../types/mod.ts'

import { setDecimals } from '../utils/math.ts'

import {
    optimizeKeyframes,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'
import { AnyNote, parseFilePath, RMLog } from '../general.ts'

import { attachWorkingDirectory, settings } from '../data/beatmap_handler.ts' // TODO: Cyclic, fix

import * as AnimationInternals from '../internals/animation.ts'
import * as CustomEventInternals from '../internals/custom_event/mod.ts'
import * as EnvironmentInternals from '../internals/environment.ts'
import * as NoteInternals from '../internals/note.ts'
import * as WallInternals from '../internals/wall.ts'
import * as BasicEventInternals from '../internals/basic_event.ts'
import * as LightingV3 from '../internals/lighting_v3.ts'
import { EventInternals } from '../internals/mod.ts'
import { FogEvent } from './fog.ts'
import { getActiveCache } from '../rm_cache.ts'
import { RuntimePointDefinitionAny } from '../types/animation_types.ts'
import { RawKeyframesLinear } from '../types/animation_types.ts'
import { animationIsRuntime } from '../animation/animation_utils.ts'

export interface RMDifficulty {
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    v3: boolean
    waypoints: bsmap.v2.IWaypoint[] | bsmap.v3.IWaypoint[]

    notes: NoteInternals.Note[]
    bombs: NoteInternals.Bomb[]
    arcs: NoteInternals.Arc[]
    chains: NoteInternals.Chain[]
    walls: WallInternals.Wall[]

    lightEvents: BasicEventInternals.LightEvent[]
    laserSpeedEvents: BasicEventInternals.LaserSpeedEvent[]
    ringZoomEvents: BasicEventInternals.RingZoomEvent[]
    ringSpinEvents: BasicEventInternals.RingSpinEvent[]
    rotationEvents: EventInternals.RotationEvent[]
    boostEvents: EventInternals.BoostEvent[]
    baseBasicEvents: BasicEventInternals.BaseEvent[]
    bpmEvents: EventInternals.BPMEvent[]

    lightColorEventBoxGroups: LightingV3.LightColorEventBoxGroup[]
    lightRotationEventBoxGroups: LightingV3.LightRotationEventBoxGroup[]
    lightTranslationEventBoxGroups: LightingV3.LightTranslationEventBoxGroup[]

    animateComponents: CustomEventInternals.AnimateComponent[]
    animateTracks: CustomEventInternals.AnimateTrack[]
    assignPathAnimations: CustomEventInternals.AssignPathAnimation[]
    assignPlayerTracks: CustomEventInternals.AssignPlayerToTrack[]
    assignTrackParents: CustomEventInternals.AssignTrackParent[]
    abstractCustomEvents: CustomEventInternals.AbstractCustomEvent[]

    pointDefinitions: Record<string, unknown>
    customData: Record<string, unknown>
    environment: EnvironmentInternals.Environment[]
    geometry: EnvironmentInternals.Geometry[]
    geometryMaterials: Record<string, RawGeometryMaterial>
    fogEvents: FogEvent[]
}

const clearPropertyMap = {
    abstractCustomEvents: 'Abstract Custom Events',
    animateComponents: 'Animate Components',
    animateTracks: 'Animate Tracks',
    arcs: 'Arcs',
    assignPathAnimations: 'Assign Path Animations',
    assignPlayerTracks: 'Assign Player Tracks',
    assignTrackParents: 'Assign Track Parents',
    baseBasicEvents: 'Base Basic Events',
    bombs: 'Bombs',
    boostEvents: 'Boost Events',
    bpmEvents: 'BPM Events',
    chains: 'Chains',
    customData: 'Custom Data',
    environment: 'Environment',
    fogEvents: 'Fog Events',
    geometry: 'Geometry',
    geometryMaterials: 'Geometry Materials',
    laserSpeedEvents: 'Laser Speed Events',
    lightColorEventBoxGroups: 'Light Color Event Box Groups',
    lightEvents: 'Light Events',
    lightRotationEventBoxGroups: 'Light Rotation Event Box Groups',
    lightTranslationEventBoxGroups: 'Light Translation Event Box Groups',
    notes: 'Notes',
    pointDefinitions: 'Point Definitions',
    ringSpinEvents: 'Ring Spin Events',
    ringZoomEvents: 'Ring Zoom Events',
    rotationEvents: 'Rotation Events',
    v3: undefined,
    version: undefined,
    walls: 'Walls',
    waypoints: 'Waypoints',
} as const satisfies {
    [K in keyof RMDifficulty]: string | undefined
}

type ClearProperty = Exclude<
    typeof clearPropertyMap[keyof typeof clearPropertyMap],
    undefined
>

// type ClearProperty =
//     | 'Notes'
//     | 'Bombs'
//     | 'Arcs'
//     | 'Chains'
//     | 'Walls'
//     | 'Light Events'
//     | 'Laser Speed Events'
//     | 'Ring Zoom Events'
//     | 'Ring Spin Events'
//     | 'Rotation Events'
//     | 'Boost Events'
//     | 'Base Basic Events'
//     | 'AnimateComponent Events'
//     | 'AnimateTrack Events'
//     | 'AssignPathAnimation Events'
//     | 'AssignPlayerToTrack Events'
//     | 'AssignTrackParent Events'
//     | 'Point Definitions'
//     | 'Custom Data'
//     | 'Environment'
//     | 'Geometry'
//     | 'Geometry Materials'
//     | 'Fog Events'
//     | 'BPM Events'

/**
 * @returns null if remove value
 */
export type PostProcessFn = (
    this: unknown,
    key: string,
    value: unknown,
) => unknown | null

export abstract class AbstractDifficulty<
    TD extends bsmap.v2.IDifficulty | bsmap.v3.IDifficulty =
        | bsmap.v2.IDifficulty
        | bsmap.v3.IDifficulty,
> implements RMDifficulty {
    /** The Json of the entire difficulty. Readonly since it is not outputted in the resulting diff */
    readonly json: Readonly<TD>
    /** The Json of the difficulty set
     * (e.g. Standard) that this difficulty is contained in inside of the Info.dat.
     */
    info: bsmap.v2.IInfoSetDifficulty
    /** The Json of the difficulty set map
     * (e.g. Hard) that this difficulty is contained in inside of the Info.dat.
     */
    setInfo: bsmap.v2.IInfoSet
    private postProcesses = new Map<number, PostProcessFn[]>()
    awaitingCompletion = new Set<Promise<unknown>>()
    savePromise?: Promise<void>

    // Initialized by constructor using Object.assign
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    v3: boolean
    waypoints: bsmap.v2.IWaypoint[] | bsmap.v3.IWaypoint[]

    notes: NoteInternals.Note[]
    bombs: NoteInternals.Bomb[]
    arcs: NoteInternals.Arc[]
    chains: NoteInternals.Chain[]
    walls: WallInternals.Wall[]

    lightEvents: BasicEventInternals.LightEvent[]
    laserSpeedEvents: BasicEventInternals.LaserSpeedEvent[]
    ringZoomEvents: BasicEventInternals.RingZoomEvent[]
    ringSpinEvents: BasicEventInternals.RingSpinEvent[]
    rotationEvents: EventInternals.RotationEvent[]
    boostEvents: EventInternals.BoostEvent[]
    baseBasicEvents: BasicEventInternals.BaseEvent[]
    bpmEvents: EventInternals.BPMEvent[]

    lightColorEventBoxGroups: LightingV3.LightColorEventBoxGroup[]
    lightRotationEventBoxGroups: LightingV3.LightRotationEventBoxGroup[]
    lightTranslationEventBoxGroups: LightingV3.LightTranslationEventBoxGroup[]

    animateComponents: CustomEventInternals.AnimateComponent[]
    animateTracks: CustomEventInternals.AnimateTrack[]
    assignPathAnimations: CustomEventInternals.AssignPathAnimation[]
    assignPlayerTracks: CustomEventInternals.AssignPlayerToTrack[]
    assignTrackParents: CustomEventInternals.AssignTrackParent[]
    abstractCustomEvents: CustomEventInternals.AbstractCustomEvent[]

    pointDefinitions: Record<string, unknown>
    customData: Record<string, unknown>
    environment: EnvironmentInternals.Environment[]
    geometry: EnvironmentInternals.Geometry[]
    geometryMaterials: Record<string, RawGeometryMaterial>
    fogEvents: FogEvent[]

    /**
     * Creates a difficulty. Can be used to access various information and the map data.
     * Will set the active difficulty to this.
     * @param input Filename for the input.
     * @param input Filename for the output. If left blank, input will be used.
     */
    constructor(
        json: TD,
        info: bsmap.v2.IInfoSetDifficulty,
        setInfo: bsmap.v2.IInfoSet,
        inner: RMDifficulty,
    ) {
        this.version = inner.version
        this.v3 = inner.v3
        this.waypoints = inner.waypoints

        this.json = json
        this.info = info
        this.setInfo = setInfo

        this.notes = inner.notes
        this.bombs = inner.bombs
        this.arcs = inner.arcs
        this.chains = inner.chains
        this.walls = inner.walls

        this.lightEvents = inner.lightEvents
        this.laserSpeedEvents = inner.laserSpeedEvents
        this.ringZoomEvents = inner.ringZoomEvents
        this.ringSpinEvents = inner.ringSpinEvents
        this.rotationEvents = inner.rotationEvents
        this.boostEvents = inner.boostEvents
        this.baseBasicEvents = inner.baseBasicEvents
        this.bpmEvents = inner.bpmEvents

        this.lightColorEventBoxGroups = inner.lightColorEventBoxGroups
        this.lightRotationEventBoxGroups = inner.lightRotationEventBoxGroups
        this.lightTranslationEventBoxGroups =
            inner.lightTranslationEventBoxGroups

        this.animateComponents = inner.animateComponents
        this.animateTracks = inner.animateTracks
        this.assignPathAnimations = inner.assignPathAnimations
        this.assignPlayerTracks = inner.assignPlayerTracks
        this.assignTrackParents = inner.assignTrackParents
        this.abstractCustomEvents = inner.abstractCustomEvents

        this.pointDefinitions = inner.pointDefinitions
        this.customData = inner.customData
        this.environment = inner.environment
        this.geometry = inner.geometry
        this.geometryMaterials = inner.geometryMaterials
        this.fogEvents = inner.fogEvents

        this.registerProcessors()
    }

    private registerProcessors() {
        // low priority
        // we want this to be last
        this.addPostProcess(reduceDecimalsPostProcess, -10)
    }

    async runAsync<T>(callback: () => Promise<T>) {
        const promise = callback()
        this.awaitingCompletion.add(promise)
        const result = await promise
        this.awaitingCompletion.delete(promise)
        return result
    }

    async awaitAllAsync() {
        await Promise.all(this.awaitingCompletion)
    }

    /**
     * Go through every animation in this difficulty and optimize it.
     * Warning, this is an expensive action and may be redundant based on what has already been optimized.
     * @param optimize Settings for the optimization.
     */
    optimize(optimize: OptimizeSettings = new OptimizeSettings()) {
        const optimizeAnimation = (
            animation: AnimationInternals.AnimationPropertiesV3,
        ) => {
            Object.entries(animation).forEach(([key, keyframes]) => {
                if (typeof keyframes === 'string') return
                if (animationIsRuntime(keyframes!)) {
                    return
                }

                animation[key] = optimizeKeyframes(
                    keyframes as RawKeyframesLinear,
                    optimize,
                ) as RuntimePointDefinitionAny
            })
        }

        this.notes.forEach((e) => optimizeAnimation(e.animation))
        this.walls.forEach((e) => optimizeAnimation(e.animation))
        this.animateTracks.forEach((e) =>
            optimizeAnimation(
                (e as CustomEventInternals.AnimateTrack).animation,
            )
        )

        // TODO: Optimize point definitions
    }

    /**
     * Allows you to add a function to be run on save of this difficulty.
     * @param process The function to be added.
     * @param priority The priority, or default 0. Higher priority means first
     */
    addPostProcess(process: PostProcessFn, priority?: number) {
        priority ??= 0

        let arr = this.postProcesses.get(priority)
        if (!arr) {
            arr = []
            this.postProcesses.set(priority, arr)
        }

        arr.push(process)
    }

    abstract toJSON(): TD

    /**
     * Saves the difficulty.
     * @param diffName Filename for the save.
     * If left blank, the beatmap file name will be used for the save.
     */
    async save(diffName?: DIFFPATH, pretty = false) {
        async function thisProcess(self: AbstractDifficulty) {
            if (diffName) {
                diffName = (await parseFilePath(diffName, '.dat'))
                    .name as DIFFPATH
            } else diffName = self.fileName as DIFFNAME

            await self.awaitAllAsync()
            const outputJSON = self.toJSON()

            // this.doPostProcess(undefined, outputJSON)

            const promise1 = getActiveCache().then((rm) => rm.save())

            const sortedProcess = [...self.postProcesses.entries()]
                // ascending
                .sort(([a], [b]) => a - b)
                // descending
                .reverse()
                .flatMap(([, arr]) => arr)

            const transformer = (k: string, v: unknown) => {
                let newValue = v

                sortedProcess.forEach((process) => {
                    const oldValue = newValue
                    newValue = process(k, newValue)

                    /// if undefined, use previous value
                    if (newValue === undefined) {
                        newValue = oldValue
                    }
                })

                return newValue
            }

            const promise2 = Deno.writeTextFile(
                attachWorkingDirectory(diffName),
                JSON.stringify(
                    outputJSON,
                    sortedProcess.length > 0 ? transformer : undefined,
                    pretty ? 2 : 0,
                ),
            )
            await Promise.all([promise1, promise2])
            RMLog(`${diffName} successfully saved!`)
        }

        this.savePromise = thisProcess(this)
        await this.savePromise
    }

    clear(exclude: ClearProperty[] = []) {
        const excludeSet = new Set(exclude)
        const clear = (property: ClearProperty) => !excludeSet.has(property)

        Object.keys(clearPropertyMap).forEach((x) => {
            const key = x as keyof typeof clearPropertyMap
            const value = clearPropertyMap[key]

            if (
                value !== undefined &&
                clear(value)
            ) {
                const arr = Array.isArray(
                    (this as unknown as Record<string, unknown>)[key],
                )
                ;(this as unknown as Record<string, unknown>)[key] = arr
                    ? []
                    : {}
            }
        })
    }

    /**
     * Add/remove a mod requirement from the difficulty.
     * @param requirement The requirement to effect.
     * @param required True by default, set to false to remove the requirement.
     */
    require(requirement: REQUIRE_MODS, required = true) {
        const requirements: TJson = {}

        let requirementsArr = this.requirements
        if (requirementsArr === undefined) requirementsArr = []
        requirementsArr.forEach((x) => {
            requirements[x] = true
        })
        requirements[requirement] = required

        requirementsArr = []
        for (const key in requirements) {
            if (requirements[key] === true) requirementsArr.push(key)
        }
        this.requirements = requirementsArr
    }

    /**
     * Add/remove a mod suggestion from the difficulty.
     * @param suggestion The suggestion to effect.
     * @param suggested True by default, set to false to remove the suggestion.
     */
    suggest(suggestion: SUGGEST_MODS, suggested = true) {
        const suggestions: TJson = {}

        let suggestionsArr = this.suggestions
        if (suggestionsArr === undefined) suggestionsArr = []
        suggestionsArr.forEach((x) => {
            suggestions[x] = true
        })
        suggestions[suggestion] = suggested

        suggestionsArr = []
        for (const key in suggestions) {
            if (suggestions[key] === true) suggestionsArr.push(key)
        }
        this.suggestions = suggestionsArr
    }

    *environmentEnhancementsCombined(): IterableIterator<
        EnvironmentInternals.AbstractEnvironment
    > {
        yield* this.geometry
        yield* this.environment
    }

    /**
     * @brief Not sorted
     */
    *allEvents(sorted = false): IterableIterator<
        BasicEventInternals.BaseEvent
    > {
        if (sorted) {
            return [
                ...this.lightEvents,
                ...this.ringSpinEvents,
                ...this.ringZoomEvents,
                ...this.laserSpeedEvents,
            ].sort((a, b) => a.beat - b.beat)
        }

        yield* this.lightEvents
        yield* this.ringSpinEvents
        yield* this.ringZoomEvents
        yield* this.laserSpeedEvents
    }

    get allNotes() {
        return [
            ...this.notes,
            ...this.bombs,
            ...this.arcs,
            ...this.chains,
        ] as readonly AnyNote[]
    }

    // Info.dat
    /** The note jump speed for this difficulty. */
    get NJS() {
        return this.info._noteJumpMovementSpeed
    }
    set NJS(value: number) {
        this.info._noteJumpMovementSpeed = value
    }

    /** The note offset for this difficulty. */
    get offset() {
        return this.info._noteJumpStartBeatOffset
    }
    set offset(value: number) {
        this.info._noteJumpStartBeatOffset = value
    }

    /** The filename for this difficulty. */
    get fileName() {
        return this.info._beatmapFilename as DIFFNAME
    }
    set fileName(value: string) {
        this.info._beatmapFilename = value
    }

    /** The name of the difficulty set. E.g. Standard */
    get diffSetName() {
        return this.setInfo._beatmapCharacteristicName
    }
    set diffSetName(value: bsmap.CharacteristicName) {
        this.setInfo._beatmapCharacteristicName = value
    }

    /** The name of the difficulty. E.g. Hard */
    get name() {
        return this.info._difficulty
    }
    set name(value: bsmap.DifficultyName) {
        this.info._difficulty = value
    }

    /** The difficulty rank. */
    get diffRank() {
        return this.info._difficultyRank
    }
    set diffRank(value: bsmap.DifficultyRank) {
        this.info._difficultyRank = value
    }

    /** The mod requirements for this difficulty. */
    get requirements() {
        return this.info._customData?._requirements
    }
    set requirements(value: string[] | undefined) {
        this.info._customData ??= {}
        this.info._customData._requirements = value
    }

    /** The mod suggestions for this difficulty. */
    get suggestions() {
        return this.info._customData?._suggestions
    }
    set suggestions(value: string[] | undefined) {
        this.info._customData ??= {}
        this.info._customData._suggestions = value
    }

    /** The unaliased settings object. */
    get rawSettings() {
        return this.info._customData?._settings
    }
    set rawSettings(value: bsmap.IChromaInfoCustomData['_settings']) {
        this.info._customData ??= {}
        this.info._customData._settings = value
    }

    /** Warnings to display in the info button. */
    get warnings() {
        return this.info._customData?._warnings
    }
    set warnings(value: string[] | undefined) {
        this.info._customData ??= {}
        this.info._customData._warnings = value
    }

    /** Information to display in the info button. */
    get buttonInfo() {
        return this.info._customData?._information
    }
    set buttonInfo(value: string[] | undefined) {
        this.info._customData ??= {}
        this.info._customData._information = value
    }

    /** The custom difficulty name. */
    get label() {
        return this.info._customData?._difficultyLabel
    }
    set label(value: string | undefined) {
        this.info._customData ??= {}
        this.info._customData._difficultyLabel = value
    }
}

function reduceDecimalsPostProcess(
    _k: string,
    v: unknown,
): unknown {
    if (!settings.decimals) return
    if (!v) return

    if (typeof v !== 'number') return

    return setDecimals(v, settings.decimals)

    // TODO: Remove
    // if (typeof v !== "object") return
    // reduceDecimalsInObject(v as Record<string, unknown>)

    // function reduceDecimalsInObject(json: TJson) {
    //     Object.keys(json).forEach((key) => {
    //         // deno-lint-ignore no-prototype-builtins
    //         if (!json.hasOwnProperty(key)) return
    //         const element = json[key]

    //         if (typeof element === 'number') {
    //             json[key] = setDecimals(element, settings.decimals as number)
    //         } else if (typeof element === 'object') {
    //             reduceDecimalsInObject(element as TJson)
    //         }
    //     })
    // }
}

//! Redundant, toJson prunes.

// function pruneCustomData(
//     k: string,
//     v: unknown,
// ): unknown {
//     if (k !== 'customData') return v

//     /// if customData is not an object
//     if (typeof v !== 'object') return {}

//     /// if no value
//     if (!v) return null

//     jsonPrune(v)

//     if (Object.entries(v).length === 0) {
//         return null // remove customData if empty
//     }

//     return v
// }
