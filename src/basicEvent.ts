// deno-lint-ignore-file no-explicit-any no-namespace adjacent-overload-signatures
import { EASE, EVENT } from './constants.ts';
import { activeDiffGet, Json } from './beatmap.ts';
import { copy, jsonGet, jsonSet, ColorType } from './general.ts';
import { BaseObject } from './object.ts';

export type LightID = number | number[];

export namespace EventInternals {
    export class BaseEvent extends BaseObject {
        constructor(time: number | Json) {
            super()
            this.value = 0;
            if (time instanceof Object) {
                this.json = time;
                return;
            }
            this.time = time;
            this.floatValue = 1;
        }

        /**
        * Push this event to the difficulty
        */
        push(clone = true) {
            activeDiffGet().events.push((clone ? copy(this) : this) as any);
            return this;
        }

        get type() { return this.json.et }
        get value() { return this.json.i }
        get floatValue() { return this.json.f }

        set type(value: number) { this.json.et = value }
        set value(value: number) { this.json.i = value }
        set floatValue(value: number) { this.json.f = value }
    }

    export class LightEvent extends EventInternals.BaseEvent {
        constructor(json: Json, type: number) {
            super(json);
            this.type = type;
        }

        /**
         * Create an event that turns lights off.
         * @returns 
         */
        off(lightID?: LightID) {
            this.value = EVENT.OFF;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that turns lights on.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        on(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_ON : EVENT.RED_ON;
            if (typeof color !== "boolean") this.color = color;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that flashes the lights.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        flash(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_FLASH : EVENT.RED_FLASH;
            if (typeof color !== "boolean") this.color = color;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that fades the lights out.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        fade(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_FADE : EVENT.RED_FADE;
            if (typeof color !== "boolean") this.color = color;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that makes the lights fade in to this color from the previous.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        in(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_IN : EVENT.RED_IN;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) }

        get lightID() { return jsonGet(this.json, "customData.lightID") }
        get color() { return jsonGet(this.json, "customData.color") }
        get easing() { return jsonGet(this.json, "customData.easing") }
        get lerpType() { return jsonGet(this.json, "customData.lerpType") }

        set lightID(value: LightID) { jsonSet(this.json, "customData.lightID", value) }
        set color(value: ColorType) { jsonSet(this.json, "customData.color", value) }
        set easing(value: EASE) { jsonSet(this.json, "customData.easing", value) }
        set lerpType(value: string) { jsonSet(this.json, "customData.lerpType", value) }
    }

    export class LaserSpeedEvent extends EventInternals.BaseEvent {
        constructor(json: Json, type: number, speed: number, direction?: number, lockRotation?: boolean) {
            super(json);
            this.type = type;

            if (speed % 1 === 0) this.value = speed;
            else this.speed = speed;
            if (direction !== undefined) this.direction = direction;
            if (lockRotation !== undefined) this.lockRotation = lockRotation;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) }

        get lockRotation() { return jsonGet(this.json, "customData.lockRotation") }
        get speed() { return jsonGet(this.json, "customData.speed") }
        get direction() { return jsonGet(this.json, "customData.direction") }

        set lockRotation(value: boolean) { jsonSet(this.json, "customData.lockRotation", value) }
        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
        set direction(value: number) { jsonSet(this.json, "customData.direction", value) }
    }

    export class RingZoomEvent extends EventInternals.BaseEvent {
        constructor(json: Json, step?: number, speed?: number) {
            super(json);
            this.type = EVENT.RING_ZOOM;

            if (step !== undefined) this.step = step;
            if (speed !== undefined) this.speed = speed;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) }

        get step() { return jsonGet(this.json, "customData.step") }
        get speed() { return jsonGet(this.json, "customData.speed") }

        set step(value: number) { jsonSet(this.json, "customData.step", value) }
        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
    }

