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

    groupID: number
    boxes: EventBox<T>[]

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
            groupID: json.g,
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
            groupID: json.g,
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
            groupID: json.g,
            boxes: json.e.map((x) =>
                lightTranslationEventBox({}).fromJson(x, true)
            ),
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }
}

//! Event Boxes
export abstract class EventBox<T extends bsmap.v3.IEventBox>
    implements JsonWrapper<never, T> {
    constructor(obj: Partial<ObjectFields<EventBox<T>>>) {
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
        this.distributionEasing = obj.distributionEasing ?? RotationEase.NONE
        this.customData = obj.customData ?? {}
    }

    filter: bsmap.v3.IIndexFilter
    beatDistribution: number
    beatDistributionType: DistributionType
    distributionEasing: RotationEase
    customData: T['customData']

    abstract fromJson(json: T, v3: true): this
    abstract fromJson(json: never, v3: false): this
    abstract fromJson(json: T, v3: boolean): this

    abstract toJson(v3: true, prune?: boolean): T
    abstract toJson(v3: false, prune?: boolean): never
    abstract toJson(v3: boolean, prune?: boolean): T
}

export class LightColorEventBox extends EventBox<bsmap.v3.ILightColorEventBox> {
    constructor(obj: Partial<Fields<LightColorEventBox>>) {
        super(obj)
        this.brightnessDistribution = obj.brightnessDistribution ?? 1
        this.brightnessDistributionType = obj.brightnessDistributionType ??
            DistributionType.STEP
        this.brightnessDistributionFirst = obj.brightnessDistributionFirst ??
            true
        this.events = obj.events ?? []
    }

    brightnessDistribution: number
    brightnessDistributionType: DistributionType
    brightnessDistributionFirst: boolean
    events: LightColorEvent[]

    fromJson(json: bsmap.v3.ILightColorEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightColorEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightColorEventBox>

        const params = {
            beatDistribution: json.w,
            beatDistributionType: json.d,
            brightnessDistribution: json.r,
            brightnessDistributionFirst: json.b === 1,
            brightnessDistributionType: json.t,
            distributionEasing: json.i,
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
    extends EventBox<bsmap.v3.ILightRotationEventBox> {
    constructor(obj: Partial<Fields<LightRotationEventBox>>) {
        super(obj)
        this.rotationDistribution = obj.rotationDistribution ?? 0
        this.rotationDistributionType = obj.rotationDistributionType ??
            DistributionType.STEP
        this.rotationAxis = obj.rotationAxis ?? LightAxis.X
        this.flipRotation = obj.flipRotation ?? false
        this.rotationDistributionFirst = obj.rotationDistributionFirst ?? true
        this.events = obj.events ?? []
    }

    rotationDistribution: number
    rotationDistributionType: DistributionType
    rotationAxis: LightAxis
    flipRotation: boolean
    rotationDistributionFirst: boolean
    events: LightRotationEvent[]

    fromJson(json: bsmap.v3.ILightRotationEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightRotationEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightRotationEventBox>

        const params = {
            filter: json.f,
            beatDistribution: json.w,
            beatDistributionType: json.d,
            distributionEasing: json.i,
            flipRotation: json.r === 1,
            rotationAxis: json.a,
            rotationDistribution: json.s,
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
    extends EventBox<bsmap.v3.ILightTranslationEventBox> {
    constructor(obj: Partial<Fields<LightTranslationEventBox>>) {
        super(obj)
        this.translationDistribution = obj.translationDistribution ?? 0
        this.translationDistributionType = obj.translationDistributionType ??
            DistributionType.STEP
        this.translationAxis = obj.translationAxis ?? LightAxis.X
        this.flipTranslation = obj.flipTranslation ?? false
        this.translationDistributionFirst = obj.translationDistributionFirst ??
            true
        this.events = obj.events ?? []
    }

    translationDistribution: number
    translationDistributionType: DistributionType
    translationAxis: LightAxis
    flipTranslation: boolean
    translationDistributionFirst: boolean
    events: LightTranslationEvent[]

    fromJson(json: bsmap.v3.ILightTranslationEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightTranslationEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightTranslationEventBox>

        const params = {
            filter: json.f,
            beatDistribution: json.w,
            beatDistributionType: json.d,
            distributionEasing: json.i,
            flipTranslation: json.r === 1,
            translationAxis: json.a,
            translationDistribution: json.s,
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
export class LightColorEvent
    extends BaseObject<never, bsmap.v3.ILightColorBase> {
    constructor(obj: Partial<ObjectFields<LightColorEvent>>) {
        super(obj)
        this.transitionType = obj.transitionType ?? LightTransition.INSTANT
        this.color = obj.color ?? LightColor.RED
        this.brightness = obj.brightness ?? 1
        this.blinkingFrequency = obj.blinkingFrequency ?? 0
    }

    transitionType: LightTransition
    color: LightColor
    brightness: number
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
            blinkingFrequency: json.f,
            brightness: json.s,
            color: json.c,
            transitionType: json.i,
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
        this.easing = obj.easing ?? RotationEase.NONE
        this.loopCount = obj.loopCount ?? 1
        this.rotationDegrees = obj.rotationDegrees ?? 0
        this.rotationDirection = obj.rotationDirection ??
            RotationDirection.AUTOMATIC
    }

    usePreviousEventRotation: boolean
    easing: RotationEase
    loopCount: number
    rotationDegrees: number
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
            easing: json.e,
            loopCount: json.l,
            rotationDegrees: json.r,
            rotationDirection: json.o,
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
            e: this.easing,
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
        this.easing = obj.easing ?? RotationEase.NONE
        this.value = obj.value ?? 0
    }

    usePreviousEventTranslation: boolean
    easing: RotationEase
    value: number

    fromJson(json: bsmap.v3.ILightTranslationBase, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightTranslationBase, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightTranslationEvent,
            BaseObject<never, bsmap.v3.ILightTranslationBase>
        >

        const params = {
            easing: json.e,
            usePreviousEventTranslation: json.p === 1,
            value: json.t,
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
            e: this.easing,
            p: this.usePreviousEventTranslation ? 1 : 0,
            t: this.value,
            customData: this.customData,
        } satisfies bsmap.v3.ILightTranslationBase
        return prune ? jsonPrune(output) : output
    }
}
