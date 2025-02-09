import { objectPrune } from '../../../../../utils/object/prune.ts'
import {
    CameraProperties,
    ISetCameraProperty
} from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../../abstract_difficulty.ts";
import {copy} from "../../../../../utils/object/copy.ts";

export class SetCameraProperty extends CustomEvent<
    never,
    ISetCameraProperty
> {
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructor<SetCameraProperty>,
    ) {
        super(difficulty, params)
        this.type = 'SetCameraProperty'
        this.properties = params.properties ?? copy(SetCameraProperty.defaults.properties)
        this.id = params.id
    }

    /** ID of camera to affect. Default to "_Main". */
    id?: string
    /** The properties for the camera. */
    properties: CameraProperties

    static override defaults: JsonObjectDefaults<SetCameraProperty> = {
        properties: {},
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.setCameraPropertyEvents as this[]
    }

    override fromJsonV3(json: ISetCameraProperty): this {
        this.id = getDataProp(json.d, 'id')
        this.properties = getDataProp(json.d, 'properties') ?? copy(SetCameraProperty.defaults.properties)
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw new Error('SetCameraProperty is only supported in V3!')
    }

    toJsonV3(prune?: boolean): ISetCameraProperty {
        const output = {
            b: this.beat,
            t: 'SetCameraProperty',
            d: {
                id: this.id,
                properties: this.properties,
                ...this.unsafeData,
            },
        } satisfies ISetCameraProperty
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('SetCameraProperty is only supported in V3!')
    }
}
