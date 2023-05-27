import {Arc, Bomb, Chain, Note} from "./note.ts";
import {Wall} from "./wall.ts";
import {CustomEvent} from "./custom_event.ts";
import {Environment, Geometry} from "./environment.ts";
import {GeometryMaterial} from "../data/environment_types.ts";
import {OptimizeSettings} from "../animation/anim_optimizer.ts";
import {parseFilePath, RMLog} from "../general.ts";
import {RMJson} from "../rm_json.ts";
import {DIFFNAME, DIFFPATH, PostProcessFn, REQUIRE_MODS, SUGGEST_MODS, TJson} from "../data/types.ts";
import {saveInfoDat, settings} from "../data/beatmap_handler.ts"; // TODO: Cyclic, fix
import {bsmap} from "../deps.ts"
import {EventInternals, AnimationInternals, CustomEventInternals, EnvironmentInternals} from "../internals/mod.ts"
import {jsonPrune} from "../utils/json.ts";
import {setDecimals} from "../utils/math.ts";

export interface RMDifficulty {
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    notes: Note[]
    bombs: Bomb[]
    arcs: Arc[]
    chains: Chain[]
    walls: Wall[]
    events: EventInternals.AbstractEvent[]
    customEvents: CustomEvent[]
    pointDefinitions: Record<string, unknown>
    customData: Record<string, unknown>
    environment: Environment[]
    geometry: Geometry[]
}

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
    diffSet: bsmap.IInfoSetDifficulty
    /** The Json of the difficulty set map
     * (e.g. Hard) that this difficulty is contained in inside of the Info.dat.
     */
    diffSetMap: bsmap.IInfoSet
    /** The path to the output file of this difficulty. */
    mapFile: DIFFPATH
    /** The filename of the output file of this difficulty. */
    relativeMapFile: DIFFNAME
    private postProcesses = new Map<
        unknown[] | undefined,
        PostProcessFn<unknown>[]
    >()

    // Initialized by constructor using Object.assign
    version!: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    notes!: Note[]
    bombs!: Bomb[]
    arcs!: Arc[]
    chains!: Chain[]
    walls!: Wall[]
    events!: EventInternals.AbstractEvent[] // TODO: Rework this
    customEvents!: CustomEvent[]
    pointDefinitions!: Record<string, unknown>
    customData!: Record<string, unknown>
    environment!: Environment[]
    geometry!: Geometry[]
    geoMaterials!: Record<string, GeometryMaterial>

    /**
     * Creates a difficulty. Can be used to access various information and the map data.
     * Will set the active difficulty to this.
     * @param input Filename for the input.
     * @param input Filename for the output. If left blank, input will be used.
     */
    constructor(
        json: TD,
        diffSet: bsmap.IInfoSetDifficulty,
        diffSetMap: bsmap.IInfoSet,
        mapFile: DIFFPATH,
        relativeMapFile: DIFFNAME,
        inner: RMDifficulty,
    ) {
        Object.assign(this, inner)
        this.json = json
        this.diffSet = diffSet
        this.diffSetMap = diffSetMap
        this.mapFile = mapFile
        this.relativeMapFile = relativeMapFile

        this.registerProcessors()
    }

    private registerProcessors() {
        this.addPostProcess(undefined, reduceDecimalsPostProcess)
        this.addPostProcess(undefined, pruneCustomData)
    }

    /**
     * Go through every animation in this difficulty and optimize it.
     * Warning, this is an expensive action and may be redundant based on what has already been optimized.
     * @param optimize Settings for the optimization.
     */
    optimize(optimize: OptimizeSettings = new OptimizeSettings()) {
        const optimizeAnimation = (
            animation: AnimationInternals.BaseAnimation,
        ) => {
            animation.optimize(undefined, optimize)
        }

        this.notes.forEach((e) => optimizeAnimation(e.animation))
        this.walls.forEach((e) => optimizeAnimation(e.animation))
        this.customEvents.filter((e) =>
            e instanceof CustomEventInternals.AnimateTrack
        ).forEach((e) =>
            optimizeAnimation((e as CustomEventInternals.AnimateTrack).animate)
        )

        // TODO: Optimize point definitions
    }

    /**
     * Allows you to add a function to be run on save of this difficulty.
     * @param object The object to process. If undefined, the difficulty will be processed.
     * @param fn The function to be added.
     */
    addPostProcess<T>(object: T[] | undefined, fn: PostProcessFn<T>) {
        let list = this.postProcesses.get(object)

        if (!list) {
            list = []
            this.postProcesses.set(object, list)
        }

        // idc am lazy
        list.push(fn as any)
    }

    /**
     * Runs the post process functions in this difficulty.
     * @param object The object to process. If undefined, the difficulty will be processed.
     */
    doPostProcess<T = unknown>(
        object: T[] | undefined = undefined,
        json: ReturnType<AbstractDifficulty['toJSON']>,
    ) {
        type Tuple = [unknown[] | undefined, PostProcessFn<unknown>[]]

        const functionsMap: Tuple[] = object === undefined
            ? Array.from(this.postProcesses.entries())
            : [[object, this.postProcesses.get(object)!]]

        functionsMap.forEach((tuple) => {
            const arr = tuple[0]
            const functions = tuple[1]

            if (arr === undefined) {
                functions.forEach((fn) => fn(undefined, this, json))
            } else {
                arr.forEach((i) => functions.forEach((fn) => fn(i, this, json)))
            }
        })
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

        this.doPostProcess(undefined, outputJSON)

        const promise3 = saveInfoDat()

        const promise1 = RMJson.then((rm) => rm.save())
        const promise2 = Deno.writeTextFile(
            diffName,
            JSON.stringify(outputJSON, null, 0),
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

    * environemntEnhancementsCombined(): IterableIterator<EnvironmentInternals.AbstractEnvironment> {
        yield* this.geometry
        yield* this.environment
    }

    // Info.dat
    /** The note jump speed for this difficulty. */
    get NJS() {
        return this.diffSet._noteJumpMovementSpeed
    }

    /** The note offset for this difficulty. */
    get offset() {
        return this.diffSet._noteJumpStartBeatOffset
    }

    /** The filename for this difficulty. */
    get fileName() {
        return this.diffSet._beatmapFilename
    }

    /** The name of the difficulty set. E.g. Standard */
    get diffSetName() {
        return this.diffSetMap._beatmapCharacteristicName
    }

    /** The name of the difficulty. E.g. Hard */
    get name() {
        return this.diffSet._difficulty
    }

    /** The difficulty rank. */
    get diffRank() {
        return this.diffSet._difficultyRank
    }

    /** The mod requirements for this difficulty. */
    get requirements() {
        return this.diffSet._customData?._requirements
    }

    /** The mod suggestions for this difficulty. */
    get suggestions() {
        return this.diffSet._customData?._suggestions
    }

    /** The unaliased settings object. */
    get rawSettings() {
        return this.diffSet._customData?._settings
    }

    /** Warnings to display in the info button. */
    get warnings() {
        return this.diffSet._customData?._warnings
    }

    /** Information to display in the info button. */
    get information() {
        return this.diffSet._customData?._information
    }

    /** The custom difficulty name. */
    get label() {
        return this.diffSet._customData?._difficultyLabel
    }

    set NJS(value: number) {
        this.diffSet._noteJumpMovementSpeed = value
    }

    set offset(value: number) {
        this.diffSet._noteJumpStartBeatOffset = value
    }

    set fileName(value: string) {
        this.diffSet._beatmapFilename = value
    }

    set diffSetName(value: bsmap.CharacteristicName) {
        this.diffSetMap._beatmapCharacteristicName = value
    }

    set name(value: bsmap.DifficultyName) {
        this.diffSet._difficulty = value
    }

    set diffRank(value: bsmap.DifficultyRank) {
        this.diffSet._difficultyRank = value
    }

    set requirements(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._requirements = value
    }

    set suggestions(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._suggestions = value
    }

    set rawSettings(value: bsmap.IChromaInfoCustomData['_settings']) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._settings = value
    }

    set warnings(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._warnings = value
    }

    set information(value: string[] | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._information = value
    }

    set label(value: string | undefined) {
        this.diffSet._customData ??= {}
        this.diffSet._customData._difficultyLabel = value
    }

    // Map
    /** The beatmap version. */
}

