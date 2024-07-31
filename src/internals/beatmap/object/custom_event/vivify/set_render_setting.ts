import { RENDER_SETTING } from '../../../../../types/vivify/setting.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetRenderSetting } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";

export class SetRenderSetting extends CustomEvent<
    never,
    ISetRenderSetting
> {
    constructor(
        params: CustomEventConstructor<SetRenderSetting>,
    ) {
        super(params)
        this.type = 'SetRenderSetting'
        this.settings = params.settings ?? copy(SetRenderSetting.defaults.settings)
        this.duration = params.duration
        this.easing = params.easing
    }

    /** The settings to set. */
    settings: Partial<RENDER_SETTING>
    /** The length of the event in beats. Defaults to 0. */
    duration?: number
    /** An easing for the animation to follow. Defaults to "easeLinear". */
    easing?: EASE

    static defaults: JsonObjectDefaults<SetRenderSetting> = {
        settings: {},
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setRenderSettingEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: ISetRenderSetting): this {
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        this.settings = { ...json.d }
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'SetRenderSetting is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetRenderSetting {
        if (Object.keys(this.settings).length === 0) {
            throw 'settings is empty, which is redundant for SetRenderSetting!'
        }

        const output = {
            b: this.beat,
            d: {
                duration: this.duration,
                easing: this.easing,
                ...this.settings,
                ...this.data,
            },
            t: 'SetRenderSetting',
        } satisfies ISetRenderSetting
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'SetRenderSetting is only supported in V3!'
    }
}
