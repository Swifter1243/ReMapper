// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { path, fs, compress } from "./deps.ts";
import { Arc, Note, Bomb, Chain } from "./note.ts";
import { Wall } from "./wall.ts";
import { Event, EventInternals } from "./basicEvent.ts";
import { CustomEvent, CustomEventInternals } from "./custom_event.ts";
import {
  Environment,
  EnvironmentInternals,
  Geometry,
  GeometryMaterial,
} from "./environment.ts";
import {
  copy,
  isEmptyObject,
  jsonGet,
  jsonPrune,
  jsonSet,
  sortObjects,
  Vec3,
  setDecimals,
  RMLog,
  parseFilePath,
  RMJson,
  jsonRemove,
  Vec4,
} from "./general.ts";
import { AnimationInternals, RawKeyframesAny } from "./animation.ts";
import { OptimizeSettings } from "./anim_optimizer.ts";
import {
  ENV_NAMES,
  MODS,
  settingsHandler,
  DIFFS,
  FILENAME,
  FILEPATH,
  EASE,
} from "./constants.ts";
import {
  BoostEvent,
  BPMChange,
  LightEvent,
  LightEventBox,
  LightEventBoxGroup,
  LightRotation,
  LightRotationBox,
  LightRotationBoxGroup,
  RotationEvent,
} from "./event.ts";

type PostProcessFn<T> = (object: T, diff: Difficulty) => void;

/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFPATH = FILEPATH<DIFFS>;
/** Filename for a difficulty. Extension is optional. */
export type DIFFNAME = FILENAME<DIFFS>;
/** Type for Json data. */
export type Json = Record<string, any>;

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
  callback?: (obj: T) => void
) {
  if (array === undefined) return;
  for (let i = 0; i < array.length; i++) {
    array[i] = (new target() as any).import(array[i]);
    if (callback) callback(array[i]);
  }
}

/**
 * Converts an array of classes to Json.
 * Used internally in Difficulty to export to Json.
 * @param arr Array to convert.
 * @param outputJSON Parent Json that array is attached to.
 * @param prop Property of the array in the outputJSON value.
 * @param callback Optional callback to run on each class copy before conversion.
 */
export function arrClassToJson<T>(
  arr: T[],
  outputJSON: Json,
  prop: string,
  callback?: (obj: any) => void
) {
  const jsonArr = jsonGet(outputJSON, prop);
  if (jsonArr === undefined) return;

  if (callback) {
    arr.forEach((x) => {
      const obj = copy(x) as any;
      callback(obj);
      jsonArr.push(obj.json);
    });
  } else arr.forEach((x) => jsonArr.push((x as any).json));

  sortObjects(jsonArr, "b");
}

export class Difficulty {
  /** The Json of the entire difficulty. */
  json: Json = {};
  /** The Json of the difficulty set
   * (e.g. Standard) that this difficulty is contained in inside of the Info.dat.
   */
  diffSet: Json = {};
  /** The Json of the difficulty set map
   * (e.g. Hard) that this difficulty is contained in inside of the Info.dat.
   */
  diffSetMap: Json = {};
  /** The path to the output file of this difficulty. */
  mapFile: DIFFPATH;
  /** The filename of the output file of this difficulty. */
  relativeMapFile: DIFFNAME;
  private postProcesses = new Map<
    unknown[] | undefined,
    PostProcessFn<unknown>[]
  >();
  private registerProcessors() {
    this.addPostProcess(undefined, reduceDecimalsPostProcess);
    this.addPostProcess(this.events, convertChromaLegacyGradients);
  }

