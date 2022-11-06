// deno-lint-ignore-file no-namespace no-explicit-any adjacent-overload-signatures
import { copy, jsonGet, jsonSet } from './general.ts';
import { activeDiffGet } from './beatmap.ts';
import { AnimationInternals, Animation, TrackValue, Track, KeyframesLinear } from './animation.ts';
import { EASE } from './constants.ts';
import { BloomFogEnvironment, ILightWithId, TubeBloomPrePassLight } from './environment.ts';

export namespace CustomEventInternals {
    export class BaseEvent {
        json: any = {
            b: 0,
            t: "",
            d: {}
        };

        constructor(time: number | Record<string, any>) {
            if (typeof time === "object") {
                Object.assign(this.json, time);
                return;
            }
            this.time = time;
        }

        /**
        * Push this event to the difficulty
        */
        push(clone = true) {
            activeDiffGet().customEvents.push(clone ? copy(this) : this);
            return this;
        }

        get time() { return this.json.b }
        get type() { return this.json.t }
        get data() { return this.json.d }

        set time(value: number) { this.json.b = value }
        set type(value: string) { this.json.t = value }
        set data(value: Record<string, any>) { this.json.d = value }
    }


    export class AnimateTrack extends BaseEvent {
        animate: AnimationInternals.AbstractAnimation;

