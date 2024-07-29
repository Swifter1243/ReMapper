import { CustomEvent } from '../base/custom_event.ts'
import { DefaultFields, ExcludedObjectFields } from '../../../../../types/beatmap/object/object.ts'
import { CustomEventExclusions } from '../../../../../types/beatmap/object/custom_event.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'

export class AssignPlayerToTrack extends CustomEvent<
    bsmap.v2.ICustomEventAssignPlayerToTrack,
    bsmap.v3.ICustomEventAssignPlayerToTrack
> {
    constructor(
        params: ExcludedObjectFields<
            AssignPlayerToTrack,
            // deno-lint-ignore ban-types
            {},
            CustomEventExclusions
        >,
    ) {
        super(params)
        this.type = 'AssignPlayerToTrack'
        this.track = params.track ?? AssignPlayerToTrack.defaults.track
        this.target = params.target
    }

    /** Track the player will be assigned to. */
    track: string
    /** Which component of the player to target. */
    target?: bsmap.PlayerObject

    static defaults: DefaultFields<AssignPlayerToTrack> = {
        track: '',
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.assignPlayerTrackEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: bsmap.v3.ICustomEventAssignPlayerToTrack): this {
        this.track = getDataProp(json.d, 'track') as string ?? AssignPlayerToTrack.defaults.track
        this.target = getDataProp(json.d, 'target')
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.ICustomEventAssignPlayerToTrack): this {
        this.track = getDataProp(json._data, '_track') as string ?? AssignPlayerToTrack.defaults.track
        this.target = getDataProp(json._data, '_target')
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEventAssignPlayerToTrack {
        const output = {
            b: this.beat,
            d: {
                track: this.track!,
                target: this.target,
                ...this.data,
            },
            t: 'AssignPlayerToTrack',
        } satisfies bsmap.v3.ICustomEventAssignPlayerToTrack
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.ICustomEventAssignPlayerToTrack {
        if (this.target) {
            console.log('Target is unsupported in v2')
        }

        const output = {
            _data: {
                _track: this.track!,
                ...this.data,
            },
            _time: this.beat,
            _type: 'AssignPlayerToTrack',
        } satisfies bsmap.v2.ICustomEventAssignPlayerToTrack
        return prune ? objectPrune(output) : output
    }
}
