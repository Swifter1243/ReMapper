import {bsmap} from '../../../../deps.ts'
import {BaseEnvironmentEnhancement} from "./base_environment.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";
import {ExcludedEnvironmentFields, LookupMethod} from "../../../../types/beatmap/object/environment.ts";
import {JsonObjectDefaults} from "../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../abstract_beatmap.ts";

export class Environment extends BaseEnvironmentEnhancement<
    bsmap.v2.IChromaEnvironmentID,
    bsmap.v3.IChromaEnvironmentID
> {

    constructor(
        parentDifficulty: AbstractDifficulty,
        fields: ExcludedEnvironmentFields<Environment>,
    ) {
        super(parentDifficulty, fields)
        this.id = fields.id ?? Environment.defaults.id
        this.lookupMethod = fields.lookupMethod ?? Environment.defaults.lookupMethod
    }

    /** The object name to look up in the environment. */
    id: string
    /** The method of looking up the object name in the environment. */
    lookupMethod: LookupMethod

    static override defaults: JsonObjectDefaults<Environment> = {
        id: '',
        lookupMethod: 'Contains',
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.environment as this[]
    }

    override fromJsonV3(json: bsmap.v3.IChromaEnvironmentID): this {
        this.id = json.id ?? Environment.defaults.id
        this.lookupMethod = json.lookupMethod ?? Environment.defaults.lookupMethod
        return super.fromJsonV3(json);
    }

    override fromJsonV2(json: bsmap.v2.IChromaEnvironmentID): this {
        this.id = json._id ?? Environment.defaults.id
        this.lookupMethod = json._lookupMethod ?? Environment.defaults.lookupMethod
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IChromaEnvironmentID {
        if (this.id === "") throw new Error("'id' is empty, which is redundant for environment statements!")

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
            track: this.track.value as string,
        } satisfies bsmap.v3.IChromaEnvironmentID
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IChromaEnvironmentID {
        if (this.id === "") throw new Error("'id' is empty, which is redundant for environment statements!")
        if (this.components) throw new Error('Components are not supported in v2')

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
            _track: this.track.value as string,
        } satisfies bsmap.v2.IChromaEnvironmentID
        return prune ? objectPrune(output) : output
    }
}

