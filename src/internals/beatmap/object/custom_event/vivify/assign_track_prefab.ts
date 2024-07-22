import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import {IAssignTrackPrefab} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";

export class AssignTrackPrefab extends CustomEvent<
    never,
    IAssignTrackPrefab
> {
    constructor(
        params: CustomEventConstructor<AssignTrackPrefab>,
    ) {
        super(params)
        this.type = 'AssignTrackPrefab'
        this.track = params.track ?? ''
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

    push(clone = true) {
        getActiveDifficulty().customEvents.assignTrackPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IAssignTrackPrefab, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IAssignTrackPrefab
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<AssignTrackPrefab>

        if (!v3) throw 'AssignTrackPrefab is only supported in V3!'

        const obj = json as IAssignTrackPrefab

        const params = {
            track: getDataProp(obj.d, 'track'),
            colorNotes: getDataProp(obj.d, 'colorNotes'),
            colorNoteDebris: getDataProp(obj.d, 'colorNoteDebris'),
            chainHeadDebris: getDataProp(obj.d, 'burstSliderDebris'),
            chainLinkDebris: getDataProp(obj.d, 'burstSliderElementDebris'),
            chainLinks: getDataProp(obj.d, 'burstSliderElements'),
            chainHeads: getDataProp(obj.d, 'burstSliders'),
            bombNotes: getDataProp(obj.d, 'bombNotes'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IAssignTrackPrefab
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'AssignTrackPrefab is only supported in V3!'

        if (!this.track) {
            throw 'track is undefined, which is required for AssignTrackPrefab!'
        }

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
}
