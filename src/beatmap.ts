// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { path, fs, compress } from './deps.ts';
import { Note } from './note.ts';
import { Wall } from './wall.ts';
import { Event, EventInternals } from './event.ts';
import { CustomEvent, CustomEventInternals } from './custom_event.ts';
import { Environment, EnvironmentInternals, Geometry, GeometryMaterial } from './environment.ts';
import { copy, isEmptyObject, jsonGet, jsonPrune, jsonRemove, jsonSet, sortObjects, Vec3, setDecimals, RMLog } from './general.ts';
import { AnimationInternals } from './animation.ts';
import { OptimizeSettings } from './anim_optimizer.ts';
import { settingsHandler } from './constants.ts';

type PostProcessFn<T> = (object: T, diff: Difficulty) => void;

export class Difficulty {
    json: Record<string, any> = {};
    diffSet: Record<string, any> = {};
    diffSetMap: Record<string, any> = {};
    mapFile: string;
    relativeMapFile: string;
    private postProcesses = new Map<unknown[] | undefined, PostProcessFn<unknown>[]>();
    private registerProcessors() {
        this.addPostProcess(undefined, reduceDecimalsPostProcess);
    }

    /**
     * Creates a difficulty. Can be used to access various information and the map data.
     * Will set the active difficulty to this.
     * @param {String} input Filename for the input.
     * @param {String} input Filename for the output. If left blank, input will be used.
     */
    constructor(input: string, output?: string) {

        // If the path contains a separator of any kind, use it instead of the default "Info.dat"
        info.load((input.includes('\\') || input.includes('/')) ? path.join(path.dirname(input), "Info.dat") : undefined);

        this.mapFile = input;
        this.relativeMapFile = path.parse(output ?? input).base;

        if (output !== undefined) {
            if (!fs.existsSync(output)) throw new Error(`The file ${output} does not exist`)
            this.mapFile = output;
        }

        if (!fs.existsSync(input)) throw new Error(`The file ${input} does not exist`)
        this.json = JSON.parse(Deno.readTextFileSync(input));

        info.json._difficultyBeatmapSets.forEach((set: Record<string, any>) => {
            set._difficultyBeatmaps.forEach((setmap: Record<string, any>) => {
                if (this.relativeMapFile === setmap._beatmapFilename) {
                    this.diffSet = set;
                    this.diffSetMap = setmap;
                }
            })
        })

        if (this.diffSet === undefined) throw new Error(`The difficulty ${input} does not exist in your Info.dat`)

        for (let i = 0; i < this.notes.length; i++) this.notes[i] = new Note().import(this.notes[i] as Record<string, any>);
        for (let i = 0; i < this.obstacles.length; i++) this.obstacles[i] = new Wall().import(this.obstacles[i] as Record<string, any>);
        for (let i = 0; i < this.events.length; i++) this.events[i] = new Event().import(this.events[i] as Record<string, any>);
        if (this.customEvents !== undefined)
            for (let i = 0; i < this.customEvents.length; i++) this.customEvents[i] = new CustomEvent().import(this.customEvents[i] as Record<string, any>);
        if (this.rawEnvironment !== undefined)
            for (let i = 0; i < this.rawEnvironment.length; i++) this.rawEnvironment[i] = new EnvironmentInternals.BaseEnvironment().import(this.rawEnvironment[i] as Record<string, any>);

        if (this.version === undefined) this.version = "2.2.0";

        activeDiff = this;

        this.registerProcessors();
    }

    optimize(optimize: OptimizeSettings = new OptimizeSettings()) {
        const optimizeAnimation = (animation: AnimationInternals.BaseAnimation) => {
            animation.optimize(undefined, optimize)
        };

        this.notes.forEach(e => optimizeAnimation(e.animate));
        this.obstacles.forEach(e => optimizeAnimation(e.animate));
        this.customEvents.filter(e => e instanceof CustomEventInternals.AnimateTrack).forEach(e => optimizeAnimation((e as CustomEventInternals.AnimateTrack).animate));

        // TODO: Optimize point definitions
    }

