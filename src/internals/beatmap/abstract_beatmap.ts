import {bsmap} from '../../deps.ts'

import {
    AbstractEnvironment,
    AnimationPropertiesV3,
    DIFFNAME,
    DIFFPATH,
    IInfoSet,
    IInfoSetDifficulty,
    RawGeometryMaterial,
    REQUIRE_MODS,
    SUGGEST_MODS,
    TJson,
} from '../../types/mod.ts'
import {optimizeKeyframes, OptimizeSettings} from '../../utils/animation/optimizer.ts'
import {AnyNote} from '../../general.ts'
import {settings} from '../../data/settings.ts' // TODO: Cyclic, fix
import * as CustomEventInternals from './object/custom_event/mod.ts'
import * as EnvironmentInternals from './object/environment/environment.ts'
import * as NoteInternals from './object/gameplay_object/color_note.ts'
import * as WallInternals from './object/gameplay_object/wall.ts'
import * as BasicEventInternals from './object/basic_event/basic_event.ts'
import {FogEvent} from './object/environment/fog.ts'
import {getActiveCache} from '../../rm_cache.ts'
import {RawKeyframesLinear, RuntimePointDefinitionAny, RuntimeRawKeyframesAny,} from '../../types/animation.ts'
import {objectSafeGet, objectSafeSet} from '../../utils/object/safe.ts'
import {Geometry} from './object/environment/geometry.ts'
import {areKeyframesRuntime} from '../../utils/animation/keyframe/runtime.ts'
import {attachWorkingDirectory} from '../../data/working_directory.ts'
import {settingsHandler} from './settings_handler.ts'
import {BeatmapCustomEvents, RMDifficulty} from "../../types/beatmap_interfaces/difficulty.ts";
import {setDecimals} from "../../utils/math/rounding.ts";
import {RMLog} from "../../utils/rm_log.ts";
import {parseFilePath} from "../../utils/file.ts";
import {AbstractBasicEvent} from "./object/basic_event/abstract.ts";
import {LightEvent} from "./object/basic_event/light_event.ts";
import {LaserSpeedEvent} from "./object/basic_event/laser_speed.ts";
import {RingZoomEvent} from "./object/basic_event/ring_zoom.ts";
import {RingSpinEvent} from "./object/basic_event/ring_spin.ts";
import {RotationEvent} from "../v3_event/rotation.ts";
import {BoostEvent} from "../v3_event/lighting/boost.ts";
import {BPMEvent} from "../v3_event/bpm.ts";
import {LightColorEventBoxGroup} from "../v3_event/lighting/light_event_box_group/color.ts";
import {LightRotationEventBoxGroup} from "../v3_event/lighting/light_event_box_group/rotation.ts";
import {LightTranslationEventBoxGroup} from "../v3_event/lighting/light_event_box_group/translation.ts";

const clearPropertyMap = {
    arcs: 'Arcs',
    abstractBasicEvents: 'Base Basic Events',
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
    colorNotes: 'Notes',
    pointDefinitions: 'Point Definitions',
    ringSpinEvents: 'Ring Spin Events',
    ringZoomEvents: 'Ring Zoom Events',
    rotationEvents: 'Rotation Events',
    v3: undefined,
    version: undefined,
    walls: 'Walls',
    waypoints: 'Waypoints',
    customEvents: 'Custom Events',
} as const satisfies {
    [K in keyof RMDifficulty]: string | undefined
}

type ClearProperty = Exclude<
    typeof clearPropertyMap[keyof typeof clearPropertyMap],
    undefined
>

/**
 * @returns null if remove value
 */
export type PostProcessFn = (
    this: unknown,
    key: string,
    value: unknown,
) => unknown | null

