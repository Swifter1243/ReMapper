import { assignTrackPrefab, instantiatePrefab } from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {PrefabInstance} from "./prefab_instance.ts";
import {InstantiatePrefab} from "../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {LOAD_MODE} from "../../types/vivify/setting.ts";

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

    /** Create an event to assign this prefab to color notes. */
    assignToColorNote(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            colorNotes: this.path,
        }).push()
    }

    /** Create an event to assign this prefab to color note debris. */
    assignToColorNoteDebris(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            colorNoteDebris: this.path,
        }).push()
    }

    /** Create an event to assign this prefab to bombs. */
    assignToBombs(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            bombNotes: this.path,
        }).push()
    }

    /** Create an event to assign this prefab to chain heads. */
    assignToChainHeads(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            chainHeads: this.path,
        }).push()
    }

    /** Create an event to assign this prefab to chain head debris. */
    assignToChainHeadDebris(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            chainHeadDebris: this.path,
        }).push()
    }

    /** Create an event to assign this prefab to chain head debris. */
    assignToChainLinks(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            chainLinks: this.path,
        }).push()
    }

    /** Create an event to assign this prefab to chain head debris. */
    assignToChainLinkDebris(track: string, loadMode?: LOAD_MODE, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            loadMode,
            chainLinkDebris: this.path,
        }).push()
    }
}