  /**
   * Creates a difficulty. Can be used to access various information and the map data.
   * Will set the active difficulty to this.
   * @param input Filename for the input.
   * @param input Filename for the output. If left blank, input will be used.
   */
  constructor(input: DIFFPATH, output?: DIFFPATH) {
    const parsedInput = parseFilePath(input, ".dat");
    const parsedOutput = parseFilePath(output ?? input, ".dat");

    // If the path contains a separator of any kind, use it instead of the default "Info.dat"
    info.load(
      parsedOutput.dir ? path.join(parsedOutput.dir, "Info.dat") : undefined
    );

    this.mapFile = parsedOutput.path as DIFFPATH;
    this.relativeMapFile = parsedOutput.name as DIFFNAME;
    this.json = JSON.parse(Deno.readTextFileSync(parsedInput.path));

    info.json._difficultyBeatmapSets.forEach((set: Json) => {
      set._difficultyBeatmaps.forEach((setmap: Json) => {
        if (this.relativeMapFile === setmap._beatmapFilename) {
          this.diffSet = set;
          this.diffSetMap = setmap;
        }
      });
    });

    if (this.diffSet === undefined)
      throw new Error(
        `The difficulty ${parsedOutput.name} does not exist in your Info.dat`
      );

    function transferKey(obj: Json, old: string, value: string) {
      if (obj[old] === undefined) return;
      obj[value] = obj[old];
      delete obj[old];
    }

    this.json.basicBeatmapEvents.forEach((x: Json) => {
      if (x.customData) {
        const keys = [
          "lightID",
          "color",
          "easing",
          "lerpType",
          "rotation",
          "nameFilter",
          "step",
          "prop",
          "speed",
          "direction",
        ];

        keys.forEach((k) => transferKey(x.customData, `_${k}`, k));
      }
    });

    arrJsonToClass(this.notes, Note);
    arrJsonToClass(this.bombs, Bomb);
    arrJsonToClass(this.arcs, Arc);
    arrJsonToClass(this.chains, Chain);
    arrJsonToClass(this.walls, Wall);
    arrJsonToClass(this.events, Event as any);
    arrJsonToClass(this.customEvents, CustomEvent);
    arrJsonToClass(this.rawEnvironment, EnvironmentInternals.BaseEnvironment);
    arrJsonToClass(this.BPMChanges, BPMChange);
    arrJsonToClass(this.rotationEvents, RotationEvent);
    arrJsonToClass(this.boostEvents, BoostEvent);

    arrJsonToClass(this.lightEventBoxes, LightEventBox, (b) => {
      arrJsonToClass(b.boxGroups, LightEventBoxGroup, (g) => {
        arrJsonToClass(g.events, LightEvent);
      });
    });

    arrJsonToClass(this.lightRotationBoxes, LightRotationBox, (b) => {
      arrJsonToClass(b.boxGroups, LightRotationBoxGroup, (g) => {
        arrJsonToClass(g.events, LightRotation);
      });
    });

    arrJsonToClass(this.fakeNotes, Note);
    arrJsonToClass(this.fakeBombs, Bomb);
    arrJsonToClass(this.fakeWalls, Wall);
    arrJsonToClass(this.fakeChains, Chain);

    activeDiff = this;

    this.registerProcessors();
  }

  /**
   * Go through every animation in this difficulty and optimize it.
   * Warning, this is an expensive action and may be redundant based on what has already been optimized.
   * @param optimize Settings for the optimization.
   */
  optimize(optimize: OptimizeSettings = new OptimizeSettings()) {
    const optimizeAnimation = (animation: AnimationInternals.BaseAnimation) => {
      animation.optimize(undefined, optimize);
    };

    this.notes.forEach((e) => optimizeAnimation(e.animate));
    this.walls.forEach((e) => optimizeAnimation(e.animate));
    this.customEvents
      .filter((e) => e instanceof CustomEventInternals.AnimateTrack)
      .forEach((e) =>
        optimizeAnimation((e as CustomEventInternals.AnimateTrack).animate)
      );

    // TODO: Optimize point definitions
  }

  /**
   * Allows you to add a function to be run on save of this difficulty.
   * @param object The object to process. If undefined, the difficulty will be processed.
   * @param fn The function to be added.
   */
  addPostProcess<T>(object: T[] | undefined, fn: PostProcessFn<T>) {
    let list = this.postProcesses.get(object);

    if (!list) {
      list = [];
      this.postProcesses.set(object, list);
    }

    // idc am lazy
    list.push(fn as any);
  }

  /**
   * Runs the post process functions in this difficulty.
   * @param object The object to process. If undefined, the difficulty will be processed.
   */
  doPostProcess<T = unknown>(object: T[] | undefined = undefined) {
    type Tuple = [unknown[] | undefined, PostProcessFn<unknown>[]];

    const functionsMap: Tuple[] =
      object === undefined
        ? Array.from(this.postProcesses.entries())
        : [[object, this.postProcesses.get(object)!]];

    functionsMap.forEach((tuple) => {
      const arr = tuple[0];
      const functions = tuple[1];

      if (arr === undefined) {
        functions.forEach((fn) => fn(undefined, this));
      } else {
        arr.forEach((i) => functions.forEach((fn) => fn(i, this)));
      }
    });
  }

