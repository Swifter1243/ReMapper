// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { adbDeno, bsmap, compress, fs, path } from "./deps.ts";
import { Arc, Bomb, Chain, Note } from "./note.ts";
import { Wall } from "./wall.ts";
import { Event, EventInternals } from "./basicEvent.ts";
import { CustomEvent, CustomEventInternals } from "./custom_event.ts";
import {
  Environment,
  EnvironmentInternals,
  Geometry,
  RawGeometryMaterial,
} from "./environment.ts";
import {
  arrRemove,
  copy,
  isEmptyObject,
  jsonGet,
  jsonPrune,
  jsonRemove,
  jsonSet,
  parseFilePath,
  RMJson,
  RMLog,
  setDecimals,
  sortObjects,
  Vec3,
} from "./general.ts";
import { RawKeyframesAny } from "./animation.ts";
import { OptimizeSettings } from "./anim_optimizer.ts";
import {
  DIFFS,
  ENV_NAMES,
  FILENAME,
  FILEPATH,
  QUEST_WIP_PATH,
  REQUIRE_MODS,
  settingsHandler,
  SUGGEST_MODS,
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
import { AnimationInternals } from "./internals/mod.ts";

type PostProcessFn<T> = (object: T, diff: AbstractDifficulty) => void;

/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFPATH = FILEPATH<DIFFS>;
/** Filename for a difficulty. Extension is optional. */
export type DIFFNAME = FILENAME<DIFFS>;
/** Type for Json data. */
export type TJson = Record<string, unknown>;

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
  if (array === undefined) return;
  for (let i = 0; i < array.length; i++) {
    array[i] = (new target() as any).import(array[i]);
    if (callback) callback(array[i]);
  }
}

