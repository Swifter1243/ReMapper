import * as fs from 'fs';
import { Note } from './note';
import { Wall } from './wall';
import { Event, EventInternals } from './event';
import { CustomEvent, CustomEventInternals } from './custom_event';
import { Environment } from './environment';
import { copy, isEmptyObject, jsonGet, jsonPrune, jsonRemove, jsonSet, sortObjects, Vec3 } from './general';

export class Difficulty {
    json;
    diffSet;
    diffSetMap;
    mapFile;

    /**
     * Creates a difficulty. Can be used to access various information and the map data.
     * Will set the active difficulty to this.
     * @param {String} input Filename for the input.
     * @param {String} input Filename for the output. If left blank, input will be used.
     */
    constructor(input: string, output: string = undefined) {
        this.mapFile = input;
        if (output !== undefined) {
            if (!fs.existsSync(output)) throw new Error(`The file ${output} does not exist`)
            this.mapFile = output;
        }

        if (!fs.existsSync(input)) throw new Error(`The file ${input} does not exist`)
        this.json = JSON.parse(fs.readFileSync(input, "utf-8"));

        info.json._difficultyBeatmapSets.forEach(set => {
            set._difficultyBeatmaps.forEach(setmap => {
                if (this.mapFile === setmap._beatmapFilename) {
                    this.diffSet = set;
                    this.diffSetMap = setmap;
                }
            })
        })

        if (this.diffSet === undefined) throw new Error(`The difficulty ${input} does not exist in your Info.dat`)

        for (let i = 0; i < this.notes.length; i++) this.notes[i] = new Note().import(this.notes[i]);
        for (let i = 0; i < this.obstacles.length; i++) this.obstacles[i] = new Wall().import(this.obstacles[i]);
        for (let i = 0; i < this.events.length; i++) this.events[i] = new Event().import(this.events[i]);
        if (this.customEvents !== undefined)
            for (let i = 0; i < this.customEvents.length; i++) this.customEvents[i] = new CustomEvent().import(this.customEvents[i]);
        if (this.environment !== undefined)
            for (let i = 0; i < this.environment.length; i++) this.environment[i] = new Environment().import(this.environment[i]);

        if (this.version === undefined) this.version = "2.2.0";

        activeDiff = this;
    }

    /** 
     * Saves the difficulty.
     * @param {String} diffName Filename for the save. If left blank, the beatmap file name will be used for the save.
     */
    save(diffName: string = this.mapFile) {
        if (!fs.existsSync(diffName)) throw new Error(`The file ${diffName} does not exist and cannot be saved`);

        let outputJSON = copy(this.json);

        for (let i = 0; i < this.notes.length; i++) {
            let note = copy(this.notes[i]);
            if (forceJumpsForNoodle && note.isModded) {
                note.NJS = note.NJS;
                note.offset = note.offset;
            }
            jsonPrune(note.json);
            outputJSON._notes[i] = note.json;
        }
        for (let i = 0; i < this.obstacles.length; i++) {
            let wall = copy(this.obstacles[i]);
            if (forceJumpsForNoodle && wall.isModded) {
                wall.NJS = wall.NJS;
                wall.offset = wall.offset;
            }
            jsonPrune(wall.json);
            outputJSON._obstacles[i] = wall.json;
        }
        for (let i = 0; i < this.events.length; i++) outputJSON._events[i] = copy(this.events[i].json);

        sortObjects(outputJSON._events, "_time");
        sortObjects(outputJSON._notes, "_time");
        sortObjects(outputJSON._obstacles, "_time");

        if (this.customEvents !== undefined) {
            for (let i = 0; i < this.customEvents.length; i++) outputJSON._customData._customEvents[i] = copy(this.customEvents[i].json);
            sortObjects(outputJSON._customData._customEvents, "_time");
        }

        if (this.environment !== undefined) {
            for (let i = 0; i < this.environment.length; i++) {
                let json = copy(this.environment[i].json);
                jsonRemove(json, "_group");
                outputJSON._customData._environment[i] = json;
            }
        }

        fs.writeFileSync(diffName, JSON.stringify(outputJSON, null, 0));
    }

