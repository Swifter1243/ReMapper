// deno-lint-ignore-file adjacent-overload-signatures
import { activeDiffGet, TJson } from "./beatmap.ts";
import { ANCHORMODE, CUT, NOTETYPE } from "./constants.ts";
import { BaseGameplayObject, BaseSliderObject } from "./object.ts";
import { copy, Vec2 } from "./general.ts";
import { bsmap } from "./deps.ts";
import { NoteAnimation } from "./internals/animation.ts";
import { Fields } from "./types.ts";
import { noteAnimation } from "./animation.ts";

export function note(
  time?: number,
  type?: NOTETYPE,
  direction?: CUT,
  x?: number,
  y?: number,
): Note;
export function note(...params: ConstructorParameters<typeof Note>): Note;
export function note(
  ...params: ConstructorParameters<typeof Note> | [
    time?: number,
    type?: NOTETYPE,
    direction?: CUT,
    x?: number,
    y?: number,
  ]
): Note {
  const [first] = params;
  if (typeof first === "object") {
    return new Note(first);
  }

  const [time, type, direction, x, y] = params;

  return new Note({
    time: time as number ?? 0,
    type: type ?? NOTETYPE.BLUE,
    direction: direction ?? CUT.DOWN,
    lineIndex: x ?? 0,
    lineLayer: y ?? 0,
  });
}

export function bomb(
  time?: number,
  x?: number,
  y?: number,
): Bomb;
export function bomb(...params: ConstructorParameters<typeof Bomb>): Bomb;
export function bomb(
  ...params: ConstructorParameters<typeof Bomb> | [
    time?: number,
    x?: number,
    y?: number,
  ]
): Bomb {
  const [first] = params;
  if (typeof first === "object") {
    return new Bomb(first);
  }

  const [time, x, y] = params;

  return new Bomb({
    time: time as number ?? 0,
    lineIndex: x ?? 0,
    lineLayer: y ?? 0,
  });
}

export abstract class BaseNote<
  TV3 extends bsmap.v3.IColorNote | bsmap.v3.IBombNote,
> extends BaseGameplayObject<bsmap.v2.INote, TV3> {
  /**
   * Note object for ease of creation.
   * @param time Time this note will be hit.
   * @param type The color of the note.
   * @param direction The direction the note will be cut.
   * @param x The lane of the note.
   * @param y The vertical row of the note.
   */
  constructor(
    fields: Partial<Fields<BaseNote<TV3>>>,
  ) {
    super(fields, noteAnimation());
  }

  /** Specifies an initial position the note will spawn at before going to it's unmodified position.  */
  flip?: Vec2;
  /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
  noteGravity?: boolean;
  /** Whether this note will look at the player. */
  noteLook?: boolean;
  /** Whether this note will have a spawn effect. */
  spawnEffect?: boolean;

  /**
   * Push this note to the difficulty.
   * @param fake Whether this note will be pushed to the fakeNotes array.
   * @param clone Whether this object will be copied before being pushed.
   */
  abstract push(clone: boolean): void;
}

export class Note extends BaseNote<bsmap.v3.IColorNote> {
  /**
   * Note object for ease of creation.
   * @param time Time this note will be hit.
   * @param type The color of the note.
   * @param direction The direction the note will be cut.
   * @param x The lane of the note.
   * @param y The vertical row of the note.
   */
  constructor(
    fields: Partial<Fields<Note>>,
  ) {
    super(fields);
  }

  /** The color of the note. */
  type: NOTETYPE = 0;
  /** The direction the note will be cut. */
  direction: CUT = 0;
  /** The angle added to the note's rotation. */
  angleOffset = 0;

  /**
   * Push this note to the difficulty.
   * @param fake Whether this note will be pushed to the fakeNotes array.
   * @param clone Whether this object will be copied before being pushed.
   */
  push(clone = true) {
    activeDiffGet().notes.push(clone ? copy(this) : this);
    return this;
  }

