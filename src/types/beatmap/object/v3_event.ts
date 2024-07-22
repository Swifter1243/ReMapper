import {bsmap} from '../../../deps.ts'

export interface ConvertableEvent {
    /** V3 only. Import from the deprecated basic event form into the new proper events.  */
    fromBasicEvent(json: bsmap.v3.IBaseObject): this
}

export type V2BPM = bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld | bsmap.v2.IEvent
export type V3BPM = bsmap.v3.IBPMChange | bsmap.v3.IBPMEvent
export type V3LightColorEventBoxGroup = bsmap.v3.IEventBoxGroup<bsmap.v3.ILightColorEventBox>
export type V3LightRotationEventBoxGroup = bsmap.v3.IEventBoxGroup<bsmap.v3.ILightRotationEventBox>
export type V3LightTranslationEventBoxGroup = bsmap.v3.IEventBoxGroup<bsmap.v3.ILightTranslationEventBox>