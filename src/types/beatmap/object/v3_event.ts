import {bsmap} from '../../../deps.ts'

export interface ConvertableEvent {
    /** V3 only. Import from the deprecated basic event form into the new proper events.  */
    fromBasicEvent(json: bsmap.v3.IBaseObject): this
}

/** All interfaces for V2 BPM changes. */
export type IV2BPM = bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld | bsmap.v2.IEvent

/** All interfaces for V3 BPM changes. */
export type IV3BPM = bsmap.v3.IBPMChange | bsmap.v3.IBPMEvent

/** Interface for V3 light color event box groups. */
export type IV3LightColorEventBoxGroup = bsmap.v3.IEventBoxGroup<bsmap.v3.ILightColorEventBox>

/** Interface for V3 light rotation event box groups. */
export type IV3LightRotationEventBoxGroup = bsmap.v3.IEventBoxGroup<bsmap.v3.ILightRotationEventBox>

/** Interface for V3 light translation event box groups. */
export type IV3LightTranslationEventBoxGroup = bsmap.v3.IEventBoxGroup<bsmap.v3.ILightTranslationEventBox>