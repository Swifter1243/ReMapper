import * as general from './general';
import { activeDiff } from './beatmap';
import { AnimationInternals, Animation, TrackValue, Track } from './animation';

export namespace CustomEventInternals {
    export class BaseEvent {
        json: any = {
            _time: 0,
            _type: "",
            _data: {}
        };

        constructor(time: number | object) {
            if (typeof time === "object") {
                Object.assign(this.json, time);
                return;
            }
            this.time = time;
        }

        /**
        * Push this event to the difficulty
        */
        push() {
            if (activeDiff.customEvents === undefined) activeDiff.customEvents = [];
            activeDiff.customEvents.push(general.copy(this));
            return this;
        }

        get time() { return this.json._time }
        get type() { return this.json._type }
        get data() { return this.json._data }

        set time(value) { this.json._time = value }
        set type(value) { this.json._type = value }
        set data(value) { this.json._data = value }
    }


    export class AnimateTrack extends BaseEvent {
        animate: AnimationInternals.AbstractAnimation;

        constructor(json: object, track: TrackValue, duration: number, animation: object, easing: string) {
            super(json);
            this.trackSet = track;
            this.duration = duration;
            this.type = "AnimateTrack";
            this.setProperties(animation);
            this.animate = new Animation().abstract(this.data);

            if (easing !== undefined) this.easing = easing;
        }

        /**
         * Set the properties for animation.
         * @param data 
         */
        setProperties(data: object) {
            let oldData = general.copy(this.data);

            Object.keys(this.data).forEach(key => { delete this.data[key] });
            this.trackSet = oldData._track;
            this.duration = oldData._duration;
            if (oldData._easing) this.easing = oldData._easing;

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

        get track() { return new Track(this.data._track) }
        get duration() { return this.data._duration }
        get easing() { return this.data._easing }

        set trackSet(value: TrackValue) { this.data._track = value }
        set duration(value) { this.data._duration = value }
        set easing(value) { this.data._easing = value }
    }

    export class AssignPathAnimation extends BaseEvent {
        animate: AnimationInternals.AbstractAnimation;

        constructor(json: object, track: string, duration: number, animation: object, easing: string) {
            super(json);
            this.type = "AssignPathAnimation";
            this.trackSet = track;
            this.duration = duration;
            this.setProperties(animation);
            this.animate = new Animation().abstract(this.data);

            if (easing !== undefined) this.easing = easing;
        }

        /**
         * Set the properties for animation.
         * @param data 
         */
        setProperties(data: object) {
            let oldData = general.copy(this.data);

            Object.keys(this.data).forEach(key => { delete this.data[key] });
            this.trackSet = oldData._track;
            this.duration = oldData._duration;
            if (oldData._easing) this.easing = oldData._easing;

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

        get track() { return new Track(this.data._track) }
        get duration() { return this.data._duration }
        get easing() { return this.data._easing }

        set trackSet(value: TrackValue) { this.data._track = value }
        set duration(value) { this.data._duration = value }
        set easing(value) { this.data._easing = value }
    }

    export class AssignTrackParent extends BaseEvent {
        constructor(json: object, childrenTracks: string[], parentTrack: string, worldPositionStays: boolean) {
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

        get childrenTracks() { return this.data._childrenTracks }
        get parentTrack() { return this.data._parentTrack }
        get worldPositionStays() { return this.data._worldPositionStays }

        set childrenTracks(value) { this.data._childrenTracks = value }
        set parentTrack(value) { this.data._parentTrack = value }
        set worldPositionStays(value) { this.data._worldPositionStays = value }
    }

    export class AssignPlayerToTrack extends BaseEvent {
        constructor(json: object, track: string) {
            super(json);
            this.type = "AssignPlayerToTrack";
            this.trackSet = track;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get track() { return new Track(this.data._track) }
        set trackSet(value: TrackValue) { this.data._track = value }
    }

    export class AssignFogTrack extends BaseEvent {
        constructor(json: object, track: string) {
            super(json);
            this.type = "AssignFogTrack";
            this.trackSet = track;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new CustomEvent().import(this.json) }

        get track() { return new Track(this.data._track) }
        set trackSet(value: TrackValue) { this.data._track = value }
    }

    export class AbstractEvent extends BaseEvent {
        animate: AnimationInternals.AbstractAnimation;

        constructor(json: object) {
            super(json);
            this.animate = new Animation().abstract(this.data);
        }

        /**
         * Add properties to the data.
         * @param data 
         */
        appendData(data: object) {
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

        get track() { return new Track(this.data._track) }
        get duration() { return this.data._duration }
        get easing() { return this.data._easing }
        get childrenTracks() { return this.data._childrenTracks }
        get parentTrack() { return this.data._parentTrack }
        get worldPositionStays() { return this.data._worldPositionStays }

        set trackSet(value: TrackValue) { this.data._track = value }
        set duration(value) { this.data._duration = value }
        set easing(value) { this.data._easing = value }
        set childrenTracks(value) { this.data._childrenTracks = value }
        set parentTrack(value) { this.data._parentTrack = value }
        set worldPositionStays(value) { this.data._worldPositionStays = value }
    }
}

export class CustomEvent extends CustomEventInternals.BaseEvent {
    /**
     * Event object for ease of creation.
     * @param {Object} time
     */
    constructor(time: number = 0) { super(time) }

    /**
     * Create a custom event using JSON.
     * @param {Object} json 
     * @returns {AbstractEvent}
     */
    import(json: object) { return new CustomEventInternals.AbstractEvent(json) }

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
    animateTrack(track: string, duration: number = undefined, animation: object = {}, easing: string = undefined) {
        duration ??= 0;
        animation ??= {};
        return new CustomEventInternals.AnimateTrack(this.json, track, duration, animation, easing);
    }

    /**
     * Animate objects on a track across their lifespan.
     * @param {String} track 
     * @param {Number} duration 
     * @param {Object} animation JSON for the animation.
     * @param {String} easing 
     * @returns 
     */
    assignPathAnimation(track: string, duration: number = undefined, animation: object = {}, easing: string = undefined) {
        duration ??= 0;
        animation ??= {};
        return new CustomEventInternals.AssignPathAnimation(this.json, track, duration, animation, easing);
    }

    /**
     * Assign a parent to a track.
     * @param {Array} childrenTracks 
     * @param {String} parentTrack 
     * @param {Boolean} worldPositionStays Object stays in the same place after being parented, false by default.
     * @returns 
     */
    assignTrackParent(childrenTracks: string[], parentTrack: string, worldPositionStays: boolean = undefined) {
        return new CustomEventInternals.AssignTrackParent(this.json, childrenTracks, parentTrack, worldPositionStays);
    }

    /**
     * Assign the player to a track.
     * @param {String} track 
     * @returns 
     */
    assignPlayerToTrack(track: string) { return new CustomEventInternals.AssignPlayerToTrack(this.json, track) }

    /**
     * Assign the fog to a track.
     * @param {String} track 
     * @returns 
     */
    assignFogTrack(track: string) { return new CustomEventInternals.AssignFogTrack(this.json, track) }
}