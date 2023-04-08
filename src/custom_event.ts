// deno-lint-ignore-file no-namespace adjacent-overload-signatures
import { copy, jsonGet, jsonSet } from "./general.ts";
import { activeDiffGet, TJson } from "./beatmap.ts";
import {
  Track,
  TrackValue,
} from "./animation.ts";
import { EASE } from "./constants.ts";
import {
  BloomFogEnvironment,
  ILightWithId,
  TubeBloomPrePassLight,
} from "./environment.ts";



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