  /**
   * Saves the difficulty.
   * @param diffName Filename for the save.
   * If left blank, the beatmap file name will be used for the save.
   */
  save(diffName?: DIFFPATH) {
    if (diffName) diffName = parseFilePath(diffName, ".dat").path as DIFFPATH;
    else diffName = this.mapFile;

    this.doPostProcess();

    const outputJSON = {} as Json;

    Object.keys(this.json).forEach((x) => {
      if (Array.isArray(this.json[x])) outputJSON[x] = [];
      else if (x === "customData")
        Object.keys(this.json[x]).forEach((y) => {
          if (!outputJSON[x]) outputJSON[x] = {};
          if (Array.isArray(this.json[x][y])) outputJSON[x][y] = [];
          else outputJSON[x][y] = copy(this.json[x][y]);
        });
      else outputJSON[x] = copy(this.json[x]);
    });

    const diffArrClassToJson = <T>(
      arr: T[],
      prop: string,
      callback?: (obj: any) => void
    ) => arrClassToJson(arr, outputJSON, prop, callback);

    function gameplayArrClassToJson<T>(arr: T[], prop: string) {
      diffArrClassToJson(arr, prop, (x) => {
        if (settings.forceJumpsForNoodle && x.isGameplayModded) {
          // deno-lint-ignore no-self-assign
          x.NJS = x.NJS;
          // deno-lint-ignore no-self-assign
          x.offset = x.offset;
        }
        jsonPrune(x.json);
      });
    }

    gameplayArrClassToJson(this.notes, "colorNotes");
    gameplayArrClassToJson(this.bombs, "bombNotes");
    gameplayArrClassToJson(this.arcs, "sliders");
    gameplayArrClassToJson(this.chains, "burstSliders");
    gameplayArrClassToJson(this.walls, "obstacles");
    diffArrClassToJson(this.events, "basicBeatmapEvents");
    diffArrClassToJson(this.BPMChanges, "bpmEvents");
    diffArrClassToJson(this.rotationEvents, "rotationEvents");
    diffArrClassToJson(this.boostEvents, "colorBoostBeatmapEvents");
    diffArrClassToJson(this.customEvents, "customData.customEvents");
    diffArrClassToJson(this.rawEnvironment, "customData.environment", (x) => {
      jsonRemove(x.json, "group");
    });
    gameplayArrClassToJson(this.fakeNotes, "customData.fakeColorNotes");
    gameplayArrClassToJson(this.fakeBombs, "customData.fakeBombNotes");
    gameplayArrClassToJson(this.fakeWalls, "customData.fakeObstacles");
    gameplayArrClassToJson(this.fakeChains, "customData.fakeBurstSliders");

    function safeCloneJSON(json: Json) {
      const output: Json = {};

      Object.keys(json).forEach((k) => {
        if (typeof json[k] !== "object") output[k] = json[k];
        else output[k] = [];
      });

      return output;
    }

    this.lightEventBoxes.forEach((b) => {
      const json = safeCloneJSON(b.json);

      b.boxGroups.forEach((g) => {
        const groupJson = safeCloneJSON(g.json);
        groupJson.f = copy(g.json.f);

        g.events.forEach((e) => {
          groupJson.e.push(e.json);
        });

        json.e.push(groupJson);
      });

      outputJSON.lightColorEventBoxGroups.push(json);
    });

    this.lightRotationBoxes.forEach((b) => {
      const json = safeCloneJSON(b.json);

      b.boxGroups.forEach((g) => {
        const groupJson = safeCloneJSON(g.json);
        groupJson.f = copy(g.json.f);

        g.events.forEach((e) => {
          groupJson.l.push(e.json);
        });

        json.e.push(groupJson);
      });

      outputJSON.lightRotationEventBoxGroups.push(json);
    });

    info.save();
    RMJson.save();
    Deno.writeTextFileSync(diffName, JSON.stringify(outputJSON, null, 0));
    RMLog(`${diffName} successfully saved!`);
  }

  /**
   * Add/remove a mod requirement from the difficulty.
   * @param requirement The requirement to effect.
   * @param required True by default, set to false to remove the requirement.
   */
  require(requirement: MODS, required = true) {
    const requirements: Json = {};

    let requirementsArr = this.requirements;
    if (requirementsArr === undefined) requirementsArr = [];
    requirementsArr.forEach((x) => {
      requirements[x] = true;
    });
    requirements[requirement] = required;

    requirementsArr = [];
    for (const key in requirements) {
      if (requirements[key] === true) requirementsArr.push(key);
    }
    this.requirements = requirementsArr;
  }

  /**
   * Add/remove a mod suggestion from the difficulty.
   * @param suggestion The suggestion to effect.
   * @param suggested True by default, set to false to remove the suggestion.
   */
  suggest(suggestion: MODS, suggested = true) {
    const suggestions: Json = {};

    let suggestionsArr = this.suggestions;
    if (suggestionsArr === undefined) suggestionsArr = [];
    suggestionsArr.forEach((x) => {
      suggestions[x] = true;
    });
    suggestions[suggestion] = suggested;

    suggestionsArr = [];
    for (const key in suggestions) {
      if (suggestions[key] === true) suggestionsArr.push(key);
    }
    this.suggestions = suggestionsArr;
  }

  /** The settings to be set for this difficulty. */
  readonly settings = new Proxy(new settingsHandler(this), {
    get(object, property) {
      const objValue = (object as any)[property] as string | [string, Json];
      const path = typeof objValue === "string" ? objValue : objValue[0];
      const diff = (object as any)["diff"] as Difficulty;

      return diff.rawSettings[path];
    },

    set(object, property, value) {
      const objValue = (object as any)[property] as string | [string, Json];
      const path = typeof objValue === "string" ? objValue : objValue[0];
      const diff = (object as any)["diff"] as Difficulty;

      if (typeof objValue !== "string") value = objValue[1][value];
      diff.pruneInput(diff.rawSettings, path, value);
      return true;
    },
  });

  private pruneInput(object: Json, property: string, value: any) {
    jsonSet(object, property, value);
    if (!isEmptyObject(value)) jsonPrune(this.diffSetMap);
  }

  private colorArrayToTuple(array: Vec3) {
    return { r: array[0], g: array[1], b: array[2] };
  }

