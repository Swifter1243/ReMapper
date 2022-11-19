// deno-lint-ignore-file no-namespace no-explicit-any adjacent-overload-signatures
import { copy, jsonGet, jsonSet, Vec3 } from './general.ts';
import { activeDiffGet, Json } from './beatmap.ts';
import { AnimationInternals, Animation, TrackValue, Track, KeyframesLinear, KeyframesColor } from './animation.ts';
import { ANIMATOR_PROP_TYPE, EASE, FILEPATH, MATERIAL_PROP_TYPE } from './constants.ts';
import { BloomFogEnvironment, ILightWithId, TubeBloomPrePassLight } from './environment.ts';

export type Property<T, V> =  {
    /** Name of the property. */
    name: string,
    /** Type of the property. */
    type: T,
    /** Value to set the property to. */
    value: V
}

/** A valid value for material properties. */
export type MaterialPropertyValue = FILEPATH | KeyframesLinear | KeyframesColor;
/** A valid value for animator properties. */
export type AnimatorPropertyValue = boolean | KeyframesLinear;
/** A property for a material. */
export type MaterialProperty = Property<MATERIAL_PROP_TYPE, MaterialPropertyValue>;
/** A property for an animator. */
export type AnimatorProperty = Property<ANIMATOR_PROP_TYPE, AnimatorPropertyValue>;

export namespace CustomEventInternals {
    export class BaseEvent {
        /** The Json for this event. */
        json: any = {
            b: 0,
            t: "",
            d: {}
        };

        constructor(time: number | Json) {
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
        get time() { return this.json.b }
        /** The type of this event. */
        get type() { return this.json.t }
        /** The data of this event. */
        get data() { return this.json.d }

        set time(value: number) { this.json.b = value }
        set type(value: string) { this.json.t = value }
        set data(value: Json) { this.json.d = value }
    }

    class BaseIdentityEvent extends BaseEvent {
        /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
        abstract() { return new CustomEvent().import(this.json) }
    }


