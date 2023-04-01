// deno-lint-ignore-file no-namespace adjacent-overload-signatures
import { copy, jsonGet, jsonSet } from "./general.ts";
import { activeDiffGet, TJson } from "./beatmap.ts";
import {
  Animation,
  AnimationInternals,
  KeyframesLinear,
  Track,
  TrackValue,
} from "./animation.ts";
import { EASE } from "./constants.ts";
import {
  BloomFogEnvironment,
  ILightWithId,
  TubeBloomPrePassLight,
} from "./environment.ts";

export namespace CustomEventInternals {
  export class BaseEvent {
    /** The Json for this event. */
    json: TJson = {
      b: 0,
      t: "",
      d: {},
    };

    constructor(time: number | TJson) {
      if (typeof time === "object") {
        Object.assign(this.json, time);
        return;
      }
      this.time = time;
    }

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
      activeDiffGet().customEvents.push(clone ? copy(this) : this);
      return this;
    }

    /** The time of this event in beats. */
    get time() {
      return this.json.b;
    }
    /** The type of this event. */
    get type() {
      return this.json.t;
    }
    /** The data of this event. */
    get data() {
      return this.json.d;
    }

    set time(value: number) {
      this.json.b = value;
    }
    set type(value: string) {
      this.json.t = value;
    }
    set data(value: TJson) {
      this.json.d = value;
    }
  }

  export class AnimateTrack extends BaseEvent {
    /** The animation of this event. */
    animate: AnimationInternals.AbstractAnimation;

    /**
     * Animate a track.
     * @param json The json to import.
     * @param track Track(s) to effect.
     * @param duration The duration of the animation.
     * @param animation The animation properties to replace.
     * @param easing The easing on this event's animation.
     */
    constructor(
      json: TJson,
      track?: TrackValue,
      duration?: number,
      animation?: TJson,
      easing?: EASE,
    ) {
      super(json);
      this.type = "AnimateTrack";
      if (track) this.track.value = track;
      if (duration) this.duration = duration;
      if (animation) this.setProperties(animation);
      if (easing) this.easing = easing;
      this.animate = new Animation().abstract(this.data);
    }

    /**
     * Set the properties for animation.
     * @param data The properties to replace.
     */
    setProperties(data: TJson) {
      const oldData = copy(this.data);

      Object.keys(this.data).forEach((key) => {
        delete this.data[key];
      });
      this.track.value = oldData.track;
      this.duration = oldData.duration;
      if (oldData.easing) this.easing = oldData.easing;

      Object.keys(data).forEach((x) => {
        this.json._data[x] = data[x];
      });
    }

    /**
     * Apply an animation through the Animation class.
     * @param animation Animation to apply.
     */
    importAnimation(animation: AnimationInternals.BaseAnimation) {
      this.setProperties(animation.json);
      this.duration = animation.length;
      this.animate.length = animation.length;
      return this;
    }

    /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
    abstract() {
      return new CustomEvent().import(this.json);
    }

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    get track() {
      return new Track(this.data);
    }
    /** The duration of the animation. */
    get duration() {
      return this.data.duration;
    }
    /** The easing on this event's animation. */
    get easing() {
      return this.data.easing;
    }
    /** The amount of times to repeat this event. */
    get repeat() {
      return this.data.repeat;
    }

    set duration(value: number) {
      this.data.duration = value;
    }
    set easing(value: EASE) {
      this.data.easing = value;
    }
    set repeat(value: number) {
      this.data.repeat = value;
    }
  }

  export class AssignPathAnimation extends BaseEvent {
    /** The animation of this event. */
    animate: AnimationInternals.AbstractAnimation;

    /**
     * Animate objects on a track across their lifespan.
     * @param json The json to import.
     * @param track Track(s) to effect.
     * @param duration The time to transition from a previous path to this one.
     * @param animation The animation properties to replace.
     * @param easing The easing on this event's animation.
     */
    constructor(
      json: TJson,
      track?: TrackValue,
      duration?: number,
      animation?: TJson,
      easing?: EASE,
    ) {
      super(json);
      this.type = "AssignPathAnimation";
      if (track) this.track.value = track;
      if (duration) this.duration = duration;
      if (animation) this.setProperties(animation);
      if (easing) this.easing = easing;
      this.animate = new Animation().abstract(this.data);
    }

    /**
     * Set the properties for animation.
     * @param data The properties to replace.
     */
    setProperties(data: TJson) {
      const oldData = copy(this.data);

      Object.keys(this.data).forEach((key) => {
        delete this.data[key];
      });
      this.track.value = oldData.track;
      this.duration = oldData.duration;
      if (oldData.easing) this.easing = oldData.easing;

      Object.keys(data).forEach((x) => {
        this.json._data[x] = data[x];
      });
    }

    /**
     * Apply an animation through the Animation class.
     * @param animation Animation to apply.
     */
    importAnimation(animation: AnimationInternals.BaseAnimation) {
      this.setProperties(animation.json);
      this.duration = animation.length;
      this.animate.length = animation.length;
      return this;
    }

    /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
    abstract() {
      return new CustomEvent().import(this.json);
    }

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    get track() {
      return new Track(this.data);
    }
    /** The time to transition from a previous path to this one. */
    get duration() {
      return this.data.duration;
    }
    /** The easing on this event's animation. */
    get easing() {
      return this.data.easing;
    }

    set duration(value: number) {
      this.data.duration = value;
    }
    set easing(value: EASE) {
      this.data.easing = value;
    }
  }

  export class AssignTrackParent extends BaseEvent {
    /**
     * Assign tracks to a parent track.
     * @param json Json to import.
     * @param childrenTracks Children tracks to assign.
     * @param parentTrack Name of the parent track.
     * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
     */
    constructor(
      json: TJson,
      childrenTracks: string[],
      parentTrack: string,
      worldPositionStays?: boolean,
    ) {
      super(json);
      this.type = "AssignTrackParent";
      this.childrenTracks = childrenTracks;
      this.parentTrack = parentTrack;

      if (worldPositionStays !== undefined) {
        this.worldPositionStays = worldPositionStays;
      }
    }

    /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
    abstract() {
      return new CustomEvent().import(this.json);
    }

    /** Children tracks to assign. */
    get childrenTracks() {
      return this.data.childrenTracks;
    }
    /** Name of the parent track. */
    get parentTrack() {
      return this.data.parentTrack;
    }
    /** Modifies the transform of children objects to remain in the same place relative to world space. */
    get worldPositionStays() {
      return this.data.worldPositionStays;
    }

    set childrenTracks(value: string[]) {
      this.data.childrenTracks = value;
    }
    set parentTrack(value: string) {
      this.data.parentTrack = value;
    }
    set worldPositionStays(value: boolean) {
      this.data.worldPositionStays = value;
    }
  }

  export class AssignPlayerToTrack extends BaseEvent {
    /**
     * Assigns the player to a track.
     * @param json Json to import.
     * @param track Track the player will be assigned to.
     */
    constructor(json: TJson, track?: string) {
      super(json);
      this.type = "AssignPlayerToTrack";
      if (track) this.track = track;
    }

    /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
    abstract() {
      return new CustomEvent().import(this.json);
    }

    /** Track the player will be assigned to. */
    get track() {
      return this.data.track;
    }

    set track(value: string) {
      this.data.track = value;
    }
  }

  export class AnimateComponent extends BaseEvent {
    /**
     * Animate components on a track.
     * @param json Json to import.
     * @param track Track(s) to effect.
     * @param duration Duration of the animation.
     * @param easing The easing on the animation.
     */
    constructor(
      json: TJson,
      track?: TrackValue,
      duration?: number,
      easing?: EASE,
    ) {
      super(json);
      this.type = "AnimateComponent";
      if (track) this.track.value = track;
      if (duration) this.duration = duration;
      if (easing) this.easing = easing;
    }

    /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
    abstract() {
      return new CustomEvent().import(this.json);
    }

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    get track() {
      return new Track(this.data);
    }
    /** The duration of the animation. */
    get duration() {
      return this.data.duration;
    }
    /** The easing on this event's animation. */
    get easing() {
      return this.data.easing;
    }
    /** The "ILightWithId" component to animate. */
    get lightID() {
      return jsonGet(this.data, "ILightWithId", {});
    }
    /** The "BloomFogEnvironment" component to animate. */
    get fog() {
      return jsonGet(this.data, "BloomFogEnvironment", {});
    }
    /** The "TubeBloomPrePassLight component to animate." */
    get lightMultiplier() {
      return jsonGet(this.data, "TubeBloomPrePassLight", {});
    }

    set duration(value: number) {
      this.data.duration = value;
    }
    set easing(value: EASE) {
      this.data.easing = value;
    }
    set lightID(value: ILightWithId<KeyframesLinear>) {
      jsonSet(this.data, "ILightWithId", value);
    }
    set fog(value: BloomFogEnvironment<KeyframesLinear>) {
      jsonSet(this.data, "BloomFogEnvironment", value);
    }
    set lightMultiplier(value: TubeBloomPrePassLight<KeyframesLinear>) {
      jsonSet(this.data, "TubeBloomPrePassLight", value);
    }
  }

  export class AbstractEvent extends BaseEvent {
    /** The animation of this event. */
    animate: AnimationInternals.AbstractAnimation;

    /**
     * A custom event that has an unknown type.
     * @param json Json to import.
     */
    constructor(json: TJson) {
      super(json);
      this.animate = new Animation().abstract(this.data);
    }

    /**
     * Add properties to the data.
     * @param data Properties to add.
     */
    appendData(data: TJson) {
      Object.keys(data).forEach((x) => {
        this.json._data[x] = data[x];
      });
    }

    /**
     * Apply an animation through the Animation class.
     * @param animation Animation to apply.
     */
    importAnimation(animation: AnimationInternals.BaseAnimation) {
      this.appendData(animation.json);
      this.duration = animation.length;
      this.animate.length = animation.length;
      return this;
    }

    /** The track class for this event.
     * Please read the properties of this class to see how it works.
     */
    get track() {
      return new Track(this.data);
    }
    /** The duration of the animation.
     * Or in the case of AssignPathAnimation,
     * the time to transition from a previous path to this one. */
    get duration() {
      return this.data.duration;
    }
    /** The easing on this event's animation.
     * Or in the case of AssignPathAnimation,
     * the easing for the transition from a previous path to this one. */
    get easing() {
      return this.data.easing;
    }
    /** Children tracks to assign. AssignTrackParent only. */
    get childrenTracks() {
      return this.data.childrenTracks;
    }
    /** Name of the parent track. AssignTrackParent only. */
    get parentTrack() {
      return this.data.parentTrack;
    }
    /** Modifies the transform of children objects to remain in the same place relative to world space.
     * AssignTrackParent only. */
    get worldPositionStays() {
      return this.data.worldPositionStays;
    }
    /** The "ILightWithId" component to animate. AnimateComponent only. */
    get lightID() {
      return jsonGet(this.data, "ILightWithId", {});
    }
    /** The "BloomFogEnvironment" component to animate. AnimateComponent only. */
    get fog() {
      return jsonGet(this.data, "BloomFogEnvironment", {});
    }
    /** The "TubeBloomPrePassLight" component to animate. AnimateComponent only. */
    get lightMultiplier() {
      return jsonGet(this.data, "TubeBloomPrePassLight", {});
    }

    set duration(value: number) {
      this.data.duration = value;
    }
    set easing(value: EASE) {
      this.data.easing = value;
    }
    set childrenTracks(value: string[]) {
      this.data.childrenTracks = value;
    }
    set parentTrack(value: string) {
      this.data.parentTrack = value;
    }
    set worldPositionStays(value: boolean) {
      this.data.worldPositionStays = value;
    }
    set lightID(value: ILightWithId<KeyframesLinear>) {
      jsonSet(this.data, "ILightWithId", value);
    }
    set fog(value: BloomFogEnvironment<KeyframesLinear>) {
      jsonSet(this.data, "BloomFogEnvironment", value);
    }
    set lightMultiplier(value: TubeBloomPrePassLight<KeyframesLinear>) {
      jsonSet(this.data, "TubeBloomPrePassLight", value);
    }
  }
}