    /**
     * Add/remove a requirement from the difficulty.
     * @param {String} requirement 
     * @param {Boolean} required True by default, set to false to remove the requirement.
     */
    require(requirement: string, required = true) {
        let requirements = {};

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
        let suggestions = {};

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

    /**
     * Set a setting.
     * @param {String} setting The path of the setting.
     * @param {*} value The value of the setting, leave blank to remove setting.
     */
    setSetting(setting: string, value = undefined) {
        if (this.settings === undefined) this.settings = {};
        this.updateSets(this.settings, setting, value);
    }

    private updateSets(object, property: string, value) {
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
    get requirements(): string[] { return jsonGet(this.diffSetMap, "_customData._requirements") }
    get suggestions(): string[] { return jsonGet(this.diffSetMap, "_customData._suggestions") }
    get settings(): any { return jsonGet(this.diffSetMap, "_customData._settings") }
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
    set settings(value: any) { this.updateSets(this.diffSetMap, "_customData._settings", value) }
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
    get customData() { return jsonGet(this.json, "_customData") }
    get customEvents(): CustomEventInternals.BaseEvent[] { return jsonGet(this.json, "_customData._customEvents") }
    get pointDefinitions(): any[] { return jsonGet(this.json, "_customData._pointDefinitions") }
    get environment(): Environment[] { return jsonGet(this.json, "_customData._environment") }

    set version(value: string) { jsonSet(this.json, "_version", value) }
    set notes(value: Note[]) { jsonSet(this.json, "_notes", value) }
    set obstacles(value: Wall[]) { jsonSet(this.json, "_obstacles", value) }
    set events(value: EventInternals.AbstractEvent[]) { jsonSet(this.json, "_events", value) }
    set waypoints(value: any[]) { jsonSet(this.json, "_waypoints", value) }
    set customData(value) { jsonSet(this.json, "_customData", value) }
    set customEvents(value: CustomEventInternals.BaseEvent[]) { jsonSet(this.json, "_customData._customEvents", value) }
    set pointDefinitions(value: any[]) { jsonSet(this.json, "_customData._pointDefinitions", value) }
    set environment(value: Environment[]) { jsonSet(this.json, "_customData._environment", value) }
}

export class Info {
    json;
    fileName = "Info.dat";

    constructor() {
        let fileName = this.fileName;
        if (fs.existsSync(fileName)) {
            this.json = JSON.parse(fs.readFileSync(fileName, "utf-8"));
            this.fileName = fileName;
        }
        else {
            throw new Error(`The file "${fileName}" does not exist. Please call "change()" if your Info.dat file is named differently.`)
        }
    }

    /**
     * Saves the Info.dat
     */
    save() {
        fs.writeFileSync(this.fileName, JSON.stringify(this.json, null, 2));
    }

    private updateInfo(object, property, value) {
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

    set version(value) { this.updateInfo(this.json, "_version", value) }
    set name(value) { this.updateInfo(this.json, "_songName", value) }
    set subName(value) { this.updateInfo(this.json, "_songSubName", value) }
    set authorName(value) { this.updateInfo(this.json, "_songAuthorName", value) }
    set mapper(value) { this.updateInfo(this.json, "_levelAuthorName", value) }
    set BPM(value) { this.updateInfo(this.json, "_beatsPerMinute", value) }
    set previewStart(value) { this.updateInfo(this.json, "_previewStartTime", value) }
    set previewDuration(value) { this.updateInfo(this.json, "_previewDuration", value) }
    set songOffset(value) { this.updateInfo(this.json, "_songTimeOffset", value) }
    set shuffle(value) { this.updateInfo(this.json, "_shuffle", value) }
    set shufflePeriod(value) { this.updateInfo(this.json, "_shufflePeriod", value) }
    set coverFileName(value) { this.updateInfo(this.json, "_coverImageFilename", value) }
    set songFileName(value) { this.updateInfo(this.json, "_songFilename", value) }
    set environment(value) { this.updateInfo(this.json, "_environmentName", value) }
    set environment360(value) { this.updateInfo(this.json, "_allDirectionsEnvironmentName", value) }
    set customData(value) { this.updateInfo(this.json, "_customData", value) }
    set editors(value) { this.updateInfo(this.json, "_customData._editors", value) }
    set contributors(value) { this.updateInfo(this.json, "_customData._contributors", value) }
    set customEnvironment(value) { this.updateInfo(this.json, "_customData._customEnvironment", value) }
    set customEnvironmentHash(value) { this.updateInfo(this.json, "_customData._customEnvironmentHash", value) }
}

export let info = new Info();
export let activeDiff: Difficulty;
export let forceJumpsForNoodle = true;

/**
 * Set the difficulty that objects are being created for.
 * @param {Object} diff 
 */
export function activeDiffSet(diff: Difficulty) { activeDiff = diff }

/**
 * Set whether exported walls and notes with custom data will have their NJS / Offset forced.
 * This helps avoid things like JDFixer breaking things. Should be set before your scripting.
 * @param {Boolean} value
 */
export function forceJumpsForNoodleSet(value: boolean) { forceJumpsForNoodle = value; }