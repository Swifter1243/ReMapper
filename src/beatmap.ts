// deno-lint-ignore-file adjacent-overload-signatures
import { adbDeno, bsmap, compress, fs, path, semver } from './deps.ts'
import { Arc, Bomb, Chain, Note } from './note.ts'
import { Wall } from './wall.ts'
import { Environment, Geometry, GeometryMaterial } from './environment.ts'
import {
    arrRemove,
    copy,
    jsonPrune,
    parseFilePath,
    RMJson,
    RMLog,
    setDecimals,
} from './general.ts'
import { OptimizeSettings } from './anim_optimizer.ts'
import {
    DIFFS,
    FILENAME,
    FILEPATH,
    QUEST_WIP_PATH,
    REQUIRE_MODS,
    SUGGEST_MODS,
} from './constants.ts'

import {
    AnimationInternals,
    CustomEventInternals,
    EventInternals,
} from './internals/mod.ts'
import { CustomEvent } from './custom_event.ts'
import { V2Difficulty } from './beatmap_v2.ts'
import { AbstractEnvironment } from './internals/environment.ts'
import { V3Difficulty } from './beatmap_v3.ts'

type PostProcessFn<T> = (
    object: T,
    diff: AbstractDifficulty,
    json: ReturnType<AbstractDifficulty['toJSON']>,
) => void

/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFPATH = FILEPATH<DIFFS>
/** Filename for a difficulty. Extension is optional. */
export type DIFFNAME = FILENAME<DIFFS>
/** Type for Json data. */
export type TJson = Record<string, unknown>

/**
 * Converts an array of Json objects to a class counterpart.
 * Used internally in Difficulty to import Json.
 * @param array Array to convert.
 * @param target Class to convert to. Must have "import" function.
 * @param callback Optional function to run on each converted class.
 */
export function arrJsonToClass<T>(
    array: T[],
    target: { new (): T },
    callback?: (obj: T) => void,
) {
    if (array === undefined) return
    for (let i = 0; i < array.length; i++) {
        array[i] = (new target() as any).import(array[i])
        if (callback) callback(array[i])
    }
}

export async function readInfoDat(
    parsedOutput: Awaited<ReturnType<typeof parseFilePath>>,
    relativeMapFile: string,
) {
    infoPath = path.join(parsedOutput.dir ?? Deno.cwd(), 'Info.dat')
    const json = await Deno.readTextFile(
        infoPath,
    )

    info = JSON.parse(json)

    let diffSet: bsmap.IInfoSetDifficulty | undefined

    const diffSetMap = info._difficultyBeatmapSets.find((e) => {
        diffSet = e._difficultyBeatmaps.find((s) =>
            s._beatmapFilename === relativeMapFile
        )

        return diffSet
    })

    if (!diffSetMap || !diffSet) {
        throw `The difficulty ${parsedOutput.name} does not exist in your Info.dat`
    }

    return {
        diffSetMap,
        diffSet,
        info,
    }
}

export async function saveInfoDat() {
    await Deno.writeTextFile(infoPath, JSON.stringify(info))
}

