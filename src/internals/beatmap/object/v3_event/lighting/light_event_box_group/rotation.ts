import { bsmap } from '../../../../../../deps.ts'
import { LightEventBoxGroup } from './base.ts'
import { lightRotationEventBox } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event_box.ts'

export class LightRotationEventBoxGroup extends LightEventBoxGroup<bsmap.v3.ILightRotationEventBox> {
    fromJsonV3(json: bsmap.v3.IEventBoxGroup<bsmap.v3.ILightRotationEventBox>): this {
        this.groupID = json.g ?? LightRotationEventBoxGroup.defaults.groupID
        this.boxes = json.e.map((x) => lightRotationEventBox({}).fromJsonV3(x))
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'Event box groups are not supported in V2!'
    }
}