        constructor(json: Record<string, any>, track?: TrackValue, duration?: number, animation?: Record<string, any>, easing?: EASE) {
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
         * @param data 
         */
        setProperties(data: Record<string, any>) {
            const oldData = copy(this.data);

            Object.keys(this.data).forEach(key => { delete this.data[key] });
            this.track.value = oldData.track;
            this.duration = oldData.duration;
            if (oldData.easing) this.easing = oldData.easing;

            Object.keys(data).forEach(x => {
                this.json._data[x] = data[x];
            })
        }

        /**
         * Apply an animation through the Animation class.
         * @param {Animation} animation
         */
        importAnimation(animation: AnimationInternals.BaseAnimation) {
            this.setProperties(animation.json);
            this.duration = animation.length;
            this.animate.length = animation.length;
            return this;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get track() { return new Track(this.data) }
        get duration() { return this.data.duration }
        get easing() { return this.data.easing }
        get repeat() {return this.data.repeat}

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set repeat(value: number) { this.data.repeat = value }
    }

    export class AssignPathAnimation extends BaseEvent {
        animate: AnimationInternals.AbstractAnimation;

        constructor(json: Record<string, any>, track?: TrackValue, duration?: number, animation?: Record<string, any>, easing?: EASE) {
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
         * @param data 
         */
        setProperties(data: Record<string, any>) {
            const oldData = copy(this.data);

            Object.keys(this.data).forEach(key => { delete this.data[key] });
            this.track.value = oldData.track;
            this.duration = oldData.duration;
            if (oldData.easing) this.easing = oldData.easing;

            Object.keys(data).forEach(x => {
                this.json._data[x] = data[x];
            })
        }

        /**
         * Apply an animation through the Animation class.
         * @param {Animation} animation
         */
        importAnimation(animation: AnimationInternals.BaseAnimation) {
            this.setProperties(animation.json);
            this.duration = animation.length;
            this.animate.length = animation.length;
            return this;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get track() { return new Track(this.data) }
        get duration() { return this.data.duration }
        get easing() { return this.data.easing }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
    }

    export class AssignTrackParent extends BaseEvent {
        constructor(json: Record<string, any>, childrenTracks: string[], parentTrack: string, worldPositionStays?: boolean) {
            super(json);
            this.type = "AssignTrackParent";
            this.childrenTracks = childrenTracks;
            this.parentTrack = parentTrack;

            if (worldPositionStays !== undefined) this.worldPositionStays = worldPositionStays;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get childrenTracks() { return this.data.childrenTracks }
        get parentTrack() { return this.data.parentTrack }
        get worldPositionStays() { return this.data.worldPositionStays }

        set childrenTracks(value: string[]) { this.data.childrenTracks = value }
        set parentTrack(value: string) { this.data.parentTrack = value }
        set worldPositionStays(value: boolean) { this.data.worldPositionStays = value }
    }

    export class AssignPlayerToTrack extends BaseEvent {
        constructor(json: Record<string, any>, track?: string) {
            super(json);
            this.type = "AssignPlayerToTrack";
            if (track) this.track.value = track;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get track() { return new Track(this.data) }
    }

    export class AnimateComponent extends BaseEvent {
        constructor(json: Record<string, any>, track?: TrackValue, duration?: number, easing?: EASE) {
            super(json);
            this.type = "AnimateComponent";
            if (track) this.track.value = track;
            if (duration) this.duration = duration;
            if (easing) this.easing = easing;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get track() { return new Track(this.data) }
        get duration() { return this.data.duration }
        get easing() { return this.data.easing }
        get lightID() { return jsonGet(this.data, "ILightWithId", {}) }
        get fog() { return jsonGet(this.data, "BloomFogEnvironment", {}) }
        get lightMultiplier() { return jsonGet(this.data, "TubeBloomPrePassLight", {}) }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set lightID(value: ILightWithId<KeyframesLinear>) { jsonSet(this.data, "ILightWithId", value) }
        set fog(value: BloomFogEnvironment<KeyframesLinear>) { jsonSet(this.data, "BloomFogEnvironment", value) }
        set lightMultiplier(value: TubeBloomPrePassLight<KeyframesLinear>) { jsonSet(this.data, "TubeBloomPrePassLight", value) }
    }

    export class AbstractEvent extends BaseEvent {
        animate: AnimationInternals.AbstractAnimation;

        constructor(json: Record<string, any>) {
            super(json);
            this.animate = new Animation().abstract(this.data);
        }

        /**
         * Add properties to the data.
         * @param data 
         */
        appendData(data: Record<string, any>) {
            Object.keys(data).forEach(x => {
                this.json._data[x] = data[x];
            })
        }

        /**
         * Apply an animation through the Animation class.
         * @param {Animation} animation
         */
        importAnimation(animation: AnimationInternals.BaseAnimation) {
            this.appendData(animation.json);
            this.duration = animation.length;
            this.animate.length = animation.length;
            return this;
        }

        get track() { return new Track(this.data) }
        get duration() { return this.data.duration }
        get easing() { return this.data.easing }
        get childrenTracks() { return this.data.childrenTracks }
        get parentTrack() { return this.data.parentTrack }
        get worldPositionStays() { return this.data.worldPositionStays }
        get lightID() { return jsonGet(this.data, "ILightWithId", {}) }
        get fog() { return jsonGet(this.data, "BloomFogEnvironment", {}) }
        get lightMultiplier() { return jsonGet(this.data, "TubeBloomPrePassLight", {}) }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set childrenTracks(value: string[]) { this.data.childrenTracks = value }
        set parentTrack(value: string) { this.data.parentTrack = value }
        set worldPositionStays(value: boolean) { this.data.worldPositionStays = value }
        set lightID(value: ILightWithId<KeyframesLinear>) { jsonSet(this.data, "ILightWithId", value) }
        set fog(value: BloomFogEnvironment<KeyframesLinear>) { jsonSet(this.data, "BloomFogEnvironment", value) }
        set lightMultiplier(value: TubeBloomPrePassLight<KeyframesLinear>) { jsonSet(this.data, "TubeBloomPrePassLight", value) }
    }
}

export class CustomEvent extends CustomEventInternals.BaseEvent {
    /**
     * Event object for ease of creation.
     * @param {Object} time
     */
    constructor(time = 0) { super(time) }

    /**
     * Create a custom event using JSON.
     * @param {Object} json 
     * @returns {AbstractEvent}
     */
    import(json: Record<string, any>) { return new CustomEventInternals.AbstractEvent(json) }

    /**
     * Create an event with no particular identity.
     * @returns {AbstractEvent};
     */
    abstract() { return this.import({}) }

    /**
     * Animate a track.
     * @param {String} track 
     * @param {Number} duration 
     * @param {Object} animation JSON for the animation.
     * @param {String} easing 
     * @returns 
     */
    animateTrack = (track?: TrackValue, duration?: number, animation?: Record<string, any>, easing?: EASE) =>
        new CustomEventInternals.AnimateTrack(this.json, track, duration, animation, easing);

    /**
     * Animate objects on a track across their lifespan.
     * @param {String} track 
     * @param {Number} duration 
     * @param {Object} animation JSON for the animation.
     * @param {String} easing 
     * @returns 
     */
    assignPathAnimation = (track?: TrackValue, duration?: number, animation: Record<string, any> = {}, easing?: EASE) =>
        new CustomEventInternals.AssignPathAnimation(this.json, track, duration, animation, easing);

    /**
     * Assign a parent to a track.
     * @param {Array} childrenTracks 
     * @param {String} parentTrack 
     * @param {Boolean} worldPositionStays Object stays in the same place after being parented, false by default.
     * @returns 
     */
    assignTrackParent = (childrenTracks: string[], parentTrack: string, worldPositionStays?: boolean) =>
        new CustomEventInternals.AssignTrackParent(this.json, childrenTracks, parentTrack, worldPositionStays);

    /**
     * Assign the player to a track.
     * @param {String} track 
     * @returns 
     */
    assignPlayerToTrack = (track?: string) =>
        new CustomEventInternals.AssignPlayerToTrack(this.json, track)

    animateComponent = (track?: TrackValue, duration?: number, easing?: EASE) =>
        new CustomEventInternals.AnimateComponent(this.json, track, duration, easing);
}