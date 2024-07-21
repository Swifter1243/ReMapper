import {wall} from '../../builder_functions/beatmap/object/gameplay_object/wall.ts'
import {bsmap} from '../../deps.ts'
import {AbstractDifficulty} from './abstract_beatmap.ts'
import {Arc, Bomb, Chain, ColorNote} from './object/gameplay_object/color_note.ts'
import {
    IInfoSet,
    IInfoSetDifficulty,
    RawGeometryMaterial,
} from '../../mod.ts'
import {AnyFog, FogEvent} from './object/environment/fog.ts'
import {
    assignTrackPrefab,
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
    setRenderSetting
} from "../../builder_functions/beatmap/object/custom_event/vivify.ts";
import {animateTrack} from "../../builder_functions/beatmap/object/custom_event/heck.ts";
import {
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent
} from "../../builder_functions/beatmap/object/custom_event/noodle_extensions.ts";
import {animateComponent} from "../../builder_functions/beatmap/object/custom_event/chroma.ts";
import {
    lightColorEventBoxGroup,
    lightRotationEventBoxGroup,
    lightTranslationEventBoxGroup
} from "../../builder_functions/beatmap/object/v3_event/lighting/light_event_box_group.ts";
import {communityBpmEvent} from "../../builder_functions/beatmap/object/basic_event/bpm.ts";
import {earlyRotation, lateRotation} from "../../builder_functions/beatmap/object/v3_event/rotation.ts";
import {leftLaserSpeed} from "../../builder_functions/beatmap/object/basic_event/laser_speed.ts";
import {ringSpin, ringZoom} from "../../builder_functions/beatmap/object/basic_event/ring.ts";
import {abstractBasicEvent} from "../../builder_functions/beatmap/object/basic_event/abstract.ts";
import {backLasers} from "../../builder_functions/beatmap/object/basic_event/light_event.ts";
import {boost} from "../../builder_functions/beatmap/object/v3_event/lighting/boost.ts";
import {environment} from "../../builder_functions/beatmap/object/environment/environment.ts";
import {geometry} from "../../builder_functions/beatmap/object/environment/geometry.ts";
import {colorNote} from "../../builder_functions/beatmap/object/gameplay_object/color_note.ts";
import {bomb} from "../../builder_functions/beatmap/object/gameplay_object/bomb.ts";
import {chain} from "../../builder_functions/beatmap/object/gameplay_object/chain.ts";
import {arc} from "../../builder_functions/beatmap/object/gameplay_object/arc.ts";
import {abstractCustomEvent} from "../../builder_functions/beatmap/object/custom_event/base.ts";
import {shallowPrune} from "../../utils/object/prune.ts";
import {EventGroup} from "../../data/constants/basic_event.ts";
import {officialBpmEvent} from "../../builder_functions/beatmap/object/v3_event/bpm.ts";
import {BeatmapCustomEvents, RMDifficulty} from "../../types/beatmap_interfaces/difficulty.ts";
import { arraySplit } from '../../utils/array/split.ts'
import { Track } from '../../utils/animation/track.ts'
import { BaseCustomEvent } from './object/custom_event/base.ts'
import {OfficialBPMEvent} from "./object/v3_event/official_bpm.ts";

export class V3Difficulty extends AbstractDifficulty<bsmap.v3.IDifficulty> {
    declare version: bsmap.v3.IDifficulty['version']
    declare waypoints: bsmap.v3.IWaypoint[]
    basicEventTypesWithKeywords:
        bsmap.v3.IDifficulty['basicEventTypesWithKeywords']
    useNormalEventsAsCompatibleEvents:
        bsmap.v3.IDifficulty['useNormalEventsAsCompatibleEvents']

