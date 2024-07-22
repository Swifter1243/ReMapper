// TODO: Stink
import {ModelObject} from "../object.ts";


/**
 * The properties reported for a given group in `ModelScene` after the model is instantiated.
 */
export type SceneObjectInfo = {
    /** The maximum number of objects in this group that showed up at once during a switch. */
    max: number
    /** The number of objects that showed up in a given switch. */
    perSwitch: Record<number, number>
    /** If defined, this is the very first transform for all objects in this group. */
    initialPos?: ModelObject[]
}