  toJson(v3: true): bsmap.v3.IColorNote;
  toJson(v3: false): bsmap.v2.INote;
  toJson(v3: boolean): bsmap.v2.INote | bsmap.v3.IColorNote {
    if (v3) {
      return {
        a: this.angleOffset,
        b: this.time,
        c: this.type,
        d: this.direction,
        x: this.lineIndex,
        y: this.lineLayer,
        customData: {
          animation: this.animation.toJson(v3),
          flip: this.flip,
          disableNoteGravity: !this.noteGravity,
          disableNoteLook: !this.noteLook,
          spawnEffect: this.spawnEffect,
          color: this.color,
          coordinates: this.coordinates,
          localRotation: this.localRotation,
          noteJumpMovementSpeed: this.NJS,
          noteJumpStartBeatOffset: this.localBeatOffset,
          track: this.track.value,
          uninteractable: !this.interactable,
          worldRotation: this.rotation,
          ...this.customData,
        },
      } satisfies bsmap.v3.IColorNote;
    }

    return {
      _cutDirection: this.direction,
      _lineIndex: this.lineIndex,
      _lineLayer: this.lineLayer,
      _time: this.time,
      _type: this.type,
      _customData: {
        _animation: this.animation.toJson(v3),
        _flip: this.flip,
        _disableNoteGravity: !this.noteGravity,
        _disableNoteLook: !this.noteLook,
        _disableSpawnEffect: !this.spawnEffect,
        _color: this.color,
        _position: this.coordinates,
        _localRotation: this.localRotation,
        _noteJumpMovementSpeed: this.NJS,
        _noteJumpStartBeatOffset: this.localBeatOffset,
        _track: this.track.value,
        _interactable: this.interactable,
        _rotation: this.rotation,
        _fake: this.fake,
        _cutDirection: this.angleOffset, //?
        ...this.customData,
      },
    } satisfies bsmap.v2.INote;
  }
}

export class Bomb extends BaseNote<bsmap.v3.IBombNote> {
  /**
   * Bomb object for ease of creation.
   * @param time The time this bomb will reach the player.
   * @param x The lane of the note.
   * @param y The vertical row of the note.
   */
  // time = 0, x = 0, y = 0
  constructor(fields: Partial<Fields<Bomb>>) {
    super(fields);
  }

  /**
   * Push this bomb to the difficulty.
   * @param fake Whether this bomb will be pushed to the fakeBombs array.
   * @param clone Whether this object will be copied before being pushed.
   */
  push(clone = true) {
    activeDiffGet().bombs.push(clone ? copy(this) : this);
    return this;
  }

  // TODO: Move to base note class
  toJson(v3: true): bsmap.v3.IBombNote;
  toJson(v3: false): bsmap.v2.INote;
  toJson(v3: boolean): bsmap.v2.INote | bsmap.v3.IBombNote {
    if (v3) {
      return {
        b: this.time,
        x: this.lineIndex,
        y: this.lineLayer,
        customData: {
          animation: this.animation.toJson(v3),
          flip: this.flip,
          disableNoteLook: !this.noteLook,
          disableNoteGravity: !this.noteGravity,

          spawnEffect: this.spawnEffect,

          ...this.customData,
        },
      } satisfies bsmap.v3.IBombNote;
    }

    return {
      _cutDirection: 0,
      _lineIndex: this.lineIndex,
      _lineLayer: this.lineLayer,
      _time: this.time,
      _type: 3,
      _customData: {
        _animation: this.animation.toJson(v3),
        _flip: this.flip,
        _disableNoteGravity: !this.noteGravity,
        _disableNoteLook: !this.noteLook,
        _disableSpawnEffect: !this.spawnEffect,
        ...this.customData,
      },
    } satisfies bsmap.v2.INote;
  }
}

export class Chain extends BaseSliderObject {
  json: TJson = {
    b: 0,
    x: 0,
    y: 0,
    c: 0,
    d: 0,
    tb: 0,
    tx: 0,
    ty: 0,
    sc: 4,
    s: 1,
    customData: {
      animation: {},
    },
  };

  /**
   * Chain object for ease of creation.
   * @param time The time this chain will be hit.
   * @param tailTime The time that the tail of the chain reaches the player.
   * @param type The color of the chain.
   * @param direction The cut direction of the chain.
   * @param x The lane of the chain.
   * @param y The vertical row of the chain.
   * @param tailX The lane of the chain's tail.
   * @param tailY The vertical row of the chain's tail.
   * @param links The amount of links in the chain.
   */
  constructor(
    time = 0,
    tailTime = 0,
    type = NOTETYPE.BLUE,
    direction = CUT.DOWN,
    x = 0,
    y = 0,
    tailX = 0,
    tailY = 0,
    links = 4,
  ) {
    super();
    this.time = time;
    this.tailTime = tailTime;
    this.type = type;
    this.headDirection = direction;
    this.lineIndex = x;
    this.lineLayer = y;
    this.tailX = tailX;
    this.tailY = tailY;
    this.links = links;
  }

  /**
   * Create a chain using Json.
   * @param json Json to import.
   */
  import(json: TJson) {
    this.json = json;
    if (this.customData === undefined) this.customData = {};
    if (this.animation === undefined) this.animation = {};
    this.animate = new Animation().noteAnimation(this.animation);
    return this;
  }

  /**
   * Push this chain to the difficulty.
   * @param fake Whether this chain will be pushed to the fakeChains array.
   * @param clone Whether this object will be copied before being pushed.
   */
  push(fake = false, clone = true) {
    if (fake) activeDiffGet().fakeChains.push(clone ? copy(this) : this);
    else activeDiffGet().chains.push(clone ? copy(this) : this);
    return this;
  }

