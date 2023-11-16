import { arc, bomb, chain, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Arc, Bomb, Chain, Note } from '../internals/note.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune } from '../utils/json.ts'
import { environment, geometry } from './environment.ts'
import { arrSplit, RawGeometryMaterial, Track } from '../mod.ts'
import {
    abstractCustomEvent,
    animateComponent,
    animateTrack,
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from './custom_event.ts'
import { event } from './mod.ts'
import { AnyFog, FogEvent } from './fog.ts'
import { CommunityBPMEvent, OfficialBPMEvent } from '../internals/event.ts'

export class V3Difficulty extends AbstractDifficulty<bsmap.v3.IDifficulty> {
    declare version: bsmap.v3.IDifficulty['version']

    constructor(
        info: bsmap.v2.IInfoSetDifficulty,
        setInfo: bsmap.v2.IInfoSet,
        json: bsmap.v3.IDifficulty,
        process?: (keyof bsmap.v3.IDifficulty)[],
    ) {
        // run only if explicitly allowed
        function runProcess<K extends keyof bsmap.v3.IDifficulty, V>(
            key: K,
            callback: (v: bsmap.v3.IDifficulty[K]) => V,
        ) {
            if (process && !process.some((s) => s === key)) return

            return callback(json[key])
        }

        // Notes
        const notes: Note[] = runProcess(
            'colorNotes',
            (notes) => notes.map((o) => note().fromJson(o, true)),
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
            notes.push(
                ...json.customData.fakeColorNotes.map((o) =>
                    note({ fake: true }).fromJson(o, true)
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
        const lightEventsFilter = arrSplit(json.basicBeatmapEvents, (x) => {
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
        json.basicBeatmapEvents = lightEventsFilter[1]

        const laserSpeedEventsFilter = arrSplit(
            json.basicBeatmapEvents,
            (x) => {
                return x.et === EventGroup.LEFT_ROTATING_LASERS ||
                    x.et === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        json.basicBeatmapEvents = laserSpeedEventsFilter[1]

        const ringZoomEventsFilter = arrSplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.RING_ZOOM
        })
        json.basicBeatmapEvents = ringZoomEventsFilter[1]

        const ringSpinEventsFilter = arrSplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.RING_SPIN
        })
        json.basicBeatmapEvents = ringSpinEventsFilter[1]

        const rotationEventsFilter = arrSplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.EARLY_ROTATION ||
                x.et === EventGroup.LATE_ROTATION
        })
        json.basicBeatmapEvents = rotationEventsFilter[1]

        const boostEventsFilter = arrSplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BOOST
        })
        json.basicBeatmapEvents = boostEventsFilter[1]

        const bpmEventsFilter = arrSplit(json.basicBeatmapEvents, (x) => {
            return x.et === EventGroup.BPM
        })
        json.basicBeatmapEvents = bpmEventsFilter[1]

        const lightEvents = lightEventsFilter[0].map((o) =>
            event.backLasers().fromJson(o as bsmap.v3.IBasicEventLight, true)
        )

        const laserSpeedEvents = laserSpeedEventsFilter[0].map((o) =>
            event.leftLaserSpeed({}).fromJson(
                o as bsmap.v3.IBasicEventLaserRotation,
                true,
            )
        )

        const ringZoomEvents = ringZoomEventsFilter[0].map((o) =>
            event.ringZoom({}).fromJson(o as bsmap.v3.IBasicEventRing, true)
        )

        const ringSpinEvents = ringSpinEventsFilter[0].map((o) =>
            event.ringSpin({}).fromJson(o as bsmap.v3.IBasicEventRing, true)
        )

        const rotationEvents = [
            ...rotationEventsFilter[0].map((o) =>
                event.lateRotation({}).fromBasicEvent(
                    o as bsmap.v3.IBasicEventLaneRotation,
                )
            ),
            ...json.rotationEvents.map((o) =>
                event.lateRotation({}).fromJson(o, true)
            ),
        ]

        const boostEvents = [
            ...boostEventsFilter[0].map((o) =>
                event.boost({}).fromBasicEvent(
                    o as bsmap.v3.IBasicEventBoost,
                )
            ),
            ...json.colorBoostBeatmapEvents.map((o) =>
                event.boost({}).fromJson(o, true)
            ),
        ]

        const baseBasicEvents = json.basicBeatmapEvents.map((o) =>
            event.baseBasicEvent({}).fromJson(o, true)
        )

        const bpmEvents = [
            ...bpmEventsFilter[0].map((o) =>
                event.officialBpmEvent({}).fromBasicEvent(o)
            ),
            ...(json.customData?.BPMChanges ?? []).map((o) =>
                event.communityBpmEvent({}).fromJson(o, true)
            ),
            ...json.bpmEvents.map((o) =>
                event.officialBpmEvent({}).fromJson(o, true)
            ),
        ]

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

        const animateTracksFilter = arrSplit(
            customEvents,
            (x) => x.t === 'AnimateTrack',
        )

        const animateTracks = animateTracksFilter[0].map((x) =>
            animateTrack({}).fromJson(
                x as bsmap.v3.ICustomEventAnimateTrack,
                true,
            )
        )
        customEvents = animateTracksFilter[1]

        const assignPathTracksFilter = arrSplit(
            customEvents,
            (x) => x.t === 'AssignPathAnimation',
        )

        const assignPathTracks = assignPathTracksFilter[0].map((x) =>
            assignPathAnimation({}).fromJson(
                x as bsmap.v3.ICustomEventAssignPathAnimation,
                true,
            )
        )
        customEvents = assignPathTracksFilter[1]

        const assignParentFilter = arrSplit(
            customEvents,
            (x) => x.t === 'AssignTrackParent',
        )

        const assignParent = assignParentFilter[0].map((x) =>
            assignTrackParent({}).fromJson(
                x as bsmap.v3.ICustomEventAssignTrackParent,
                true,
            )
        )
        customEvents = assignParentFilter[1]

        const assignPlayerFilter = arrSplit(
            customEvents,
            (x) => x.t === 'AssignPlayerToTrack',
        )

        const assignPlayer = assignPlayerFilter[0].map((x) =>
            assignPlayerToTrack({}).fromJson(
                x as bsmap.v3.ICustomEventAssignPlayerToTrack,
                true,
            )
        )
        customEvents = assignPlayerFilter[1]

        const animateComponentsFilter = arrSplit(
            customEvents,
            (x) => x.t === 'AnimateComponent',
        )

        const animateComponents = animateComponentsFilter[0].map((x) =>
            animateComponent({}).fromJson(
                x as bsmap.v3.ICustomEventAnimateComponent,
                true,
            )
        )
        customEvents = animateComponentsFilter[1]

        const abstractCustomEvents = customEvents.map((x) =>
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

        const materials = (json.customData?.materials ?? {}) as Record<
            string,
            RawGeometryMaterial
        >

        super(
            json,
            info,
            setInfo,
            {
                version: json.version,
                v3: true,

                notes,
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
                baseBasicEvents: baseBasicEvents,
                bpmEvents: bpmEvents,

                animateComponents: animateComponents,
                animateTracks: animateTracks,
                assignPathAnimations: assignPathTracks,
                assignPlayerTracks: assignPlayer,
                assignTrackParents: assignParent,
                abstractCustomEvents: abstractCustomEvents,

                pointDefinitions: json.customData?.pointDefinitions ?? {},
                customData: json.customData ?? {},
                environment: environmentArr,
                geometry: geometryArr,
                geometryMaterials: materials,
                fogEvents: fogEvents,
            },
        )
    }

    toJSON(): bsmap.v3.IDifficulty {
        const sortItems = (a: { b: number }, b: { b: number }) => a.b - b.b

        // Notes
        const colorNotes = this.notes.filter((e) => !e.fake)
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
            ...this.baseBasicEvents,
        ].map((o) => o.toJson(true))
            .sort(sortItems)

        const boostEvents = this.boostEvents
            .map((x) => x.toJson(true))
            .sort(sortItems)

        const rotationEvents = this.rotationEvents
            .map((x) => x.toJson(true))
            .sort(sortItems)

        const bpmEventsFilter = arrSplit(
            this.bpmEvents,
            (x) => x instanceof OfficialBPMEvent,
        )

        const officialBPMEvents = (bpmEventsFilter[0] as OfficialBPMEvent[])
            .map((x) => x.toJson(true))
            .sort(sortItems)

        const communityBPMEvents = (bpmEventsFilter[1] as CommunityBPMEvent[])
            .map((x) => x.toJson(true))
            .sort(sortItems)

        // Custom events
        const customEvents = [
            ...this.animateTracks,
            ...this.assignPathAnimations,
            ...this.assignTrackParents,
            ...this.assignPlayerTracks,
            ...this.animateComponents,
            ...this.abstractCustomEvents,
        ].map((x) => x.toJson(true))
            .sort(sortItems)

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

        return {
            colorNotes: colorNotes,
            bombNotes: bombNotes,
            basicBeatmapEvents: basicEvents,
            bpmEvents: officialBPMEvents,
            burstSliders: chains,
            colorBoostBeatmapEvents: boostEvents,
            lightColorEventBoxGroups: [],
            lightRotationEventBoxGroups: [],
            lightTranslationEventBoxGroups: [],
            rotationEvents: rotationEvents,
            obstacles: this.walls.map((o) => (o.toJson(true))),
            sliders: arcs,
            version: '3.2.0',
            waypoints: [],
            customData: jsonPrune(
                {
                    ...this.customData,
                    fakeColorNotes: this.notes.filter((e) => e.fake)
                        .map((e) => e.toJson(true))
                        .sort(sortItems),
                    fakeBombNotes: this.bombs.filter((e) => e.fake)
                        .map((e) => e.toJson(true))
                        .sort(sortItems),
                    fakeBurstSliders: this.chains.filter((e) => e.fake)
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
                } satisfies bsmap.v3.ICustomDataDifficulty,
            ),
            useNormalEventsAsCompatibleEvents: true,
            basicEventTypesWithKeywords: {
                d: [],
            },
        }
    }
}