    /**
     * 
     * @param object The object to process. If undefined, will just process the difficulty
     * @param fn 
     */
    addPostProcess<T>(object: T[] | undefined, fn: PostProcessFn<T>) {
        let list = this.postProcesses.get(object)

        if (!list) {
            list = []
            this.postProcesses.set(object, list);
        }

        // idc am lazy
        list.push(fn as any);
    }

    /**
     * 
     * @param object The object to process. If undefined, will run all 
     */
    doPostProcess<T = unknown>(object: T[] | undefined = undefined) {
        type Tuple = [unknown[] | undefined, PostProcessFn<unknown>[]];

        const functionsMap: Tuple[] = object === undefined
            ? Array.from(this.postProcesses.entries()) :
            [[object, this.postProcesses.get(object)!]]

        functionsMap.forEach(tuple => {
            const arr = tuple[0]
            const functions = tuple[1]

            if (arr === undefined) {
                functions.forEach(fn => fn(undefined, this))
            } else {
                arr.forEach(i => functions.forEach(fn => fn(i, this)))
            }
        })
    }

    /** 
     * Saves the difficulty.
     * @param {String} diffName Filename for the save. If left blank, the beatmap file name will be used for the save.
     */
    save(diffName?: string) {
        diffName ??= this.mapFile;
        if (!fs.existsSync(diffName)) throw new Error(`The file ${diffName} does not exist and cannot be saved`);

        const outputJSON = copy(this.json);

        for (let i = 0; i < this.notes.length; i++) {
            const note = copy(this.notes[i]);
            if (settings.forceJumpsForNoodle && note.isGameplayModded) {
                // deno-lint-ignore no-self-assign
                note.NJS = note.NJS;
                // deno-lint-ignore no-self-assign
                note.offset = note.offset;
            }
            jsonPrune(note.json);
            outputJSON._notes[i] = note.json;
        }
        for (let i = 0; i < this.obstacles.length; i++) {
            const wall = copy(this.obstacles[i]);
            if (settings.forceJumpsForNoodle && wall.isGameplayModded) {
                // deno-lint-ignore no-self-assign
                wall.NJS = wall.NJS;
                // deno-lint-ignore no-self-assign
                wall.offset = wall.offset;
            }
            jsonPrune(wall.json);
            outputJSON._obstacles[i] = wall.json;
        }
        for (let i = 0; i < this.events.length; i++) outputJSON._events[i] = copy(this.events[i].json);

        // Finish up
        this.doPostProcess()

        sortObjects(outputJSON._events, "_time");
        sortObjects(outputJSON._notes, "_time");
        sortObjects(outputJSON._obstacles, "_time");

        if (this.customEvents !== undefined) {
            for (let i = 0; i < this.customEvents.length; i++) outputJSON._customData._customEvents[i] = copy(this.customEvents[i].json);
            sortObjects(outputJSON._customData._customEvents, "_time");
        }

        if (this.rawEnvironment !== undefined) {
            for (let i = 0; i < this.rawEnvironment.length; i++) {
                const json = copy(this.rawEnvironment[i].json);
                jsonRemove(json, "_group");
                outputJSON._customData._environment[i] = json;
            }
        }

        Deno.writeTextFileSync(diffName, JSON.stringify(outputJSON, null, 0));
        RMLog(`${this.fileName} successfully saved!`);
    }

    /**
     * Add/remove a requirement from the difficulty.
     * @param {String} requirement 
     * @param {Boolean} required True by default, set to false to remove the requirement.
     */
    require(requirement: string, required = true) {
        const requirements: Record<string, any> = {};

        let requirementsArr = this.requirements;
        if (requirementsArr === undefined) requirementsArr = [];
        requirementsArr.forEach(x => {
            requirements[x] = true;
        })
        requirements[requirement] = required;

        requirementsArr = [];
        for (const key in requirements) {
            if (requirements[key] === true) requirementsArr.push(key);
        }
        this.requirements = requirementsArr;
        info.save();
    }

