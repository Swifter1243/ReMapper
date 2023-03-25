// deno-lint-ignore-file
import { Track } from "./animation.ts";
import { activeDiffGet, info, Json } from "./beatmap.ts";
import { NOTETYPE } from "./constants.ts";
import {
  ColorType,
  copy,
  getJumps,
  isEmptyObject,
  jsonCheck,
  jsonGet,
  jsonPrune,
  jsonRemove,
  jsonSet,
  Vec2,
  Vec3,
} from "./general.ts";

export class BaseObject {
  /** The time that this object is scheduled for. */
  time: number = 0;
  /** Any community made data on this object. */
  customData: Record<string, unknown> = {};

  constructor(time?: number, obj?: BaseObject);
  constructor(obj: BaseObject);
  constructor(
    ...params: [obj: BaseObject | number | undefined, obj?: BaseObject | undefined]
  ) {
    if (typeof params === "object") {
      Object.assign(this, params);
    } else {
      this.time = params[0];
      this.customData = params[1];
    }
  }

  /** Checks if the object has modded properties. */
  get isModded() {
    if (this.customData === undefined) return false;

    return !isEmptyObject(this.customData);
  }
}

export class BaseGameplayObject extends BaseObject {
  x: number;
  y: number;
  position?: Vec2;

  /** The rotation added to an object around the world origin. */
  rotation?: Vec3;
  /** The rotation added to an object around it's anchor point. */
  localRotation?: Vec3;

  
  njs: number

  get NJS() {
    if (this.json.customData.noteJumpMovementSpeed !== undefined) {
      return this.json.customData.noteJumpMovementSpeed;
    } else return activeDiffGet().NJS;
  }
  /** The note offset of an object. */
  get offset() {
    if (this.json.customData.noteJumpStartBeatOffset !== undefined) {
      return this.json.customData.noteJumpStartBeatOffset;
    } else return activeDiffGet().offset;
  }
  /**
   * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
   * Jump Duration is the time in beats that the object will be jumping for.
   * This function will output half of this, so it will end when the note is supposed to be hit.
   */
  get halfJumpDur() {
    return getJumps(this.NJS, this.offset, info.BPM).halfDur;
  }
  /**
   * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
   * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
   */
  get jumpDist() {
    return getJumps(this.NJS, this.offset, info.BPM).dist;
  }
  /** The lifespan of the object. */
  get life() {
    return this.halfJumpDur * 2;
  }
  /** The time of the start of the object's lifespan. */
  get lifeStart() {
    return this.time - this.life / 2;
  }
  /** Whether this object is interactable. */
  get interactable() {
    return !this.json.customData.uninteractable;
  }
  /** The track class for this event.
   * Please read the properties of this class to see how it works.
   */
  get track() {
    return new Track(this.json.customData);
  }
  /** The chroma color of the object. */
  get color() {
    return this.json.customData.color;
  }
  /** The animation json on the object. */
  get animation() {
    return this.json.customData.animation;
  }

  set x(value: number) {
    this.json.x = value;
  }
  set y(value: number) {
    this.json.y = value;
  }
  set position(value: Vec2) {
    this.json.customData.coordinates = value;
  }
  set rotation(value: Vec3 | number) {
    this.json.customData.worldRotation = value;
  }
  set localRotation(value: Vec3) {
    this.json.customData.localRotation = value;
  }
  set NJS(value: number) {
    this.json.customData.noteJumpMovementSpeed = value;
  }
  set offset(value: number) {
    this.json.customData.noteJumpStartBeatOffset = value;
  }
  set life(value: number) {
    if (value < 0.25) {
      console.log(
        "Warning: The lifespan of a note has a minimum of 0.25 beats."
      );
    }
    const defaultJumps = getJumps(this.NJS, 0, info.BPM);
    this.offset = (value - 2 * defaultJumps.halfDur) / 2;
  }
  set lifeStart(value: number) {
    this.time = value + this.life / 2;
  }
  set interactable(value: boolean) {
    this.json.customData.uninteractable = !value;
  }
  set color(value: ColorType) {
    this.json.customData.color = value;
  }
  set animation(value) {
    this.json.customData.animation = value;
  }

  get isModded() {
    if (this.customData === undefined) return false;
    const customData = copy(this.customData);
    jsonPrune(customData);
    return !isEmptyObject(customData);
  }

  get isGameplayModded() {
    if (this.customData === undefined) return false;
    const customData = copy(this.customData);
    jsonRemove(customData, "color");
    jsonRemove(customData, "spawnEffect");
    jsonRemove(customData, "animation.color");
    jsonPrune(customData);
    return !isEmptyObject(customData);
  }
}

export class BaseSliderObject extends BaseGameplayObject {
  /** The color of the object. */
  get type() {
    return this.json.c;
  }
  /** The cut direction of the head. */
  get headDirection() {
    return this.json.d;
  }
  /** The time the tail arrives at the player. */
  get tailTime() {
    return this.json.tb;
  }
  /** The lane of the tail. */
  get tailX() {
    return this.json.tx;
  }
  /** The vertical row of the tail. */
  get tailY() {
    return this.json.ty;
  }
  /** The position of the tail. */
  get tailPos() {
    return this.json.customData.tailCoordinates;
  }

  set type(value: NOTETYPE) {
    this.json.c = value;
  }
  set headDirection(value: number) {
    this.json.d = value;
  }
  set tailTime(value: number) {
    this.json.tb = value;
  }
  set tailX(value: number) {
    this.json.tx = value;
  }
  set tailY(value: number) {
    this.json.ty = value;
  }
  set tailPos(value: Vec2) {
    this.json.customData.tailCoordinates = value;
  }
}
