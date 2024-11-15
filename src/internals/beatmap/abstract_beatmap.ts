import { bsmap } from '../../deps.ts'
import { RMDifficulty } from '../../types/beatmap/rm_difficulty.ts'
import { ClearProperty, PostProcessFn, REQUIRE_MODS, SUGGEST_MODS } from '../../types/beatmap/beatmap.ts'
import { LightEvent } from './object/basic_event/light_event.ts'
import { LaserSpeedEvent } from './object/basic_event/laser_speed.ts'
import { RingZoomEvent } from './object/basic_event/ring_zoom.ts'
import { RingSpinEvent } from './object/basic_event/ring_spin.ts'
import { RotationEvent } from './object/v3_event/rotation.ts'
import { BoostEvent } from './object/v3_event/lighting/boost.ts'
import { AbstractBasicEvent } from './object/basic_event/abstract.ts'
import { BPMEvent } from './object/v3_event/bpm/bpm.ts'
import { LightColorEventBoxGroup } from './object/v3_event/lighting/light_event_box_group/color.ts'
import { LightRotationEventBoxGroup } from './object/v3_event/lighting/light_event_box_group/rotation.ts'
import { LightTranslationEventBoxGroup } from './object/v3_event/lighting/light_event_box_group/translation.ts'
import { BeatmapCustomEvents } from '../../types/beatmap/object/custom_event.ts'
import { RuntimeRawPointsAny } from '../../types/animation/points/runtime/any.ts'
import { Environment } from './object/environment/environment.ts'
import { Geometry } from './object/environment/geometry.ts'
import { AbstractEnvironment, RawGeometryMaterial } from '../../types/beatmap/object/environment.ts'
import { FogEvent } from './object/environment/fog.ts'
import { BasicEvent } from './object/basic_event/basic_event.ts'
import { AnyNote } from '../../types/beatmap/object/note.ts'
import { settings } from '../../data/settings.ts'
import { setDecimals } from '../../utils/math/rounding.ts'
import { Wall } from './object/gameplay_object/wall.ts'
import { ColorNote } from './object/gameplay_object/color_note.ts'
import { Bomb } from './object/gameplay_object/bomb.ts'
import { Arc } from './object/gameplay_object/arc.ts'
import { Chain } from './object/gameplay_object/chain.ts'
import { clearPropertyMap } from '../../constants/beatmap.ts'
import { convertRotationEventsToObjectRotation } from '../../utils/beatmap/convert.ts'
import { animateTrack } from '../../builder_functions/beatmap/object/custom_event/heck.ts'
import { DEFAULT_SCALED_TRACK } from '../../constants/settings.ts'
import { IDifficultyInfo } from '../../types/beatmap/info/difficulty_info.ts'
import { arrayEnsureValue } from '../../utils/array/mutate.ts'
import {ReMapperWorkspace} from "../rm_workspace.ts";

/** A remapper difficulty, version agnostic */
export abstract class AbstractDifficulty<
    TD extends bsmap.v2.IDifficulty | bsmap.v3.IDifficulty =
        | bsmap.v2.IDifficulty
        | bsmap.v3.IDifficulty,