  // Info.dat
  /** The note jump speed for this difficulty. */
  get NJS() {
    return jsonGet(this.diffSetMap, "_noteJumpMovementSpeed");
  }
  /** The note offset for this difficulty. */
  get offset() {
    return jsonGet(this.diffSetMap, "_noteJumpStartBeatOffset");
  }
  /** The filename for this difficulty. */
  get fileName() {
    return jsonGet(this.diffSetMap, "_beatmapFilename");
  }
  /** The name of the difficulty set. E.g. Standard */
  get diffSetName() {
    return jsonGet(this.diffSet, "_beatmapCharacteristicName");
  }
  /** The name of the difficulty. E.g. Hard */
  get name() {
    return jsonGet(this.diffSetMap, "_difficulty");
  }
  /** The difficulty rank. */
  get diffRank() {
    return jsonGet(this.diffSetMap, "_difficultyRank");
  }
  /** The mod requirements for this difficulty. */
  get requirements() {
    return jsonGet(this.diffSetMap, "_customData._requirements", []);
  }
  /** The mod suggestions for this difficulty. */
  get suggestions() {
    return jsonGet(this.diffSetMap, "_customData._suggestions", []);
  }
  /** The unaliased settings object. */
  get rawSettings() {
    return jsonGet(this.diffSetMap, "_customData._settings", {});
  }
  /** Warnings to display in the info button. */
  get warnings() {
    return jsonGet(this.diffSetMap, "_customData._warnings");
  }
  /** Information to display in the info button. */
  get information() {
    return jsonGet(this.diffSetMap, "_customData._information");
  }
  /** The custom difficulty name. */
  get label() {
    return jsonGet(this.diffSetMap, "_customData._difficultyLabel");
  }
  /** Unknown */
  get editorOffset() {
    return jsonGet(this.diffSetMap, "_customData._editorOffset");
  }
  /** Unknown */
  get editorOldOffset() {
    return jsonGet(this.diffSetMap, "_customData._editorOldOffset");
  }
  /** The left object color. */
  get colorLeft() {
    return jsonGet(this.diffSetMap, "_customData._colorLeft");
  }
  /** The right object color. */
  get colorRight() {
    return jsonGet(this.diffSetMap, "_customData._colorRight");
  }
  /** The left light color. */
  get lightColorLeft() {
    return jsonGet(this.diffSetMap, "_customData._envColorLeft");
  }
  /** The right light color. */
  get lightColorRight() {
    return jsonGet(this.diffSetMap, "_customData._envColorRight");
  }
  /** The left boost light color. */
  get boostColorLeft() {
    return jsonGet(this.diffSetMap, "_customData._envColorLeftBoost");
  }
  /** The right boost light color. */
  get boostColorRight() {
    return jsonGet(this.diffSetMap, "_customData._envColorRightBoost");
  }
  /** The color for walls. */
  get wallColor() {
    return jsonGet(this.diffSetMap, "_customData._obstacleColor");
  }

