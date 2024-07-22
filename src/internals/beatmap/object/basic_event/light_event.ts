import {LightID} from '../../../../types/beatmap/object/environment.ts'
import {EventAction} from '../../../../data/constants/basic_event.ts'
import {getActiveDifficulty} from '../../../../data/active_difficulty.ts'
import {copy} from '../../../../utils/object/copy.ts'
import {objectPrune} from '../../../../utils/object/prune.ts'
import {BasicEvent} from './basic_event.ts'
import {bsmap} from '../../../../deps.ts'
import {BasicEventExcludedFields, LightColorLiteral} from '../../../../types/beatmap/object/basic_event.ts'
import {ColorVec} from "../../../../types/math/vector.ts";

import {EASE} from "../../../../types/animation/easing.ts";
import {Fields, SubclassExclusiveProps} from "../../../../types/util/class.ts";
import {getCDProp} from "../../../../utils/beatmap/json.ts";

export class LightEvent<
    TV2 extends bsmap.v2.IEventLight = bsmap.v2.IEventLight,
    TV3 extends bsmap.v3.IBasicEventLight = bsmap.v3.IBasicEventLight,
> extends BasicEvent<TV2, TV3> {
    constructor(obj: BasicEventExcludedFields<LightEvent<TV2, TV3>>) {
        super(obj)
        this.lightID = obj.lightID
        this.color = obj.color
        this.easing = obj.easing
        this.lerpType = obj.lerpType
    }

    /** The lightIDs to target. */
    lightID?: LightID
    /** The color of the event. */
    color?: ColorVec
    /** The easing for transition events. Goes on start event. */
    easing?: EASE
    /** The color interpolation for transition events. Goes on start event. */
    lerpType?: 'RGB' | 'HSV'

    /** Create an event that turns lights off
     * @param lightID The lightIDs to target.
     */
    off(lightID?: LightID) {
        this.value = EventAction.OFF
        if (lightID) this.lightID = lightID
        return this
    }

    private makeAction(
        actions: { [K in LightColorLiteral]: EventAction },
    ) {
        return (
            color: ColorVec | LightColorLiteral = 'Blue',
            lightID?: LightID,
        ) => {
            if (typeof color === 'string') {
                this.value = actions[color]
            } else {
                this.value = Object.values(actions)[0]
                this.color = color
            }

            if (lightID) this.lightID = lightID
            return this
        }
    }

    /**
     * Create a light event that turns lights on.
     */
    on = this.makeAction({
        Blue: EventAction.BLUE_ON,
        Red: EventAction.RED_ON,
        White: EventAction.WHITE_ON,
    })

    /**
     * Create a light event that flashes the lights.
     */
    flash = this.makeAction({
        Blue: EventAction.BLUE_FLASH,
        Red: EventAction.RED_FLASH,
        White: EventAction.WHITE_FLASH,
    })

    /**
     * Create a light event that fades the lights out.
     */
    fade = this.makeAction({
        Blue: EventAction.BLUE_FADE,
        Red: EventAction.RED_FADE,
        White: EventAction.WHITE_FADE,
    })

    /**
     * Create a light event that makes the lights fade in to this color from the previous.
     */
    transition = this.makeAction({
        Blue: EventAction.BLUE_TRANSITION,
        Red: EventAction.RED_TRANSITION,
        White: EventAction.WHITE_TRANSITION,
    })

    push(
        clone = true,
    ): LightEvent<TV2, TV3> {
        getActiveDifficulty().lightEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                LightEvent,
                BasicEvent
            >
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                color: getCDProp(obj, 'color'),
                easing: getCDProp(obj, 'easing'),
                lerpType: getCDProp(obj, 'lerpType'),
                lightID: getCDProp(obj, 'lightID'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as TV2

            const params = {
                color: getCDProp(obj, '_color'),
                easing: getCDProp(obj, '_easing'),
                lerpType: getCDProp(obj, '_lerpType'),
                lightID: getCDProp(obj, '_lightID'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): TV3
    toJson(v3: false, prune?: boolean): TV2
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v3.IBasicEventLight | bsmap.v2.IEventLight {
        if (v3) {
            const output = {
                b: this.beat,
                et: this.type as bsmap.v3.IBasicEventLight['et'],
                f: this.floatValue,
                i: this.value,
                customData: {
                    color: this.color,
                    easing: this.easing,
                    lerpType: this.lerpType,
                    lightID: this.lightID,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IBasicEventLight
            return prune ? objectPrune(output) : output
        } else {
            const output = {
                _floatValue: this.floatValue,
                _time: this.beat,
                _type: this.type as bsmap.v2.IEventLight['_type'],
                _value: this.value,
                _customData: {
                    _color: this.color,
                    _easing: this.easing,
                    _lerpType: this.lerpType,
                    _lightID: this.lightID,
                    ...this.customData,
                },
            } satisfies bsmap.v2.IEventLight
            return prune ? objectPrune(output) : output
        }
    }
}