export async function readDifficulty(
  input: DIFFPATH,
  output?: DIFFPATH,
  process: boolean = true,
): Promise<AbstractDifficulty> {
  const parsedInput = parseFilePath(input, ".dat");
  const parsedOutput = parseFilePath(output ?? input, ".dat");

  const mapFile = parsedOutput.path as DIFFPATH;
  const relativeMapFile = parsedOutput.name as DIFFNAME;

  // If the path contains a separator of any kind, use it instead of the default "Info.dat"
  const infoPromise = Deno.readTextFile(
    path.join(parsedOutput.dir ?? Deno.cwd(), "Info.dat"),
  ).then((j) => {
    info = JSON.parse(j);

    let diffSetMap: bsmap.IInfoSetDifficulty | undefined;

    const diffSet = info._difficultyBeatmapSets.find((e) => {
      diffSetMap = e._difficultyBeatmaps.find((s) =>
        s._beatmapFilename === relativeMapFile
      );

      return diffSetMap;
    });

    if (!diffSet || !diffSetMap) {
      throw `The difficulty ${parsedOutput.name} does not exist in your Info.dat`;
    }

    return {
      diffSet,
      diffSetMap,
      info,
    };
  });

  const jsonPromise = Deno.readTextFile(parsedInput.path).then((j) => {
    const json = JSON.parse(j);

    function transferKey(obj: TJson, old: string, value: string) {
      if (obj[old] === undefined) return;
      obj[value] = obj[old];
      delete obj[old];
    }

    json.basicBeatmapEvents.forEach((x: TJson) => {
      const customData = x.customData as TJson;
      if (customData && typeof customData === "object") {
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

        keys.forEach((k) => transferKey(customData, `_${k}`, k));
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
  });

  await Promise.all([jsonPromise, infoPromise]);
}

export abstract class AbstractDifficulty {
  /** The Json of the entire difficulty. */
  json: bsmap.v2.IDifficulty;
  /** The Json of the difficulty set
   * (e.g. Standard) that this difficulty is contained in inside of the Info.dat.
   */
  diffSet: bsmap.IInfoSetDifficulty;
  /** The Json of the difficulty set map
   * (e.g. Hard) that this difficulty is contained in inside of the Info.dat.
   */
  diffSetMap: bsmap.IInfoSet;
  /** The path to the output file of this difficulty. */
  mapFile: DIFFPATH;
  /** The filename of the output file of this difficulty. */
  relativeMapFile: DIFFNAME;
  private postProcesses = new Map<
    unknown[] | undefined,
    PostProcessFn<unknown>[]
  >();

    /**
   * Creates a difficulty. Can be used to access various information and the map data.
   * Will set the active difficulty to this.
   * @param input Filename for the input.
   * @param input Filename for the output. If left blank, input will be used.
   */
  constructor(
    json: bsmap.v2.IDifficulty,
    diffSet: bsmap.IInfoSetDifficulty,
    diffSetMap: bsmap.IInfoSet,
    mapFile: DIFFPATH,
    relativeMapFile: DIFFNAME,
  ) {
    this.json = json;
    this.diffSet = diffSet;
    this.diffSetMap = diffSetMap
    this.mapFile = mapFile;
    this.relativeMapFile = relativeMapFile;
  }

  private registerProcessors() {
    this.addPostProcess(undefined, reduceDecimalsPostProcess);
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
    this.customEvents.filter((e) =>
      e instanceof CustomEventInternals.AnimateTrack
    ).forEach((e) =>
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

    const functionsMap: Tuple[] = object === undefined
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

    const outputJSON = {} as TJson;

    Object.keys(this.json).forEach((x) => {
      if (Array.isArray(this.json[x])) outputJSON[x] = [];
      else if (x === "customData") {
        Object.keys(this.json[x]).forEach((y) => {
          if (!outputJSON[x]) outputJSON[x] = {};
          if (Array.isArray(this.json[x][y])) outputJSON[x][y] = [];
          else outputJSON[x][y] = copy(this.json[x][y]);
        });
      } else outputJSON[x] = copy(this.json[x]);
    });

    const diffArrClassToJson = <T>(
      arr: T[],
      prop: string,
      callback?: (obj: any) => void,
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

    function safeCloneJSON(json: TJson) {
      const output: TJson = {};

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
  require(requirement: REQUIRE_MODS, required = true) {
    const requirements: TJson = {};

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
  suggest(suggestion: SUGGEST_MODS, suggested = true) {
    const suggestions: TJson = {};

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
      const objValue = (object as any)[property] as string | [string, TJson];
      const path = typeof objValue === "string" ? objValue : objValue[0];
      const diff = (object as any)["diff"] as Difficulty;

      return diff.rawSettings[path];
    },

    set(object, property, value) {
      const objValue = (object as any)[property] as string | [string, TJson];
      const path = typeof objValue === "string" ? objValue : objValue[0];
      const diff = (object as any)["diff"] as Difficulty;

      if (typeof objValue !== "string") value = objValue[1][value];
      diff.pruneInput(diff.rawSettings, path, value);
      return true;
    },
  });

  private pruneInput(object: TJson, property: string, value: any) {
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
  set rawSettings(value: TJson) {
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
      this.colorArrayToTuple(value),
    );
  }
  set colorRight(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._colorRight",
      this.colorArrayToTuple(value),
    );
  }
  set lightColorLeft(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorLeft",
      this.colorArrayToTuple(value),
    );
  }
  set lightColorRight(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorRight",
      this.colorArrayToTuple(value),
    );
  }
  set boostColorLeft(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorLeftBoost",
      this.colorArrayToTuple(value),
    );
  }
  set boostColorRight(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._envColorRightBoost",
      this.colorArrayToTuple(value),
    );
  }
  set wallColor(value: Vec3) {
    this.pruneInput(
      this.diffSetMap,
      "_customData._obstacleColor",
      this.colorArrayToTuple(value),
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
  set waypoints(value: TJson[]) {
    this.json.waypoints = value;
  }
  set basicEventTypesKeywords(value: TJson) {
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
  set geoMaterials(value: Record<string, RawGeometryMaterial>) {
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
    const arr = this.customEvents.filter((x) =>
      x instanceof CustomEventInternals.AnimateTrack
    ) as CustomEventInternals.AnimateTrack[];
    fn(arr);
    this.customEvents = this.customEvents.filter((x) =>
      !(x instanceof CustomEventInternals.AnimateTrack)
    ).concat(arr);
  }
  /** Returns a callback function providing an array of all AssignPathAnimation events. */
  assignPathAnimations(
    fn: (arr: CustomEventInternals.AssignPathAnimation[]) => void,
  ) {
    const arr = this.customEvents.filter((x) =>
      x instanceof CustomEventInternals.AssignPathAnimation
    ) as CustomEventInternals.AssignPathAnimation[];
    fn(arr);
    this.customEvents = this.customEvents.filter((x) =>
      !(x instanceof CustomEventInternals.AssignPathAnimation)
    ).concat(arr);
  }
  /** Returns a callback function providing an array of all AssignTrackParent events. */
  assignTrackParents(
    fn: (arr: CustomEventInternals.AssignTrackParent[]) => void,
  ) {
    const arr = this.customEvents.filter((x) =>
      x instanceof CustomEventInternals.AssignTrackParent
    ) as CustomEventInternals.AssignTrackParent[];
    fn(arr);
    this.customEvents = this.customEvents.filter((x) =>
      !(x instanceof CustomEventInternals.AssignTrackParent)
    ).concat(arr);
  }
  /** Returns a callback function providing an array of all AssignPlayerToTrack events. */
  assignPlayerToTracks(
    fn: (arr: CustomEventInternals.AssignPlayerToTrack[]) => void,
  ) {
    const arr = this.customEvents.filter((x) =>
      x instanceof CustomEventInternals.AssignPlayerToTrack
    ) as CustomEventInternals.AssignPlayerToTrack[];
    fn(arr);
    this.customEvents = this.customEvents.filter((x) =>
      !(x instanceof CustomEventInternals.AssignPlayerToTrack)
    ).concat(arr);
  }
  /** Returns a callback function providing an array of all AbstractEvent events. */
  abstractEvents(fn: (arr: CustomEventInternals.AbstractEvent[]) => void) {
    const arr = this.customEvents.filter((x) =>
      x instanceof CustomEventInternals.AbstractEvent
    ) as CustomEventInternals.AbstractEvent[];
    fn(arr);
    this.customEvents = this.customEvents.filter((x) =>
      !(x instanceof CustomEventInternals.AbstractEvent)
    ).concat(arr);
  }
  /** Returns a callback function providing an array of all AnimateComponent events. */
  animateComponents(
    fn: (arr: CustomEventInternals.AnimateComponent[]) => void,
  ) {
    const arr = this.customEvents.filter((x) =>
      x instanceof CustomEventInternals.AnimateComponent
    ) as CustomEventInternals.AnimateComponent[];
    fn(arr);
    this.customEvents = this.customEvents.filter((x) =>
      !(x instanceof CustomEventInternals.AnimateComponent)
    ).concat(arr);
  }

  /** Returns a callback function providing an array of all Environment objects. */
  environment(fn: (arr: Environment[]) => void) {
    const arr = this.rawEnvironment.filter((x) =>
      x instanceof Environment
    ) as Environment[];
    fn(arr);
    this.rawEnvironment = this.rawEnvironment.filter((x) =>
      !(x instanceof Environment)
    ).concat(arr);
  }
  /** Returns a callback function providing an array of all Geometry objects. */
  geometry(fn: (arr: Geometry[]) => void) {
    const arr = this.rawEnvironment.filter((x) =>
      x instanceof Geometry
    ) as Geometry[];
    fn(arr);
    this.rawEnvironment = this.rawEnvironment.filter((x) =>
      !(x instanceof Geometry)
    ).concat(arr);
  }
}

export let info: bsmap.IInfo;
export let activeDiff: AbstractDifficulty;
export const settings = {
  forceJumpsForNoodle: true,
  decimals: 7 as number | undefined,
};

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function activeDiffSet(diff: AbstractDifficulty) {
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

  function reduceDecimalsInObject(json: TJson) {
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
 * Create a temporary directory with all of the relevant files for the beatmap.
 * Returns all of the files that are in the directory.
 * @param excludeDiffs Difficulties to exclude.
 */
export function collectBeatmapFiles(
  excludeDiffs: FILENAME<DIFFS>[] = [],
) {
  if (!info.json) throw new Error("The Info object has not been loaded.");

  const exportInfo = copy(info.json);
  const unsanitizedFiles: (string | undefined)[] = [
    exportInfo._songFilename,
    exportInfo._coverImageFilename,
    "cinema-video.json",
  ];

  for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
    const set = exportInfo._difficultyBeatmapSets[s];
    for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
      const map = set._difficultyBeatmaps[m];
      let passed = true;
      excludeDiffs.forEach((d) => {
        if (map._beatmapFilename === parseFilePath(d, ".dat").path) {
          arrRemove(set._difficultyBeatmaps, m);
          m--;
          passed = false;
        }
      });

      if (passed) unsanitizedFiles.push(map._beatmapFilename);
    }

    if (set._difficultyBeatmaps.length === 0) {
      arrRemove(exportInfo._difficultyBeatmapSets, s);
      s--;
    }
  }

  const workingDir = Deno.cwd();
  const files = unsanitizedFiles
    .filter((v) => v) // check not undefined or null
    .map((v) => path.join(workingDir, v!)) // prepend workspace dir
    .filter((v) => fs.existsSync(v)); // ensure file exists

  const tempDir = Deno.makeTempDirSync();
  const tempInfo = tempDir + `\\Info.dat`;
  Deno.writeTextFileSync(tempInfo, JSON.stringify(exportInfo, null, 0));

  files.push(tempInfo); // add temp info

  return files;
}

/**
 * Automatically zip the map, including only necessary files.
 * @param excludeDiffs Difficulties to exclude.
 * @param zipName Name of the zip (don't include ".zip"). Uses folder name if undefined.
 */
export function exportZip(
  excludeDiffs: FILENAME<DIFFS>[] = [],
  zipName?: string,
) {
  const workingDir = Deno.cwd();
  zipName ??= `${path.parse(workingDir).name}`;
  zipName = `${zipName}.zip`;
  zipName = zipName.replaceAll(" ", "_");

  const files = collectBeatmapFiles(excludeDiffs)
    .map((v) => `"${v}"`); // surround with quotes for safety

  compress(files, zipName, { overwrite: true }).then(() => {
    RMLog(`${zipName} has been zipped!`);
  });
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
  const adbBinary = adbDeno.getADBBinary(adbDeno.defaultADBPath());

  // Download ADB
  if (!fs.existsSync(adbBinary)) {
    console.log("ADB not found, downloading");
    await adbDeno.downloadADB(options?.downloadPath);
  }

  const files = collectBeatmapFiles(excludeDiffs); // surround with quotes for safety
  const cwd = Deno.cwd();

  const questSongFolder = `${QUEST_WIP_PATH}/${info.name}`;

  await adbDeno.mkdir(questSongFolder);

  const tasks = files.map((v) => {
    const relativePath = path.relative(cwd, v);
    console.log(`Uploading ${relativePath} to quest`);
    adbDeno.uploadFile(
      `${questSongFolder}/${relativePath}`,
      v,
      options,
    );
  });

  await Promise.all(tasks);
  console.log("Uploaded all files to quest");
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
  walls = true,
) {
  const startActive = activeDiff as Difficulty;

  diffs.forEach((x) => {
    const workingDiff = new Difficulty(
      parseFilePath(x, ".dat").path as DIFFPATH,
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
          arrRemove(workingDiff.walls, y);
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
