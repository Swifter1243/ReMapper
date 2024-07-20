import { bsmap } from '../deps.ts'
import { BaseEvent } from '../internals/lighting/basic_event.ts'

export type AbstractEvent = BaseEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBasicEvent
>
