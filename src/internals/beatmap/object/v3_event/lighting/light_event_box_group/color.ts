import { LightEventBoxGroup } from './base.ts'
import { V3LightColorEventBoxGroup } from '../../../../types/v3_event.ts'
import { SubclassExclusiveProps } from '../../../../types/util.ts'
import { lightColorEventBox } from '../../../../builder_functions/v3_event/lighting/light_event_box.ts'
import { bsmap } from '../../../../deps.ts'

export class LightColorEventBoxGroup extends LightEventBoxGroup<bsmap.v3.ILightColorEventBox> {
    fromJson(json: V3LightColorEventBoxGroup, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: V3LightColorEventBoxGroup, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEventBoxGroup,
            LightEventBoxGroup<bsmap.v3.ILightColorEventBox>
        >

        const params = {
            groupID: json.g ?? 0,
            boxes: json.e.map((x) => lightColorEventBox({}).fromJson(x, true)),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}
