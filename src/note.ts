// deno-lint-ignore-file adjacent-overload-signatures
import { activeDiffGet, TJson } from "./beatmap.ts";
import { Animation, AnimationInternals } from "./animation.ts";
import { ANCHORMODE, CUT, NOTETYPE } from "./constants.ts";
import { BaseGameplayObject, BaseSliderObject } from "./object.ts";
import { copy, Vec2 } from "./general.ts";
import { bsmap } from "./deps.ts";

export class Note extends BaseGameplayObject<bsmap.v2. {
  json: TJson = {
    b: 0,
    x: 0,
    y: 0,
    c: 0,
    d: 0,
    a: 0,
    customData: {
      animation: {},
    },
  };
  /** The animation of this note. */
  animate = new Animation().noteAnimation(this.animation);

  /**
   * Note object for ease of creation.
   * @param time Time this note will be hit.
   * @param type The color of the note.
   * @param direction The direction the note will be cut.
   * @param x The lane of the note.
   * @param y The vertical row of the note.
   */
  constructor(
    time = 0,
    type = NOTETYPE.BLUE,
    direction = CUT.DOWN,
    x = 0,
    y = 0,
  ) {
    super();
    this.time = time;
    this.type = type;
    this.direction = direction;
    this.lineIndex = x;
    this.lineLayer = y;
  }

  /**
   * Create a note using Json.
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
   * Push this note to the difficulty.
   * @param fake Whether this note will be pushed to the fakeNotes array.
   * @param clone Whether this object will be copied before being pushed.
   */
  push(fake = false, clone = true) {
    if (fake) activeDiffGet().fakeNotes.push(clone ? copy(this) : this);
    else activeDiffGet().notes.push(clone ? copy(this) : this);
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

  /** The color of the note. */
  get type() {
    return this.json.c;
  }
  /** The direction the note will be cut. */
  get direction() {
    return this.json.d;
  }
  /** The angle added to the note's rotation. */
  get angleOffset() {
    return this.json.a;
  }
  /** Specifies an initial position the note will spawn at before going to it's unmodified position.  */
  get flip() {
    return this.json.customData.flip;
  }
  /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
  get noteGravity() {
    return !this.json.customData.disableNoteGravity;
  }
  /** Whether this note will look at the player. */
  get noteLook() {
    return !this.json.customData.disableNoteLook;
  }
  /** Whether this note will have a spawn effect. */
  get spawnEffect() {
    return this.json.customData.spawnEffect;
  }

  set type(value: NOTETYPE) {
    this.json.c = value;
  }
  set direction(value: CUT) {
    this.json.d = value;
  }
  set angleOffset(value: number) {
    this.json.a = value;
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
  set spawnEffect(value: boolean) {
    this.json.customData.spawnEffect = value;
  }
}

export class Bomb extends BaseGameplayObject {
  json: TJson = {
    b: 0,
    x: 0,
    y: 0,
    customData: {
      animation: {},
    },
  };
  /** The animation of this bomb. */
  animate = new Animation().noteAnimation(this.animation);

  /**
   * Bomb object for ease of creation.
   * @param time The time this bomb will reach the player.
   * @param x The lane of the note.
   * @param y The vertical row of the note.
   */
  constructor(time = 0, x = 0, y = 0) {
    super();
    this.time = time;
    this.lineIndex = x;
    this.lineLayer = y;
  }

  /**
   * Create a bomb using Json.
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
   * Push this bomb to the difficulty.
   * @param fake Whether this bomb will be pushed to the fakeBombs array.
   * @param clone Whether this object will be copied before being pushed.
   */
  push(fake = false, clone = true) {
    if (fake) activeDiffGet().fakeBombs.push(clone ? copy(this) : this);
    else activeDiffGet().bombs.push(clone ? copy(this) : this);
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

  /** Specifies an initial position the bomb will spawn at before going to it's unmodified position.  */
  get flip() {
    return this.json.customData.flip;
  }
  /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
  get noteGravity() {
    return !this.json.customData.disableNoteGravity;
  }
  /** Whether this bomb will look at the player. */
  get noteLook() {
    return !this.json.customData.disableNoteLook;
  }
  /** Whether this bomb will have a spawn effect. */
  get spawnEffect() {
    return this.json.customData.spawnEffect;
  }

  set flip(value: boolean) {
    this.json.customData.flip = value;
  }
  set noteGravity(value: boolean) {
    this.json.customData.disableNoteGravity = !value;
  }
  set noteLook(value: boolean) {
    this.json.customData.disableNoteLook = !value;
  }
  set spawnEffect(value: boolean) {
    this.json.customData.spawnEffect = value;
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
  /** The animation of this chain. */
  animate = new Animation().noteAnimation(this.animation);

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
