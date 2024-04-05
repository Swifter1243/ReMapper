import { bsmap } from '../deps.ts'
import { Fields, jsonPrune, SubclassExclusiveProps } from '../mod.ts'
import { ObjectFields } from '../types/util_types.ts'
import { BaseObject } from './object.ts'
import { JsonWrapper } from '../mod.ts'
import { DistributionType, RotationEase } from '../data/mod.ts'
import { LightColor } from '../data/mod.ts'
import { LightTransition } from '../data/mod.ts'
import { LightAxis } from '../data/mod.ts'
import { RotationDirection } from '../data/mod.ts'
import {
    lightColorEvent,
    lightColorEventBox,
    lightRotationEvent,
    lightRotationEventBox,
    lightTranslationEvent,
    lightTranslationEventBox,
} from '../beatmap/lighting_v3.ts'

//! Event Box Groups
export abstract class EventBoxGroup<T extends bsmap.v3.IEventBox>
    extends BaseObject<never, bsmap.v3.IEventBoxGroup<T>> {
    constructor(obj: Partial<ObjectFields<EventBoxGroup<T>>>) {
        super(obj)
        this.groupID = obj.groupID ?? 0
        this.boxes = obj.boxes ?? []
    }

    /** An integer value which represents what group of environment objects are affected. */
    groupID: number
    /** The event boxes in this group.  */
    boxes: EventBox<T>[]

    /** Add a box to this group's boxes. */
    add(box: EventBox<T>) {
        this.boxes.push(box)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IEventBoxGroup<T>
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune = true): bsmap.v3.IEventBoxGroup<T> {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            e: this.boxes.map((x) => x.toJson(true)),
            g: this.groupID,
            customData: this.customData,
        } satisfies bsmap.v3.IEventBoxGroup<T>
        return prune ? jsonPrune(output) : output
    }
}

type LightColorEventBoxGroupV3 = bsmap.v3.IEventBoxGroup<
    bsmap.v3.ILightColorEventBox
>

type LightRotationEventBoxGroupV3 = bsmap.v3.IEventBoxGroup<
    bsmap.v3.ILightRotationEventBox
>

type LightTranslationEventBoxGroupV3 = bsmap.v3.IEventBoxGroup<
    bsmap.v3.ILightTranslationEventBox
>