    /**
     * Add/remove a suggestion from the difficulty.
     * @param {String} suggestion 
     * @param {Boolean} suggested True by default, set to false to remove the suggestion.
     */
    suggest(suggestion: string, suggested = true) {
        const suggestions: Record<string, any> = {};

        let suggestionsArr = this.suggestions;
        if (suggestionsArr === undefined) suggestionsArr = [];
        suggestionsArr.forEach(x => {
            suggestions[x] = true;
        })
        suggestions[suggestion] = suggested;

        suggestionsArr = [];
        for (const key in suggestions) {
            if (suggestions[key] === true) suggestionsArr.push(key);
        }
        this.suggestions = suggestionsArr;
        info.save();
    }

    readonly settings = new Proxy(new settingsHandler(this), {
        get(object, property) {
            const objValue = (object as any)[property] as string | [string, Record<string, any>];
            const path = typeof objValue === "string" ? objValue : objValue[0];
            const diff = (object as any)["diff"] as Difficulty;

            return diff.rawSettings[path];
        },

        set(object, property, value) {
            const objValue = (object as any)[property] as string | [string, Record<string, any>];
            const path = typeof objValue === "string" ? objValue : objValue[0];
            const diff = (object as any)["diff"] as Difficulty;
            
            if (typeof objValue !== "string") value = objValue[1][value];
            diff.updateSets(diff.rawSettings, path, value);
            return true;
        }
    });

    private updateSets(object: Record<string, any>, property: string, value: any) {
        jsonSet(object, property, value);
        if (!isEmptyObject(value)) jsonPrune(this.diffSetMap);
        info.save();
    }

    private colorArrayToTuple(array: Vec3) { return { r: array[0], g: array[1], b: array[2] } }

    // Info.dat
    get NJS(): number { return jsonGet(this.diffSetMap, "_noteJumpMovementSpeed") }
    get offset(): number { return jsonGet(this.diffSetMap, "_noteJumpStartBeatOffset") }
    get fileName(): string { return jsonGet(this.diffSetMap, "_beatmapFilename") }
    get diffSetName(): string { return jsonGet(this.diffSet, "_beatmapCharacteristicName") }
    get name(): string { return jsonGet(this.diffSetMap, "_difficulty") }
    get diffRank(): number { return jsonGet(this.diffSetMap, "_difficultyRank") }
    get requirements(): string[] { return jsonGet(this.diffSetMap, "_customData._requirements", []) }
    get suggestions(): string[] { return jsonGet(this.diffSetMap, "_customData._suggestions", []) }
    get rawSettings(): Record<string, any> { return jsonGet(this.diffSetMap, "_customData._settings", {}) }
    get warnings(): string[] { return jsonGet(this.diffSetMap, "_customData._warnings") }
    get information(): string[] { return jsonGet(this.diffSetMap, "_customData._information") }
    get label(): string { return jsonGet(this.diffSetMap, "_customData._difficultyLabel") }
    get editorOffset(): number { return jsonGet(this.diffSetMap, "_customData._editorOffset") }
    get editorOldOffset(): number { return jsonGet(this.diffSetMap, "_customData._editorOldOffset") }
    get colorLeft(): Vec3 { return jsonGet(this.diffSetMap, "_customData._colorLeft") }
    get colorRight(): Vec3 { return jsonGet(this.diffSetMap, "_customData._colorRight") }
    get lightColorLeft(): Vec3 { return jsonGet(this.diffSetMap, "_customData._envColorLeft") }
    get lightColorRight(): Vec3 { return jsonGet(this.diffSetMap, "_customData._envColorRight") }
    get boostColorLeft(): Vec3 { return jsonGet(this.diffSetMap, "_customData._envColorLeftBoost") }
    get boostColorRight(): Vec3 { return jsonGet(this.diffSetMap, "_customData._envColorRightBoost") }
    get obstacleColor(): Vec3 { return jsonGet(this.diffSetMap, "_customData._obstacleColor") }