> implements RMDifficulty {
    /** The Json of the entire difficulty. Readonly since it is not outputted in the resulting diff */
    readonly json: Readonly<TD>
    /** The info relating to this difficulty on the Info.dat */
    difficultyInfo: IDifficultyInfo
    /** The workspace this difficulty is a part of. */
    workspace: ReMapperWorkspace
    /** Tasks to complete before the difficulty is saved. */
    awaitingCompletion = new Set<Promise<unknown>>()

    private postProcesses = new Map<number, PostProcessFn[]>()

    // Initialized by constructor using Object.assign
    /** Semver beatmap version. */
    version!: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    /** Whether this difficulty is V3 or not. */
    v3!: boolean
    /** Nobody really knows what these do lol */
    waypoints!: bsmap.v2.IWaypoint[] | bsmap.v3.IWaypoint[]

    /** All standard color notes. */
    colorNotes: ColorNote[] = []
    bombs: Bomb[] = []
    arcs: Arc[] = []
    chains: Chain[] = []
    walls: Wall[] = []

    lightEvents: LightEvent[] = []

    laserSpeedEvents: LaserSpeedEvent[] = []
    ringZoomEvents: RingZoomEvent[] = []
    ringSpinEvents: RingSpinEvent[] = []
    rotationEvents: RotationEvent[] = []
    boostEvents: BoostEvent[] = []
    abstractBasicEvents: AbstractBasicEvent[] = []
    bpmEvents: BPMEvent[] = []

    lightColorEventBoxGroups: LightColorEventBoxGroup[] = []
    lightRotationEventBoxGroups: LightRotationEventBoxGroup[] = []
    lightTranslationEventBoxGroups: LightTranslationEventBoxGroup[] = []

    customEvents: BeatmapCustomEvents = {
        animateComponentEvents: [],
        animateTrackEvents: [],
        assignPathAnimationEvents: [],
        assignPlayerTrackEvents: [],
        assignTrackParentEvents: [],

        setMaterialPropertyEvents: [],
        setGlobalPropertyEvents: [],
        blitEvents: [],
        createCameraEvents: [],
        createScreenTextureEvents: [],
        instantiatePrefabEvents:  [],
        destroyObjectEvents:  [],
        setAnimatorPropertyEvents: [],
        setCameraPropertyEvents: [],
        assignObjectPrefabEvents: [],
        setRenderingSettingEvents: [],

        abstractCustomEvents: []
    }

    pointDefinitions: Record<string, RuntimeRawPointsAny> = {}
    unsafeCustomData!: Record<string, unknown>
    environment: Environment[] = []
    geometry: Geometry[] = []
    geometryMaterials: Record<string, RawGeometryMaterial> = {}
    /** All of the fog related things that happen in this difficulty. */
    fogEvents: FogEvent[] = []

    /**
     * Creates a difficulty. Can be used to access various information and the map properties.
     * Will set the active difficulty to this.
     */
    constructor(
        workspace: ReMapperWorkspace,
        json: TD,
        difficultyInfo: IDifficultyInfo,
    ) {
        this.difficultyInfo = difficultyInfo
        this.loadJSON(json)
        this.json = json
        this.workspace = workspace
        this.registerProcessors()
    }

    private registerProcessors() {
        // low priority
        // we want this to be last
        this.addPostProcess(reduceDecimalsPostProcess, -10)
    }

    /** Add a promise to the difficulty, that will be awaited for on save. */
    async runAsync<T>(callback: () => Promise<T>) {
        const promise = callback()
        this.awaitingCompletion.add(promise)
        const result = await promise
        this.awaitingCompletion.delete(promise)
        return result
    }

    /** Await all promises in this difficulty.
     * Some examples of promises that would be awaited are things like ModelScene calls.
     */
    async awaitAllAsync() {
        await Promise.all(this.awaitingCompletion)
    }

    /**
     * Allows you to add a function to be run on save of this difficulty.
     * @param process The function to be added.
     * @param priority Default 0. Higher priority means first
     */
    addPostProcess(process: PostProcessFn, priority?: number) {
        priority ??= 0

        let arr = this.postProcesses.get(priority)
        if (!arr) {
            arr = []
            this.postProcesses.set(priority, arr)
        }

        arr.push(process)
    }

    protected abstract loadJSON(json: TD): void

    abstract toJSON(): TD

    async toString(pretty = false) {
        await this.awaitAllAsync()
        this.applySettings()
        const outputJSON = this.toJSON()

        const sortedProcess = [...this.postProcesses.entries()]
            // ascending
            .sort(([a], [b]) => a - b)
            // descending
            .reverse()
            .flatMap(([, arr]) => arr)

        const transformer = (k: string, v: unknown) => {
            let newValue = v

            sortedProcess.forEach((process) => {
                const oldValue = newValue
                newValue = process(k, newValue)

                /// if undefined, use previous value
                if (newValue === undefined) {
                    newValue = oldValue
                }
            })

            return newValue
        }

        return JSON.stringify(
            outputJSON,
            sortedProcess.length > 0 ? transformer : undefined,
            pretty ? 2 : 0,
        )
    }

    private applySettings() {
        const identityScaledObjects = [
            ...this.colorNotes,
            ...this.chains,
            ...this.bombs,
        ]

        if (settings.forceDefaultScale && identityScaledObjects.length > 0) {
            identityScaledObjects.forEach((o) => {
                o.track.add(DEFAULT_SCALED_TRACK)
            })

            animateTrack(this, {
                track: DEFAULT_SCALED_TRACK,
                animation: {
                    scale: [1, 1, 1],
                },
            })
        }
        if (settings.convertRotationEventsToObjectRotation) {
            convertRotationEventsToObjectRotation(this)
        }
    }

    /** Clear objects on this difficulty.
     @param exclude Array of things to ignore during the clear.
     */
    clear(exclude: ClearProperty[] = []) {
        const excludeSet = new Set(exclude)
        const clear = (property: ClearProperty) => !excludeSet.has(property)

        Object.keys(clearPropertyMap).forEach((x) => {
            const key = x as keyof typeof clearPropertyMap
            const value = clearPropertyMap[key]

            if (value !== undefined && !clear(value)) return

            if (key === 'customEvents') {
                this.clearObject(this.customEvents)
                return
            }

            const arr = Array.isArray(
                (this as unknown as Record<string, unknown>)[key],
            )
            ;(this as unknown as Record<string, unknown>)[key] = arr ? [] : {}
        })
    }

    private clearObject(object: object) {
        Object.keys(object).forEach((x) => {
            const arr = Array.isArray(
                (object as unknown as Record<string, unknown>)[x],
            )
            ;(object as unknown as Record<string, unknown>)[x] = arr ? [] : {}
        })
    }

    /**
     * Add/remove a mod requirement from the difficulty.
     * @param requirement The requirement to effect.
     * @param required True by default, set to false to remove the requirement.
     */
    require(requirement: REQUIRE_MODS, required = true) {
        const requirements = this.difficultyInfo.requirements ??= []
        arrayEnsureValue(requirements, requirement, required)
    }

    /**
     * Add/remove a mod suggestion from the difficulty.
     * @param suggestion The suggestion to effect.
     * @param suggested True by default, set to false to remove the suggestion.
     */
    suggest(suggestion: SUGGEST_MODS, suggested = true) {
        const suggestions = this.difficultyInfo.suggestions ??= []
        arrayEnsureValue(suggestions, suggestion, suggested)
    }

    /** Array opf both geometry and environment. */
    rawEnvironment() {
        return [
            ...this.environment,
            ...this.geometry,
        ] as AbstractEnvironment[]
    }

    /**
     * Iterator for all basic (non V3 lighting_v3) events on the difficulty.
     * @brief Not sorted
     */
    allBasicEvents(sorted = false): BasicEvent[] {
        const arr = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.abstractBasicEvents,
        ]

        if (sorted) return arr.sort((a, b) => a.beat - b.beat)
        return arr
    }

    /** Iterator for all notes. */
    get allNotes() {
        return [
            ...this.colorNotes,
            ...this.bombs,
            ...this.arcs,
            ...this.chains,
        ] as readonly AnyNote[]
    }
}

function reduceDecimalsPostProcess(
    _k: string,
    v: unknown,
): unknown {
    if (!settings.decimalPrecision) return
    if (!v) return

    if (typeof v !== 'number') return

    return setDecimals(v, settings.decimalPrecision)
}