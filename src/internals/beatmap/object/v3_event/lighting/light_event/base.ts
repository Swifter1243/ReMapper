//! Events
import { bsmap } from '../../../../../../deps.ts'
import {BeatmapObject} from "../../../object.ts";

type LightBase =
    | bsmap.v3.ILightColorBase
    | bsmap.v3.ILightRotationBase
    | bsmap.v3.ILightTranslationBase

export abstract class BaseLightEvent<T extends LightBase = LightBase>
    extends BeatmapObject<never, T> {}
