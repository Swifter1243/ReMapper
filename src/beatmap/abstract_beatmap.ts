import { bsmap } from '../deps.ts'

import {
    DIFFNAME,
    DIFFPATH,
    PointDefinitionAny,
    RawGeometryMaterial,
    RawKeyframesAbstract,
    REQUIRE_MODS,
    SUGGEST_MODS,
    TJson,
} from '../types/mod.ts'

import { jsonPrune } from '../utils/json.ts'
import { setDecimals } from '../utils/math.ts'

import {
    optimizeKeyframes,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'
import { AnyNote, parseFilePath, RMLog } from '../general.ts'

import { RMJson } from '../rm_json.ts'
import { settings } from '../data/beatmap_handler.ts' // TODO: Cyclic, fix

import * as AnimationInternals from '../internals/animation.ts'
import * as CustomEventInternals from '../internals/custom_event.ts'
import * as EnvironmentInternals from '../internals/environment.ts'
import * as NoteInternals from '../internals/note.ts'
import * as WallInternals from '../internals/wall.ts'
import * as BasicEventInternals from '../internals/basic_event.ts'
import { saveInfoDat } from '../data/info_file.ts'
import { EventInternals } from '../internals/mod.ts'
import { FogEvent } from './fog.ts'

export interface RMDifficulty {
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    v3: boolean,

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

    animateComponents: CustomEventInternals.AnimateComponent[]
    animateTracks: CustomEventInternals.AnimateTrack[]
    assignPathAnimations: CustomEventInternals.AssignPathAnimation[]
    assignPlayerTracks: CustomEventInternals.AssignPlayerToTrack[]
    assignTrackParents: CustomEventInternals.AssignTrackParent[]

    pointDefinitions: Record<string, unknown>
    customData: Record<string, unknown>
    environment: EnvironmentInternals.Environment[]
    geometry: EnvironmentInternals.Geometry[]
    geometryMaterials: Record<string, RawGeometryMaterial>
    fogEvents: FogEvent[]
}

type ClearProperty =
    | 'Notes'
    | 'Bombs'
    | 'Arcs'
    | 'Chains'
    | 'Walls'
    | 'Light Events'
    | 'Laser Speed Events'
    | 'Ring Zoom Events'
    | 'Ring Spin Events'
    | 'Rotation Events'
    | 'Boost Events'
    | 'Base Basic Events'
    | 'AnimateComponent Events'
    | 'AnimateTrack Events'
    | 'AssignPathAnimation Events'
    | 'AssignPlayerToTrack Events'
    | 'AssignTrackParent Events'
    | 'Point Definitions'
    | 'Custom Data'
    | 'Environment'
    | 'Geometry'
    | 'Geometry Materials'
    | 'Fog Events'

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
    /** The path to the output file of this difficulty. */
    mapFile: DIFFPATH
    /** The filename of the output file of this difficulty. */
    relativeMapFile: DIFFNAME
    private postProcesses = new Map<number, PostProcessFn[]>()
    awaitingCompletion = new Set<Promise<unknown>>()

    // Initialized by constructor using Object.assign
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    v3: boolean

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

    animateComponents: CustomEventInternals.AnimateComponent[]
    animateTracks: CustomEventInternals.AnimateTrack[]
    assignPathAnimations: CustomEventInternals.AssignPathAnimation[]
    assignPlayerTracks: CustomEventInternals.AssignPlayerToTrack[]
    assignTrackParents: CustomEventInternals.AssignTrackParent[]

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
        mapFile: DIFFPATH,
        relativeMapFile: DIFFNAME,
        inner: RMDifficulty,
    ) {
        this.version = inner.version
        this.v3 = inner.v3

        this.json = json
        this.info = info
        this.setInfo = setInfo
        this.mapFile = mapFile
        this.relativeMapFile = relativeMapFile

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

        this.animateComponents = inner.animateComponents
        this.animateTracks = inner.animateTracks
        this.assignPathAnimations = inner.assignPathAnimations
        this.assignPlayerTracks = inner.assignPlayerTracks
        this.assignTrackParents = inner.assignTrackParents
        
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
        this.addPostProcess(reduceDecimalsPostProcess, -1)
        this.addPostProcess(pruneCustomData, -1)
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

                animation[key] = optimizeKeyframes(
                    keyframes as RawKeyframesAbstract<number[]>,
                    optimize,
                ) as PointDefinitionAny
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
        if (diffName) {
            diffName = (await parseFilePath(diffName, '.dat')).path as DIFFPATH
        } else diffName = this.mapFile

        await this.awaitAllAsync()
        const outputJSON = this.toJSON()

        // this.doPostProcess(undefined, outputJSON)

        const promise3 = saveInfoDat()
        const promise1 = RMJson.then((rm) => rm.save())

        const sortedProcess = [...this.postProcesses.entries()]
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
            diffName,
            JSON.stringify(
                outputJSON,
                sortedProcess.length > 0 ? transformer : undefined,
                pretty ? 2 : 0,
            ),
        )
        await Promise.all([promise1, promise2, promise3])
        RMLog(`${diffName} successfully saved!`)
    }

    clear(exclude: ClearProperty[] = []) {
        const excludeSet = new Set(exclude)
        const clear = (property: ClearProperty) => !excludeSet.has(property)

        if (clear('Notes')) this.notes = []
        if (clear('Bombs')) this.bombs = []
        if (clear('Arcs')) this.arcs = []
        if (clear('Chains')) this.chains = []
        if (clear('Walls')) this.walls = []

        if (clear('Light Events')) this.lightEvents = []
        if (clear('Laser Speed Events')) this.laserSpeedEvents = []
        if (clear('Ring Zoom Events')) this.ringZoomEvents = []
        if (clear('Ring Spin Events')) this.ringSpinEvents = []
        if (clear('Rotation Events')) this.rotationEvents = []
        if (clear('Boost Events')) this.boostEvents = []
        if (clear('Base Basic Events')) this.baseBasicEvents = []

        if (clear('AnimateComponent Events')) this.animateComponents = []
        if (clear('AnimateTrack Events')) this.animateTracks = []
        if (clear('AssignPathAnimation Events')) this.assignPathAnimations = []
        if (clear('AssignPlayerToTrack Events')) this.assignPlayerTracks = []
        if (clear('AssignTrackParent Events')) this.assignTrackParents = []

        if (clear('Point Definitions')) this.pointDefinitions = {}
        if (clear('Custom Data')) this.customData = {}
        if (clear('Environment')) this.environment = []
        if (clear('Geometry')) this.geometry = []
        if (clear('Geometry Materials')) this.geometryMaterials = {}
        if (clear('Fog Events')) this.fogEvents = []
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
            ].sort((a, b) => a.time - b.time)
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
        return this.info._beatmapFilename
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

function pruneCustomData(
    k: string,
    v: unknown,
): unknown {
    if (k !== 'customData') return v

    /// if customData is not an object
    if (typeof v !== 'object') return {}

    /// if no value
    if (!v) return null

    jsonPrune(v);

    if (Object.entries(v).length === 0) {
        return null; // remove customData if empty
    }
    
    return v
}
