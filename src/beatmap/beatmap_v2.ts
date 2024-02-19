import { bomb, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { AbstractDifficulty, BeatmapCustomEvents } from './abstract_beatmap.ts'
import { Bomb, Note } from '../internals/note.ts'
import { ColorVec } from '../types/data_types.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune, shallowPrune } from '../utils/json.ts'
import { Wall } from '../internals/wall.ts'
import { environment, geometry } from './environment.ts'
import {
    abstractCustomEvent,
    animateTrack,
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from './custom_event.ts'
import { GeoShader, RawGeometryMaterial } from '../types/environment_types.ts'
import { arraySplit } from '../utils/array_utils.ts'
import { CommunityBPMEvent, OfficialBPMEvent } from '../internals/event.ts'
import { AnyFog, CustomEventInternals, event, FogEvent, TJson } from '../mod.ts'

export class V2Difficulty extends AbstractDifficulty<bsmap.v2.IDifficulty> {
    declare version: bsmap.v2.IDifficulty['_version']
    declare waypoints: bsmap.v2.IWaypoint[]
    specialEventsKeywordFilters:
        bsmap.v2.IDifficulty['_specialEventsKeywordFilters']

    constructor(
        info: bsmap.v2.IInfoSetDifficulty,
        setInfo: bsmap.v2.IInfoSet,
        json: bsmap.v2.IDifficulty,
        process?: (keyof bsmap.v2.IDifficulty)[],
    ) {
        // run only if explicitly allowed
        function runProcess<K extends keyof bsmap.v2.IDifficulty, V>(
            key: K,
            callback: (v: bsmap.v2.IDifficulty[K]) => V,
        ) {
            if (process && !process.some((s) => s === key)) return

            return callback(json[key])
        }

        // Notes
        const notes: Note[] = runProcess(
            '_notes',
            (notes) =>
                notes.filter((n) => n._type !== 3).map((o) =>
                    note().fromJson(o, false)
                ),
        ) ?? []
        const bombs: Bomb[] = runProcess(
            '_notes',
            (notes) =>
                notes.filter((n) => n._type === 3).map((o) =>
                    bomb().fromJson(o, false)
                ),
        ) ?? []

        // Walls
        const obstacles: Wall[] = runProcess(
            '_obstacles',
            (obstacles) => obstacles.map((o) => wall().fromJson(o, false)),
        ) ?? []

        // Events
        const lightEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.BACK_LASERS ||
                x._type === EventGroup.RING_LIGHTS ||
                x._type === EventGroup.LEFT_LASERS ||
                x._type === EventGroup.RIGHT_LASERS ||
                x._type === EventGroup.CENTER_LASERS ||
                x._type === EventGroup.LEFT_EXTRA ||
                x._type === EventGroup.RIGHT_EXTRA ||
                x._type === EventGroup.BILLIE_LEFT ||
                x._type === EventGroup.BILLIE_RIGHT ||
                x._type === EventGroup.GAGA_LEFT ||
                x._type === EventGroup.GAGA_RIGHT
        })
        json._events = lightEventsFilter[1]

        const laserSpeedEventsFilter = arraySplit(
            json._events,
            (x) => {
                return x._type === EventGroup.LEFT_ROTATING_LASERS ||
                    x._type === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        json._events = laserSpeedEventsFilter[1]

        const ringZoomEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.RING_ZOOM
        })
        json._events = ringZoomEventsFilter[1]

        const ringSpinEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.RING_SPIN
        })
        json._events = ringSpinEventsFilter[1]

        const rotationEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.EARLY_ROTATION ||
                x._type === EventGroup.LATE_ROTATION
        })
        json._events = rotationEventsFilter[1]

        const boostEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.BOOST
        })
        json._events = boostEventsFilter[1]

        const bpmEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.BPM
        })
        json._events = bpmEventsFilter[1]

        const lightEvents = lightEventsFilter[0].map((o) =>
            event.backLasers().fromJson(o as bsmap.v2.IEventLight, false)
        )

        const laserSpeedEvents = laserSpeedEventsFilter[0].map((o) =>
            event.leftLaserSpeed({}).fromJson(
                o as bsmap.v2.IEventLaser,
                false,
            )
        )

        const ringZoomEvents = ringZoomEventsFilter[0].map((o) =>
            event.ringZoom(0).fromJson(o as bsmap.v2.IEventZoom, false)
        )

        const ringSpinEvents = ringSpinEventsFilter[0].map((o) =>
            event.ringSpin({}).fromJson(o as bsmap.v2.IEventRing, false)
        )

        const rotationEvents = rotationEventsFilter[0].map((o) =>
            event.lateRotation({}).fromJson(
                o as bsmap.v2.IEventLaneRotation,
                false,
            )
        )

        const boostEvents = boostEventsFilter[0].map((o) =>
            event.boost({}).fromJson(o, false)
        )

        const baseBasicEvents = json._events.map((o) =>
            event.baseBasicEvent({}).fromJson(o, false)
        )

        const bpmEvents = [
            ...bpmEventsFilter[0].map((o) =>
                event.officialBpmEvent({}).fromJson(o, false)
            ),
            ...[
                ...json._customData?._BPMChanges ?? [],
                ...json._customData?._bpmChanges ?? [],
            ].map((o) => event.communityBpmEvent({}).fromJson(o, false)),
        ]
        delete json._customData?._BPMChanges
        delete json._customData?._bpmChanges

        // Fog
        const fogEvents: FogEvent[] = []

        if (json._customData?._customEvents) {
            json._customData._customEvents = json._customData._customEvents
                .filter(
                    (x) => {
                        const obj: AnyFog = {}
                        // @ts-ignore 2322
                        obj.attenuation = x._data._attenuation
                        // @ts-ignore 2322
                        obj.height = x._data._height
                        // @ts-ignore 2322
                        obj.offset = x._data._offset
                        // @ts-ignore 2322
                        obj.startY = x._data._startY

                        jsonPrune(obj)

                        if (
                            x._type === 'AnimateTrack' &&
                            Object.keys(obj).length > 0
                        ) {
                            fogEvents.push(
                                new FogEvent(
                                    obj as AnyFog,
                                    x._time,
                                    x._data._duration,
                                ),
                            )
                            return false
                        }

                        return true
                    },
                )
        }

        // Custom events
        let customEvents = json._customData?._customEvents ?? []
        delete json._customData?._customEvents

        const diffCustomEvents: Partial<BeatmapCustomEvents> = {}

        function extractCustomEvents<
            T extends CustomEventInternals.BaseCustomEvent,
            K extends keyof BeatmapCustomEvents,
        >(
            obj: (a: object) => T,
            property: K,
        ) {
            const type = obj({}).type

            const filter = arraySplit(
                customEvents,
                (x) => x._type === type,
            )

            const result = filter[0].map((x) =>
                obj({}).fromJson(
                    x as bsmap.v2.ICustomEventAnimateTrack,
                    false,
                )
            )
            customEvents = filter[1]

            diffCustomEvents[property] =
                result as unknown as BeatmapCustomEvents[K]
        }

        extractCustomEvents(animateTrack, 'animateTrackEvents')
        extractCustomEvents(assignPathAnimation, 'assignPathAnimationEvents')
        extractCustomEvents(assignPlayerToTrack, 'assignPlayerTrackEvents')
        extractCustomEvents(assignTrackParent, 'assignTrackParentEvents')

        diffCustomEvents.abstractCustomEvents = customEvents.map((x) =>
            abstractCustomEvent({}).fromJson(x, false)
        )

        // Environment
        const environmentArr =
            json._customData?._environment?.filter((x) =>
                x._geometry === undefined
            ).map((x) =>
                environment().fromJson(
                    x as bsmap.v2.IChromaEnvironmentID,
                    false,
                )
            ) ?? []

        const geometryArr =
            json._customData?._environment?.filter((x) =>
                x._geometry !== undefined
            ).map((x) =>
                geometry().fromJson(
                    x as bsmap.v2.IChromaEnvironmentGeometry,
                    false,
                )
            ) ?? []

        delete json._customData?._environment

        // Point definitions
        const pointDefinitions: TJson = {}

        json._customData?._pointDefinitions?.forEach((x) => {
            pointDefinitions[x._name] = x._points
        })
        delete json._customData?._pointDefinitions

        // Geometry materials
        const materials: Record<string, RawGeometryMaterial> = {}

        Object.entries(json._customData?._materials ?? {}).forEach(
            ([key, value]) => {
                materials[key] = {
                    shader: value._shader as GeoShader,
                    color: value._color as ColorVec,
                    shaderKeywords: value._shaderKeywords,
                    track: value._track,
                }
            },
        )
        delete json._customData?._materials

        super(
            json,
            info,
            setInfo,
            {
                version: json._version,
                v3: false,
                waypoints: json._waypoints,

                notes,
                bombs,
                arcs: [],
                chains: [],
                walls: obstacles,

                lightEvents: lightEvents,
                laserSpeedEvents: laserSpeedEvents,
                ringSpinEvents: ringSpinEvents,
                ringZoomEvents: ringZoomEvents,
                rotationEvents: rotationEvents,
                boostEvents: boostEvents,
                baseBasicEvents: baseBasicEvents,
                bpmEvents: bpmEvents,

                lightColorEventBoxGroups: [],
                lightRotationEventBoxGroups: [],
                lightTranslationEventBoxGroups: [],

                customEvents: customEvents as unknown as BeatmapCustomEvents,

                geometryMaterials: materials,
                pointDefinitions: pointDefinitions,
                customData: json._customData ?? {},
                environment: environmentArr,
                geometry: geometryArr,
                fogEvents: fogEvents,
            },
        )

        // Extra
        this.specialEventsKeywordFilters = json._specialEventsKeywordFilters
    }

    toJSON(): bsmap.v2.IDifficulty {
        const sortItems = (a: { _time: number }, b: { _time: number }) =>
            a._time - b._time

        // Notes
        const notes = [...this.notes, ...this.bombs]
            .map((e) => jsonPrune(e.toJson(false)))
            .sort(sortItems)

        // Walls
        const obstacles = this.walls
            .map((e) => jsonPrune(e.toJson(false)))
            .sort(sortItems)

        // Environment
        const environment = [
            ...this.environment.map((e) => e.toJson(false)),
            ...this.geometry.map((e) => e.toJson(false)),
        ]

        // Point Definitions
        const pointDefinitions = [] as bsmap.v2.IPointDefinition[]

        Object.entries(this.pointDefinitions).forEach((x) => {
            pointDefinitions.push({
                _name: x[0],
                _points: x[1] as bsmap.v2.IPointDefinition['_points'],
            })
        })

        // Materials
        const materials: Record<string, bsmap.v2.IChromaMaterial> = {}

        Object.entries(this.geometryMaterials).forEach(
            ([key, value]) => {
                materials[key] = {
                    _shader: value.shader,
                    _color: value.color,
                    _shaderKeywords: value.shaderKeywords,
                    _track: value.track,
                }
            },
        )

        // Events
        const bpmEventsFilter = arraySplit(
            this.bpmEvents,
            (x) => x instanceof OfficialBPMEvent,
        )

        const mediocreEventsFilter = arraySplit(
            bpmEventsFilter[1] as CommunityBPMEvent[],
            (x) => x.mediocreMapper,
        )

        const basicEvents = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.rotationEvents,
            ...this.boostEvents,
            ...this.baseBasicEvents,
            ...(bpmEventsFilter[0] as OfficialBPMEvent[]),
        ].map((o) => o.toJson(false))
            .sort(sortItems)

        // Custom Events
        const customEvents = (Object.values(
            this.customEvents,
        ) as CustomEventInternals.BaseCustomEvent[][])
            .map((a) =>
                a.map((e) => e.toJson(false))
                    .sort(sortItems) as bsmap.v2.ICustomEvent[]
            )
            .flat()

        // Fog
        if (this.fogEvents.length > 0) {
            customEvents.push({
                _time: 0,
                _type: 'AssignFogTrack',
                _data: {
                    _track: 'ReMapper_Fog',
                },
            } as bsmap.v2.ICustomEvent)
        }

        this.fogEvents.forEach((x) => {
            customEvents.push(x.exportV2())
        })

        return {
            _notes: notes,
            _events: basicEvents,
            _obstacles: obstacles,
            _sliders: [],
            _version: '2.6.0',
            _waypoints: this.waypoints,
            _customData: shallowPrune({
                ...this.customData,
                _environment: environment,
                _pointDefinitions: pointDefinitions,
                _customEvents: customEvents,
                _materials: materials,
                _bpmChanges: mediocreEventsFilter[0]
                    .map((o) => o.toJson(false))
                    .sort(sortItems) as bsmap.v2.IBPMChangeOld[],
                _BPMChanges: mediocreEventsFilter[1]
                    .map((o) => o.toJson(false))
                    .sort(sortItems) as bsmap.v2.IBPMChange[],
            }) satisfies bsmap.v2.ICustomDataDifficulty,
            _specialEventsKeywordFilters: this.specialEventsKeywordFilters,
        }
    }
}
