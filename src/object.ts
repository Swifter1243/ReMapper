// deno-lint-ignore-file
import { Track } from "./animation.ts";
import { activeDiffGet, info, Json } from "./beatmap.ts";
import { NOTETYPE } from "./constants.ts";
import { bsmap } from "./deps.ts";
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
import { NoteAnimation, WallAnimation } from "./internals/animation.ts";
import { JsonWrapper } from "./types.ts";

export abstract class BaseObject<
  TV2 extends bsmap.v2.IBaseObject,
  TV3 extends bsmap.v3.IBaseObject,
> implements JsonWrapper<TV2, TV3> {
  /** The time that this object is scheduled for. */
  time: number = 0;
  /** Any community made data on this object. */
  customData: Record<string, unknown> = {};

  constructor(time?: number, obj?: Record<string, unknown>);
  constructor(obj: Readonly<BaseObject<TV2, TV3>>);
  constructor(
    ...params:
      | [time?: number, obj?: Record<string, unknown>]
      | [obj: Readonly<BaseObject<TV2, TV3>>]
  ) {
    if (typeof params[0] === "object") {
      Object.assign(this, params);
    } else {
      this.time = params[0] ?? 0;
      this.customData = params[1] ?? {};
    }
  }

  /** Checks if the object has modded properties. */
  get isModded() {
    if (this.customData === undefined) return false;

    return !isEmptyObject(this.customData);
  }

  abstract toJson(v3: true): TV3;
  abstract toJson(v3: false): TV2;
  abstract toJson(v3: boolean): TV2 | TV3;
  abstract toJson(v3: unknown): TV2 | TV3;
}

export abstract class BaseGameplayObject extends BaseObject<
  bsmap.v2.INote | bsmap.v2.IObstacle,
  bsmap.v3.IColorNote | bsmap.v3.IBombNote | bsmap.v3.IObstacle
> {
  constructor(beat: number, x: number, y: number);
  constructor(obj: Readonly<BaseGameplayObject>);
  constructor(
    ...params: [beat: number, x: number, y: number] | [
      obj: Readonly<BaseGameplayObject>,
    ]
  ) {
    // beat, x, y
    if (typeof params[0] === "number") {
      const [beat, x, y] = params;
      super(beat);
      this.lineIndex = x ?? 0;
      this.lineLayer = y ?? 0;
    } else {
      super(params[0]);
      this.lineIndex = 0;
      this.lineLayer = 0;
      // this will overwrite everything
      Object.assign(this, params[0]);
    }
  }

  lineIndex: number;
  lineLayer: number;
  position?: Vec2;

  /** The rotation added to an object around the world origin. */
  rotation?: Vec3;
  /** The rotation added to an object around it's anchor point. */
  localRotation?: Vec3;

  localNJS?: number;
  localOffset?: number;

  /** Whether this object is interactable. */
  interactable?: boolean;

  /** The track class for this event.
   * @see Track
   */
  track?: Track;

  /** The chroma color of the object. */
  color?: ColorType;

  /** The animation json on the object. */
  animation?: NoteAnimation | WallAnimation;

  get NJS() {
    return this.localNJS ?? activeDiffGet().NJS;
  }

  /** The note offset of an object. */
  get offset() {
    return this.localOffset ?? activeDiffGet().offset;
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

  set life(value: number) {
    if (value < 0.25) {
      console.log(
        "Warning: The lifespan of a note has a minimum of 0.25 beats.",
      );
    }
    const defaultJumps = getJumps(this.NJS, 0, info.BPM);
    this.localOffset = (value - 2 * defaultJumps.halfDur) / 2;
  }
  set lifeStart(value: number) {
    this.time = value + this.life / 2;
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