  /**
   * Apply an animation through the Animation class.
   * @param animation Animation to apply.
   */
  importAnimation(animation: AnimationInternals.BaseAnimation) {
    this.animation = animation.json;
    this.animate = new Animation().noteAnimation(this.animation);
    return this;
  }

  /** The amount of links in the chain. */
  get links() {
    return this.json.sc;
  }
  /** An interpolation or extrapolation of the path between the head and tail. */
  get squish() {
    return this.json.s;
  }
  /** Specifies an initial position the chain will spawn at before going to it's unmodified position.  */
  get flip() {
    return this.json.customData.flip;
  }
  /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
  get noteGravity() {
    return !this.json.customData.disableNoteGravity;
  }
  /** Whether this chain will look at the player. */
  get noteLook() {
    return !this.json.customData.disableNoteLook;
  }

  set links(value: number) {
    this.json.sc = value;
  }
  set squish(value: number) {
    this.json.s = value;
  }
  set flip(value: Vec2) {
    this.json.customData.flip = value;
  }
  set noteGravity(value: boolean) {
    this.json.customData.disableNoteGravity = !value;
  }
  set noteLook(value: boolean) {
    this.json.customData.disableNoteLook = !value;
  }
}

export class Arc extends BaseSliderObject {
  json: TJson = {
    b: 0,
    c: 0,
    x: 0,
    y: 0,
    d: 0,
    mu: 1,
    tb: 0,
    tx: 0,
    ty: 0,
    tc: 0,
    tmu: 1,
    m: 0,
    customData: {
      animation: {},
    },
  };
  /** The animation of this arc. */
  animate = new Animation().noteAnimation(this.animation);

  /**
   * Arc object for ease of creation.
   * @param time The time this arc will be hit.
   * @param tailTime The time that the tail of the arc reaches the player.
   * @param type The color of the arc.
   * @param headDirection The cut direction of the head of the arc.
   * @param tailDirection The cut direction of the tail of the arc.
   * @param x The lane of the arc.
   * @param y The vertical row of the arc.
   * @param tailX The lane of the arc's tail.
   * @param tailY The vertical row of the arc's tail.
   */
  constructor(
    time = 0,
    tailTime = 0,
    type = NOTETYPE.BLUE,
    headDirection = CUT.DOWN,
    tailDirection = CUT.DOWN,
    x = 0,
    y = 0,
    tailX = 0,
    tailY = 0,
  ) {
    super();
    this.time = time;
    this.tailTime = tailTime;
    this.type = type;
    this.headDirection = headDirection;
    this.tailDirection = tailDirection;
    this.lineIndex = x;
    this.lineLayer = y;
    this.tailX = tailX;
    this.tailY = tailY;
  }

  /**
   * Create an arc using JSON.
   * @param json
   * @returns {Note}
   */
  import(json: TJson) {
    this.json = json;
    if (this.customData === undefined) this.customData = {};
    if (this.animation === undefined) this.animation = {};
    this.animate = new Animation().noteAnimation(this.animation);
    return this;
  }

  /**
   * Push this arc to the difficulty
   */
  push(clone = true) {
    activeDiffGet().arcs.push(clone ? copy(this) : this);
    return this;
  }

  /**
   * Apply an animation through the Animation class.
   * @param {Animation} animation
   */
  importAnimation(animation: AnimationInternals.BaseAnimation) {
    this.animation = animation.json;
    this.animate = new Animation().noteAnimation(this.animation);
    return this;
  }

  /** The cut direction of the tail of the arc. */
  get tailDirection() {
    return this.json.tc;
  }
  /** Multiplier for the distance the start of the arc shoots outward. */
  get headLength() {
    return this.json.mu;
  }
  /** Multiplier for the distance the end of the arc shoots outward. */
  get tailLength() {
    return this.json.tmu;
  }
  /** How the arc curves from the head to the midpoint. */
  get anchorMode() {
    return this.json.m;
  }
  /** Specifies an initial position the arc will spawn at before going to it's unmodified position.  */
  get flip() {
    return this.json.customData.flip;
  }
  /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
  get noteGravity() {
    return !this.json.customData.disableNoteGravity;
  }

  set tailDirection(value: CUT) {
    this.json.tc = value;
  }
  set headLength(value: number) {
    this.json.mu = value;
  }
  set tailLength(value: number) {
    this.json.tmu = value;
  }
  set anchorMode(value: ANCHORMODE) {
    this.json.m = value;
  }
  set flip(value: Vec2) {
    this.json.customData.flip = value;
  }
  set noteGravity(value: boolean) {
    this.json.customData.disableNoteGravity = !value;
  }
}