/** A remapper difficulty, version agnostic */
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
    info: IInfoSetDifficulty
    /** The Json of the difficulty set map
     * (e.g. Hard) that this difficulty is contained in inside of the Info.dat.
     */
    setInfo: IInfoSet
    private postProcesses = new Map<number, PostProcessFn[]>()
    /** Tasks to complete before the difficulty is saved. */
    awaitingCompletion = new Set<Promise<unknown>>()
    /** The current promise of the difficulty being saved. */
    savePromise?: Promise<void>

    // Initialized by constructor using Object.assign
    /** Semver beatmap version. */
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    /** Whether this difficulty is V3 or not. */
    v3: boolean
    /** Nobody really knows what these do lol */
    waypoints: bsmap.v2.IWaypoint[] | bsmap.v3.IWaypoint[]

    /** All standard color notes. */
    colorNotes: NoteInternals.ColorNote[]
    bombs: NoteInternals.Bomb[]
    arcs: NoteInternals.Arc[]
    chains: NoteInternals.Chain[]
    walls: WallInternals.Wall[]

    lightEvents: LightEvent[]
    laserSpeedEvents: LaserSpeedEvent[]
    ringZoomEvents: RingZoomEvent[]
    ringSpinEvents: RingSpinEvent[]
    rotationEvents: RotationEvent[]
    boostEvents: BoostEvent[]
    abstractBasicEvents: AbstractBasicEvent[]
    bpmEvents: BPMEvent[]

    lightColorEventBoxGroups: LightColorEventBoxGroup[]
    lightRotationEventBoxGroups: LightRotationEventBoxGroup[]
    lightTranslationEventBoxGroups: LightTranslationEventBoxGroup[]

    customEvents: BeatmapCustomEvents

    pointDefinitions: Record<string, RuntimeRawKeyframesAny>
    customData: Record<string, unknown>
    environment: EnvironmentInternals.Environment[]
    geometry: Geometry[]
    geometryMaterials: Record<string, RawGeometryMaterial>
    /** All of the fog related things that happen in this difficulty. */
    fogEvents: FogEvent[]

    /**
     * Creates a difficulty. Can be used to access various information and the map data.
     * Will set the active difficulty to this.
     */
    constructor(
        json: TD,
        info: IInfoSetDifficulty,
        setInfo: IInfoSet,
        inner: RMDifficulty,
    ) {
        this.version = inner.version
        this.v3 = inner.v3
        this.waypoints = inner.waypoints

        this.json = json
        this.info = info
        this.setInfo = setInfo

        this.colorNotes = inner.colorNotes
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
        this.abstractBasicEvents = inner.abstractBasicEvents
        this.bpmEvents = inner.bpmEvents

        this.lightColorEventBoxGroups = inner.lightColorEventBoxGroups
        this.lightRotationEventBoxGroups = inner.lightRotationEventBoxGroups
        this.lightTranslationEventBoxGroups = inner.lightTranslationEventBoxGroups

        this.customEvents = inner.customEvents

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

    /** Add a promise to the difficulty, that will be awaited for on save. */
    async runAsync<T>(callback: () => Promise<T>) {
        const promise = callback()
        this.awaitingCompletion.add(promise)
        const result = await promise
        this.awaitingCompletion.delete(promise)
        return result
    }

    /** Await all promises in this difficulty.
     * Some examples of promises that would be awaited are things like ModelScene calls.
     */
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
            animation: AnimationPropertiesV3,
        ) => {
            Object.entries(animation).forEach(([key, keyframes]) => {
                if (typeof keyframes === 'string') return
                if (areKeyframesRuntime(keyframes!)) {
                    return
                }

                animation[key] = optimizeKeyframes(
                    keyframes as RawKeyframesLinear,
                    optimize,
                ) as RuntimePointDefinitionAny
            })
        }

        this.colorNotes.forEach((e) => optimizeAnimation(e.animation))
        this.walls.forEach((e) => optimizeAnimation(e.animation))
        this.customEvents.animateTrackEvents.forEach((e) =>
            optimizeAnimation(
                (e as CustomEventInternals.AnimateTrack).animation,
            )
        )

        // TODO: Optimize point definitions
    }

    /**
     * Allows you to add a function to be run on save of this difficulty.
     * @param process The function to be added.
     * @param priority Default 0. Higher priority means first
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

    /** Convert this difficulty to the JSON outputted into the .dat file. */
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

    /** Clear objects on this difficulty.
     @param exclude Array of things to ignore during the clear.
     */
    clear(exclude: ClearProperty[] = []) {
        const excludeSet = new Set(exclude)
        const clear = (property: ClearProperty) => !excludeSet.has(property)

        Object.keys(clearPropertyMap).forEach((x) => {
            const key = x as keyof typeof clearPropertyMap
            const value = clearPropertyMap[key]

            if (value !== undefined && !clear(value)) return

            if (key === 'customEvents') {
                this.clearObject(this.customEvents)
                return
            }

            const arr = Array.isArray(
                (this as unknown as Record<string, unknown>)[key],
            )
            ;(this as unknown as Record<string, unknown>)[key] = arr ? [] : {}
        })
    }

    private clearObject(object: object) {
        Object.keys(object).forEach((x) => {
            const arr = Array.isArray(
                (object as unknown as Record<string, unknown>)[x],
            )
            ;(object as unknown as Record<string, unknown>)[x] = arr ? [] : {}
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

    /** Array opf both geometry and environment. */
    rawEnvironment() {
        return [
            ...this.environment,
            ...this.geometry,
        ] as AbstractEnvironment[]
    }

    /**
     * Iterator for all basic (non V3 lighting_v3) events on the difficulty.
     * @brief Not sorted
     */
    allBasicEvents(sorted = false): BasicEventInternals.BasicEvent[] {
        const arr = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.abstractBasicEvents,
        ]

        if (sorted) return arr.sort((a, b) => a.beat - b.beat)
        return arr
    }

    /** Iterator for all notes. */
    get allNotes() {
        return [
            ...this.colorNotes,
            ...this.bombs,
            ...this.arcs,
            ...this.chains,
        ] as readonly AnyNote[]
    }

    // Info.dat
    /** The note jump speed for this difficulty. */
    get noteJumpSpeed() {
        return this.info._noteJumpMovementSpeed
    }
    set noteJumpSpeed(value: number) {
        this.info._noteJumpMovementSpeed = value
    }

    /** The note offset for this difficulty. */
    get noteJumpOffset() {
        return this.info._noteJumpStartBeatOffset
    }
    set noteJumpOffset(value: number) {
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

    /** An aliased settings object. This controls the heck settings setter. */
    readonly settings = new Proxy(new settingsHandler(this), {
        get(handler, property) {
            const objValue = handler[property as keyof typeof handler]
            const path = (
                typeof objValue === 'object' ? objValue[0] : objValue
            ) as string
            const diff = handler['diff']

            if (!diff.rawSettings) {
                return undefined
            }
            return objectSafeGet(diff.rawSettings as TJson, path)
        },

        set(handler, property, value) {
            const objValue = handler[property as keyof typeof handler]
            const path = (
                typeof objValue === 'object' ? objValue[0] : objValue
            ) as string
            const diff = handler['diff']

            if (typeof objValue !== 'string') {
                value = (objValue as unknown as TJson[])[1][value]
            }

            objectSafeSet(diff.rawSettings as TJson, path, value)

            return true
        },
    })

    /** The unaliased settings object. This controls the heck settings setter. */
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