  set NJS(value: number) {
    this.pruneInput(this.diffSetMap, "_noteJumpMovementSpeed", value);
  }
  set offset(value: number) {
    this.pruneInput(this.diffSetMap, "_noteJumpStartBeatOffset", value);
  }
  set fileName(value: string) {
    this.pruneInput(this.diffSetMap, "_beatmapFilename", value);
  }
  set diffSetName(value: string) {
    this.pruneInput(this.diffSet, "_beatmapCharacteristicName", value);
  }
  set name(value: string) {
    this.pruneInput(this.diffSetMap, "_difficulty", value);
  }
  set diffRank(value: number) {
    this.pruneInput(this.diffSetMap, "_difficultyRank", value);
  }
  set requirements(value: string[]) {
    this.pruneInput(this.diffSetMap, "_customData._requirements", value);
  }
  set suggestions(value: string[]) {
    this.pruneInput(this.diffSetMap, "_customData._suggestions", value);
  }
  set rawSettings(value: Json) {
    this.pruneInput(this.diffSetMap, "_customData._settings", value);
  }
  set warnings(value: string[]) {
    this.pruneInput(this.diffSetMap, "_customData._warnings", value);
  }
  set information(value: string[]) {
    this.pruneInput(this.diffSetMap, "_customData._information", value);
  }
  set label(value: string) {
    this.pruneInput(this.diffSetMap, "_customData._difficultyLabel", value);
  }
  set editorOffset(value: number) {
    this.pruneInput(this.diffSetMap, "_customData._editorOffset", value);
  }
  set editorOldOffset(value: number) {
    this.pruneInput(this.diffSetMap, "_customData._editorOldOffset", value);
  }
  set colorLeft(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._colorLeft",
      this.colorArrayToTuple(value)
    );
  }
  set colorRight(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._colorRight",
      this.colorArrayToTuple(value)
    );
  }
  set lightColorLeft(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorLeft",
      this.colorArrayToTuple(value)
    );
  }
  set lightColorRight(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorRight",
      this.colorArrayToTuple(value)
    );
  }
  set boostColorLeft(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorLeftBoost",
      this.colorArrayToTuple(value)
    );
  }
  set boostColorRight(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorRightBoost",
      this.colorArrayToTuple(value)
    );
  }
  set wallColor(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._obstacleColor",
      this.colorArrayToTuple(value)
    );
  }

  // Map
  /** The beatmap version. */
  get version() {
    return this.json.version;
  }
  /** All notes in the map. */
  get notes() {
    return this.json.colorNotes;
  }
  /** All bombs in the map. */
  get bombs() {
    return this.json.bombNotes;
  }
  /** All arcs in the map. */
  get arcs() {
    return this.json.sliders;
  }
  /** All chains in the map. */
  get chains() {
    return this.json.burstSliders;
  }
  /** All walls in the map. */
  get walls() {
    return this.json.obstacles;
  }
  /** All basic events in the map. */
  get events() {
    return this.json.basicBeatmapEvents;
  }
  /** All BPM changes. */
  get BPMChanges() {
    return this.json.bpmEvents;
  }
  /** All rotation events in the map. Used for 90 and 360 levels.
   * Doesn't include basic event version. */
  get rotationEvents() {
    return this.json.rotationEvents;
  }
  /** All light boost color events. Doesn't include basic event version. */
  get boostEvents() {
    return this.json.colorBoostBeatmapEvents;
  }
  /** All light event boxes. (V3 lighting) */
  get lightEventBoxes() {
    return this.json.lightColorEventBoxGroups;
  }
  /** All rotation event boxes. (V3 light rotating) */
  get lightRotationBoxes() {
    return this.json.lightRotationEventBoxGroups;
  }
  /** All waypoints. Not much is known about what these do. */
  get waypoints() {
    return this.json.waypoints;
  }
  /** Unknown. */
  get basicEventTypesKeywords() {
    return this.json.basicEventTypesWithKeywords;
  }
  /** Unknown, probably enables/disables basic events. */
  get useBasicEvents() {
    return this.json.useNormalEventsAsCompatibleEvents;
  }
  /** Custom data in the map. */
  get customData() {
    return jsonGet(this.json, "customData", {});
  }
  /** All custom events in the map. */
  get customEvents() {
    return jsonGet(this.json, "customData.customEvents", []);
  }
  /** Point definitions in the map. Used as arbitrary animation data. */
  get pointDefinitions() {
    return jsonGet(this.json, "customData.pointDefinitions", {});
  }
  /** All materials for geometry. */
  get geoMaterials() {
    return jsonGet(this.json, "customData.materials", {});
  }
  /** The unaliased environment object array. */
  get rawEnvironment() {
    return jsonGet(this.json, "customData.environment", []);
  }
  /** All fake notes in the map. */
  get fakeNotes() {
    return jsonGet(this.json, "customData.fakeColorNotes", []);
  }
  /** All fake bombs in the map. */
  get fakeBombs() {
    return jsonGet(this.json, "customData.fakeBombNotes", []);
  }
  /** All fake walls in the map. */
  get fakeWalls() {
    return jsonGet(this.json, "customData.fakeObstacles", []);
  }
  /** All fake chains in the map. */
  get fakeChains() {
    return jsonGet(this.json, "customData.fakeBurstSliders", []);
  }

  set version(value: string) {
    this.json.version = value;
  }
  set notes(value: Note[]) {
    this.json.colorNotes = value;
  }
  set bombs(value: Bomb[]) {
    this.json.bombNotes = value;
  }
  set arcs(value: Arc[]) {
    this.json.sliders = value;
  }
  set chains(value: Chain[]) {
    this.json.burstSliders = value;
  }
  set walls(value: Wall[]) {
    this.json.obstacles = value;
  }
  set events(value: EventInternals.AbstractEvent[]) {
    this.json.basicBeatmapEvents = value;
  }
  set BPMChanges(value: BPMChange[]) {
    this.json.bpmEvents = value;
  }
  set rotationEvents(value: RotationEvent[]) {
    this.json.rotationEvents = value;
  }
  set boostEvents(value: BoostEvent[]) {
    this.json.colorBoostBeatmapEvents = value;
  }
  set lightEventBoxes(value: LightEventBox[]) {
    this.json.lightColorEventBoxGroups = value;
  }
  set lightRotationBoxes(value: LightRotationBox[]) {
    this.json.lightRotationEventBoxGroups = value;
  }
  set waypoints(value: Json[]) {
    this.json.waypoints = value;
  }
  set basicEventTypesKeywords(value: Json) {
    this.json.basicEventTypesWithKeywords = value;
  }
  set useBasicEvents(value: boolean) {
    this.json.useNormalEventsAsCompatibleEvents = value;
  }
  set customData(value) {
    jsonSet(this.json, "customData", value);
  }
  set customEvents(value: CustomEventInternals.BaseEvent[]) {
    jsonSet(this.json, "customData.customEvents", value);
  }
  set pointDefinitions(value: Record<string, RawKeyframesAny>) {
    jsonSet(this.json, "customData.pointDefinitions", value);
  }
  set geoMaterials(value: Record<string, GeometryMaterial>) {
    jsonSet(this.json, "customData.materials", value);
  }
  set rawEnvironment(value: EnvironmentInternals.BaseEnvironment[]) {
    jsonSet(this.json, "customData.environment", value);
  }
  set fakeNotes(value: Note[]) {
    jsonSet(this.json, "customData.fakeColorNotes", value);
  }
  set fakeBombs(value: Bomb[]) {
    jsonSet(this.json, "customData.fakeBombNotes", value);
  }
  set fakeWalls(value: Wall[]) {
    jsonSet(this.json, "customData.fakeObstacles", value);
  }
  set fakeChains(value: Chain[]) {
    jsonSet(this.json, "customData.fakeBurstSliders", value);
  }

  /** Returns a callback function providing an array of all AnimateTrack events. */
  animateTracks(fn: (arr: CustomEventInternals.AnimateTrack[]) => void) {
    const arr = this.customEvents.filter(
      (x) => x instanceof CustomEventInternals.AnimateTrack
    ) as CustomEventInternals.AnimateTrack[];
    fn(arr);
    this.customEvents = this.customEvents
      .filter((x) => !(x instanceof CustomEventInternals.AnimateTrack))
      .concat(arr);
  }
  /** Returns a callback function providing an array of all AssignPathAnimation events. */
  assignPathAnimations(
    fn: (arr: CustomEventInternals.AssignPathAnimation[]) => void
  ) {
    const arr = this.customEvents.filter(
      (x) => x instanceof CustomEventInternals.AssignPathAnimation
    ) as CustomEventInternals.AssignPathAnimation[];
    fn(arr);
    this.customEvents = this.customEvents
      .filter((x) => !(x instanceof CustomEventInternals.AssignPathAnimation))
      .concat(arr);
  }
  /** Returns a callback function providing an array of all AssignTrackParent events. */
  assignTrackParents(
    fn: (arr: CustomEventInternals.AssignTrackParent[]) => void
  ) {
    const arr = this.customEvents.filter(
      (x) => x instanceof CustomEventInternals.AssignTrackParent
    ) as CustomEventInternals.AssignTrackParent[];
    fn(arr);
    this.customEvents = this.customEvents
      .filter((x) => !(x instanceof CustomEventInternals.AssignTrackParent))
      .concat(arr);
  }
  /** Returns a callback function providing an array of all AssignPlayerToTrack events. */
  assignPlayerToTracks(
    fn: (arr: CustomEventInternals.AssignPlayerToTrack[]) => void
  ) {
    const arr = this.customEvents.filter(
      (x) => x instanceof CustomEventInternals.AssignPlayerToTrack
    ) as CustomEventInternals.AssignPlayerToTrack[];
    fn(arr);
    this.customEvents = this.customEvents
      .filter((x) => !(x instanceof CustomEventInternals.AssignPlayerToTrack))
      .concat(arr);
  }
  /** Returns a callback function providing an array of all AbstractEvent events. */
  abstractEvents(fn: (arr: CustomEventInternals.AbstractEvent[]) => void) {
    const arr = this.customEvents.filter(
      (x) => x instanceof CustomEventInternals.AbstractEvent
    ) as CustomEventInternals.AbstractEvent[];
    fn(arr);
    this.customEvents = this.customEvents
      .filter((x) => !(x instanceof CustomEventInternals.AbstractEvent))
      .concat(arr);
  }
  /** Returns a callback function providing an array of all AnimateComponent events. */
  animateComponents(
    fn: (arr: CustomEventInternals.AnimateComponent[]) => void
  ) {
    const arr = this.customEvents.filter(
      (x) => x instanceof CustomEventInternals.AnimateComponent
    ) as CustomEventInternals.AnimateComponent[];
    fn(arr);
    this.customEvents = this.customEvents
      .filter((x) => !(x instanceof CustomEventInternals.AnimateComponent))
      .concat(arr);
  }

  /** Returns a callback function providing an array of all Environment objects. */
  environment(fn: (arr: Environment[]) => void) {
    const arr = this.rawEnvironment.filter(
      (x) => x instanceof Environment
    ) as Environment[];
    fn(arr);
    this.rawEnvironment = this.rawEnvironment
      .filter((x) => !(x instanceof Environment))
      .concat(arr);
  }
  /** Returns a callback function providing an array of all Geometry objects. */
  geometry(fn: (arr: Geometry[]) => void) {
    const arr = this.rawEnvironment.filter(
      (x) => x instanceof Geometry
    ) as Geometry[];
    fn(arr);
    this.rawEnvironment = this.rawEnvironment
      .filter((x) => !(x instanceof Geometry))
      .concat(arr);
  }
}

