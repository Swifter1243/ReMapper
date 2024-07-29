import { CustomEvent } from '../base/custom_event.ts'
import { CustomEventConstructorTrack } from '../../../../../types/beatmap/object/custom_event.ts'
import { Fields } from '../../../../../types/util/class.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'

export class AssignTrackParent extends CustomEvent<
    bsmap.v2.ICustomEventAssignTrackParent,
    bsmap.v3.ICustomEventAssignTrackParent
> {
    /**
     * Assign tracks to a parent track.
     */
    constructor(
        params: CustomEventConstructorTrack<AssignTrackParent>,
    ) {
        super(params)
        this.type = 'AssignTrackParent'
        this.childrenTracks = params.childrenTracks ?? AssignTrackParent.defaults.childrenTracks
        this.parentTrack = params.parentTrack ?? AssignTrackParent.defaults.parentTrack
        this.worldPositionStays = params.worldPositionStays
    }

    /** Children tracks to assign. */
    childrenTracks: string[]
    /** Name of the parent track. */
    parentTrack: string
    /** Modifies the transform of children objects to remain in the same place relative to world space. */
    worldPositionStays?: boolean

    static defaults: Fields<AssignTrackParent> = {
        childrenTracks: [],
        parentTrack: '',
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.assignTrackParentEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: bsmap.v3.ICustomEventAssignTrackParent): this {
        this.childrenTracks = getDataProp(json.d, 'childrenTracks') as string[] ??
            AssignTrackParent.defaults.childrenTracks
        this.parentTrack = getDataProp(json.d, 'parentTrack') ??
            AssignTrackParent.defaults.parentTrack
        this.worldPositionStays = getDataProp(json.d, 'worldPositionStays')
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.ICustomEventAssignTrackParent): this {
        this.childrenTracks = getDataProp(json._data, '_childrenTracks') as string[] ??
            AssignTrackParent.defaults.childrenTracks
        this.parentTrack = getDataProp(json._data, '_parentTrack') ??
            AssignTrackParent.defaults.parentTrack
        this.worldPositionStays = getDataProp(json._data, '_worldPositionStays')
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEventAssignTrackParent {
        const output = {
            b: this.beat,
            d: {
                childrenTracks: this.childrenTracks,
                parentTrack: this.parentTrack,
                worldPositionStays: this.worldPositionStays,
                ...this.data,
            },
            t: 'AssignTrackParent',
        } satisfies bsmap.v3.ICustomEventAssignTrackParent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.ICustomEventAssignTrackParent {
        const output = {
            _data: {
                _childrenTracks: this.childrenTracks,
                _parentTrack: this.parentTrack,
                _worldPositionStays: this.worldPositionStays,
                ...this.data,
            },
            _time: this.beat,
            _type: 'AssignTrackParent',
        } satisfies bsmap.v2.ICustomEventAssignTrackParent
        return prune ? objectPrune(output) : output
    }
}