export class LightColorEventBoxGroup
    extends EventBoxGroup<bsmap.v3.ILightColorEventBox> {
    fromJson(json: LightColorEventBoxGroupV3, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: LightColorEventBoxGroupV3, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEventBoxGroup,
            EventBoxGroup<bsmap.v3.ILightColorEventBox>
        >

        const params = {
            groupID: json.g ?? 0,
            boxes: json.e.map((x) => lightColorEventBox({}).fromJson(x, true)),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}

export class LightRotationEventBoxGroup
    extends EventBoxGroup<bsmap.v3.ILightRotationEventBox> {
    fromJson(json: LightRotationEventBoxGroupV3, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: LightRotationEventBoxGroupV3, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEventBoxGroup,
            EventBoxGroup<bsmap.v3.ILightRotationEventBox>
        >

        const params = {
            groupID: json.g ?? 0,
            boxes: json.e.map((x) =>
                lightRotationEventBox({}).fromJson(x, true)
            ),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}

export class LightTranslationEventBoxGroup
    extends EventBoxGroup<bsmap.v3.ILightTranslationEventBox> {
    fromJson(json: LightTranslationEventBoxGroupV3, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: LightTranslationEventBoxGroupV3, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEventBoxGroup,
            EventBoxGroup<bsmap.v3.ILightTranslationEventBox>
        >

        const params = {
            groupID: json.g ?? 0,
            boxes: json.e.map((x) =>
                lightTranslationEventBox({}).fromJson(x, true)
            ),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}

//! Event Boxes
export abstract class EventBox<
    T extends bsmap.v3.IEventBox,
    E extends LightEvent = LightEvent,
> implements JsonWrapper<never, T> {
    constructor(obj: Partial<ObjectFields<EventBox<T, E>>>) {
        this.filter = obj.filter ?? {
            f: 1,
            c: 0,
            d: 0,
            l: 0,
            n: 0,
            p: 0,
            r: 0,
            s: 0,
            t: 0,
        }
        this.beatDistribution = obj.beatDistribution ?? 0
        this.beatDistributionType = obj.beatDistributionType ??
            DistributionType.STEP
        this.distributionEasing = obj.distributionEasing ?? RotationEase.None
        this.customData = obj.customData ?? {}
        this.events = obj.events ?? []
    }

    /** Allows you to filter specific environment objects within an event box and control how its effects are distributed. */
    filter: bsmap.v3.IIndexFilter
    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-color-event-boxes-beat-distribution */
    beatDistribution: number
    /** Determines how the effects will be processed over time, in relation to the starting beat. */
    beatDistributionType: DistributionType
    /** An integer value which determines the interpolation of the distribution, or the behavior for how to traverse the sequence. */
    distributionEasing: RotationEase
    /** Community data in the event box. */
    customData: T['customData']
    /** The events in this event box. */
    events: E[]

    /** Add an event to this box's events. */
    add(event: E) {
        this.events.push(event)
    }

    abstract fromJson(json: T, v3: true): this
    abstract fromJson(json: never, v3: false): this
    abstract fromJson(json: T, v3: boolean): this

    abstract toJson(v3: true, prune?: boolean): T
    abstract toJson(v3: false, prune?: boolean): never
    abstract toJson(v3: boolean, prune?: boolean): T
}

export class LightColorEventBox
    extends EventBox<bsmap.v3.ILightColorEventBox, LightColorEvent> {
    constructor(obj: Partial<Fields<LightColorEventBox>>) {
        super(obj)
        this.brightnessDistribution = obj.brightnessDistribution ?? 1
        this.brightnessDistributionType = obj.brightnessDistributionType ??
            DistributionType.STEP
        this.brightnessDistributionFirst = obj.brightnessDistributionFirst ??
            true
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-color-event-boxes-effect-distribution */
    brightnessDistribution: number
    /** Determines how the brightness of all filtered objects should be adjusted when iterating through the sequence. */
    brightnessDistributionType: DistributionType
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first event in the sequence. */
    brightnessDistributionFirst: boolean

    fromJson(json: bsmap.v3.ILightColorEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightColorEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightColorEventBox>

        const params = {
            beatDistribution: json.w ?? 0,
            beatDistributionType: json.d ?? 0,
            brightnessDistribution: json.r ?? 0,
            brightnessDistributionFirst: json.b === 1,
            brightnessDistributionType: json.t ?? 0,
            distributionEasing: json.i ?? 0,
            customData: json.customData,
            events: json.e.map((x) => lightColorEvent({}).fromJson(x, true)),
            filter: json.f,
        } as Params

        Object.assign(this, params)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightColorEventBox
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightColorEventBox {
        if (!v3) throw 'Event boxes are not supported in V2!'

        const output = {
            b: this.brightnessDistributionFirst ? 1 : 0,
            d: this.beatDistributionType,
            e: this.events.map((x) => x.toJson(true)),
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            r: this.brightnessDistribution,
            t: this.brightnessDistributionType,
            w: this.beatDistribution,
            customData: this.customData,
        } satisfies bsmap.v3.ILightColorEventBox
        return prune ? jsonPrune(output) : output
    }
}

export class LightRotationEventBox
    extends EventBox<bsmap.v3.ILightRotationEventBox, LightRotationEvent> {
    constructor(obj: Partial<Fields<LightRotationEventBox>>) {
        super(obj)
        this.rotationDistribution = obj.rotationDistribution ?? 0
        this.rotationDistributionType = obj.rotationDistributionType ??
            DistributionType.STEP
        this.rotationAxis = obj.rotationAxis ?? LightAxis.X
        this.flipRotation = obj.flipRotation ?? false
        this.rotationDistributionFirst = obj.rotationDistributionFirst ?? true
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-rotation-event-boxes-effect-distribution */
    rotationDistribution: number
    /** Determines how the rotation of all filtered objects should be adjusted when iterating through the sequence. */
    rotationDistributionType: DistributionType
    /** An integer value which controls the axis of rotation. */
    rotationAxis: LightAxis
    /** An integer value which determines whether the rotation should be mirrored. */
    flipRotation: boolean
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first event in the sequence. */
    rotationDistributionFirst: boolean

    fromJson(json: bsmap.v3.ILightRotationEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightRotationEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightRotationEventBox>

        const params = {
            filter: json.f,
            beatDistribution: json.w ?? 0,
            beatDistributionType: json.d,
            distributionEasing: json.i ?? 0,
            flipRotation: json.r === 1,
            rotationAxis: json.a ?? 0,
            rotationDistribution: json.s ?? 0,
            rotationDistributionFirst: json.b === 1,
            rotationDistributionType: json.t,
            events: json.l.map((x) => lightRotationEvent({}).fromJson(x, true)),
            customData: json.customData,
        } as Params

        Object.assign(this, params)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightRotationEventBox
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightRotationEventBox {
        if (!v3) throw 'Event boxes are not supported in V2!'

        const output = {
            a: this.rotationAxis,
            b: this.rotationDistributionFirst ? 1 : 0,
            d: this.beatDistributionType,
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            l: this.events.map((x) => x.toJson(true)),
            r: this.flipRotation ? 1 : 0,
            s: this.rotationDistribution,
            t: this.rotationDistributionType,
            w: this.beatDistribution,
            customData: this.customData,
        } satisfies bsmap.v3.ILightRotationEventBox
        return prune ? jsonPrune(output) : output
    }
}

export class LightTranslationEventBox
    extends EventBox<
        bsmap.v3.ILightTranslationEventBox,
        LightTranslationEvent
    > {
    constructor(obj: Partial<Fields<LightTranslationEventBox>>) {
        super(obj)
        this.translationDistribution = obj.translationDistribution ?? 0
        this.translationDistributionType = obj.translationDistributionType ??
            DistributionType.STEP
        this.translationAxis = obj.translationAxis ?? LightAxis.X
        this.flipTranslation = obj.flipTranslation ?? false
        this.translationDistributionFirst = obj.translationDistributionFirst ??
            true
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-translation-event-boxes-effect-distribution */
    translationDistribution: number
    /** Determines how the translation of all filtered objects should be adjusted when iterating through the sequence. */
    translationDistributionType: DistributionType
    /** An integer value which controls the axis of translation. */
    translationAxis: LightAxis
    /** An integer value which determines whether the translation should be mirrored. */
    flipTranslation: boolean
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first event in the sequence. */
    translationDistributionFirst: boolean

    fromJson(json: bsmap.v3.ILightTranslationEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightTranslationEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightTranslationEventBox>

        const params = {
            filter: json.f,
            beatDistribution: json.w ?? 0,
            beatDistributionType: json.d,
            distributionEasing: json.i ?? 0,
            flipTranslation: json.r === 1,
            translationAxis: json.a ?? 0,
            translationDistribution: json.s ?? 0,
            translationDistributionFirst: json.b === 1,
            translationDistributionType: json.t,
            events: json.l.map((x) =>
                lightTranslationEvent({}).fromJson(x, true)
            ),
            customData: json.customData,
        } as Params

        Object.assign(this, params)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightTranslationEventBox
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightTranslationEventBox {
        if (!v3) throw 'Event boxes are not supported in V2!'

        const output = {
            d: this.beatDistributionType,
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            w: this.beatDistribution,
            a: this.translationAxis,
            b: this.translationDistributionFirst ? 1 : 0,
            l: this.events.map((x) => x.toJson(true)),
            r: this.flipTranslation ? 1 : 0,
            s: this.translationDistribution,
            t: this.translationDistributionType,
            customData: this.customData,
        } satisfies bsmap.v3.ILightTranslationEventBox
        return prune ? jsonPrune(output) : output
    }
}

//! Events
type LightBase =
    | bsmap.v3.ILightColorBase
    | bsmap.v3.ILightRotationBase
    | bsmap.v3.ILightTranslationBase

abstract class LightEvent<T extends LightBase = LightBase>
    extends BaseObject<never, T> {}

export class LightColorEvent extends LightEvent<bsmap.v3.ILightColorBase> {
    constructor(obj: Partial<ObjectFields<LightColorEvent>>) {
        super(obj)
        this.transitionType = obj.transitionType ?? LightTransition.INSTANT
        this.color = obj.color ?? LightColor.RED
        this.brightness = obj.brightness ?? 1
        this.blinkingFrequency = obj.blinkingFrequency ?? 0
    }

    /** An integer value which determines the behavior of the effect, relative to the previous effect. */
    transitionType: LightTransition
    /** The color of the effect. */
    color: LightColor
    /** The brightness of the effect, as a percentage (0-1). */
    brightness: number
    /** Blinking frequency in beat time of the event, 0 is static. */
    blinkingFrequency: number

    fromJson(json: bsmap.v3.ILightColorBase, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightColorBase, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEvent,
            BaseObject<never, bsmap.v3.ILightColorBase>
        >

        const params = {
            blinkingFrequency: json.f ?? 0,
            brightness: json.s ?? 0,
            color: json.c ?? 0,
            transitionType: json.i ?? 0,
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightColorBase
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightColorBase {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            c: this.color,
            f: this.blinkingFrequency,
            i: this.transitionType,
            s: this.brightness,
            customData: this.customData,
        } satisfies bsmap.v3.ILightColorBase
        return prune ? jsonPrune(output) : output
    }
}

export class LightRotationEvent
    extends BaseObject<never, bsmap.v3.ILightRotationBase> {
    constructor(obj: Partial<ObjectFields<LightRotationEvent>>) {
        super(obj)
        this.usePreviousEventRotation = obj.usePreviousEventRotation ?? true
        this.easing = obj.easing ?? RotationEase.None
        this.loopCount = obj.loopCount ?? 1
        this.rotationDegrees = obj.rotationDegrees ?? 0
        this.rotationDirection = obj.rotationDirection ??
            RotationDirection.AUTOMATIC
    }

    /** If true, extend the state of the previous event. If not, transition from previous state to this state. */
    usePreviousEventRotation: boolean
    /** The easing of the rotation. */
    easing: RotationEase
    /** The amount of additional revolutions (full 360 degree turns) for the rotation.  */
    loopCount: number
    /** The amount of degrees to rotate. */
    rotationDegrees: number
    /** The direction to rotate. */
    rotationDirection: RotationDirection

    fromJson(json: bsmap.v3.ILightRotationBase, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightRotationBase, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightRotationEvent,
            BaseObject<never, bsmap.v3.ILightRotationBase>
        >

        const params = {
            easing: json.e ?? 0,
            loopCount: json.l ?? 0,
            rotationDegrees: json.r ?? 0,
            rotationDirection: json.o ?? 0,
            usePreviousEventRotation: json.p === 1,
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightRotationBase
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightRotationBase {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            e: this.easing as bsmap.v3.ILightRotationBase['e'],
            l: this.loopCount,
            o: this.rotationDirection,
            p: this.usePreviousEventRotation ? 1 : 0,
            r: this.rotationDegrees,
            customData: this.customData,
        } satisfies bsmap.v3.ILightRotationBase
        return prune ? jsonPrune(output) : output
    }
}

export class LightTranslationEvent
    extends BaseObject<never, bsmap.v3.ILightTranslationBase> {
    constructor(obj: Partial<ObjectFields<LightTranslationEvent>>) {
        super(obj)
        this.usePreviousEventTranslation = obj.usePreviousEventTranslation ??
            false
        this.easing = obj.easing ?? RotationEase.None
        this.magnitude = obj.magnitude ?? 0
    }

    /** If true, extend the state of the previous event. If not, transition from previous state to this state. */
    usePreviousEventTranslation: boolean
    /** The easing of the translation. */
    easing: RotationEase
    /** The magnitude of the translation. */
    magnitude: number

    fromJson(json: bsmap.v3.ILightTranslationBase, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightTranslationBase, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightTranslationEvent,
            BaseObject<never, bsmap.v3.ILightTranslationBase>
        >

        const params = {
            easing: json.e ?? 0,
            usePreviousEventTranslation: json.p === 1,
            magnitude: json.t ?? 0,
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightTranslationBase
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightTranslationBase {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            e: this.easing as bsmap.v3.ILightTranslationBase['e'],
            p: this.usePreviousEventTranslation ? 1 : 0,
            t: this.magnitude,
            customData: this.customData,
        } satisfies bsmap.v3.ILightTranslationBase
        return prune ? jsonPrune(output) : output
    }
}
