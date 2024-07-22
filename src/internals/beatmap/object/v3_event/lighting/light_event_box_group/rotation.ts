import { bsmap } from '../../../../../../deps.ts'
import { IV3LightRotationEventBoxGroup } from '../../../../../../types/beatmap/object/v3_event.ts'
import { SubclassExclusiveProps } from '../../../../../../types/util/class.ts'
import { LightEventBoxGroup } from './base.ts'
import { LightColorEventBoxGroup } from './color.ts'
import {
    lightRotationEventBox
} from "../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event_box.ts";


export class LightRotationEventBoxGroup
    extends LightEventBoxGroup<bsmap.v3.ILightRotationEventBox> {
    fromJson(json: IV3LightRotationEventBoxGroup, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: IV3LightRotationEventBoxGroup, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEventBoxGroup,
            LightEventBoxGroup<bsmap.v3.ILightRotationEventBox>
        >

        const params = {
            groupID: json.g ?? 0,
            boxes: json.e.map((x) => lightRotationEventBox({}).fromJson(x, true)),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}
