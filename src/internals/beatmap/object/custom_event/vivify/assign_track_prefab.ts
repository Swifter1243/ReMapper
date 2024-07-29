import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IAssignTrackPrefab } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {DefaultFields} from "../../../../../types/beatmap/object/object.ts";

export class AssignTrackPrefab extends CustomEvent<
    never,
    IAssignTrackPrefab
> {
    constructor(
        params: CustomEventConstructor<AssignTrackPrefab>,
    ) {
        super(params)
        this.type = 'AssignTrackPrefab'
        this.track = params.track ?? AssignTrackPrefab.defaults.track
        this.colorNotes = params.colorNotes
        this.bombNotes = params.bombNotes
        this.chainHeads = params.chainHeads
        this.chainLinks = params.chainLinks
        this.colorNoteDebris = params.colorNoteDebris
        this.chainHeadDebris = params.chainHeadDebris
        this.chainLinkDebris = params.chainLinkDebris
    }

    /** Only objects on this track will be affected. */
    track: string
    /** File path to the desired prefab to replace color notes. */
    colorNotes?: string
    /** File path to the desired prefab to replace bombs. */
    bombNotes?: string
    /** File path to the desired prefab to replace chain heads. */
    chainHeads?: string
    /** File path to the desired prefab to replace chain links. */
    chainLinks?: string
    /** File path to the desired prefab to replace color note debris. */
    colorNoteDebris?: string
    /** File path to the desired prefab to replace chain head debris. */
    chainHeadDebris?: string
    /** File path to the desired prefab to replace chain link debris. */
    chainLinkDebris?: string

    static defaults: DefaultFields<AssignTrackPrefab> = {
        track: '',
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.assignTrackPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: IAssignTrackPrefab): this {
        this.track = getDataProp(json.d, 'track') ?? AssignTrackPrefab.defaults.track
        this.colorNotes = getDataProp(json.d, 'colorNotes')
        this.colorNoteDebris = getDataProp(json.d, 'colorNoteDebris')
        this.chainHeadDebris = getDataProp(json.d, 'burstSliderDebris')
        this.chainLinkDebris = getDataProp(json.d, 'burstSliderElementDebris')
        this.chainLinks = getDataProp(json.d, 'burstSliderElements')
        this.chainHeads = getDataProp(json.d, 'burstSliders')
        this.bombNotes = getDataProp(json.d, 'bombNotes')
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'AssignTrackPrefab is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IAssignTrackPrefab {
        const output = {
            b: this.beat,
            d: {
                track: this.track,
                colorNoteDebris: this.colorNoteDebris,
                colorNotes: this.colorNotes,
                burstSliderDebris: this.chainHeadDebris,
                burstSliders: this.chainHeads,
                burstSliderElements: this.chainLinks,
                burstSliderElementDebris: this.chainLinkDebris,
                bombNotes: this.bombNotes,
                ...this.data,
            },
            t: 'AssignTrackPrefab',
        } satisfies IAssignTrackPrefab
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'AssignTrackPrefab is only supported in V3!'
    }
}