    constructor(
        info: IInfoSetDifficulty,
        setInfo: IInfoSet,
        json: bsmap.v3.IDifficulty,
        process?: (keyof bsmap.v3.IDifficulty)[],
    ) {
        // run only if explicitly allowed
        function runProcess<K extends keyof bsmap.v3.IDifficulty, V>(
            key: K,
            callback: (v: bsmap.v3.IDifficulty[K]) => V,
        ) {
            if (!json[key]) throw `"${key}" is not defined in the beatmap!`

            if (process && !process.some((s) => s === key)) return

            return callback(json[key])
        }

        // Notes
        const colorNotes: ColorNote[] = runProcess(
            'colorNotes',
            (notes) => notes.map((o) => colorNote().fromJson(o, true)),
        ) ?? []

        const bombs: Bomb[] = runProcess(
            'bombNotes',
            (notes) => notes.map((o) => bomb().fromJson(o, true)),
        ) ?? []

        const arcs: Arc[] = runProcess(
            'sliders',
            (arcs) => arcs.map((o) => arc().fromJson(o, true)),
        ) ?? []

        const chains: Chain[] = runProcess(
            'burstSliders',
            (chains) => chains.map((o) => chain().fromJson(o, true)),
        ) ?? []

        const obstacles = runProcess(
            'obstacles',
            (obstacles) => obstacles.map((o) => wall().fromJson(o, true)),
        ) ?? []

        // Fake stuff
        if (json.customData?.fakeColorNotes) {
            colorNotes.push(
                ...json.customData.fakeColorNotes.map((o) =>
                    colorNote({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeColorNotes
        }

        if (json.customData?.fakeBombNotes) {
            bombs.push(
                ...json.customData.fakeBombNotes.map((o) =>
                    bomb({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeBombNotes
        }

        if (json.customData?.fakeBurstSliders) {
            chains.push(
                ...json.customData.fakeBurstSliders.map((o) =>
                    chain({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeBurstSliders
        }

        if (json.customData?.fakeObstacles) {
            obstacles.push(
                ...json.customData.fakeObstacles.map((o) =>
                    wall({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeObstacles
        }

        // Events
        if (!json.basicBeatmapEvents) {
            throw `"basicBeatmapEvents" does not exist in the beatmap!`
        }
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
        json.basicBeatmapEvents = lightEventsFilter.fail

        const laserSpeedEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.LEFT_ROTATING_LASERS ||
                    x.et === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        json.basicBeatmapEvents = laserSpeedEventsFilter.fail

        const ringZoomEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.RING_ZOOM
            },
        )
        json.basicBeatmapEvents = ringZoomEventsFilter.fail

        const ringSpinEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.RING_SPIN
            },
        )
        json.basicBeatmapEvents = ringSpinEventsFilter.fail

        const rotationEventsFilter = arraySplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.EARLY_ROTATION ||
                    x.et === EventGroup.LATE_ROTATION
            },
        )
        json.basicBeatmapEvents = rotationEventsFilter.fail

        const boostEventsFilter = arraySplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BOOST
        })
        json.basicBeatmapEvents = boostEventsFilter.fail

        const bpmEventsFilter = arraySplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BPM
        })
        json.basicBeatmapEvents = bpmEventsFilter.fail

        const lightEvents = lightEventsFilter.success.map((o) =>
            backLasers().fromJson(o as bsmap.v3.IBasicEventLight, true)
        )

        const laserSpeedEvents = laserSpeedEventsFilter.success.map((o) =>
            leftLaserSpeed({}).fromJson(
                o as bsmap.v3.IBasicEventLaserRotation,
                true,
            )
        )

        const ringZoomEvents = ringZoomEventsFilter.success.map((o) =>
            ringZoom({}).fromJson(o as bsmap.v3.IBasicEventRing, true)
        )

        const ringSpinEvents = ringSpinEventsFilter.success.map((o) =>
            ringSpin({}).fromJson(o as bsmap.v3.IBasicEventRing, true)
        )

        if (!json.rotationEvents) {
            throw `"rotationEvents" does not exist in the beatmap!`
        }
        const rotationEvents = [
            ...rotationEventsFilter.success.map((o) => {
                if (o.et === EventGroup.EARLY_ROTATION) {
                    return earlyRotation({}).fromBasicEvent(
                        o as bsmap.v3.IBasicEventLaneRotation,
                    )
                } else {
                    return lateRotation({}).fromBasicEvent(
                        o as bsmap.v3.IBasicEventLaneRotation,
                    )
                }
            }),
            ...json.rotationEvents.map((o) =>
                lateRotation({}).fromJson(o, true)
            ),
        ]

        if (!json.colorBoostBeatmapEvents) {
            throw `"colorBoostBeatmapEvents" does not exist in the beatmap!`
        }
        const boostEvents = [
            ...boostEventsFilter.success.map((o) =>
                boost({}).fromBasicEvent(
                    o as bsmap.v3.IBasicEventBoost,
                )
            ),
            ...json.colorBoostBeatmapEvents.map((o) =>
                boost({}).fromJson(o, true)
            ),
        ]

        const baseBasicEvents = json.basicBeatmapEvents.map((o) =>
            abstractBasicEvent({}).fromJson(o, true)
        )

        if (!json.bpmEvents) {
            throw `"bpmEvents" does not exist in the beatmap!`
        }
        const bpmEvents = [
            ...bpmEventsFilter.success.map((o) =>
                officialBpmEvent({}).fromBasicEvent(o)
            ),
            ...(json.customData?.BPMChanges ?? []).map((o) =>
                communityBpmEvent({}).fromJson(o, true)
            ),
            ...json.bpmEvents.map((o) =>
                officialBpmEvent({}).fromJson(o, true)
            ),
        ]
        delete json.customData?.BPMChanges

        // Fog
        const fogEvents: FogEvent[] = []

        if (json.customData?.environment) {
            json.customData.environment = json.customData.environment.filter(
                (x) => {
                    if (x.components?.BloomFogEnvironment !== undefined) {
                        fogEvents.push(
                            new FogEvent(x.components.BloomFogEnvironment),
                        )
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

                        fogEvents.push(
                            new FogEvent(
                                x.d.BloomFogEnvironment as AnyFog,
                                x.b,
                                x.d.duration,
                            ),
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

        const diffCustomEvents: Partial<BeatmapCustomEvents> = {}

        function extractCustomEvents<
            T extends BaseCustomEvent,
            K extends keyof BeatmapCustomEvents,
        >(
            obj: (a: object) => T,
            property: K,
        ) {
            const type = obj({}).type

            const filter = arraySplit(
                customEvents,
                (x) => x.t === type,
            )

            const result = filter.success.map((x) =>
                obj({}).fromJson(
                    x as bsmap.v3.ICustomEventAnimateTrack,
                    true,
                )
            )
            customEvents = filter.fail

            diffCustomEvents[property] =
                result as unknown as BeatmapCustomEvents[K]
        }

        extractCustomEvents(animateComponent, 'animateComponentEvents')
        extractCustomEvents(animateTrack, 'animateTrackEvents')
        extractCustomEvents(assignPathAnimation, 'assignPathAnimationEvents')
        extractCustomEvents(assignPlayerToTrack, 'assignPlayerTrackEvents')
        extractCustomEvents(assignTrackParent, 'assignTrackParentEvents')

        extractCustomEvents(setMaterialProperty, 'setMaterialPropertyEvents')
        extractCustomEvents(setGlobalProperty, 'setGlobalPropertyEvents')
        extractCustomEvents(blit, 'blitEvents')
        extractCustomEvents(
            declareCullingTexture,
            'declareCullingTextureEvents',
        )
        extractCustomEvents(declareRenderTexture, 'declareRenderTextureEvents')
        extractCustomEvents(destroyTexture, 'destroyTextureEvents')
        extractCustomEvents(instantiatePrefab, 'instantiatePrefabEvents')
        extractCustomEvents(destroyPrefab, 'destroyPrefabEvents')
        extractCustomEvents(setAnimatorProperty, 'setAnimatorPropertyEvents')
        extractCustomEvents(setCameraProperty, 'setCameraPropertyEvents')
        extractCustomEvents(assignTrackPrefab, 'assignTrackPrefabEvents')
        extractCustomEvents(setRenderSetting, 'setRenderSettingEvents')

        diffCustomEvents.abstractCustomEvents = customEvents.map((x) =>
            abstractCustomEvent({}).fromJson(x, true)
        )

        // Environment
        const environmentArr =
            json.customData?.environment?.filter((x) =>
                x.geometry === undefined
            ).map((x) =>
                environment().fromJson(x as bsmap.v3.IChromaEnvironmentID, true)
            ) ?? []

        const geometryArr =
            json.customData?.environment?.filter((x) =>
                x.geometry !== undefined
            ).map((x) =>
                geometry().fromJson(
                    x as bsmap.v3.IChromaEnvironmentGeometry,
                    true,
                )
            ) ?? []
        delete json.customData?.environment

        const materials = (json.customData?.materials ?? {}) as Record<
            string,
            RawGeometryMaterial
        >
        delete json.customData?.materials

        // V3 Lighting
        const lightColorEventBoxGroups = (json.lightColorEventBoxGroups ?? [])
            .map(
                (x) => lightColorEventBoxGroup().fromJson(x, true),
            )

        const lightRotationEventBoxGroups =
            (json.lightRotationEventBoxGroups ?? [])
                .map(
                    (x) => lightRotationEventBoxGroup().fromJson(x, true),
                )

        const lightTranslationEventBoxGroups =
            (json.lightTranslationEventBoxGroups ?? [])
                .map(
                    (x) => lightTranslationEventBoxGroup().fromJson(x, true),
                )

        super(
            json,
            info,
            setInfo,
            {
                version: json.version,
                v3: true,
                waypoints: json.waypoints,

                colorNotes,
                bombs,
                arcs: arcs,
                chains: chains,
                walls: obstacles,

                lightEvents: lightEvents,
                laserSpeedEvents: laserSpeedEvents,
                ringSpinEvents: ringSpinEvents,
                ringZoomEvents: ringZoomEvents,
                rotationEvents: rotationEvents,
                boostEvents: boostEvents,
                abstractBasicEvents: baseBasicEvents,
                bpmEvents: bpmEvents,

                lightColorEventBoxGroups: lightColorEventBoxGroups,
                lightRotationEventBoxGroups: lightRotationEventBoxGroups,
                lightTranslationEventBoxGroups: lightTranslationEventBoxGroups,

                customEvents: diffCustomEvents as BeatmapCustomEvents,

                pointDefinitions: json.customData
                    ?.pointDefinitions as RMDifficulty['pointDefinitions'] ??
                    {},
                customData: json.customData ?? {},
                environment: environmentArr,
                geometry: geometryArr,
                geometryMaterials: materials,
                fogEvents: fogEvents,
            },
        )

        // Extra
        this.basicEventTypesWithKeywords = json.basicEventTypesWithKeywords
        this.useNormalEventsAsCompatibleEvents =
            json.useNormalEventsAsCompatibleEvents
    }

    toJSON(): bsmap.v3.IDifficulty {
        const sortItems = (a: { b: number }, b: { b: number }) => a.b - b.b

        // Notes
        const colorNotes = this.colorNotes.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(sortItems)

        const bombNotes = this.bombs.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(sortItems)

        const chains = this.chains.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(sortItems)

        const arcs = this.arcs
            .map((e) => (e.toJson(true)))
            .sort(sortItems)

        // Walls
        const obstacles = this.walls.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(sortItems)

        // Environment
        const environment = [
            ...this.environment.map((e) => e.toJson(true)),
            ...this.geometry.map((e) => e.toJson(true)),
        ]

        // Events
        const basicEvents = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.abstractBasicEvents,
        ].map((o) => o.toJson(true))
            .sort(sortItems)

        const boostEvents = this.boostEvents
            .map((x) => x.toJson(true))
            .sort(sortItems)

        const rotationEvents = this.rotationEvents
            .map((x) => x.toJson(true))
            .sort(sortItems)

        const bpmEventsFilter = arraySplit(
            this.bpmEvents,
            (x) => x instanceof OfficialBPMEvent,
        )

        const officialBPMEvents = bpmEventsFilter.success
            .map((x) => x.toJson(true))
            .sort(sortItems) as bsmap.v3.IBPMEvent[]

        const communityBPMEvents = bpmEventsFilter.fail
            .map((x) => x.toJson(true))
            .sort(sortItems) as bsmap.v3.IBPMChange[]

        // Custom events
        const customEvents = (Object.values(
            this.customEvents,
        ) as BaseCustomEvent[][])
            .map((a) => a.map((e) => e.toJson(true)))
            .flat()
            .sort(sortItems) as bsmap.v3.ICustomEvent[]

        // Fog
        let fogEnvironment: bsmap.v3.IChromaEnvironment
        let animatedFog = false

        this.fogEvents.forEach((x) => {
            const result = x.exportV3()

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
        const lightColorEventBoxGroups = this.lightColorEventBoxGroups.map(
            (x) => x.toJson(true),
        ).sort(sortItems)

        const lightRotationEventBoxGroups = this.lightRotationEventBoxGroups
            .map(
                (x) => x.toJson(true),
            ).sort(sortItems)

        const lightTranslationEventBoxGroups = this
            .lightTranslationEventBoxGroups.map(
                (x) => x.toJson(true),
            ).sort(sortItems)

        return {
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
            version: '3.2.0',
            waypoints: this.waypoints,
            customData: shallowPrune({
                ...this.customData,
                fakeColorNotes: this.colorNotes.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(sortItems),
                fakeBombNotes: this.bombs.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(sortItems),
                fakeBurstSliders: this.chains.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(sortItems),
                fakeObstacles: this.walls.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
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
            useNormalEventsAsCompatibleEvents:
                this.useNormalEventsAsCompatibleEvents,
            basicEventTypesWithKeywords: this.basicEventTypesWithKeywords,
        }
    }
}