    export class RingSpinEvent extends EventInternals.BaseEvent {
        constructor(json: Json, rotation?: number, direction?: number, step?: number, speed?: number, prop?: number, nameFilter?: string) {
            super(json);
            this.type = EVENT.RING_SPIN;

            if (rotation !== undefined) this.rotation = rotation;
            if (direction !== undefined) this.direction = direction;
            if (step !== undefined) this.step = step;
            if (speed !== undefined) this.speed = speed;
            if (prop !== undefined) this.prop = prop;
            if (nameFilter !== undefined) this.nameFilter = nameFilter;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) }

        get speed() { return jsonGet(this.json, "customData.speed") }
        get direction() { return jsonGet(this.json, "customData.direction") }
        get nameFilter() { return jsonGet(this.json, "customData.nameFilter") }
        get rotation() { return jsonGet(this.json, "customData.rotation") }
        get step() { return jsonGet(this.json, "customData.step") }
        get prop() { return jsonGet(this.json, "customData.prop") }

        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
        set direction(value: number) { jsonSet(this.json, "customData.direction", value) }
        set nameFilter(value: string) { jsonSet(this.json, "customData.nameFilter", value) }
        set rotation(value: number) { jsonSet(this.json, "customData.rotation", value) }
        set step(value: number) { jsonSet(this.json, "customData.step", value) }
        set prop(value: number) { jsonSet(this.json, "customData.prop", value) }
    }

    export class RotationEvent extends EventInternals.BaseEvent {
        constructor(json: Json, type: number, rotation: number) {
            super(json);
            this.type = type;
            this.value = (EVENT as Json)[`${(rotation < 0 ? "CCW_" : "CW_") + Math.abs(rotation)}`];
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) }
    }

    export class AbstractEvent extends EventInternals.BaseEvent {
        get lockRotation() { return jsonGet(this.json, "customData.lockRotation") }
        get lightID() { return jsonGet(this.json, "customData.lightID") }
        get color() { return jsonGet(this.json, "customData.color") }
        get easing() { return jsonGet(this.json, "customData.easing") }
        get lerpType() { return jsonGet(this.json, "customData.lerpType") }
        get speed() { return jsonGet(this.json, "customData.speed") }
        get direction() { return jsonGet(this.json, "customData.direction") }
        get nameFilter() { return jsonGet(this.json, "customData.nameFilter") }
        get rotation() { return jsonGet(this.json, "customData.rotation") }
        get step() { return jsonGet(this.json, "customData.step") }
        get prop() { return jsonGet(this.json, "customData.prop") }

        set lockRotation(value: boolean) { jsonSet(this.json, "customData.lockRotation", value) }
        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
        set direction(value: number) { jsonSet(this.json, "customData.direction", value) }
        set nameFilter(value: string) { jsonSet(this.json, "customData.nameFilter", value) }
        set rotation(value: number) { jsonSet(this.json, "customData.rotation", value) }
        set step(value: number) { jsonSet(this.json, "customData.step", value) }
        set prop(value: number) { jsonSet(this.json, "customData.prop", value) }
        set lightID(value: LightID) { jsonSet(this.json, "customData.lightID", value) }
        set color(value: ColorType) { jsonSet(this.json, "customData.color", value) }
        set easing(value: EASE) { jsonSet(this.json, "customData.easing", value) }
        set lerpType(value: string) { jsonSet(this.json, "customData.lerpType", value) }
    }
}

export class Event extends EventInternals.BaseEvent {
    /**
     * Event object for ease of creation.
     * @param {Object} time
     */
    constructor(time = 0) { super(time) }

    setType(type: number) { return new EventInternals.LightEvent(this.json, type) }

    /**
     * Controls the back lasers.
     * @returns 
     */
    backLasers() { return new EventInternals.LightEvent(this.json, EVENT.BACK_LASERS) }

    /**
     * Controls the ring lights.
     * @returns 
     */
    ringLights() { return new EventInternals.LightEvent(this.json, EVENT.RING_LIGHTS) }

    /**
     * Controls the left lasers.
     * @returns 
     */
    leftLasers() { return new EventInternals.LightEvent(this.json, EVENT.LEFT_LASERS) }

