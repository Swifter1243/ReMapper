import { NoteColor, NoteCut } from '../../../../data/constants/note.ts'
import { ExcludedObjectFields } from '../../../../types/beatmap/object/object.ts'
import { BeatmapGameplayObject } from './gameplay_object.ts'
import { bsmap } from '../../../../deps.ts'
import {Vec2} from "../../../../types/math/vector.ts";
import {NoteAnimationData} from "../../../../types/animation/properties/note.ts";
import {Fields, SubclassExclusiveProps} from "../../../../types/util/class.ts";
import {getCDProp} from "../../../../utils/beatmap/json.ts";

export abstract class BaseSliderObject<TV3 extends bsmap.v3.IBaseSlider>
    extends BeatmapGameplayObject<never, TV3> {
    /** The color of the object. */
    type: NoteColor
    /** The cut direction of the head. */
    cutDirection: NoteCut
    /** The time the tail arrives at the player. */
    tailBeat: number
    /** The lane of the tail. */
    tailX: number
    /** The vertical row of the tail. */
    tailY: number
    /** The position of the tail. */
    tailCoordinates?: Vec2

    constructor(
        obj: ExcludedObjectFields<BaseSliderObject<TV3>>,
    ) {
        super(obj)
        this.type = obj.type ?? NoteColor.RED
        this.cutDirection = obj.cutDirection ?? 0
        this.tailBeat = obj.tailBeat ?? 0
        this.tailX = obj.tailX ?? 0
        this.tailY = obj.tailY ?? 0
        this.tailCoordinates = obj.tailCoordinates
    }

    declare animation: NoteAnimationData

    get isGameplayModded() {
        if (super.isGameplayModded) return true
        if (this.tailCoordinates) return true
        return false
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: never | TV3, v3: boolean): this {
        if (!v3) throw 'V2 is not supported for slider notes'

        type Params = Fields<
            SubclassExclusiveProps<
                BaseSliderObject<TV3>,
                BeatmapGameplayObject<never, TV3>
            >
        >

        const obj = json as TV3

        const params = {
            type: obj.c ?? 0,
            cutDirection: obj.d ?? 0,
            tailCoordinates: getCDProp(obj, 'tailCoordinates'),
            tailBeat: obj.tb ?? 0,
            tailX: obj.tx ?? 0,
            tailY: obj.ty ?? 0,
        } satisfies Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }
}
