import { RotationDirection, RotationEase } from '../../../../../../constants/v3_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import {BaseLightEvent} from "./base.ts";
import {LightRotationEventBox} from "../light_event_box/rotation.ts";

export class LightRotationEvent extends BaseLightEvent<bsmap.v3.ILightRotationBase> {
    constructor(parent: LightRotationEventBox, obj: BeatmapObjectConstructor<LightRotationEvent>) {
        super(parent, obj)
        this.usePreviousEventRotation = obj.usePreviousEventRotation ?? LightRotationEvent.defaults.usePreviousEventRotation
        this.easing = obj.easing ?? LightRotationEvent.defaults.easing
        this.loopCount = obj.loopCount ?? LightRotationEvent.defaults.loopCount
        this.rotationDegrees = obj.rotationDegrees ?? LightRotationEvent.defaults.rotationDegrees
        this.rotationDirection = obj.rotationDirection ?? LightRotationEvent.defaults.rotationDirection
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

    static override defaults: BeatmapObjectDefaults<LightRotationEvent> = {
        usePreviousEventRotation: true,
        easing: RotationEase.None,
        loopCount: 1,
        rotationDegrees: 0,
        rotationDirection: RotationDirection.AUTOMATIC,
        ...super.defaults,
    }

    protected override getArray(parent: LightRotationEventBox): this[] {
        return parent.events as this[]
    }

    override fromJsonV3(json: bsmap.v3.ILightRotationBase): this {
        this.usePreviousEventRotation = json.p !== undefined ? json.p === 1 : LightRotationEvent.defaults.usePreviousEventRotation
        this.easing = json.e ?? LightRotationEvent.defaults.easing
        this.loopCount = json.l ?? LightRotationEvent.defaults.loopCount
        this.rotationDegrees = json.r ?? LightRotationEvent.defaults.rotationDegrees
        this.rotationDirection = json.o ?? LightRotationEvent.defaults.rotationDirection
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw 'Event box groups are not supported in V2!'
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightRotationBase {
        const output = {
            b: this.beat,
            e: this.easing as bsmap.v3.ILightRotationBase['e'],
            l: this.loopCount,
            o: this.rotationDirection,
            p: this.usePreviousEventRotation ? 1 : 0,
            r: this.rotationDegrees,
            customData: this.unsafeCustomData,
        } satisfies bsmap.v3.ILightRotationBase
        return prune ? objectPrune(output) : output
    }
}
