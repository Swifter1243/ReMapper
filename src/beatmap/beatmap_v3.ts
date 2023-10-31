import { arc, bomb, chain, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Arc, Bomb, Chain, Note } from '../internals/note.ts'
import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune } from '../utils/json.ts'
import { environment, geometry } from './environment.ts'
import { arrSplit, RawGeometryMaterial, Track } from '../mod.ts'
import {
    animateComponent,
    animateTrack,
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from './custom_event.ts'
import { event } from './mod.ts'
import { AnyFog, FogEvent } from './fog.ts'

export class V3Difficulty extends AbstractDifficulty<bsmap.v3.IDifficulty> {
    declare version: bsmap.v3.IDifficulty['version']

    constructor(
        info: bsmap.v2.IInfoSetDifficulty,
        setInfo: bsmap.v2.IInfoSet,
        mapFile: DIFFPATH,
        relativeMapFile: DIFFNAME,
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
        const customEvents = json?.customData?.customEvents

        const animateTracks =
            customEvents?.filter((x) => x.t === 'AnimateTrack').map((x) =>
                animateTrack({}).fromJson(
                    x as bsmap.v3.ICustomEventAnimateTrack,
                    true,
                )
            ) ?? []

        const assignPathTracks =
            customEvents?.filter((x) => x.t === 'AssignPathAnimation').map((
                x,
            ) => assignPathAnimation({}).fromJson(
                x as bsmap.v3.ICustomEventAssignPathAnimation,
                true,
            )) ?? []

        const assignParent =
            customEvents?.filter((x) => x.t === 'AssignTrackParent').map((x) =>
                assignTrackParent({}).fromJson(
                    x as bsmap.v3.ICustomEventAssignTrackParent,
                    true,
                )
            ) ?? []

        const assignPlayer =
            customEvents?.filter((x) => x.t === 'AssignPlayerToTrack').map((
                x,
            ) => assignPlayerToTrack({}).fromJson(
                x as bsmap.v3.ICustomEventAssignPlayerToTrack,
                true,
            )) ?? []

        const animateComponents =
            customEvents?.filter((x) => x.t === 'AnimateComponent').map((x) =>
                animateComponent({}).fromJson(
                    x as bsmap.v3.ICustomEventAnimateComponent,
                    true,
                )
            ) ?? []

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
            mapFile,
            relativeMapFile,
            {
                version: json.version,

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

                animateComponents: animateComponents,
                animateTracks: animateTracks,
                assignPathAnimations: assignPathTracks,
                assignPlayerTracks: assignPlayer,
                assignTrackParents: assignParent,

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

        // Custom events
        const customEvents = [
            ...this.animateTracks,
            ...this.assignPathAnimations,
            ...this.assignTrackParents,
            ...this.assignPlayerTracks,
            ...this.animateComponents,
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
                lookupMethod: 'EndsWith'
            }
            fogEnvironment.track = 'ReMapper_Fog'
        }
        if (fogEnvironment!) environment.push(fogEnvironment)

        return {
            colorNotes: colorNotes,
            bombNotes: bombNotes,
            basicBeatmapEvents: basicEvents,
            bpmEvents: [],
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
            customData: jsonPrune({
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
            }),
            useNormalEventsAsCompatibleEvents: true,
            basicEventTypesWithKeywords: {
                d: [],
            },
        }
    }
}
