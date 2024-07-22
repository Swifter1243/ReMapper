import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { RENDER_SETTING } from '../../../../../types/vivify/setting.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetRenderSetting } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { EASE } from '../../../../../types/animation/easing.ts'

export class SetRenderSetting extends CustomEvent<
    never,
    ISetRenderSetting
> {
    constructor(
        params: CustomEventConstructor<SetRenderSetting>,
    ) {
        super(params)
        this.type = 'SetRenderSetting'
        this.settings = params.settings ?? {}
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
    }

    /** The length of the event in beats. Defaults to 0. */
    duration?: number
    /** An easing for the animation to follow. Defaults to "easeLinear". */
    easing?: EASE
    /** The settings to set. */
    settings: Partial<RENDER_SETTING>

    push(clone = true) {
        getActiveDifficulty().customEvents.setRenderSettingEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: ISetRenderSetting, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | ISetRenderSetting
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetRenderSetting>

        if (!v3) throw 'SetRenderSetting is only supported in V3!'

        const obj = json as ISetRenderSetting

        const params = {
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            settings: obj.d,
        } as Params

        obj.d = {}

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): ISetRenderSetting
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetRenderSetting is only supported in V3!'

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
}
