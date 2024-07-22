import {bsmap} from '../../../../deps.ts'
import {BaseEnvironmentEnhancement} from "./base_environment.ts";
import {copy} from "../../../../utils/object/copy.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {getActiveDifficulty} from "../../../../data/active_difficulty.ts";
import {ExcludedEnvironmentFields, LookupMethod} from "../../../../types/beatmap/object/environment.ts";
import {SubclassExclusiveProps} from "../../../../types/util/class.ts";

export class Environment extends BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentID,
    bsmap.v3.IChromaEnvironmentID
> {
    push(clone = true): void {
        getActiveDifficulty().environment.push(clone ? copy(this) : this)
    }

    constructor(
        fields: ExcludedEnvironmentFields<Environment>,
    ) {
        super(fields)
        this.id = fields.id ?? ''
        this.lookupMethod = fields.lookupMethod ?? 'Contains'
    }

    /** The object name to look up in the environment. */
    id: string
    /** The method of looking up the object name in the environment. */
    lookupMethod: LookupMethod

    fromJson(json: bsmap.v3.IChromaEnvironmentID, v3: true): this
    fromJson(json: bsmap.v2.IChromaEnvironmentID, v3: false): this
    fromJson(
        json: bsmap.v2.IChromaEnvironmentID | bsmap.v3.IChromaEnvironmentID,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            Environment,
            BaseEnvironmentEnhancement<
                bsmap.v2.IChromaEnvironmentID,
                bsmap.v3.IChromaEnvironmentID
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IChromaEnvironmentID

            const params = {
                id: obj.id,
                lookupMethod: obj.lookupMethod,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.IChromaEnvironmentID

            const params = {
                id: obj._id,
                lookupMethod: obj._lookupMethod,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IChromaEnvironmentID
    toJson(v3: false, prune?: boolean): bsmap.v2.IChromaEnvironmentID
    toJson(
        v3: boolean,
        prune = true,
    ): bsmap.v2.IChromaEnvironmentID | bsmap.v3.IChromaEnvironmentID {
        if (v3) {
            const output = {
                id: this.id,
                lookupMethod: this.lookupMethod,
                active: this.active,
                components: {
                    ILightWithId: {
                        lightID: this.lightID,
                        type: this.lightType,
                    },
                    ...this.components,
                },
                duplicate: this.duplicate,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track?.value as string,
            } satisfies bsmap.v3.IChromaEnvironmentID
            return prune ? objectPrune(output) : output
        }

        if (this.components) throw 'Components are not supported in v2'

        const output = {
            _id: this.id,
            _lookupMethod: this.lookupMethod,
            _active: this.active,
            _duplicate: this.duplicate,
            _lightID: this.lightID,
            _localPosition: this.localPosition,
            _localRotation: this.localRotation,
            _position: this.position,
            _rotation: this.rotation,
            _scale: this.scale,
            _track: this.track?.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentID
        return prune ? objectPrune(output) : output
    }
}

