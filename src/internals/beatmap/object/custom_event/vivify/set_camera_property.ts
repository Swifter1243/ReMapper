import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetCameraProperty } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { DEPTH_TEX_MODE } from '../../../../../types/vivify/setting.ts'

export class SetCameraProperty extends CustomEvent<
    never,
    ISetCameraProperty
> {
    constructor(
        params: CustomEventConstructor<SetCameraProperty>,
    ) {
        super(params)
        this.type = 'SetCameraProperty'
        this.depthTextureMode = params.depthTextureMode ?? []
    }

    /** Sets the depth texture mode on the camera. */
    depthTextureMode: DEPTH_TEX_MODE[]

    push(clone = true) {
        getActiveDifficulty().customEvents.setCameraPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: ISetCameraProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | ISetCameraProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetCameraProperty>

        if (!v3) throw 'SetCameraProperty is only supported in V3!'

        const obj = json as ISetCameraProperty

        const params = {
            depthTextureMode: getDataProp(obj.d, 'depthTextureMode'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): ISetCameraProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetCameraProperty is only supported in V3!'

        if (this.depthTextureMode.length === 0) {
            throw 'depthTextureMode is empty, which is redundant for SetCameraProperty!'
        }

        const output = {
            b: this.beat,
            d: {
                depthTextureMode: this.depthTextureMode,
                ...this.data,
            },
            t: 'SetCameraProperty',
        } satisfies ISetCameraProperty
        return prune ? objectPrune(output) : output
    }
}