    /**
     * Controls the right lasers.
     * @returns 
     */
    rightLasers() { return new EventInternals.LightEvent(this.json, EVENT.RIGHT_LASERS) }

    /**
     * Controls the center lasers.
     * @returns 
     */
    centerLasers() { return new EventInternals.LightEvent(this.json, EVENT.CENTER_LASERS) }

    /**
     * Controls the extra left lasers in some environments.
     * @returns 
     */
    extraLeft() { return new EventInternals.LightEvent(this.json, EVENT.LEFT_EXTRA) }

    /**
     * Controls the extra right lasers in some environments.
     * @returns 
     */
    extraRight() { return new EventInternals.LightEvent(this.json, EVENT.RIGHT_EXTRA) }

    /**
     * Controls the left lasers in the Billie environment.
     * @returns 
     */
    billieLeft() { return new EventInternals.LightEvent(this.json, EVENT.BILLIE_LEFT) }

    /**
     * Controls the right lasers in the Billie environment.
     * @returns 
     */
    billieRight() { return new EventInternals.LightEvent(this.json, EVENT.BILLIE_RIGHT) }

    /**
     * Create an event using JSON.
     * @param {Object} json 
     * @returns {AbstractEvent}
     */
    import(json: Json) { return new EventInternals.AbstractEvent(json) }

    /**
     * Create an event with no particular identity.
    * @returns {AbstractEvent};
    */
    abstract() { return this.import({}) }

    /**
     * Move cars in the interscope environment.
     * @param {Number} value 
     * @returns 
     */
    moveCars(value: number) {
        this.type = EVENT.RING_SPIN;
        this.value = value;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Lower the hydraulics of the cars in the interscope environment.
     * @returns 
     */
    lowerHydraulics() {
        this.type = EVENT.LOWER_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Raise the hydraulics of the cars in the interscope environment.
     * @returns 
     */
    raiseHydraulics() {
        this.type = EVENT.RAISE_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Spin the rings in an environment.
     * @param {Number} rotation 
     * @param {Number} direction 
     * @param {Number} step 
     * @param {Number} speed 
     * @param {Number} prop 
     * @param {String} nameFilter 
     * @returns 
     */
    ringSpin(
        rotation?: number,
        direction?: number,
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ) {
        return new EventInternals.RingSpinEvent(this.json, rotation, direction, step, speed, prop, nameFilter);
    }

    /**
     * Control the zoom of the rings.
     * @param {Number} step 
     * @param {Number} speed 
     * @returns 
     */
    ringZoom(step?: number, speed?: number) { return new EventInternals.RingZoomEvent(this.json, step, speed) }

    /**
     * Control the movement speed of the left lasers.
     * @param {Number} speed When containing decimals, the noodle data will be used for speed.
     * @param {Number} direction 
     * @param {Boolean} lockRotation 
     * @returns 
     */
    leftLaserSpeed(speed: number, direction?: number, lockRotation?: boolean) {
        return new EventInternals.LaserSpeedEvent(this.json, EVENT.LEFT_SPEED, speed, direction, lockRotation);
    }

    /**
     * Control the movement speed of the right lasers.
     * @param {Number} speed When containing decimals, the noodle data will be used for speed.
     * @param {Number} direction 
     * @param {Boolean} lockRotation 
     * @returns 
     */
    rightLaserSpeed(speed: number, direction?: number, lockRotation?: boolean) {
        return new EventInternals.LaserSpeedEvent(this.json, EVENT.RIGHT_SPEED, speed, direction, lockRotation);
    }

    /**
     * Used for 360 mode, rotates future objects and active objects.
     * @param {Number} rotation 
     * @returns 
     */
    earlyRotation(rotation: number) { return new EventInternals.RotationEvent(this.json, EVENT.EARLY_ROTATION, rotation) }

    /**
     * Used for 360 mode, rotates future objects only.
     * @param {Number} rotation 
     * @returns 
     */
    lateRotation(rotation: number) { return new EventInternals.RotationEvent(this.json, EVENT.LATE_ROTATION, rotation) }
}