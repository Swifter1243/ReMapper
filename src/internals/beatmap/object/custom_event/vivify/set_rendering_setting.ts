import {QUALITY_SETTINGS, RENDERING_SETTINGS, XR_SETTINGS} from '../../../../../types/vivify/setting.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetRenderingSettings } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { CustomEventConstructor } from '../../../../../types/beatmap/object/custom_event.ts'

import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { CustomEvent } from '../base/custom_event.ts'
import { JsonObjectDefaults } from '../../../../../types/beatmap/object/object.ts'

export class SetRenderingSettings extends CustomEvent<
    never,
    ISetRenderingSettings
> {
    constructor(
        params: CustomEventConstructor<SetRenderingSettings>,
    ) {
        super(params)
        this.type = 'SetRenderingSettings'
        this.duration = params.duration
        this.easing = params.easing
        this.renderSettings = params.renderSettings
        this.qualitySettings = params.qualitySettings
        this.xrSettings = params.xrSettings
    }

    /** The length of the event in beats. Defaults to 0. */
    duration?: number
    /** An easing for the animation to follow. Defaults to "easeLinear". */
    easing?: EASE
    /** https://docs.unity3d.com/ScriptReference/RenderSettings.html */
    renderSettings?: Partial<RENDERING_SETTINGS>
    /** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
    qualitySettings?: Partial<QUALITY_SETTINGS>
    /** https://docs.unity3d.com/ScriptReference/XR.XRSettings.html */
    xrSettings?: Partial<XR_SETTINGS>

    static defaults: JsonObjectDefaults<SetRenderingSettings> = {
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setRenderingSettingEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: ISetRenderingSettings): this {
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        this.renderSettings = getDataProp(json.d, 'renderSettings')
        this.qualitySettings = getDataProp(json.d, 'qualitySettings')
        this.xrSettings = getDataProp(json.d, 'xrSettings')
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'SetRenderingSettings is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetRenderingSettings {
        if (this.renderSettings && Object.keys(this.renderSettings).length === 0) {
            throw 'renderSettings is empty, which is redundant for SetRenderingSettings!'
        }
        if (this.qualitySettings && Object.keys(this.qualitySettings).length === 0) {
            throw 'qualitySettings is empty, which is redundant for SetRenderingSettings!'
        }
        if (this.xrSettings && Object.keys(this.xrSettings).length === 0) {
            throw 'xrSettings is empty, which is redundant for SetRenderingSettings!'
        }
        if (!this.qualitySettings && !this.renderSettings && !this.xrSettings) {
            throw 'there are no settings on this event, which is redundant for SetRenderingSettings!'
        }

        const output = {
            b: this.beat,
            d: {
                duration: this.duration,
                easing: this.easing,
                renderSettings: this.renderSettings,
                qualitySettings: this.qualitySettings,
                xrSettings: this.xrSettings,
                ...this.data,
            },
            t: 'SetRenderingSettings',
        } satisfies ISetRenderingSettings
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'SetRenderingSettings is only supported in V3!'
    }
}
