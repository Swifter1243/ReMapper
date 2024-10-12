import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IAssignObjectPrefab } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {LOAD_MODE} from "../../../../../types/vivify/setting.ts";

export class AssignObjectPrefab extends CustomEvent<
    never,
    IAssignObjectPrefab
> {
    constructor(
        params: CustomEventConstructor<AssignObjectPrefab>,
    ) {
        super(params)
        this.type = 'AssignObjectPrefab'
        this.loadMode = params.loadMode
        this.colorNotes = params.colorNotes
        this.bombNotes = params.bombNotes
        this.chainHeads = params.chainHeads
        this.chainLinks = params.chainLinks
        this.saber = params.saber
    }

    /** Determines how this prefab will be assigned to this track. */
    loadMode?: LOAD_MODE
    /** The desired prefab(s) to replace color notes. */
    colorNotes?: IAssignObjectPrefab['d']['colorNotes']
    /** The desired prefab to replace bombs. */
    bombNotes?: IAssignObjectPrefab['d']['bombNotes']
    /** The desired prefab(s) to replace chain heads. */
    chainHeads?: IAssignObjectPrefab['d']['burstSliders']
    /** The desired prefab(s) to replace chain links. */
    chainLinks?: IAssignObjectPrefab['d']['burstSliderElements']
    /** The desired prefab/material to replace sabers */
    saber?: IAssignObjectPrefab['d']['saber']

    static override defaults: JsonObjectDefaults<AssignObjectPrefab> = {
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.assignObjectPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    override fromJsonV3(json: IAssignObjectPrefab): this {
        this.loadMode = getDataProp(json.d, 'loadMode')
        this.colorNotes = getDataProp(json.d, 'colorNotes')
        this.chainLinks = getDataProp(json.d, 'burstSliderElements')
        this.chainHeads = getDataProp(json.d, 'burstSliders')
        this.bombNotes = getDataProp(json.d, 'bombNotes')
        this.saber = getDataProp(json.d, 'saber')
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw 'AssignObjectPrefab is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IAssignObjectPrefab {
        const output = {
            b: this.beat,
            d: {
                loadMode: this.loadMode,
                colorNotes: this.colorNotes,
                burstSliders: this.chainHeads,
                burstSliderElements: this.chainLinks,
                bombNotes: this.bombNotes,
                saber: this.saber,
                ...this.data,
            },
            t: 'AssignObjectPrefab',
        } satisfies IAssignObjectPrefab
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'AssignObjectPrefab is only supported in V3!'
    }
}
