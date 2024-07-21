import { assignTrackPrefab, instantiatePrefab } from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {InstantiatePrefab} from "../../internals/beatmap/object/custom_event/vivify.ts";
import {PrefabInstance} from "./prefab_instance.ts";

/** Used to load type safe prefabs. See `loadAssets` */
export class Prefab {
    /** Path to this prefab in the asset bundle. */
    readonly path: string
    /** Name of this prefab, it is also included in the track. */
    readonly name: string
    /** Keeps track of how many times this prefab has been instantiated. */
    private iteration = 0

    constructor(path: string, name: string) {
        this.path = path
        this.name = name
    }

    /** Instantiate this prefab. Returns the instance. */
    instantiate(
        beat = 0,
        event?: (event: InstantiatePrefab) => void,
    ) {
        const id = `${this.name}_${this.iteration}`
        const instantiation = instantiatePrefab(beat, this.path, id, id)
        if (event) event(instantiation)
        instantiation.push(false)
        this.iteration++
        return new PrefabInstance(id, instantiation)
    }

    /** Create an light_event to assign this prefab to color notes. */
    assignToColorNote(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            colorNotes: this.path,
        }).push()
    }

    /** Create an light_event to assign this prefab to color note debris. */
    assignToColorNoteDebris(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            colorNoteDebris: this.path,
        }).push()
    }

    /** Create an light_event to assign this prefab to bombs. */
    assignToBombs(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            bombNotes: this.path,
        }).push()
    }

    /** Create an light_event to assign this prefab to chain heads. */
    assignToChainHeads(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainHeads: this.path,
        }).push()
    }

    /** Create an light_event to assign this prefab to chain head debris. */
    assignToChainHeadDebris(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainHeadDebris: this.path,
        }).push()
    }

    /** Create an light_event to assign this prefab to chain head debris. */
    assignToChainLinks(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainLinks: this.path,
        }).push()
    }

    /** Create an light_event to assign this prefab to chain head debris. */
    assignToChainLinkDebris(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainLinkDebris: this.path,
        }).push()
    }
}