export class Info {
  /** The Json for this info */
  json: Json = {};
  /** The filename of this info */
  fileName = "Info.dat";

  /**
   * Loads the Json into this info.
   * @param path Path to the file to load from.
   */
  load(path?: string) {
    const fileName = path ? parseFilePath(path, ".dat").path : this.fileName;
    this.json = JSON.parse(Deno.readTextFileSync(fileName));
    this.fileName = fileName;
  }

  /** Saves the info. */
  save() {
    if (!this.json) throw new Error("The Info object has not been loaded.");
    Deno.writeTextFileSync(this.fileName, JSON.stringify(this.json, null, 2));
  }

  /** Info version. */
  get version() {
    return jsonGet(this.json, "_version");
  }
  /** Name of the song. */
  get name() {
    return jsonGet(this.json, "_songName");
  }
  /** Song subname. */
  get subName() {
    return jsonGet(this.json, "_songSubName");
  }
  /** Name of the song author. */
  get authorName() {
    return jsonGet(this.json, "_songAuthorName");
  }
  /** Name of the mapper(s). */
  get mapper() {
    return jsonGet(this.json, "_levelAuthorName");
  }
  /** BPM of the song. */
  get BPM() {
    return jsonGet(this.json, "_beatsPerMinute");
  }
  /** Start (in seconds) of the song preview when clicking on the song. */
  get previewStart() {
    return jsonGet(this.json, "_previewStartTime");
  }
  /** Duration (in seconds) of the song preview when clicking on the song. */
  get previewDuration() {
    return jsonGet(this.json, "_previewDuration");
  }
  /** Offsets the song audio in seconds. */
  get songOffset() {
    return jsonGet(this.json, "_songTimeOffset");
  }
  /**
   * Value that is meant to correct some beats being offset in a measure.
   * This value works in tangent with shufflePeriod.
   * More info can be found here: https://bsmg.wiki/mapping/map-format.html#shuffle
   */
  get shuffle() {
    return jsonGet(this.json, "_shuffle");
  }
  /**
   * Value that is meant to correct some beats being offset in a measure.
   * This value works in tangent with shuffle.
   * More info can be found here: https://bsmg.wiki/mapping/map-format.html#shuffleperiod
   */
  get shufflePeriod() {
    return jsonGet(this.json, "_shufflePeriod");
  }
  /** Filename of the cover art. */
  get coverFileName() {
    return jsonGet(this.json, "_coverImageFilename");
  }
  /** Filename of the song. */
  get songFileName() {
    return jsonGet(this.json, "_songFilename");
  }
  /** Name of the environment. */
  get environment() {
    return jsonGet(this.json, "_environmentName");
  }
  /** Name of the environment for 360 levels. */
  get environment360() {
    return jsonGet(this.json, "_allDirectionsEnvironmentName");
  }
  /** Custom data for the info. */
  get customData() {
    return jsonGet(this.json, "_customData");
  }
  /** Editors that have edited this map. */
  get editors() {
    return jsonGet(this.json, "_customData._editors");
  }
  /** Contributors who have worked on this map. */
  get contributors() {
    return jsonGet(this.json, "_customData._contributors");
  }
  /** A custom platform to use. */
  get customEnvironment() {
    return jsonGet(this.json, "_customData._customEnvironment");
  }
  /** The hash for a custom platform used. */
  get customEnvironmentHash() {
    return jsonGet(this.json, "_customData._customEnvironmentHash");
  }

