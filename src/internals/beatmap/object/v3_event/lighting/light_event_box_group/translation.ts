import { LightEventBoxGroup } from './base.ts'
import { lightTranslationEventBox } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event_box.ts'
import { bsmap } from '../../../../../../deps.ts'

export class LightTranslationEventBoxGroup extends LightEventBoxGroup<bsmap.v3.ILightTranslationEventBox> {
    override fromJsonV3(json: bsmap.v3.IEventBoxGroup<bsmap.v3.ILightTranslationEventBox>): this {
        this.groupID = json.g ?? LightTranslationEventBoxGroup.defaults.groupID
        this.boxes = json.e.map((x) => lightTranslationEventBox({}).fromJsonV3(x))
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw 'Event box groups are not supported in V2!'
    }
}
