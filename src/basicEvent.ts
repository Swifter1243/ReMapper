// deno-lint-ignore-file no-explicit-any no-namespace adjacent-overload-signatures
import { EASE, EVENTGROUP, EVENTACTION, ROTATIONACTION, INTERSCOPEGROUP } from './constants.ts';
import { activeDiffGet, Json } from './beatmap.ts';
import { copy, jsonGet, jsonSet, ColorType } from './general.ts';
import { BaseObject } from './object.ts';

export type LightID = number | number[];

export namespace EventInternals {
    export class BaseEvent extends BaseObject {
        /** The bare minimum event. */
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

        /** Push this event to the difficulty 
         * @param clone Whether this object will be copied before being pushed.
        */
        push(clone = true) {
            activeDiffGet().events.push((clone ? copy(this) : this) as any);
            return this;
        }

        /** The type of the event. */
        get type() { return this.json.et }
        /** The value of the event. */
        get value() { return this.json.i }
        /** The value of the event, but allowing decimals. */
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

        /** Create an event that turns lights off
         * @param lightID The lightIDs to target.
         */
        off(lightID?: LightID) {
            this.value = EVENTACTION.OFF;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that turns lights on.
         * @param color Can be boolean to determine if the light is blue (true), or a color.
         * @param lightID The lightIDs to target.
         */
        on(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENTACTION.BLUE_ON : EVENTACTION.RED_ON;
            if (typeof color !== "boolean") this.color = color;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that flashes the lights.
         * @param color Can be boolean to determine if the light is blue (true), or a color.
         * @param lightID The lightIDs to target.
         */
        flash(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENTACTION.BLUE_FLASH : EVENTACTION.RED_FLASH;
            if (typeof color !== "boolean") this.color = color;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that fades the lights out.
         * @param color Can be boolean to determine if the light is blue (true), or a color.
         * @param lightID The lightIDs to target.
         */
        fade(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENTACTION.BLUE_FADE : EVENTACTION.RED_FADE;
            if (typeof color !== "boolean") this.color = color;
            if (lightID) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that makes the lights fade in to this color from the previous.
         * @param color Can be boolean to determine if the light is blue (true), or a color.
         * @param lightID The lightIDs to target.
         * @returns 
         */
        in(color: ColorType | boolean = true, lightID?: LightID) {
            this.value = (typeof color === "boolean" && color) ? EVENTACTION.BLUE_IN : EVENTACTION.RED_IN;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }

        /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
        abstract() { return new Event().import(this.json) }

        /** The lightIDs to target. */
        get lightID() { return jsonGet(this.json, "customData.lightID") }
        /** The color of the event. */
        get color() { return jsonGet(this.json, "customData.color") }
        /** The easing for transition events. Goes on start event. */
        get easing() { return jsonGet(this.json, "customData.easing") }
        /** The color interpolation for transition events. Goes on start event. */
        get lerpType() { return jsonGet(this.json, "customData.lerpType") }

        set lightID(value: LightID) { jsonSet(this.json, "customData.lightID", value) }
        set color(value: ColorType) { jsonSet(this.json, "customData.color", value) }
        set easing(value: EASE) { jsonSet(this.json, "customData.easing", value) }
        set lerpType(value: "RGB" | "HSV") { jsonSet(this.json, "customData.lerpType", value) }
    }

    export class LaserSpeedEvent extends EventInternals.BaseEvent {
        /**
         * Controls rotating laser speed.
         * @param json Json to import.
         * @param type Type of the event.
         * @param speed Speed of the rotating lasers.
         * @param direction Direction of the rotating lasers.
         * @param lockRotation Whether the existing rotation should be kept.
         */
        constructor(json: Json, type: number, speed: number, direction?: number, lockRotation?: boolean) {
            super(json);
            this.type = type;

            if (speed % 1 === 0) this.value = speed;
            else this.speed = speed;
            if (direction !== undefined) this.direction = direction;
            if (lockRotation !== undefined) this.lockRotation = lockRotation;
        }

        /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
        abstract() { return new Event().import(this.json) }

        /** Whether the existing rotation should be kept. */
        get lockRotation() { return jsonGet(this.json, "customData.lockRotation") }
        /** Speed of the rotating lasers. */
        get speed() { return jsonGet(this.json, "customData.speed") }
        /** Direction of the rotating lasers. */
        get direction() { return jsonGet(this.json, "customData.direction") }

        set lockRotation(value: boolean) { jsonSet(this.json, "customData.lockRotation", value) }
        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
        set direction(value: number) { jsonSet(this.json, "customData.direction", value) }
    }

    export class RingZoomEvent extends EventInternals.BaseEvent {
        /**
         * Controls ring zoom.
         * @param json Json to import.
         * @param step The position offset between each ring.
         * @param speed The speed of the zoom.
         */
        constructor(json: Json, step?: number, speed?: number) {
            super(json);
            this.type = EVENTGROUP.RING_ZOOM;

            if (step !== undefined) this.step = step;
            if (speed !== undefined) this.speed = speed;
        }

        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) }

        /** The position offset between each ring. */
        get step() { return jsonGet(this.json, "customData.step") }
        /** The speed of the zoom. */
        get speed() { return jsonGet(this.json, "customData.speed") }

        set step(value: number) { jsonSet(this.json, "customData.step", value) }
        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
    }

    export class RingSpinEvent extends EventInternals.BaseEvent {
        /**
         * Controls spinning the rings.
         * @param json Json to import.
         * @param rotation Degrees of the spin.
         * @param direction Direction of the spin. 1 is clockwise, 0 is counterclockwise.
         * @param step The angle between each ring.
         * @param speed The speed multiplier of the spin.
         * @param prop The rate at which physics propogate through the rings.
         * High values will cause rings to move simultneously, low values gives them significant delay.
         * @param nameFilter The ring object name to target.
         */
        constructor(json: Json, rotation?: number, direction?: number, step?: number, speed?: number, prop?: number, nameFilter?: string) {
            super(json);
            this.type = EVENTGROUP.RING_SPIN;

            if (rotation !== undefined) this.rotation = rotation;
            if (direction !== undefined) this.direction = direction;
            if (step !== undefined) this.step = step;
            if (speed !== undefined) this.speed = speed;
            if (prop !== undefined) this.prop = prop;
            if (nameFilter !== undefined) this.nameFilter = nameFilter;
        }

        /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
        abstract() { return new Event().import(this.json) }

        /** The speed multiplier of the spin. */
        get speed() { return jsonGet(this.json, "customData.speed") }
        /** Direction of the spin. 1 is clockwise, 0 is counterclockwise. */
        get direction() { return jsonGet(this.json, "customData.direction") }
        /** The ring object name to target. */
        get nameFilter() { return jsonGet(this.json, "customData.nameFilter") }
        /** Degrees of the spin. */
        get rotation() { return jsonGet(this.json, "customData.rotation") }
        /** The angle between each ring. */
        get step() { return jsonGet(this.json, "customData.step") }
        /** The rate at which physics propogate through the rings.
         * High values will cause rings to move simultneously, low values gives them significant delay.
         */
        get prop() { return jsonGet(this.json, "customData.prop") }

        set speed(value: number) { jsonSet(this.json, "customData.speed", value) }
        set direction(value: number) { jsonSet(this.json, "customData.direction", value) }
        set nameFilter(value: string) { jsonSet(this.json, "customData.nameFilter", value) }
        set rotation(value: number) { jsonSet(this.json, "customData.rotation", value) }
        set step(value: number) { jsonSet(this.json, "customData.step", value) }
        set prop(value: number) { jsonSet(this.json, "customData.prop", value) }
    }

    export class RotationEvent extends EventInternals.BaseEvent {
        /**
         * Event to spin the gameplay objects in the map.
         * The new rotation events should be used instead.
         * @param json Json to import.
         * @param type Type of the event.
         * @param rotation The rotation of the event.
         * Must be a multiple of 15 between -60 and 60.
         */
        constructor(json: Json, type: number, rotation: number) {
            super(json);
            this.type = type;
            this.value = (ROTATIONACTION as Json)[`${(rotation < 0 ? "CCW_" : "CW_") + Math.abs(rotation)}`];
        }

        /** Remove the subclass of the event, giving access to all properties, but can allow for invalid data. */
        abstract() { return new Event().import(this.json) }
    }

    export class AbstractEvent extends EventInternals.BaseEvent {
        /** Whether the existing rotation should be kept. */
        get lockRotation() { return jsonGet(this.json, "customData.lockRotation") }
        /** The lightIDs to target. */
        get lightID() { return jsonGet(this.json, "customData.lightID") }
        /** The color of the event. */
        get color() { return jsonGet(this.json, "customData.color") }
        /** The easing for transition events. Goes on start event. */
        get easing() { return jsonGet(this.json, "customData.easing") }
        /** The color interpolation for transition events. Goes on start event. */
        get lerpType() { return jsonGet(this.json, "customData.lerpType") }
        /** The speed of the event. Only for ring spins & zooms, and laser rotations. */
        get speed() { return jsonGet(this.json, "customData.speed") }
        /** Direction of the spin/lasers. Only for laser rotations and ring spins. */
        get direction() { return jsonGet(this.json, "customData.direction") }
        /** The ring object name to target. Only for ring spins. */
        get nameFilter() { return jsonGet(this.json, "customData.nameFilter") }
        /** Degrees of the spin. Only for ring spins. */
        get rotation() { return jsonGet(this.json, "customData.rotation") }
        /** The angle between each ring. Only for ring spins. */
        get step() { return jsonGet(this.json, "customData.step") }
        /** The rate at which physics propogate through the rings.
        * High values will cause rings to move simultneously, low values gives them significant delay.
        * Only for ring spins.
        */
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
     * The starting event class builder.
     * From this point you should select one of the attached methods to continue initialization.
     * @param time Time of the event.
     */
    constructor(time = 0) { super(time) }

    /**
     * Iniitialize an event from a type.
     * @param type The type of the event.
     */
    setType(type: number) { return new EventInternals.LightEvent(this.json, type) }

    /** Controls the back lasers. (Type 0) */
    backLasers = () => new EventInternals.LightEvent(this.json, EVENTGROUP.BACK_LASERS)

    /** Controls the ring lights. (Type 1) */
    ringLights = () => new EventInternals.LightEvent(this.json, EVENTGROUP.RING_LIGHTS)

    /** Controls the left lasers. (Type 2) */
    leftLasers = () => new EventInternals.LightEvent(this.json, EVENTGROUP.LEFT_LASERS)

    /** Controls the right lasers. (Type 3) */
    rightLasers = () => new EventInternals.LightEvent(this.json, EVENTGROUP.RIGHT_LASERS)

    /** Controls the center lasers. (Type 4) */
    centerLasers = () => new EventInternals.LightEvent(this.json, EVENTGROUP.CENTER_LASERS)

    /** Controls the extra left lasers in some environments. (Type 6) */
    extraLeft = () => new EventInternals.LightEvent(this.json, EVENTGROUP.LEFT_EXTRA)

    /** Controls the extra right lasers in some environments. (Type 7) */
    extraRight = () => new EventInternals.LightEvent(this.json, EVENTGROUP.RIGHT_EXTRA)

    /** Controls the left lasers in the Billie environment. (Type 10) */
    billieLeft = () => new EventInternals.LightEvent(this.json, EVENTGROUP.BILLIE_LEFT)

    /** Controls the right lasers in the Billie environment. (Type 11) */
    billieRight = () => new EventInternals.LightEvent(this.json, EVENTGROUP.BILLIE_RIGHT)

    /** Controls the outer left tower height in the Gaga environment. (Type 18) */
    gagaLeft = () => new EventInternals.LightEvent(this.json, EVENTGROUP.GAGA_LEFT)

    /** Controls the outer left tower height in the Gaga environment. (Type 19) */
    gagaRight = () => new EventInternals.LightEvent(this.json, EVENTGROUP.GAGA_RIGHT)

    /**
     * Create an event using Json.
     * @param json The Json to import.
     */
    import = (json: Json) => new EventInternals.AbstractEvent(json)

    /** Create an event with no particular identity. */
    abstract = () => this.import({});

    /**
     * Move cars in the interscope environment.
     * @param value The group of cars to target.
     */
    moveCars(value: INTERSCOPEGROUP) {
        this.type = EVENTGROUP.RING_SPIN;
        this.value = value;
        return new EventInternals.BaseEvent(this.json);
    }

    /** Lower the hydraulics of the cars in the interscope environment. */
    lowerHydraulics() {
        this.type = EVENTGROUP.LOWER_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    /** Raise the hydraulics of the cars in the interscope environment. */
    raiseHydraulics() {
        this.type = EVENTGROUP.RAISE_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Spin the rings of an environment.
     * @param rotation Degrees of the spin.
     * @param direction Direction of the spin. 1 is clockwise, 0 is counterclockwise.
     * @param step The angle between each ring.
     * @param speed The speed multiplier of the spin.
     * @param prop The rate at which physics propogate through the rings.
     * High values will cause rings to move simultneously, low values gives them significant delay.
     * @param nameFilter The ring object name to target.
     */
    ringSpin = (
        rotation?: number,
        direction?: number,
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ) => new EventInternals.RingSpinEvent(
        this.json,
        rotation,
        direction,
        step,
        speed,
        prop,
        nameFilter
    );

    /**
     * Controls ring zoom.
     * @param step The position offset between each ring.
     * @param speed The speed of the zoom.
     */
    ringZoom = (step?: number, speed?: number) =>
        new EventInternals.RingZoomEvent(this.json, step, speed)

    /**
     * Controls left rotating laser speed.
     * @param speed Speed of the rotating lasers.
     * @param direction Direction of the rotating lasers.
     * @param lockRotation Whether the existing rotation should be kept.
     */
    leftLaserSpeed = (
        speed: number,
        direction?: number,
        lockRotation?: boolean
    ) => new EventInternals.LaserSpeedEvent(
        this.json,
        EVENTGROUP.LEFT_ROTATING,
        speed,
        direction,
        lockRotation
    );

    /**
     * Controls right rotating laser speed.
     * @param speed Speed of the rotating lasers.
     * @param direction Direction of the rotating lasers.
     * @param lockRotation Whether the existing rotation should be kept.
     */
    rightLaserSpeed = (
        speed: number,
        direction?: number,
        lockRotation?: boolean
    ) => new EventInternals.LaserSpeedEvent(
        this.json,
        EVENTGROUP.RIGHT_ROTATING,
        speed,
        direction,
        lockRotation
    );

    /**
     * Used for 360 mode, rotates future objects and active objects.
     * @param rotation The rotation of the event.
     * Must be a multiple of 15 between -60 and 60.
     */
    earlyRotation = (rotation: number) => new EventInternals.RotationEvent(
        this.json,
        EVENTGROUP.EARLY_ROTATION,
        rotation
    )

    /**
     * Used for 360 mode, rotates future objects only.
     * @param rotation The rotation of the event.
     * Must be a multiple of 15 between -60 and 60.
     */
    lateRotation = (rotation: number) => new EventInternals.RotationEvent(
        this.json,
        EVENTGROUP.LATE_ROTATION,
        rotation
    )
}