function reduceDecimalsPostProcess(
    _: never,
    _diff: AbstractDifficulty,
    mapJson: AbstractDifficulty['json'],
) {
    if (!settings.decimals) return
    reduceDecimalsInObject(mapJson)

    function reduceDecimalsInObject(json: TJson) {
        Object.keys(json).forEach((key) => {
            // deno-lint-ignore no-prototype-builtins
            if (!json.hasOwnProperty(key)) return
            const element = json[key]

            if (typeof element === 'number') {
                json[key] = setDecimals(element, settings.decimals as number)
            } else if (typeof element === 'object') {
                reduceDecimalsInObject(element as TJson)
            }
        })
    }
}

function pruneCustomData(
    _: never,
    _diff: AbstractDifficulty,
    mapJson: AbstractDifficulty['json'],
): void {
    // only prune the values of the map
    // so empty arrays don't get yeeted
    Object.values(mapJson).forEach((x) => {
        jsonPrune(x)
    })

    //   const promises: Promise<void>[] = []
    //   function traverseTree<T = unknown>(obj: Record<string, unknown>, key: string, callback: (x: T) => Promise<void> | void) {
    //     Object.entries(obj).forEach(([k, v]) => {
    //       if (k === key) {
    //         const val = callback(v as T)
    //         if (val instanceof Promise<void>) {
    //           promises.push(val)
    //         }
    //         return
    //       }

    //       if (Array.isArray(v)) {
    //         v.forEach(e => {
    //           if (typeof e !== "object") return

    //           traverseTree(e, key, callback)
    //         })
    //         return
    //       }

    //       if (!v || typeof v !== "object") return

    //       Object.values(v).forEach(vv => traverseTree(vv, key, callback))
    //     })
    //   }

    // traverseTree(mapJson, "customData", x => {
    //   if (!x || typeof x !== "object") return
    //   jsonPrune(x as Record<string, unknown>)
    // })
}