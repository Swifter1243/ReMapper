import {BeatmapObject} from "../../../object.ts";
import {ObjectFields} from "../../../../../../types/util/json.ts";
import {RotationDirection, RotationEase} from "../../../../../../data/constants/v3_event.ts";
import {SubclassExclusiveProps} from "../../../../../../types/util/class.ts";
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'


export class LightRotationEvent extends BeatmapObject<never, bsmap.v3.ILightRotationBase> {
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
            BeatmapObject<never, bsmap.v3.ILightRotationBase>
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
        return prune ? objectPrune(output) : output
    }
}