    export class AnimateTrack extends BaseIdentityEvent {
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
        constructor(json: Json, track?: TrackValue, duration?: number, animation?: Json, easing?: EASE) {
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
        setProperties(data: Json) {
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
         * @param animation Animation to apply.
         */
        importAnimation(animation: AnimationInternals.BaseAnimation) {
            this.setProperties(animation.json);
            this.duration = animation.length;
            this.animate.length = animation.length;
            return this;
        }

        /** The track class for this event.
         * Please read the properties of this class to see how it works.
         */
        get track() { return new Track(this.data) }
        /** The duration of the animation. */
        get duration() { return this.data.duration }
        /** The easing on this event's animation. */
        get easing() { return this.data.easing }
        /** The amount of times to repeat this event. */
        get repeat() { return this.data.repeat }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set repeat(value: number) { this.data.repeat = value }
    }

    export class AssignPathAnimation extends BaseIdentityEvent {
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
        constructor(json: Json, track?: TrackValue, duration?: number, animation?: Json, easing?: EASE) {
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
        setProperties(data: Json) {
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
         * @param animation Animation to apply.
         */
        importAnimation(animation: AnimationInternals.BaseAnimation) {
            this.setProperties(animation.json);
            this.duration = animation.length;
            this.animate.length = animation.length;
            return this;
        }

        /** The track class for this event.
         * Please read the properties of this class to see how it works.
         */
        get track() { return new Track(this.data) }
        /** The time to transition from a previous path to this one. */
        get duration() { return this.data.duration }
        /** The easing on this event's animation. */
        get easing() { return this.data.easing }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
    }

    export class AssignTrackParent extends BaseIdentityEvent {
        /**
         * Assign tracks to a parent track.
         * @param json Json to import.
         * @param childrenTracks Children tracks to assign.
         * @param parentTrack Name of the parent track.
         * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
         */
        constructor(json: Json, childrenTracks: string[], parentTrack: string, worldPositionStays?: boolean) {
            super(json);
            this.type = "AssignTrackParent";
            this.childrenTracks = childrenTracks;
            this.parentTrack = parentTrack;

            if (worldPositionStays !== undefined) this.worldPositionStays = worldPositionStays;
        }

        /** Children tracks to assign. */
        get childrenTracks() { return this.data.childrenTracks }
        /** Name of the parent track. */
        get parentTrack() { return this.data.parentTrack }
        /** Modifies the transform of children objects to remain in the same place relative to world space. */
        get worldPositionStays() { return this.data.worldPositionStays }

        set childrenTracks(value: string[]) { this.data.childrenTracks = value }
        set parentTrack(value: string) { this.data.parentTrack = value }
        set worldPositionStays(value: boolean) { this.data.worldPositionStays = value }
    }

    export class AssignPlayerToTrack extends BaseIdentityEvent {
        /**
         * Assigns the player to a track.
         * @param json Json to import.
         * @param track Track the player will be assigned to.
         */
        constructor(json: Json, track?: string) {
            super(json);
            this.type = "AssignPlayerToTrack";
            if (track) this.track = track;
        }

        /** Track the player will be assigned to. */
        get track() { return this.data.track }

        set track(value: string) { this.data.track = value }
    }

    export class AnimateComponent extends BaseIdentityEvent {
        /**
         * Animate components on a track.
         * @param json Json to import.
         * @param track Track(s) to effect.
         * @param duration Duration of the animation.
         * @param easing The easing on the animation.
         */
        constructor(json: Json, track?: TrackValue, duration?: number, easing?: EASE) {
            super(json);
            this.type = "AnimateComponent";
            if (track) this.track.value = track;
            if (duration) this.duration = duration;
            if (easing) this.easing = easing;
        }

        /** The track class for this event.
         * Please read the properties of this class to see how it works.
         */
        get track() { return new Track(this.data) }
        /** The duration of the animation. */
        get duration() { return this.data.duration }
        /** The easing on this event's animation. */
        get easing() { return this.data.easing }
        /** The "ILightWithId" component to animate. */
        get lightID() { return jsonGet(this.data, "ILightWithId", {}) }
        /** The "BloomFogEnvironment" component to animate. */
        get fog() { return jsonGet(this.data, "BloomFogEnvironment", {}) }
        /** The "TubeBloomPrePassLight component to animate." */
        get lightMultiplier() { return jsonGet(this.data, "TubeBloomPrePassLight", {}) }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set lightID(value: ILightWithId<KeyframesLinear>) { jsonSet(this.data, "ILightWithId", value) }
        set fog(value: BloomFogEnvironment<KeyframesLinear>) { jsonSet(this.data, "BloomFogEnvironment", value) }
        set lightMultiplier(value: TubeBloomPrePassLight<KeyframesLinear>) { jsonSet(this.data, "TubeBloomPrePassLight", value) }
    }

    export class SetMaterialProperty extends BaseIdentityEvent {
        /**
         * Set properties on a material.
         * @param json Json to import.
         * @param asset File path to the material.
         * @param properties Properties to set.
         * @param duration The duration of the animation.
         * @param easing An easing for the animation to follow.
         */
        constructor(json: Json, asset: string, properties: MaterialProperty[], duration?: number, easing?: EASE) {
            super(json);
            this.type = "SetMaterialProperty";
            this.asset = asset;
            this.properties = properties;
            if (duration) this.duration = duration;
            if (easing) this.easing = easing;
        }

        /** File path to the material. */
        get asset() { return this.data.asset }
        /** The duration of the animation. */
        get duration() { return this.data.duration }
        /** An easing for the animation to follow. */
        get easing() { return this.data.easing }
        /** Properties to set. */
        get properties() { return this.data.properties }

        set asset(value: FILEPATH) { this.data.asset = value }
        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set properties(value: MaterialProperty[]) { this.data.properties = value }
    }

    export class ApplyPostProcessing extends BaseIdentityEvent {
        /**
         * Assigns a material to the camera and allows you to call a SetMaterialProperty from within.
         * @param json Json to import.
         * @param asset File path to the material.
         * @param properties Properties to set.
         * @param duration The duration of the animation.
         * @param easing An easing for the animation to follow.
         */
        constructor(json: Json, asset: string, properties: MaterialProperty[], duration?: number, easing?: EASE) {
            super(json);
            this.type = "ApplyPostProcessing";
            this.asset = asset;
            this.properties = properties;
            if (duration) this.duration = duration;
            if (easing) this.easing = easing;
        }

        /** File path to the material. */
        get asset() { return this.data.asset }
        /** The duration of the animation. */
        get duration() { return this.data.duration }
        /** An easing for the animation to follow. */
        get easing() { return this.data.easing }
        /** Properties to set. */
        get properties() { return this.data.properties }
        /** Which order to run current active post processing effects.
         * Higher post priority will run first.
         */
        get priority() { return this.data.priority }
        /** Which pass in the shader. */
        get pass() { return this.data.pass }
        /** Which render texture to save to. 
         * Default is "_Main", which is reserved for the camera. */
        get target() { return this.data.target }

        set asset(value: FILEPATH) { this.data.asset = value }
        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set properties(value: MaterialProperty[]) { this.data.properties = value }
        set priority(value: number) { this.data.priority = value }
        set pass(value: number) { this.data.pass = value }
        set target(value: string) { this.data.target = value }
    }

    export class DeclareCullingMask extends BaseIdentityEvent {
        /**
         * Declares a culling mask where selected tracks are culled.
         * Vivify will automatically create a texture for you to sample from your shader
         * @param json Json to import.
         * @param name Name of the culling mask, this is what you must name your sampler in your shader.
         * @param track The track(s) to target for culling.
         * @param whitelist Culls everything but the selected tracks.
         */
        constructor(json: Json, name: string, track: TrackValue, whitelist?: boolean) {
            super(json);
            this.type = "DeclareCullingMask";
            this.name = name;
            this.track.value = track;
            if (whitelist) this.whitelist = whitelist;
        }

        /** Name of the culling mask, this is what you must name your sampler in your shader. */
        get name() { return this.data.name }
        /** The track class for this event.
        * Please read the properties of this class to see how it works.
        */
        get track() { return new Track(this.data) }
        /** Culls everything but the selected tracks. */
        get whitelist() { return this.data.whitelist }

        set name(value: string) { this.data.name = value }
        set whitelist(value: boolean) { this.data.whitelist = value }
    }

    export class DeclareRenderTexture extends BaseIdentityEvent {
        /**
         * Declare a RenderTexture to be used anywhere.
         * They are set as a global variable and can be accessed by declaring a sampler named what you put in "name".
         * Depth texture can be obtained by adding the suffix "_Depth" to your sampler.
         * @param json Json to import.
         * @param name Name of the depth texture.
         * @param width Exact width for the texture.
         * @param height Exact height for the texture.
         */
        constructor(json: Json, name: string, width: number, height: number) {
            super(json);
            this.type = "DeclareRenderTexture";
            this.name = name;
            this.width = width;
            this.height = height;
        }

        /** Name of the depth texture. */
        get name() { return this.data.name }
        /** Number to divide screen width by. */
        get xRatio() { return this.data.xRatio }
        /** Number to divide screen height by. */
        get yRatio() { return this.data.yRatio }
        /** Exact width for the texture. */
        get width() { return this.data.width }
        /** Exact height for the texture. */
        get height() { return this.data.height }

        set name(value: string) { this.data.name = value }
        set xRatio(value: number) { this.data.xRatio = value }
        set yRatio(value: number) { this.data.yRatio = value }
        set width(value: number) { this.data.width = value }
        set height(value: number) { this.data.height = value }
    }

    export class InstantiatePrefab extends BaseIdentityEvent {
        /**
         * Instantiate a chosen prefab into the scene.
         * @param json Json to import.
         * @param asset File path to the desired prefab.
         * @param track The track(s) for the prefab.
         * @param id Unique id for referencing prefab later. Random id will be given by default.
         */
        constructor(json: Json, asset: FILEPATH, track?: TrackValue, id?: string) {
            super(json);
            this.type = "InstantiatePrefab";
            this.asset = asset;
            if (track) this.track.value = track;
            if (id) this.id = id;
        }

        /** File path to the desired prefab. */
        get asset() { return this.data.asset }
        /** Unique id for referencing prefab later. Random id will be given by default. */
        get id() { return this.data.id }
        /** The track class for this event.
        * Please read the properties of this class to see how it works.
        */
        get track() { return new Track(this.data) }
        /** Position of the prefab relative to the world. */
        get position() { return this.data.position }
        /** Position of the prefab relative to it's parent. */
        get localPosition() { return this.data.localPosition }
        /** Rotation of the prefab relative to the world. */
        get rotation() { return this.data.rotation }
        /** Rotation of the prefab relative to it's parent. */
        get localRotation() { return this.data.localRotation }
        /** Scale of the prefab. */
        get scale() { return this.data.scale }

        set asset(value: FILEPATH) { this.data.asset = value }
        set id(value: string) { this.data.id = value }
        set position(value: Vec3) { this.data.position = value }
        set localPosition(value: Vec3) { this.data.localPosition = value }
        set rotation(value: Vec3) { this.data.rotation = value }
        set localRotation(value: Vec3) { this.data.localRotation = value }
        set scale(value: Vec3) { this.data.scale = value }
    }

    export class DestroyPrefab extends BaseIdentityEvent {
        /**
         * Will destroy a prefab in the scene.
         * @param json Json to import.
         * @param id Id of the prefab to destroy.
         */
        constructor(json: Json, id: string) {
            super(json);
            this.type = "DestroyPrefab";
            this.id = id;
        }

        /** Id of the prefab to destroy. */
        get id() { return this.data.id }

        set id(value: string) { this.data.id = value }
    }

    export class AbstractEvent extends BaseEvent {
        /** The animation of this event. */
        animate: AnimationInternals.AbstractAnimation;

        /**
         * A custom event that has an unknown type.
         * @param json Json to import.
         */
        constructor(json: Json) {
            super(json);
            this.animate = new Animation().abstract(this.data);
        }

        /**
         * Add properties to the data.
         * @param data Properties to add.
         */
        appendData(data: Json) {
            Object.keys(data).forEach(x => {
                this.json._data[x] = data[x];
            })
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
        get track() { return new Track(this.data) }
        /** The duration of the animation. 
         * Or in the case of AssignPathAnimation,
         * the time to transition from a previous path to this one.  */
        get duration() { return this.data.duration }
        /** The easing on this event's animation.
         * Or in the case of AssignPathAnimation,
         * the easing for the transition from a previous path to this one.  */
        get easing() { return this.data.easing }
        /** Children tracks to assign. AssignTrackParent only. */
        get childrenTracks() { return this.data.childrenTracks }
        /** Name of the parent track. AssignTrackParent only. */
        get parentTrack() { return this.data.parentTrack }
        /** Modifies the transform of children objects to remain in the same place relative to world space. 
         * AssignTrackParent only. */
        get worldPositionStays() { return this.data.worldPositionStays }
        /** The "ILightWithId" component to animate. AnimateComponent only. */
        get lightID() { return jsonGet(this.data, "ILightWithId", {}) }
        /** The "BloomFogEnvironment" component to animate. AnimateComponent only. */
        get fog() { return jsonGet(this.data, "BloomFogEnvironment", {}) }
        /** The "TubeBloomPrePassLight" component to animate. AnimateComponent only. */
        get lightMultiplier() { return jsonGet(this.data, "TubeBloomPrePassLight", {}) }
        /** File path to the relevant asset. 
         * SetMaterialProperty, ApplyPostProcessing & InstantiatePrefab only. */
        get asset() { return this.data.asset }
        /** Properties to set. SetMaterialProperty & ApplyPostProcessing only. */
        get properties() { return this.data.properties }
        /** Which order to run current active post processing effects.
         * Higher post priority will run first.
         * ApplyPostProcessing only.
         */
        get priority() { return this.data.priority }
        /** Which pass in the shader. ApplyPostProcessing only. */
        get pass() { return this.data.pass }
        /** Which render texture to save to. 
         * Default is "_Main", which is reserved for the camera.
         * ApplyPostProcessing only. */
        get target() { return this.data.target }
        /** DeclareCullingMask:
         * Name of the culling mask, this is what you must name your sampler in your shader.
         * DeclareDepthTexture:
         * Name of the depth texture.
         */
        get name() { return this.data.name }
        /** Culls everything but the selected tracks. DeclareCullingMask only. */
        get whitelist() { return this.data.whitelist }
        /** Number to divide screen width by. DeclareRenderTexture only. */
        get xRatio() { return this.data.xRatio }
        /** Number to divide screen height by. DeclareRenderTexture only. */
        get yRatio() { return this.data.yRatio }
        /** Exact width for the texture. DeclareRenderTexture only. */
        get width() { return this.data.width }
        /** Exact height for the texture. DeclareRenderTexture only. */
        get height() { return this.data.height }
        /** InstantiatePrefab: 
         * Unique id for referencing prefab later. Random id will be given by default.
         * DestroyPrefab: Id of the prefab to destroy. */
        get id() { return this.data.id }
        /** Position of the prefab relative to the world. InstantiatePrefab only. */
        get position() { return this.data.position }
        /** Position of the prefab relative to it's parent. InstantiatePrefab only. */
        get localPosition() { return this.data.localPosition }
        /** Rotation of the prefab relative to the world. InstantiatePrefab only. */
        get rotation() { return this.data.rotation }
        /** Rotation of the prefab relative to it's parent. InstantiatePrefab only. */
        get localRotation() { return this.data.localRotation }
        /** Scale of the prefab. InstantiatePrefab only. */
        get scale() { return this.data.scale }

        set duration(value: number) { this.data.duration = value }
        set easing(value: EASE) { this.data.easing = value }
        set childrenTracks(value: string[]) { this.data.childrenTracks = value }
        set parentTrack(value: string) { this.data.parentTrack = value }
        set worldPositionStays(value: boolean) { this.data.worldPositionStays = value }
        set lightID(value: ILightWithId<KeyframesLinear>) { jsonSet(this.data, "ILightWithId", value) }
        set fog(value: BloomFogEnvironment<KeyframesLinear>) { jsonSet(this.data, "BloomFogEnvironment", value) }
        set lightMultiplier(value: TubeBloomPrePassLight<KeyframesLinear>) { jsonSet(this.data, "TubeBloomPrePassLight", value) }
        set asset(value: FILEPATH) { this.data.asset = value }
        set properties(value: MaterialProperty[]) { this.data.properties = value }
        set priority(value: number) { this.data.priority = value }
        set pass(value: number) { this.data.pass = value }
        set target(value: string) { this.data.target = value }
        set name(value: string) { this.data.name = value }
        set whitelist(value: boolean) { this.data.whitelist = value }
        set xRatio(value: number) { this.data.xRatio = value }
        set yRatio(value: number) { this.data.yRatio = value }
        set width(value: number) { this.data.width = value }
        set height(value: number) { this.data.height = value }
        set id(value: string) { this.data.id = value }
        set position(value: Vec3) { this.data.position = value }
        set localPosition(value: Vec3) { this.data.localPosition = value }
        set rotation(value: Vec3) { this.data.rotation = value }
        set localRotation(value: Vec3) { this.data.localRotation = value }
        set scale(value: Vec3) { this.data.scale = value }
    }
}

export class CustomEvent extends CustomEventInternals.BaseEvent {
    /**
     * Custom Event object for ease of creation.
     * @param time Time of the event.
     */
    constructor(time = 0) { super(time) }

    /**
     * Create a custom event using Json.
     * @param json Json to import.
     */
    import(json: Json) { return new CustomEventInternals.AbstractEvent(json) }

    /** Create an event with no particular identity. */
    abstract() { return this.import({}) }

    /**
     * Animate a track.
     * @param track Track(s) to effect.
     * @param duration The duration of the animation.
     * @param animation The animation properties to replace.
     * @param easing The easing on this event's animation.
     */
    animateTrack = (track?: TrackValue, duration?: number, animation?: Json, easing?: EASE) =>
        new CustomEventInternals.AnimateTrack(this.json, track, duration, animation, easing);

    /**
     * Animate objects on a track across their lifespan.
     * @param track Track(s) to effect.
     * @param duration The time to transition from a previous path to this one.
     * @param animation The animation properties to replace.
     * @param easing The easing on this event's animation.
     */
    assignPathAnimation = (track?: TrackValue, duration?: number, animation: Json = {}, easing?: EASE) =>
        new CustomEventInternals.AssignPathAnimation(this.json, track, duration, animation, easing);

    /**
     * Assign tracks to a parent track.
     * @param childrenTracks Children tracks to assign.
     * @param parentTrack Name of the parent track.
     * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
     */
    assignTrackParent = (childrenTracks: string[], parentTrack: string, worldPositionStays?: boolean) =>
        new CustomEventInternals.AssignTrackParent(this.json, childrenTracks, parentTrack, worldPositionStays);

    /**
     * Assigns the player to a track.
     * @param track Track the player will be assigned to.
     */
    assignPlayerToTrack = (track?: string) =>
        new CustomEventInternals.AssignPlayerToTrack(this.json, track)

    /**
     * Animate components on a track.
     * @param track Track(s) to effect.
     * @param duration Duration of the animation.
     * @param easing The easing on the animation.
     */
    animateComponent = (track?: TrackValue, duration?: number, easing?: EASE) =>
        new CustomEventInternals.AnimateComponent(this.json, track, duration, easing);

    /**
     * Set properties on a material.
     * @param asset File path to the material.
     * @param properties Properties to set.
     * @param duration The duration of the animation.
     * @param easing An easing for the animation to follow.
     */
    setMaterialProperty = (asset: string, properties: MaterialProperty[], duration?: number, easing?: EASE) =>
        new CustomEventInternals.SetMaterialProperty(this.json, asset, properties, duration, easing);

    /**
     * Assigns a material to the camera and allows you to call a SetMaterialProperty from within.
     * @param asset File path to the material.
     * @param properties Properties to set.
     * @param duration The duration of the animation.
     * @param easing An easing for the animation to follow.
     */
    applyPostProcessing = (asset: string, properties: MaterialProperty[], duration?: number, easing?: EASE) =>
        new CustomEventInternals.ApplyPostProcessing(this.json, asset, properties, duration, easing);

    /**
     * Declares a culling mask where selected tracks are culled.
     * Vivify will automatically create a texture for you to sample from your shader
     * @param json Json to import.
     * @param name Name of the culling mask, this is what you must name your sampler in your shader.
     * @param track The track(s) to target for culling.
     * @param whitelist Culls everything but the selected tracks.
     */
    declareCullingMask = (name: string, track: TrackValue, whitelist?: boolean) =>
        new CustomEventInternals.DeclareCullingMask(this.json, name, track, whitelist);

    /**
     * Declare a RenderTexture to be used anywhere.
     * They are set as a global variable and can be accessed by declaring a sampler named what you put in "name".
     * Depth texture can be obtained by adding the suffix "_Depth" to your sampler.
     * @param name Name of the depth texture.
     * @param width Exact width for the texture.
     * @param height Exact height for the texture.
     */
    declareRenderTexture = (name: string, width: number, height: number) =>
        new CustomEventInternals.DeclareRenderTexture(this.json, name, width, height);

    /**
     * Instantiate a chosen prefab into the scene.
     * @param asset File path to the desired prefab.
     * @param track The track(s) for the prefab.
     * @param id Unique id for referencing prefab later. Random id will be given by default.
     */
    instantiatePrefab = (asset: FILEPATH, track?: TrackValue, id?: string) =>
        new CustomEventInternals.InstantiatePrefab(this.json, asset, track, id);

    /**
     * Will destroy a prefab in the scene.
     * @param id Id of the prefab to destroy.
     */
    destroyPrefab = (id: string) =>
        new CustomEventInternals.DestroyPrefab(this.json, id);
}