export class CustomEvent extends CustomEventInternals.BaseEvent {
  /**
   * Custom Event object for ease of creation.
   * @param time Time of the event.
   */
  constructor(time = 0) {
    super(time);
  }

  /**
   * Create a custom event using Json.
   * @param json Json to import.
   */
  import(json: TJson) {
    return new CustomEventInternals.AbstractEvent(json);
  }

  /** Create an event with no particular identity. */
  abstract() {
    return this.import({});
  }

  /**
   * Animate a track.
   * @param track Track(s) to effect.
   * @param duration The duration of the animation.
   * @param animation The animation properties to replace.
   * @param easing The easing on this event's animation.
   */
  animateTrack = (
    track?: TrackValue,
    duration?: number,
    animation?: TJson,
    easing?: EASE,
  ) =>
    new CustomEventInternals.AnimateTrack(
      this.json,
      track,
      duration,
      animation,
      easing,
    );

  /**
   * Animate objects on a track across their lifespan.
   * @param track Track(s) to effect.
   * @param duration The time to transition from a previous path to this one.
   * @param animation The animation properties to replace.
   * @param easing The easing on this event's animation.
   */
  assignPathAnimation = (
    track?: TrackValue,
    duration?: number,
    animation: TJson = {},
    easing?: EASE,
  ) =>
    new CustomEventInternals.AssignPathAnimation(
      this.json,
      track,
      duration,
      animation,
      easing,
    );

  /**
   * Assign tracks to a parent track.
   * @param childrenTracks Children tracks to assign.
   * @param parentTrack Name of the parent track.
   * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
   */
  assignTrackParent = (
    childrenTracks: string[],
    parentTrack: string,
    worldPositionStays?: boolean,
  ) =>
    new CustomEventInternals.AssignTrackParent(
      this.json,
      childrenTracks,
      parentTrack,
      worldPositionStays,
    );

  /**
   * Assigns the player to a track.
   * @param track Track the player will be assigned to.
   */
  assignPlayerToTrack = (track?: string) =>
    new CustomEventInternals.AssignPlayerToTrack(this.json, track);

  /**
   * Animate components on a track.
   * @param track Track(s) to effect.
   * @param duration Duration of the animation.
   * @param easing The easing on the animation.
   */
  animateComponent = (track?: TrackValue, duration?: number, easing?: EASE) =>
    new CustomEventInternals.AnimateComponent(
      this.json,
      track,
      duration,
      easing,
    );
}