export async function readDifficulty(
    input: DIFFPATH,
    output?: DIFFPATH,
    process: boolean = true,
): Promise<AbstractDifficulty> {
    const parsedInput = parseFilePath(input, '.dat')
    const parsedOutput = parseFilePath(output ?? input, '.dat')

    await Promise.all([parsedInput, parsedOutput])

    const mapFile = (await parsedOutput).path as DIFFPATH
    const relativeMapFile = (await parsedOutput).name as DIFFNAME

    // If the path contains a separator of any kind, use it instead of the default "Info.dat"
    const infoPromise = readInfoDat(await parsedOutput, relativeMapFile)

    const jsonPromise = Deno.readTextFile((await parsedInput).path)

    const infoData = await infoPromise
    const json = JSON.parse(await jsonPromise) as
        | bsmap.v2.IDifficulty
        | bsmap.v3.IDifficulty

    const v3 = Object.hasOwn(json, 'version') &&
        semver.satisfies(json as any['version'], '>=3.0.0')
    if (v3) {
        // TODO: Uncomment, breaks benchmark
        // return new V3Difficulty(
        //     infoData.diffSet,
        //     infoData.diffSetMap,
        //     mapFile,
        //     relativeMapFile,
        //     json as bsmap.v3.IDifficulty,
        // )
    }

    // return new V2Difficulty(
    //     infoData.diffSet,
    //     infoData.diffSetMap,
    //     mapFile,
    //     relativeMapFile,
    //     json as bsmap.v2.IDifficulty,
    // )
    return undefined!
}

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
    version!: string
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

    *environemntEnhancementsCombined(): IterableIterator<AbstractEnvironment> {
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

export let info: bsmap.IInfo
export let infoPath: string
export let activeDiff: AbstractDifficulty
export const settings = {
    forceJumpsForNoodle: true,
    decimals: 7 as number | undefined,
}

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function activeDiffSet(diff: AbstractDifficulty) {
    activeDiff = diff
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function activeDiffGet() {
    if (activeDiff) return activeDiff

    throw new Error('There is currently no loaded difficulty.')
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

/**
 * Create a temporary directory with all of the relevant files for the beatmap.
 * Returns all of the files that are in the directory.
 * @param excludeDiffs Difficulties to exclude.
 */
export async function collectBeatmapFiles(
    excludeDiffs: FILENAME<DIFFS>[] = [],
) {
    if (!info) throw new Error('The Info object has not been loaded.')

    const exportInfo = copy(info)
    const unsanitizedFiles: (string | undefined)[] = [
        exportInfo._songFilename,
        exportInfo._coverImageFilename,
        'cinema-video.json',
    ]

    for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
        const set = exportInfo._difficultyBeatmapSets[s]
        for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
            const map = set._difficultyBeatmaps[m]
            let passed = true
            excludeDiffs.forEach(async (d) => {
                if (
                    map._beatmapFilename ===
                        (await parseFilePath(d, '.dat')).path
                ) {
                    arrRemove(set._difficultyBeatmaps, m)
                    m--
                    passed = false
                }
            })

            if (passed) unsanitizedFiles.push(map._beatmapFilename)
        }

        if (set._difficultyBeatmaps.length === 0) {
            arrRemove(exportInfo._difficultyBeatmapSets, s)
            s--
        }
    }

    const workingDir = Deno.cwd()
    const filesPromise: [string, Promise<boolean>][] = unsanitizedFiles
        .filter((v) => v) // check not undefined or null
        .map((v) => path.join(workingDir, v!)) // prepend workspace dir
        .map((v) => [v, fs.exists(v)]) // ensure file exists

    const files: string[] = filesPromise.filter(async (v) => await v[1]).map((
        v,
    ) => v[0])

    const tempDir = await Deno.makeTempDir()
    const tempInfo = tempDir + `\\Info.dat`
    await Deno.writeTextFile(tempInfo, JSON.stringify(exportInfo, null, 0))

    files.push(tempInfo) // add temp info

    return files
}

/**
 * Automatically zip the map, including only necessary files.
 * @param excludeDiffs Difficulties to exclude.
 * @param zipName Name of the zip (don't include ".zip"). Uses folder name if undefined.
 */
export async function exportZip(
    excludeDiffs: FILENAME<DIFFS>[] = [],
    zipName?: string,
) {
    const workingDir = Deno.cwd()
    zipName ??= `${path.parse(workingDir).name}`
    zipName = `${zipName}.zip`
    zipName = zipName.replaceAll(' ', '_')

    const files = (await collectBeatmapFiles(excludeDiffs))
        .map((v) => `"${v}"`) // surround with quotes for safety

    compress(files, zipName, { overwrite: true }).then(() => {
        RMLog(`${zipName} has been zipped!`)
    })
}

/**
 * Automatically upload the map files to quest, including only necessary files.
 *
 * They will be uploaded to the song WIP folder, {@link QUEST_WIP_PATH}
 * @param excludeDiffs Difficulties to exclude.
 * @param options Options to pass to ADB
 */
export async function exportToQuest(
    excludeDiffs: FILENAME<DIFFS>[] = [],
    options?: adbDeno.InvokeADBOptions,
) {
    const adbBinary = adbDeno.getADBBinary(adbDeno.defaultADBPath())

    // Download ADB
    const adbPromise = fs.exists(adbBinary).then(async (exists) => {
        if (!exists) return

        console.log('ADB not found, downloading')
        await adbDeno.downloadADB(options?.downloadPath)
    })

    const files = await collectBeatmapFiles(excludeDiffs) // surround with quotes for safety
    const cwd = Deno.cwd()

    const questSongFolder = `${QUEST_WIP_PATH}/${info._songName}`

    await adbPromise
    await adbDeno.mkdir(questSongFolder)

    const tasks = files.map((v) => {
        const relativePath = path.relative(cwd, v)
        console.log(`Uploading ${relativePath} to quest`)
        adbDeno.uploadFile(
            `${questSongFolder}/${relativePath}`,
            v,
            options,
        )
    })

    await Promise.all(tasks)
    console.log('Uploaded all files to quest')
}

/**
 * Transfer the visual aspect of maps to other difficulties.
 * @param diffs The difficulties being effected.
 * @param forDiff A function to run over each difficulty.
 * @param walls If true, walls with custom data will be overriden.
 * The activeDiff keyword will change to be each difficulty running during this function.
 * Be mindful that the external difficulties don't have an input/output structure,
 * so new pushed notes for example may not be cleared on the next run and would build up.
 */
export function transferVisuals(
    diffs: DIFFPATH[],
    forDiff?: (diff: RMDifficulty) => void,
    walls = true,
) {
    throw 'TODO: Implement'
    // const startActive = activeDiff;

    // diffs.forEach((x) => {
    //   const workingDiff = new RMDifficulty(
    //     parseFilePath(x, ".dat").path as DIFFPATH,
    //   );

    //   workingDiff.rawEnvironment = startActive.rawEnvironment;
    //   workingDiff.pointDefinitions = startActive.pointDefinitions;
    //   workingDiff.customEvents = startActive.customEvents;
    //   workingDiff.events = startActive.events;
    //   workingDiff.geoMaterials = startActive.geoMaterials;
    //   workingDiff.boostEvents = startActive.boostEvents;
    //   workingDiff.lightEventBoxes = startActive.lightEventBoxes;
    //   workingDiff.lightRotationBoxes = startActive.lightRotationBoxes;
    //   workingDiff.fakeNotes = startActive.fakeNotes;
    //   workingDiff.fakeBombs = startActive.fakeBombs;
    //   workingDiff.fakeWalls = startActive.fakeWalls;
    //   workingDiff.fakeChains = startActive.fakeChains;

    //   if (walls) {
    //     for (let y = 0; y < workingDiff.walls.length; y++) {
    //       const obstacle = workingDiff.walls[y];
    //       if (obstacle.isModded) {
    //         arrRemove(workingDiff.walls, y);
    //         y--;
    //       }
    //     }

    //     startActive.walls.forEach((y) => {
    //       if (y.isModded) workingDiff.walls.push(y);
    //     });
    //   }

    //   if (forDiff !== undefined) forDiff(workingDiff);
    //   workingDiff.save();
    // });

    // activeDiffSet(startActive);
}
