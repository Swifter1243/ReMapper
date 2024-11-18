import { bsmap } from '../../../../../../deps.ts'
import { LightEventBoxGroup } from './base.ts'
import { lightRotationEventBox } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event_box.ts'
import {AbstractDifficulty} from "../../../../abstract_difficulty.ts";

export class LightRotationEventBoxGroup extends LightEventBoxGroup<bsmap.v3.ILightRotationEventBox> {
    protected getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.lightRotationEventBoxGroups as this[]
    }

    override fromJsonV3(json: bsmap.v3.IEventBoxGroup<bsmap.v3.ILightRotationEventBox>): this {
        this.groupID = json.g ?? LightRotationEventBoxGroup.defaults.groupID
        this.boxes = json.e.map((x) => lightRotationEventBox(this).fromJsonV3(x))
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw new Error('Event box groups are not supported in V2!')
    }
}
