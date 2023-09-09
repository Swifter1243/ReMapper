import { bsmap } from '../deps.ts'

import {
    DIFFNAME,
    DIFFPATH,
    GeometryMaterial,
    PointDefinitionAny,
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

import { CustomEvent } from './custom_event.ts'
import { Environment, Geometry } from './environment.ts'
import { saveInfoDat } from '../data/info_file.ts'

export interface RMDifficulty {
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    notes: NoteInternals.Note[]
    bombs: NoteInternals.Bomb[]
    arcs: NoteInternals.Arc[]
    chains: NoteInternals.Chain[]
    walls: WallInternals.Wall[]

    basicEvents: BasicEventInternals.LightEvent[]
    laserSpeedEvents: BasicEventInternals.LaserSpeedEvent[]
    ringZoomEvents: BasicEventInternals.RingZoomEvent[]
    ringSpinEvents: BasicEventInternals.RingSpinEvent[]
    rotationEvent: BasicEventInternals.RotationEvent[]

    customEvents: CustomEvent[]
    pointDefinitions: Record<string, unknown>
    customData: Record<string, unknown>
    environment: Environment[]
    geometry: Geometry[]

    geoMaterials: Record<string, GeometryMaterial>
}

export type PostProcessFn = (
    this: unknown,
    key: string,
    value: unknown,
) => unknown

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
    diffSet: bsmap.v2.IInfoSetDifficulty
    /** The Json of the difficulty set map
     * (e.g. Hard) that this difficulty is contained in inside of the Info.dat.
     */
    diffSetMap: bsmap.v2.IInfoSet
    /** The path to the output file of this difficulty. */
    mapFile: DIFFPATH
    /** The filename of the output file of this difficulty. */
    relativeMapFile: DIFFNAME
    private postProcesses = new Map<number, PostProcessFn[]>()

    // Initialized by constructor using Object.assign
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    notes: NoteInternals.Note[]
    bombs: NoteInternals.Bomb[]
    arcs: NoteInternals.Arc[]
    chains: NoteInternals.Chain[]
    walls: WallInternals.Wall[]
    basicEvents: BasicEventInternals.LightEvent[]
    laserSpeedEvents: BasicEventInternals.LaserSpeedEvent[]
    ringZoomEvents: BasicEventInternals.RingZoomEvent[]
    ringSpinEvents: BasicEventInternals.RingSpinEvent[]
    rotationEvent: BasicEventInternals.RotationEvent[]
    customEvents: CustomEvent[]
    pointDefinitions: Record<string, unknown>
    customData: Record<string, unknown>
    environment: Environment[]
    geometry: Geometry[]
    geoMaterials: Record<string, GeometryMaterial>

    /**
     * Creates a difficulty. Can be used to access various information and the map data.
     * Will set the active difficulty to this.
     * @param input Filename for the input.
     * @param input Filename for the output. If left blank, input will be used.
     */
    constructor(
        json: TD,
        diffSet: bsmap.v2.IInfoSetDifficulty,
        diffSetMap: bsmap.v2.IInfoSet,
        mapFile: DIFFPATH,
        relativeMapFile: DIFFNAME,
        inner: RMDifficulty,
    ) {
        this.json = json
        this.diffSet = diffSet
        this.diffSetMap = diffSetMap
        this.mapFile = mapFile
        this.relativeMapFile = relativeMapFile

        this.arcs = inner.arcs
        this.basicEvents = inner.basicEvents
        this.bombs = inner.bombs
        this.chains = inner.chains
        this.customData = inner.customData
        this.customEvents = inner.customEvents
        this.geometry = inner.geometry
        this.environment = inner.environment

        this.geoMaterials = inner.geoMaterials

        this.laserSpeedEvents = inner.laserSpeedEvents
        this.rotationEvent = inner.rotationEvent
        this.ringZoomEvents = inner.ringZoomEvents
        this.ringSpinEvents = inner.ringSpinEvents

        this.pointDefinitions = inner.pointDefinitions

        this.walls = inner.walls
        this.notes = inner.notes

        this.version = inner.version

        this.registerProcessors()
    }

    private registerProcessors() {
        // low priority
        // we want this to be last
        this.addPostProcess(reduceDecimalsPostProcess, -1)
        this.addPostProcess(pruneCustomData, -1)
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
        this.customEvents.filter((e) =>
            e instanceof CustomEventInternals.AnimateTrack
        ).forEach((e) =>
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
    async save(diffName?: DIFFPATH) {
        if (diffName) {
            diffName = (await parseFilePath(diffName, '.dat')).path as DIFFPATH
        } else diffName = this.mapFile

        const outputJSON = this.toJSON()

        // this.doPostProcess(undefined, outputJSON)

        const promise3 = saveInfoDat()
        const promise1 = RMJson.then((rm) => rm.save())

        const sortedProcess = [...this.postProcesses.entries()]
            .sort(([a], [b]) => a - b)
            .reverse()
            .flatMap(([, arr]) => arr)

        const transformer = (k: string, v: unknown) => {
            let newValue = v

            sortedProcess.forEach((process) => newValue = process(k, newValue))

            return newValue
        }

        const promise2 = Deno.writeTextFile(
            diffName,
            JSON.stringify(
                outputJSON,
                // sortedProcess.length > 0 ? transformer : undefined,
                // 0,
            ),
        )
        await Promise.all([promise1, promise2, promise3])
        RMLog(`${diffName} successfully saved!`)
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
                ...this.basicEvents,
                ...this.ringSpinEvents,
                ...this.ringZoomEvents,
                ...this.laserSpeedEvents,
            ].sort((a, b) => a.time - b.time)
        }

        yield* this.basicEvents
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
        return this.diffSet._noteJumpMovementSpeed
    }
    set NJS(value: number) {
        this.diffSet._noteJumpMovementSpeed = value
    }

    /** The note offset for this difficulty. */
    get offset() {
        return this.diffSet._noteJumpStartBeatOffset
    }
    set offset(value: number) {
        this.diffSet._noteJumpStartBeatOffset = value
    }

    /** The filename for this difficulty. */
    get fileName() {
        return this.diffSet._beatmapFilename
    }
    set fileName(value: string) {
        this.diffSet._beatmapFilename = value
    }

    /** The name of the difficulty set. E.g. Standard */
    get diffSetName() {
        return this.diffSetMap._beatmapCharacteristicName
    }
    set diffSetName(value: bsmap.CharacteristicName) {
        this.diffSetMap._beatmapCharacteristicName = value
    }

    /** The name of the difficulty. E.g. Hard */
    get name() {
        return this.diffSet._difficulty
    }
    set name(value: bsmap.DifficultyName) {
        this.diffSet._difficulty = value
    }

    /** The difficulty rank. */
    get diffRank() {
        return this.diffSet._difficultyRank
    }
    set diffRank(value: bsmap.DifficultyRank) {
        this.diffSet._difficultyRank = value
    }

    /** The mod requirements for this difficulty. */
    get requirements() {
        return this.diffSet._customData?._requirements
    }
    set requirements(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._requirements = value
    }

    /** The mod suggestions for this difficulty. */
    get suggestions() {
        return this.diffSet._customData?._suggestions
    }
    set suggestions(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._suggestions = value
    }

    /** The unaliased settings object. */
    get rawSettings() {
        return this.diffSet._customData?._settings
    }
    set rawSettings(value: bsmap.IChromaInfoCustomData['_settings']) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._settings = value
    }

    /** Warnings to display in the info button. */
    get warnings() {
        return this.diffSet._customData?._warnings
    }
    set warnings(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._warnings = value
    }

    /** Information to display in the info button. */
    get information() {
        return this.diffSet._customData?._information
    }
    set information(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._information = value
    }

    /** The custom difficulty name. */
    get label() {
        return this.diffSet._customData?._difficultyLabel
    }
    set label(value: string | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._difficultyLabel = value
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
    if (!v) return

    if (k !== 'customData') return
    if (typeof v !== 'object') return {}

    // only prune the values of the map
    // so empty arrays don't get yeeted

    Object.values(v).forEach((x) => {
        jsonPrune(x)
    })
    return v
}