  set version(value: string) {
    jsonSet(this.json, "_version", value);
  }
  set name(value: string) {
    jsonSet(this.json, "_songName", value);
  }
  set subName(value: string) {
    jsonSet(this.json, "_songSubName", value);
  }
  set authorName(value: string) {
    jsonSet(this.json, "_songAuthorName", value);
  }
  set mapper(value: string) {
    jsonSet(this.json, "_levelAuthorName", value);
  }
  set BPM(value: number) {
    jsonSet(this.json, "_beatsPerMinute", value);
  }
  set previewStart(value: number) {
    jsonSet(this.json, "_previewStartTime", value);
  }
  set previewDuration(value: number) {
    jsonSet(this.json, "_previewDuration", value);
  }
  set songOffset(value: number) {
    jsonSet(this.json, "_songTimeOffset", value);
  }
  set shuffle(value: boolean) {
    jsonSet(this.json, "_shuffle", value);
  }
  set shufflePeriod(value: number) {
    jsonSet(this.json, "_shufflePeriod", value);
  }
  set coverFileName(value: string) {
    jsonSet(this.json, "_coverImageFilename", value);
  }
  set songFileName(value: string) {
    jsonSet(this.json, "_songFilename", value);
  }
  set environment(value: ENV_NAMES) {
    jsonSet(this.json, "_environmentName", value);
  }
  set environment360(value: string) {
    jsonSet(this.json, "_allDirectionsEnvironmentName", value);
  }
  set customData(value: Json) {
    jsonSet(this.json, "_customData", value);
  }
  set editors(value: Json) {
    jsonSet(this.json, "_customData._editors", value);
  }
  set contributors(value: Json[]) {
    jsonSet(this.json, "_customData._contributors", value);
  }
  set customEnvironment(value: string) {
    jsonSet(this.json, "_customData._customEnvironment", value);
  }
  set customEnvironmentHash(value: string) {
    jsonSet(this.json, "_customData._customEnvironmentHash", value);
  }
}

