import { LightID } from '../../../../types/beatmap/object/environment.ts'
import { EventAction } from '../../../../constants/basic_event.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'
import { bsmap } from '../../../../deps.ts'
import { LightColorLiteral } from '../../../../types/beatmap/object/basic_event.ts'
import { ColorVec } from '../../../../types/math/vector.ts'
import { EASE } from '../../../../types/animation/easing.ts'
import { getCDProp } from '../../../../utils/beatmap/json.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../types/beatmap/object/object.ts'
import type {AbstractDifficulty} from "../../abstract_beatmap.ts";

type ActionFunction = [
    color?: ColorVec | LightColorLiteral,
    lightID?: LightID,
]

export class LightEvent extends BasicEvent<bsmap.v2.IEventLight, bsmap.v3.IBasicEventLight> {
    constructor(
        difficulty: AbstractDifficulty,
        obj: BeatmapObjectConstructor<LightEvent>
    ) {
        super(difficulty, obj)
        this.lightID = obj.lightID
        this.chromaColor = obj.chromaColor
        this.easing = obj.easing
        this.lerpType = obj.lerpType
    }

    /** The lightIDs to target. */
    lightID?: LightID
    /** The color of the event. */
    chromaColor?: ColorVec
    /** The easing for transition events. Goes on start event. */
    easing?: EASE
    /** The color interpolation for transition events. Goes on start event. */
    lerpType?: 'RGB' | 'HSV'

    static override defaults: BeatmapObjectDefaults<LightEvent> = {
        ...super.defaults,
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.lightEvents as this[]
    }

    /** Create an event that turns lights off
     * @param lightID The lightIDs to target.
     */
    off(lightID?: LightID) {
        this.value = EventAction.OFF
        if (lightID !== undefined) this.lightID = lightID
        return this
    }

    private setAction(
        params: ActionFunction,
        actions: { [K in LightColorLiteral]: EventAction }
    ) {
        let [color, lightID] = params
        color ??= 'Blue'

        if (typeof color === 'string') {
            this.value = actions[color]
        } else {
            this.value = Object.values(actions)[0]
            this.chromaColor = color
        }

        if (lightID !== undefined) this.lightID = lightID
        return this
    }

    /**
     * Create a light event that turns lights on.
     */
    on(...params: ActionFunction) {
        return this.setAction(params, {
            Blue: EventAction.BLUE_ON,
            Red: EventAction.RED_ON,
            White: EventAction.WHITE_ON,
        })
    }

    /**
     * Create a light event that flashes the lights.
     */
    flash(...params: ActionFunction) {
        return this.setAction(params, {
            Blue: EventAction.BLUE_FLASH,
            Red: EventAction.RED_FLASH,
            White: EventAction.WHITE_FLASH,
        })
    }

    /**
     * Create a light event that fades the lights out.
     */
    fade(...params: ActionFunction) {
        return this.setAction(params, {
            Blue: EventAction.BLUE_FADE,
            Red: EventAction.RED_FADE,
            White: EventAction.WHITE_FADE,
        })
    }

    /**
     * Create a light event that makes the lights fade in to this color from the previous.
     */
    transition(...params: ActionFunction) {
        return this.setAction(params, {
            Blue: EventAction.BLUE_TRANSITION,
            Red: EventAction.RED_TRANSITION,
            White: EventAction.WHITE_TRANSITION,
        })
    }

    override fromJsonV3(json: bsmap.v3.IBasicEventLight): this {
        this.chromaColor = getCDProp(json, 'color') as ColorVec | undefined
        this.easing = getCDProp(json, 'easing')
        this.lerpType = getCDProp(json, 'lerpType')
        this.lightID = getCDProp(json, 'lightID')
        return super.fromJsonV3(json)
    }

    override fromJsonV2(json: bsmap.v2.IEventLight): this {
        this.chromaColor = getCDProp(json, '_color') as ColorVec | undefined
        this.easing = getCDProp(json, '_easing')
        this.lerpType = getCDProp(json, '_lerpType')
        this.lightID = getCDProp(json, '_lightID')
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBasicEventLight {
        const output = {
            b: this.beat,
            et: this.type as bsmap.v3.IBasicEventLight['et'],
            f: this.floatValue,
            i: this.value,
            customData: {
                color: this.chromaColor,
                easing: this.easing,
                lerpType: this.lerpType,
                lightID: this.lightID,
                ...this.customData,
            },
        } satisfies bsmap.v3.IBasicEventLight
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEventLight {
        const output = {
            _floatValue: this.floatValue,
            _time: this.beat,
            _type: this.type as bsmap.v2.IEventLight['_type'],
            _value: this.value,
            _customData: {
                _color: this.chromaColor,
                _easing: this.easing,
                _lerpType: this.lerpType,
                _lightID: this.lightID,
                ...this.customData,
            },
        } satisfies bsmap.v2.IEventLight
        return prune ? objectPrune(output) : output
    }
}
