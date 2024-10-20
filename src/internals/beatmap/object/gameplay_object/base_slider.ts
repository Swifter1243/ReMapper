import { NoteColor, NoteCut } from '../../../../constants/note.ts'
import { BeatmapGameplayObject } from './gameplay_object.ts'
import { bsmap } from '../../../../deps.ts'
import {Vec2} from "../../../../types/math/vector.ts";
import {NoteAnimationData} from "../../../../types/animation/properties/note.ts";
import {getCDProp} from "../../../../utils/beatmap/json.ts";
import {GameplayObjectDefaults, GameplayObjectConstructor} from "../../../../types/beatmap/object/gameplay_object.ts";
import {AbstractDifficulty} from "../../abstract_beatmap.ts";

export abstract class BaseSliderObject<TV3 extends bsmap.v3.IBaseSlider = bsmap.v3.IBaseSlider>
    extends BeatmapGameplayObject<never, TV3> {

    constructor(
        parentDifficulty: AbstractDifficulty,
        obj: GameplayObjectConstructor<BaseSliderObject<TV3>>,
    ) {
        super(parentDifficulty, obj)
        this.color = obj.color ?? BaseSliderObject.defaults.color
        this.cutDirection = obj.cutDirection ?? BaseSliderObject.defaults.cutDirection
        this.tailBeat = obj.tailBeat ?? BaseSliderObject.defaults.tailBeat
        this.tailX = obj.tailX ?? BaseSliderObject.defaults.tailX
        this.tailY = obj.tailY ?? BaseSliderObject.defaults.tailY
        this.tailCoordinates = obj.tailCoordinates
    }

    declare animation: NoteAnimationData
    /** The color of the object. */
    color: NoteColor
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

    static override defaults: GameplayObjectDefaults<BaseSliderObject> = {
        color: NoteColor.RED,
        cutDirection: NoteCut.DOWN,
        tailBeat: 0,
        tailX: 0,
        tailY: 0,
        ...super.defaults
    }

    override get isGameplayModded() {
        if (this.tailCoordinates) return true
        return super.isGameplayModded
    }

    override fromJsonV3(json: TV3): this {
        this.color = json.c ?? BaseSliderObject.defaults.color
        this.cutDirection = json.d ?? BaseSliderObject.defaults.cutDirection
        this.tailBeat = json.tb ?? BaseSliderObject.defaults.tailBeat
        this.tailX = json.tx ?? BaseSliderObject.defaults.tailX
        this.tailY = json.ty ?? BaseSliderObject.defaults.tailY
        this.tailCoordinates = getCDProp(json, 'tailCoordinates')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw 'V2 is not supported for slider notes'
    }
}