export const info = new Info();
export let activeDiff: Difficulty;
export const settings = {
  forceJumpsForNoodle: true,
  decimals: 7 as number | undefined,
};

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function activeDiffSet(diff: Difficulty) {
  activeDiff = diff;
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function activeDiffGet() {
  if (activeDiff) return activeDiff;
  else throw new Error("There is currently no loaded difficulty.");
}

function reduceDecimalsPostProcess(_: never, diff: Difficulty) {
  if (!settings.decimals) return;
  const mapJson = diff.json;
  reduceDecimalsInObject(mapJson);

  function reduceDecimalsInObject(json: Json) {
    for (const key in json) {
      // deno-lint-ignore no-prototype-builtins
      if (!json.hasOwnProperty(key)) return;
      const element = json[key];

      if (typeof element === "number") {
        json[key] = setDecimals(element, settings.decimals as number);
      } else if (element instanceof Object) {
        reduceDecimalsInObject(element);
      }
    }
  }
}

/**
 * Automatically zip the map, including only necessary files.
 * @param excludeDiffs Difficulties to exclude.
 * @param zipName Name of the zip (don't include ".zip"). Uses folder name if undefined.
 */
export function exportZip(
  excludeDiffs: FILENAME<DIFFS>[] = [],
  zipName?: string
) {
  if (!info.json) throw new Error("The Info object has not been loaded.");

  const absoluteInfoFileName =
    info.fileName === "Info.dat"
      ? Deno.cwd() + `\\${info.fileName}`
      : info.fileName;
  const workingDir = path.parse(absoluteInfoFileName).dir;
  const exportInfo = copy(info.json);
  let files: string[] = [];
  function pushFile(file: string) {
    const dir = workingDir + `\\${file}`;
    if (fs.existsSync(dir)) files.push(dir);
  }

  pushFile(exportInfo._songFilename);
  if (exportInfo._coverImageFilename !== undefined)
    pushFile(exportInfo._coverImageFilename);

  for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
    const set = exportInfo._difficultyBeatmapSets[s];
    for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
      const map = set._difficultyBeatmaps[m];
      let passed = true;
      excludeDiffs.forEach((d) => {
        if (map._beatmapFilename === parseFilePath(d, ".dat").path) {
          set._difficultyBeatmaps.splice(m, 1);
          m--;
          passed = false;
        }
      });

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

  files = files.map((x) => (x = `"${x}"`));
  zipName = zipName.replaceAll(" ", "_");
  compressZip();
  async function compressZip() {
    await compress(files, zipName, { overwrite: true });
    RMLog(`${zipName} has been zipped!`);
  }
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
  forDiff?: (diff: Difficulty) => void,
  walls = true
) {
  const startActive = activeDiff as Difficulty;

  diffs.forEach((x) => {
    const workingDiff = new Difficulty(
      parseFilePath(x, ".dat").path as DIFFPATH
    );

    workingDiff.rawEnvironment = startActive.rawEnvironment;
    workingDiff.pointDefinitions = startActive.pointDefinitions;
    workingDiff.customEvents = startActive.customEvents;
    workingDiff.events = startActive.events;
    workingDiff.geoMaterials = startActive.geoMaterials;
    workingDiff.boostEvents = startActive.boostEvents;
    workingDiff.lightEventBoxes = startActive.lightEventBoxes;
    workingDiff.lightRotationBoxes = startActive.lightRotationBoxes;
    workingDiff.fakeNotes = startActive.fakeNotes;
    workingDiff.fakeBombs = startActive.fakeBombs;
    workingDiff.fakeWalls = startActive.fakeWalls;
    workingDiff.fakeChains = startActive.fakeChains;

    if (walls) {
      for (let y = 0; y < workingDiff.walls.length; y++) {
        const obstacle = workingDiff.walls[y];
        if (obstacle.isModded) {
          workingDiff.walls.splice(y, 1);
          y--;
        }
      }

      startActive.walls.forEach((y) => {
        if (y.isModded) workingDiff.walls.push(y);
      });
    }

    if (forDiff !== undefined) forDiff(workingDiff);
    workingDiff.save();
  });

  activeDiffSet(startActive);
}

// source: https://github.com/Aeroluna/HeckedV2ToV3/blob/f0c9250ba05fa03126012a93e7c6fa257d75696a/HeckedV2ToV3/BeatmapEventsConverter.cs#L177
function convertChromaLegacyGradients(
  event: EventInternals.AbstractEvent,
  diff: Difficulty
) {
  type GradientJSON = {
    _startColor?: Vec4; // default white
    _endColor?: Vec4; // default white
    _easing?: EASE; // default easeLinear
    _duration: number;
  };

  const gradient: GradientJSON = event.json._lightGradient;
  if (!gradient) return;

  event.color = gradient._startColor ?? [1, 1, 1, 1];
  event.easing = gradient._easing ?? "easeLinear";

    const index = diff.events.findIndex((v) => event == v);
    // find next event with index > current index and same type
    // TODO: check if affects the same light ids? idk
  const nextIndex = diff.events.findIndex(
    (v) => v.type == event.type && diff.events.findIndex((o) => o == v) > index
  );

  let endBeat = event.time + gradient._duration;

  if (nextIndex != -1) {
    const nextEvent = diff.events[nextIndex];
    if (endBeat > nextEvent.time) {
      endBeat = nextEvent.time;
    }
  }

  event.value = 4;
  const endEvent = new Event(endBeat).abstract();
  endEvent.type = event.type;
  endEvent.value = 1;
  endEvent.floatValue = 1;
  endEvent.color = gradient._endColor ?? [1, 1, 1, 1];

  endEvent.push();
}
