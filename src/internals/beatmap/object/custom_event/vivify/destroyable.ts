import { AbstractDifficulty } from '../../../abstract_beatmap.ts'
import { destroyObject } from '../../../../../builder_functions/beatmap/object/custom_event/vivify.ts'
import { CustomEvent } from '../base/custom_event.ts'
import { DestroyObject } from './destroy_object.ts'
import {
    CustomEventConstructorTrack,
    IV3EventDestroyable
} from '../../../../../types/beatmap/object/custom_event.ts'
import { bsmap } from '../../../../../deps.ts'
import {getDataProp} from "../../../../../utils/beatmap/json.ts";

export abstract class Destroyable<
    TV2 extends bsmap.v2.ICustomEvent = bsmap.v2.ICustomEvent,
    TV3 extends IV3EventDestroyable = IV3EventDestroyable,
> extends CustomEvent<TV2, TV3> {
    /** The ID of this object. */
    id?: string
    private _destroyed = false

    protected constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<Destroyable>,
    ) {
        super(difficulty, params)
        this.id = params.id
    }

    /** Destroy this object with a DestroyObject event. Requires it to have an ID. */
    destroyObject(beat: number): void
    destroyObject(event: DestroyObject): void
    destroyObject(param: number | DestroyObject) {
        this.destroyInternal()

        if (param instanceof DestroyObject) {
            param.id.add(this.id!)
        }
        else {
            destroyObject(this.parent, param, this.id)
        }
    }

    private destroyInternal() {
        if (!this.id) {
            throw new Error(`You can't destroy an object without an ID!`)
        }

        if (this._destroyed) {
            throw new Error(`Object ${this.id} is already destroyed.`)
        }

        this._destroyed = true
    }

    override fromJsonV3(json: TV3): this {
        this.id = getDataProp(json.d, 'id')
        return super.fromJsonV3(json);
    }
}