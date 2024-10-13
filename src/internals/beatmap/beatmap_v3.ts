import { wall } from '../../builder_functions/beatmap/object/gameplay_object/wall.ts'
import { bsmap } from '../../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { AnyFog, FogEvent } from './object/environment/fog.ts'
import {
    assignObjectPrefab,
    blit,
    declareCullingTexture,
    declareRenderTexture,
    destroyPrefab,
    destroyTexture,
    instantiatePrefab,
    setAnimatorProperty,
    setCameraProperty,
    setGlobalProperty,
    setMaterialProperty,
    setRenderingSettings,
} from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import { animateTrack } from '../../builder_functions/beatmap/object/custom_event/heck.ts'
import {
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from '../../builder_functions/beatmap/object/custom_event/noodle_extensions.ts'
import { animateComponent } from '../../builder_functions/beatmap/object/custom_event/chroma.ts'
import {
    lightColorEventBoxGroup,
    lightRotationEventBoxGroup,
    lightTranslationEventBoxGroup,
} from '../../builder_functions/beatmap/object/v3_event/lighting/light_event_box_group.ts'
import { communityBpmEvent } from '../../builder_functions/beatmap/object/basic_event/bpm.ts'
import { earlyRotation, lateRotation } from '../../builder_functions/beatmap/object/v3_event/rotation.ts'
import { leftLaserSpeed } from '../../builder_functions/beatmap/object/basic_event/laser_speed.ts'
import { ringSpin, ringZoom } from '../../builder_functions/beatmap/object/basic_event/ring.ts'
import { abstract } from '../../builder_functions/beatmap/object/basic_event/abstract.ts'
import { backLasers } from '../../builder_functions/beatmap/object/basic_event/light_event.ts'
import { boost } from '../../builder_functions/beatmap/object/v3_event/lighting/boost.ts'
import { environment } from '../../builder_functions/beatmap/object/environment/environment.ts'
import { geometry } from '../../builder_functions/beatmap/object/environment/geometry.ts'
import { colorNote } from '../../builder_functions/beatmap/object/gameplay_object/color_note.ts'
import { bomb } from '../../builder_functions/beatmap/object/gameplay_object/bomb.ts'
import { chain } from '../../builder_functions/beatmap/object/gameplay_object/chain.ts'
import { arc } from '../../builder_functions/beatmap/object/gameplay_object/arc.ts'
import { abstractCustomEvent } from '../../builder_functions/beatmap/object/custom_event/base.ts'
import { shallowPrune } from '../../utils/object/prune.ts'
import { EventGroup } from '../../constants/basic_event.ts'
import { officialBpmEvent } from '../../builder_functions/beatmap/object/v3_event/bpm.ts'
import { arraySplit } from '../../utils/array/split.ts'
import { Track } from '../../utils/animation/track.ts'
import { OfficialBPMEvent } from './object/v3_event/bpm/official_bpm.ts'
import { RawGeometryMaterial } from '../../types/beatmap/object/environment.ts'
import { CustomEvent } from './object/custom_event/base/custom_event.ts'

export class V3Difficulty extends AbstractDifficulty<bsmap.v3.IDifficulty> {
    declare version: bsmap.v3.IDifficulty['version']
    declare waypoints: bsmap.v3.IWaypoint[]
    basicEventTypesWithKeywords!: bsmap.v3.IDifficulty['basicEventTypesWithKeywords']
    useNormalEventsAsCompatibleEvents!: bsmap.v3.IDifficulty['useNormalEventsAsCompatibleEvents']

    protected loadJSON(json: bsmap.v3.IDifficulty) {
        // Header
        this.version = json.version
        this.v3 = true
        this.waypoints = json.waypoints

        // Notes
        json.colorNotes.forEach((o) => colorNote(this).fromJsonV3(o))
        json.bombNotes.forEach((o) => bomb(this).fromJsonV3(o))
        json.sliders.forEach((o) => arc(this).fromJsonV3(o))
        json.burstSliders.forEach((o) => chain(this).fromJsonV3(o))
        json.obstacles.forEach((o) => wall(this).fromJsonV3(o))

        // Fake stuff
        if (json.customData?.fakeColorNotes) {
            json.customData.fakeColorNotes.forEach((o) => colorNote(this, { fake: true }).fromJsonV3(o))
            delete json.customData.fakeColorNotes
        }

        if (json.customData?.fakeBombNotes) {
            json.customData.fakeBombNotes.forEach((o) => bomb(this, { fake: true }).fromJsonV3(o))
            delete json.customData.fakeBombNotes
        }

        if (json.customData?.fakeBurstSliders) {
            json.customData.fakeBurstSliders.forEach((o) => chain(this, { fake: true }).fromJsonV3(o))
            delete json.customData.fakeBurstSliders
        }

        if (json.customData?.fakeObstacles) {
            json.customData.fakeObstacles.forEach((o) => wall(this, { fake: true }).fromJsonV3(o))
            delete json.customData.fakeObstacles
        }

        // Events
        const lightEventsFilter = arraySplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BACK_LASERS ||
                x.et === EventGroup.RING_LIGHTS ||
                x.et === EventGroup.LEFT_LASERS ||
                x.et === EventGroup.RIGHT_LASERS ||
                x.et === EventGroup.CENTER_LASERS ||
                x.et === EventGroup.LEFT_EXTRA ||
                x.et === EventGroup.RIGHT_EXTRA ||
                x.et === EventGroup.BILLIE_LEFT ||
                x.et === EventGroup.BILLIE_RIGHT ||
                x.et === EventGroup.GAGA_LEFT ||
                x.et === EventGroup.GAGA_RIGHT
        })
        lightEventsFilter.success.forEach((o) => backLasers(this).fromJsonV3(o as bsmap.v3.IBasicEventLight))
        json.basicBeatmapEvents = lightEventsFilter.fail

        const laserSpeedEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.LEFT_ROTATING_LASERS ||
                    x.et === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        laserSpeedEventsFilter.success.forEach((o) => leftLaserSpeed(this, {}).fromJsonV3(o as bsmap.v3.IBasicEventLaserRotation))
        json.basicBeatmapEvents = laserSpeedEventsFilter.fail

        const ringZoomEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.RING_ZOOM
            },
        )
        ringZoomEventsFilter.success.forEach((o) => ringZoom(this, {}).fromJsonV3(o as bsmap.v3.IBasicEventRing))
        json.basicBeatmapEvents = ringZoomEventsFilter.fail

        const ringSpinEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.RING_SPIN
            },
        )
        ringSpinEventsFilter.success.forEach((o) => ringSpin(this, {}).fromJsonV3(o as bsmap.v3.IBasicEventRing))
        json.basicBeatmapEvents = ringSpinEventsFilter.fail

        const rotationEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.EARLY_ROTATION ||
                    x.et === EventGroup.LATE_ROTATION
            },
        )
        rotationEventsFilter.success.forEach((o) => {
            if (o.et === EventGroup.EARLY_ROTATION) {
                return earlyRotation(this, {}).fromBasicEvent(
                    o as bsmap.v3.IBasicEventLaneRotation,
                )
            } else {
                return lateRotation(this, {}).fromBasicEvent(
                    o as bsmap.v3.IBasicEventLaneRotation,
                )
            }
        })
        json.rotationEvents.forEach((o) => lateRotation(this, {}).fromJsonV3(o)), json.basicBeatmapEvents = rotationEventsFilter.fail

        const boostEventsFilter = arraySplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BOOST
        })
        boostEventsFilter.success.forEach((o) =>
            boost(this, {}).fromBasicEvent(
                o as bsmap.v3.IBasicEventBoost,
            )
        )
        json.colorBoostBeatmapEvents.forEach((o) => boost(this, {}).fromJsonV3(o))
        json.basicBeatmapEvents = boostEventsFilter.fail

        const bpmEventsFilter = arraySplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BPM
        })
        json.basicBeatmapEvents = bpmEventsFilter.fail

        json.basicBeatmapEvents.forEach((o) => abstract(this, {}).fromJsonV3(o))

        bpmEventsFilter.success.forEach((o) => officialBpmEvent(this, {}).fromBasicEvent(o))
        ;(json.customData?.BPMChanges ?? []).forEach((o) => communityBpmEvent(this, {}).fromJsonV3(o))
        json.bpmEvents.forEach((o) => officialBpmEvent(this, {}).fromJsonV3(o))

        delete json.customData?.BPMChanges

        // Fog
        if (json.customData?.environment) {
            json.customData.environment = json.customData.environment.filter(
                (x) => {
                    if (x.components?.BloomFogEnvironment !== undefined) {
                        new FogEvent(this, x.components.BloomFogEnvironment)
                        return false
                    }

                    return true
                },
            )
        }

        if (json.customData?.customEvents) {
            const environmentTrack = new Track()

            json.customData.customEvents = json.customData.customEvents.filter(
                (x) => {
                    if (
                        x.t === 'AnimateComponent' &&
                        x.d.BloomFogEnvironment !== undefined
                    ) {
                        environmentTrack.add(x.d.track)

                        new FogEvent(
                            this,
                            x.d.BloomFogEnvironment as AnyFog,
                            x.b,
                            x.d.duration,
                        )
                        return false
                    }

                    return true
                },
            )

            if (
                environmentTrack.value !== undefined &&
                json.customData.environment !== undefined
            ) {
                json.customData.environment = json.customData.environment
                    .filter((x) => {
                        if (x.track === undefined) return true
                        return !environmentTrack.has(x.track)
                    })
            }
        }

        // Custom Events
        let customEvents = json?.customData?.customEvents ?? []
        delete json.customData?.customEvents

        const extractCustomEvents = <
            T extends CustomEvent,
        >(
            obj: (difficulty: AbstractDifficulty, a: object) => T,
        ) => {
            const type = obj(this, {}).type

            const filter = arraySplit(
                customEvents,
                (x) => x.t === type,
            )

            customEvents = filter.fail

            filter.success.forEach((x) => obj(this, {}).fromJsonV3(x as bsmap.v3.ICustomEventAnimateTrack))
        }

        extractCustomEvents(animateComponent)
        extractCustomEvents(animateTrack)
        extractCustomEvents(assignPathAnimation)
        extractCustomEvents(assignPlayerToTrack)
        extractCustomEvents(assignTrackParent)

        extractCustomEvents(setMaterialProperty)
        extractCustomEvents(setGlobalProperty)
        extractCustomEvents(blit)
        extractCustomEvents(declareCullingTexture)
        extractCustomEvents(declareRenderTexture)
        extractCustomEvents(destroyTexture)
        extractCustomEvents(instantiatePrefab)
        extractCustomEvents(destroyPrefab)
        extractCustomEvents(setAnimatorProperty)
        extractCustomEvents(setCameraProperty)
        extractCustomEvents(assignObjectPrefab)
        extractCustomEvents(setRenderingSettings)

        customEvents.forEach((x) => abstractCustomEvent(this, {}).fromJsonV3(x))

        // Environment
        json.customData?.environment
            ?.filter((x) => x.geometry === undefined)
            .forEach((x) => environment(this).fromJsonV3(x as bsmap.v3.IChromaEnvironmentID))

        json.customData?.environment
            ?.filter((x) => x.geometry !== undefined)
            .forEach((x) => geometry(this).fromJsonV3(x as bsmap.v3.IChromaEnvironmentGeometry))
        delete json.customData?.environment

        this.geometryMaterials = (json.customData?.materials ?? {}) as Record<
            string,
            RawGeometryMaterial
        >
        delete json.customData?.materials

        // V3 Lighting
        json.lightColorEventBoxGroups ??= []
        json.lightColorEventBoxGroups.forEach((x) => lightColorEventBoxGroup(this).fromJsonV3(x))
        json.lightRotationEventBoxGroups ??= []
        json.lightRotationEventBoxGroups.forEach((x) => lightRotationEventBoxGroup(this).fromJsonV3(x))
        json.lightTranslationEventBoxGroups ??= []
        json.lightTranslationEventBoxGroups.forEach((x) => lightTranslationEventBoxGroup(this).fromJsonV3(x))

        // Extra
        this.basicEventTypesWithKeywords = json.basicEventTypesWithKeywords
        this.useNormalEventsAsCompatibleEvents = json.useNormalEventsAsCompatibleEvents
        this.customData = json.customData ?? {}
    }

    toJSON(): bsmap.v3.IDifficulty {
        function sortItems(a: { b: number }, b: { b: number }) {
            return a.b - b.b
        }

        // Notes
        const colorNotes = this.colorNotes.filter((e) => !e.fake)
            .map((e) => (e.toJsonV3(true)))
            .sort(sortItems)

        const bombNotes = this.bombs.filter((e) => !e.fake)
            .map((e) => (e.toJsonV3(true)))
            .sort(sortItems)

        const chains = this.chains.filter((e) => !e.fake)
            .map((e) => (e.toJsonV3(true)))
            .sort(sortItems)

        const arcs = this.arcs
            .map((e) => (e.toJsonV3(true)))
            .sort(sortItems)

        // Walls
        const obstacles = this.walls.filter((e) => !e.fake)
            .map((e) => (e.toJsonV3(true)))
            .sort(sortItems)

        // Environment
        const environment = [
            ...this.environment.map((e) => e.toJsonV3(true)),
            ...this.geometry.map((e) => e.toJsonV3(true)),
        ]

        // Events
        const basicEvents = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.abstractBasicEvents,
        ].map((o) => o.toJsonV3(true))
            .sort(sortItems)

        const boostEvents = this.boostEvents
            .map((x) => x.toJsonV3(true))
            .sort(sortItems)

        const rotationEvents = this.rotationEvents
            .map((x) => x.toJsonV3(true))
            .sort(sortItems)

        const bpmEventsFilter = arraySplit(
            this.bpmEvents,
            (x) => x instanceof OfficialBPMEvent,
        )

        const officialBPMEvents = bpmEventsFilter.success
            .map((x) => x.toJsonV3(true))
            .sort(sortItems) as bsmap.v3.IBPMEvent[]

        const communityBPMEvents = bpmEventsFilter.fail
            .map((x) => x.toJsonV3(true))
            .sort(sortItems) as bsmap.v3.IBPMChange[]

        // Custom events
        const customEvents = (Object.values(
            this.customEvents,
        ) as CustomEvent[][])
            .map((a) => a.map((e) => e.toJsonV3(true)))
            .flat()
            .sort(sortItems) as bsmap.v3.ICustomEvent[]

        // Fog
        let fogEnvironment: bsmap.v3.IChromaEnvironment
        let animatedFog = false

        this.fogEvents.forEach((x) => {
            const result = x.exportV3(true)

            if (Object.hasOwn(result, 'id') && !fogEnvironment) {
                fogEnvironment = result as bsmap.v3.IChromaEnvironment
            } else {
                customEvents.push(
                    result as bsmap.v3.ICustomEventAnimateComponent,
                )
                animatedFog = true
            }
        })

        if (animatedFog) {
            fogEnvironment ??= {
                id: '[0]Environment',
                lookupMethod: 'EndsWith',
            }
            fogEnvironment.track = 'ReMapper_Fog'
        }
        if (fogEnvironment!) environment.push(fogEnvironment)

        // V3 Lighting
        const lightColorEventBoxGroups = this.lightColorEventBoxGroups
            .map((x) => x.toJsonV3(true)).sort(sortItems)

        const lightRotationEventBoxGroups = this.lightRotationEventBoxGroups
            .map((x) => x.toJsonV3(true)).sort(sortItems)

        const lightTranslationEventBoxGroups = this.lightTranslationEventBoxGroups
            .map((x) => x.toJsonV3(true)).sort(sortItems)

        return {
            version: '3.2.0',
            colorNotes: colorNotes,
            bombNotes: bombNotes,
            basicBeatmapEvents: basicEvents,
            bpmEvents: officialBPMEvents,
            burstSliders: chains,
            colorBoostBeatmapEvents: boostEvents,
            lightColorEventBoxGroups: lightColorEventBoxGroups,
            lightRotationEventBoxGroups: lightRotationEventBoxGroups,
            lightTranslationEventBoxGroups: lightTranslationEventBoxGroups,
            rotationEvents: rotationEvents,
            obstacles: obstacles,
            sliders: arcs,
            waypoints: this.waypoints,
            customData: shallowPrune({
                ...this.customData,
                fakeColorNotes: this.colorNotes.filter((e) => e.fake)
                    .map((e) => e.toJsonV3(true))
                    .sort(sortItems),
                fakeBombNotes: this.bombs.filter((e) => e.fake)
                    .map((e) => e.toJsonV3(true))
                    .sort(sortItems),
                fakeBurstSliders: this.chains.filter((e) => e.fake)
                    .map((e) => e.toJsonV3(true))
                    .sort(sortItems),
                fakeObstacles: this.walls.filter((e) => e.fake)
                    .map((e) => e.toJsonV3(true))
                    .sort(sortItems),
                environment: environment,
                materials: this.geometryMaterials as Record<
                    string,
                    bsmap.v3.IChromaMaterial
                >,
                customEvents: customEvents,
                pointDefinitions: this
                    .pointDefinitions as bsmap.v3.IPointDefinition,
                BPMChanges: communityBPMEvents,
            }) satisfies bsmap.v3.ICustomDataDifficulty,
            useNormalEventsAsCompatibleEvents: this.useNormalEventsAsCompatibleEvents,
            basicEventTypesWithKeywords: this.basicEventTypesWithKeywords,
        }
    }
}
