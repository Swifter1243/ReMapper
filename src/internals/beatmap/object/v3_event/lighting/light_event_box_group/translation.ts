import {LightEventBoxGroup} from "./base.ts";
import {V3LightTranslationEventBoxGroup} from "../../../../../../types/beatmap/object/v3_event.ts";
import {SubclassExclusiveProps} from "../../../../../../types/util/class.ts";
import {LightColorEventBoxGroup} from "./color.ts";
import {
    lightTranslationEventBox
} from "../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event_box.ts";
import { bsmap } from '../../../../../../deps.ts'


export class LightTranslationEventBoxGroup
    extends LightEventBoxGroup<bsmap.v3.ILightTranslationEventBox> {
    fromJson(json: V3LightTranslationEventBoxGroup, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: V3LightTranslationEventBoxGroup, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEventBoxGroup,
            LightEventBoxGroup<bsmap.v3.ILightTranslationEventBox>
        >

        const params = {
            groupID: json.g ?? 0,
            boxes: json.e.map((x) => lightTranslationEventBox({}).fromJson(x, true)),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}