    set NJS(value: number) { this.updateSets(this.diffSetMap, "_noteJumpMovementSpeed", value) }
    set offset(value: number) { this.updateSets(this.diffSetMap, "_noteJumpStartBeatOffset", value) }
    set fileName(value: string) { this.updateSets(this.diffSetMap, "_beatmapFilename", value) }
    set diffSetName(value: string) { this.updateSets(this.diffSet, "_beatmapCharacteristicName", value) }
    set name(value: string) { this.updateSets(this.diffSetMap, "_difficulty", value) }
    set diffRank(value: number) { this.updateSets(this.diffSetMap, "_difficultyRank", value) }
    set requirements(value: string[]) { this.updateSets(this.diffSetMap, "_customData._requirements", value) }
    set suggestions(value: string[]) { this.updateSets(this.diffSetMap, "_customData._suggestions", value) }
    set rawSettings(value: Record<string, any>) { this.updateSets(this.diffSetMap, "_customData._settings", value) }
    set warnings(value: string[]) { this.updateSets(this.diffSetMap, "_customData._warnings", value) }
    set information(value: string[]) { this.updateSets(this.diffSetMap, "_customData._information", value) }
    set label(value: string) { this.updateSets(this.diffSetMap, "_customData._difficultyLabel", value) }
    set editorOffset(value: number) { this.updateSets(this.diffSetMap, "_customData._editorOffset", value) }
    set editorOldOffset(value: number) { this.updateSets(this.diffSetMap, "_customData._editorOldOffset", value) }
    set colorLeft(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._colorLeft", this.colorArrayToTuple(value)) }
    set colorRight(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._colorRight", this.colorArrayToTuple(value)) }
    set lightColorLeft(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._envColorLeft", this.colorArrayToTuple(value)) }
    set lightColorRight(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._envColorRight", this.colorArrayToTuple(value)) }
    set boostColorLeft(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._envColorLeftBoost", this.colorArrayToTuple(value)) }
    set boostColorRight(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._envColorRightBoost", this.colorArrayToTuple(value)) }
    set obstacleColor(value: Vec3) { this.updateSets(this.diffSetMap, "_customData._obstacleColor", this.colorArrayToTuple(value)) }

    // Map
    get version(): string { return jsonGet(this.json, "_version") }
    get notes(): Note[] { return jsonGet(this.json, "_notes") }
    get obstacles(): Wall[] { return jsonGet(this.json, "_obstacles") }
    get events(): EventInternals.AbstractEvent[] { return jsonGet(this.json, "_events") }
    get waypoints(): any[] { return jsonGet(this.json, "_waypoints") }
    get customData() { return jsonGet(this.json, "_customData", {}) }
    get customEvents(): CustomEventInternals.BaseEvent[] { return jsonGet(this.json, "_customData._customEvents", []) }
    animateTracks(fn: (arr: CustomEventInternals.AnimateTrack[]) => void) {
        const arr = this.customEvents.filter(x => x instanceof CustomEventInternals.AnimateTrack) as CustomEventInternals.AnimateTrack[]
        fn(arr);
        this.customEvents = this.customEvents.filter(x => !(x instanceof CustomEventInternals.AnimateTrack)).concat(arr);
    }
    assignPathAnimations(fn: (arr: CustomEventInternals.AssignPathAnimation[]) => void) {
        const arr = this.customEvents.filter(x => x instanceof CustomEventInternals.AssignPathAnimation) as CustomEventInternals.AssignPathAnimation[]
        fn(arr);
        this.customEvents = this.customEvents.filter(x => !(x instanceof CustomEventInternals.AssignPathAnimation)).concat(arr);
    }
    assignTrackParents(fn: (arr: CustomEventInternals.AssignTrackParent[]) => void) {
        const arr = this.customEvents.filter(x => x instanceof CustomEventInternals.AssignTrackParent) as CustomEventInternals.AssignTrackParent[]
        fn(arr);
        this.customEvents = this.customEvents.filter(x => !(x instanceof CustomEventInternals.AssignTrackParent)).concat(arr);
    }
    assignPlayerToTracks(fn: (arr: CustomEventInternals.AssignPlayerToTrack[]) => void) {
        const arr = this.customEvents.filter(x => x instanceof CustomEventInternals.AssignPlayerToTrack) as CustomEventInternals.AssignPlayerToTrack[]
        fn(arr);
        this.customEvents = this.customEvents.filter(x => !(x instanceof CustomEventInternals.AssignPlayerToTrack)).concat(arr);
    }
    assignFogTracks(fn: (arr: CustomEventInternals.AssignFogTrack[]) => void) {
        const arr = this.customEvents.filter(x => x instanceof CustomEventInternals.AssignFogTrack) as CustomEventInternals.AssignFogTrack[]
        fn(arr);
        this.customEvents = this.customEvents.filter(x => !(x instanceof CustomEventInternals.AnimateTrack)).concat(arr);
    }
    abstractEvents(fn: (arr: CustomEventInternals.AbstractEvent[]) => void) {
        const arr = this.customEvents.filter(x => x instanceof CustomEventInternals.AbstractEvent) as CustomEventInternals.AbstractEvent[]
        fn(arr);
        this.customEvents = this.customEvents.filter(x => !(x instanceof CustomEventInternals.AbstractEvent)).concat(arr);
    }
    get pointDefinitions(): Record<string, any>[] { return jsonGet(this.json, "_customData._pointDefinitions", []) }
    get geoMaterials(): Record<string, GeometryMaterial> { return jsonGet(this.json, "_customData._materials", {}) }
    get rawEnvironment(): EnvironmentInternals.BaseEnvironment[] { return jsonGet(this.json, "_customData._environment", []) }
    environment(fn: (arr: Environment[]) => void) {
        const arr = this.rawEnvironment.filter(x => x instanceof Environment) as Environment[]
        fn(arr);
        this.rawEnvironment = this.rawEnvironment.filter(x => !(x instanceof Environment)).concat(arr);
    }
    geometry(fn: (arr: Geometry[]) => void) {
        const arr = this.rawEnvironment.filter(x => x instanceof Geometry) as Geometry[]
        fn(arr);
        this.rawEnvironment = this.rawEnvironment.filter(x => !(x instanceof Geometry)).concat(arr);
    }

    set version(value: string) { jsonSet(this.json, "_version", value) }
    set notes(value: Note[]) { jsonSet(this.json, "_notes", value) }
    set obstacles(value: Wall[]) { jsonSet(this.json, "_obstacles", value) }
    set events(value: EventInternals.AbstractEvent[]) { jsonSet(this.json, "_events", value) }
    set waypoints(value: any[]) { jsonSet(this.json, "_waypoints", value) }
    set customData(value) { jsonSet(this.json, "_customData", value) }
    set customEvents(value: CustomEventInternals.BaseEvent[]) { jsonSet(this.json, "_customData._customEvents", value) }
    set pointDefinitions(value: Record<string, any>[]) { jsonSet(this.json, "_customData._pointDefinitions", value) }
    set geoMaterials(value: Record<string, GeometryMaterial>) { jsonSet(this.json, "_customData._materials", value) }
    set rawEnvironment(value: EnvironmentInternals.BaseEnvironment[]) { jsonSet(this.json, "_customData._environment", value) }
}

export class Info {
    json: Record<string, any> = {};
    fileName = "Info.dat";

    load(path?: string) {
        const fileName = path ?? this.fileName;
        if (fs.existsSync(fileName)) {
            this.json = JSON.parse(Deno.readTextFileSync(fileName));
            this.fileName = fileName;
        }
        else {
            throw new Error(`The file "${fileName}" does not exist.`)
        }
    }

    /**
     * Saves the Info.dat
     */
    save() {
        if (!this.json) throw new Error("The Info object has not been loaded.");
        Deno.writeTextFileSync(this.fileName, JSON.stringify(this.json, null, 2));
    }

    private updateInfo(object: Record<string, any>, property: string, value: any) {
        jsonSet(object, property, value);
        info.save();
    }

    get version() { return jsonGet(this.json, "_version") }
    get name() { return jsonGet(this.json, "_songName") }
    get subName() { return jsonGet(this.json, "_songSubName") }
    get authorName() { return jsonGet(this.json, "_songAuthorName") }
    get mapper() { return jsonGet(this.json, "_levelAuthorName") }
    get BPM() { return jsonGet(this.json, "_beatsPerMinute") }
    get previewStart() { return jsonGet(this.json, "_previewStartTime") }
    get previewDuration() { return jsonGet(this.json, "_previewDuration") }
    get songOffset() { return jsonGet(this.json, "_songTimeOffset") }
    get shuffle() { return jsonGet(this.json, "_shuffle") }
    get shufflePeriod() { return jsonGet(this.json, "_shufflePeriod") }
    get coverFileName() { return jsonGet(this.json, "_coverImageFilename") }
    get songFileName() { return jsonGet(this.json, "_songFilename") }
    get environment() { return jsonGet(this.json, "_environmentName") }
    get environment360() { return jsonGet(this.json, "_allDirectionsEnvironmentName") }
    get customData() { return jsonGet(this.json, "_customData") }
    get editors() { return jsonGet(this.json, "_customData._editors") }
    get contributors() { return jsonGet(this.json, "_customData._contributors") }
    get customEnvironment() { return jsonGet(this.json, "_customData._customEnvironment") }
    get customEnvironmentHash() { return jsonGet(this.json, "_customData._customEnvironmentHash") }

    set version(value: string) { this.updateInfo(this.json, "_version", value) }
    set name(value: string) { this.updateInfo(this.json, "_songName", value) }
    set subName(value: string) { this.updateInfo(this.json, "_songSubName", value) }
    set authorName(value: string) { this.updateInfo(this.json, "_songAuthorName", value) }
    set mapper(value: string) { this.updateInfo(this.json, "_levelAuthorName", value) }
    set BPM(value: number) { this.updateInfo(this.json, "_beatsPerMinute", value) }
    set previewStart(value: number) { this.updateInfo(this.json, "_previewStartTime", value) }
    set previewDuration(value: number) { this.updateInfo(this.json, "_previewDuration", value) }
    set songOffset(value: number) { this.updateInfo(this.json, "_songTimeOffset", value) }
    set shuffle(value: boolean) { this.updateInfo(this.json, "_shuffle", value) }
    set shufflePeriod(value: number) { this.updateInfo(this.json, "_shufflePeriod", value) }
    set coverFileName(value: string) { this.updateInfo(this.json, "_coverImageFilename", value) }
    set songFileName(value: string) { this.updateInfo(this.json, "_songFilename", value) }
    set environment(value: string) { this.updateInfo(this.json, "_environmentName", value) }
    set environment360(value: string) { this.updateInfo(this.json, "_allDirectionsEnvironmentName", value) }
    set customData(value: Record<string, any>) { this.updateInfo(this.json, "_customData", value) }
    set editors(value: Record<string, any>) { this.updateInfo(this.json, "_customData._editors", value) }
    set contributors(value: Record<string, any>[]) { this.updateInfo(this.json, "_customData._contributors", value) }
    set customEnvironment(value: string) { this.updateInfo(this.json, "_customData._customEnvironment", value) }
    set customEnvironmentHash(value: string) { this.updateInfo(this.json, "_customData._customEnvironmentHash", value) }
}

export const info = new Info();
export let activeDiff: Difficulty;
export const settings = {
    forceJumpsForNoodle: true,
    decimals: 7 as number | undefined
}

/**
 * Set the difficulty that objects are being created for.
 * @param {Object} diff 
 */
export function activeDiffSet(diff: Difficulty) { activeDiff = diff }

/**
 * Get the active difficulty, ensuring that it is indeed active.
 * @returns {Object}
 */
export function activeDiffGet() {
    if (activeDiff) return activeDiff;
    else throw new Error("There is currently no loaded difficulty.");
}

function reduceDecimalsPostProcess(_: never, diff: Difficulty) {
    if (!settings.decimals) return;
    const mapJson = diff.json;
    reduceDecimalsInObject(mapJson);

    function reduceDecimalsInObject(json: Record<string, any>) {
        for (const key in json) {
            // deno-lint-ignore no-prototype-builtins
            if (!json.hasOwnProperty(key)) return;
            const element = json[key];

            if (typeof element === "number") {
                json[key] = setDecimals(element, settings.decimals as number);
            } else if (element instanceof Object) {
                reduceDecimalsInObject(element)
            }
        }
    }
}

/**
 * Automatically zip the map, including only necessary files.
 * @param {String[]} excludeDiffs Difficulties to exclude.
 * @param {String} zipName Name of the zip (don't include ".zip"). Uses folder name if undefined.
 */
export function exportZip(excludeDiffs: string[] = [], zipName?: string) {
    if (!info.json) throw new Error("The Info object has not been loaded.");

    const absoluteInfoFileName = info.fileName === "Info.dat" ? Deno.cwd() + `\\${info.fileName}` : info.fileName;
    const workingDir = path.parse(absoluteInfoFileName).dir;
    const exportInfo = copy(info.json);
    let files: string[] = [];
    function pushFile(file: string) {
        const dir = workingDir + `\\${file}`;
        if (fs.existsSync(dir)) files.push(dir);
    }

    pushFile(exportInfo._songFilename);
    if (exportInfo._coverImageFilename !== undefined) pushFile(exportInfo._coverImageFilename);

    for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
        const set = exportInfo._difficultyBeatmapSets[s];
        for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
            const map = set._difficultyBeatmaps[m];
            let passed = true;
            excludeDiffs.forEach(d => {
                if (map._beatmapFilename === d) {
                    set._difficultyBeatmaps.splice(m, 1);
                    m--;
                    passed = false;
                }
            })

            if (passed) pushFile(map._beatmapFilename);
        }

        if (set._difficultyBeatmaps.length === 0) {
            exportInfo._difficultyBeatmapSets.splice(s, 1);
            s--;
        }
    }

    zipName ??= `${path.parse(workingDir).name}`;
    zipName = `${zipName}.zip`;
    const tempDir = Deno.makeTempDirSync();
    const tempInfo = tempDir + `\\Info.dat`;
    files.push(tempInfo);
    Deno.writeTextFileSync(tempInfo, JSON.stringify(exportInfo, null, 0));

    files = files.map(x => x = `"${x}"`);
    zipName = zipName.replaceAll(" ", "_");
    compressZip();
    async function compressZip() {
        await compress(files, zipName, { overwrite: true });
        RMLog(`${zipName} has been zipped!`);
    }
}

/**
 * Transfer the visual aspect of maps to other difficulties.
 * More specifically modded walls, custom events, point definitions, environment enhancements, and lighting events.
 * @param {Array} diffs The difficulties being effected.
 * @param {Function} forDiff A function to run over each difficulty.
 * The activeDiff keyword will change to be each difficulty running during this function.
 * Be mindful that the external difficulties don't have an input/output structure,
 * so new pushed notes for example may not be cleared on the next run and would build up.
 */
export function transferVisuals(diffs: string[], forDiff?: (diff: Difficulty) => void) {
    const startActive = activeDiff as Difficulty;

    diffs.forEach(x => {
        const workingDiff = new Difficulty(x);

        workingDiff.rawEnvironment = startActive.rawEnvironment;
        workingDiff.pointDefinitions = startActive.pointDefinitions;
        workingDiff.customEvents = startActive.customEvents;
        workingDiff.events = startActive.events;

        for (let y = 0; y < workingDiff.obstacles.length; y++) {
            const obstacle = workingDiff.obstacles[y];
            if (obstacle.isModded) {
                workingDiff.obstacles.splice(y, 1);
                y--;
            }
        }

        startActive.obstacles.forEach(y => { if (y.isModded) workingDiff.obstacles.push(y) })

        if (forDiff !== undefined) forDiff(workingDiff);
        workingDiff.save();
    })

    activeDiffSet(startActive);
}