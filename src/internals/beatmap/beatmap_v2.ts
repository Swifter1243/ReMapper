import { wall } from '../../builder_functions/beatmap/object/gameplay_object/wall.ts'
import { bsmap } from '../../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Wall } from './object/gameplay_object/wall.ts'
import { GeoShader, RawGeometryMaterial } from '../../types/beatmap/object/environment.ts'
import { animateTrack } from '../../builder_functions/beatmap/object/custom_event/heck.ts'
import {
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from '../../builder_functions/beatmap/object/custom_event/noodle_extensions.ts'
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
import { AnyFog, FogEvent } from './object/environment/fog.ts'
import { abstractCustomEvent } from '../../builder_functions/beatmap/object/custom_event/base.ts'
import { arraySplit } from '../../utils/array/split.ts'
import { objectPrune, shallowPrune } from '../../utils/object/prune.ts'
import { EventGroup } from '../../data/constants/basic_event.ts'
import { officialBpmEvent } from '../../builder_functions/beatmap/object/v3_event/bpm.ts'
import { RMDifficulty } from '../../types/beatmap/rm_difficulty.ts'
import { OfficialBPMEvent } from './object/v3_event/bpm/official_bpm.ts'
import { CommunityBPMEvent } from './object/v3_event/bpm/community_bpm.ts'
import { ColorVec } from '../../types/math/vector.ts'
import { BeatmapCustomEvents } from '../../types/beatmap/object/custom_event.ts'
import { IInfoSet, IInfoSetDifficulty } from '../../types/beatmap/info.ts'
import { ColorNote } from './object/gameplay_object/color_note.ts'
import { Bomb } from './object/gameplay_object/bomb.ts'
import { RuntimeRawKeyframesAny } from '../../types/animation/keyframe/runtime/any.ts'
import { CustomEvent } from './object/custom_event/base/custom_event.ts'

/** Difficulty V2 beatmap. */
export class V2Difficulty extends AbstractDifficulty<bsmap.v2.IDifficulty> {
    declare version: bsmap.v2.IDifficulty['_version']
    declare waypoints: bsmap.v2.IWaypoint[]
    specialEventsKeywordFilters: bsmap.v2.IDifficulty['_specialEventsKeywordFilters']

    constructor(
        info: IInfoSetDifficulty,
        setInfo: IInfoSet,
        json: bsmap.v2.IDifficulty,
        process?: (keyof bsmap.v2.IDifficulty)[],
    ) {
        // run only if explicitly allowed
        function runProcess<K extends keyof bsmap.v2.IDifficulty, V>(
            key: K,
            callback: (v: bsmap.v2.IDifficulty[K]) => V,
        ) {
            if (!json[key]) throw `"${key}" is not defined in the beatmap!`

            if (process && !process.some((s) => s === key)) return

            return callback(json[key])
        }

        // Notes
        const colorNotes: ColorNote[] = runProcess(
            '_notes',
            (notes) => notes.filter((n) => n._type !== 3).map((o) => colorNote().fromJsonV2(o)),
        ) ?? []
        const bombs: Bomb[] = runProcess(
            '_notes',
            (notes) => notes.filter((n) => n._type === 3).map((o) => bomb().fromJsonV2(o)),
        ) ?? []

        // Walls
        const obstacles: Wall[] = runProcess(
            '_obstacles',
            (obstacles) => obstacles.map((o) => wall().fromJsonV2(o)),
        ) ?? []

        // Events
        if (!json._events) {
            throw `"_events" does not exist in the beatmap!`
        }
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
        json._events = lightEventsFilter.fail

        const laserSpeedEventsFilter = arraySplit(
            json._events,
            (x) => {
                return x._type === EventGroup.LEFT_ROTATING_LASERS ||
                    x._type === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        json._events = laserSpeedEventsFilter.fail

        const ringZoomEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.RING_ZOOM
        })
        json._events = ringZoomEventsFilter.fail

        const ringSpinEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.RING_SPIN
        })
        json._events = ringSpinEventsFilter.fail

        const rotationEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.EARLY_ROTATION ||
                x._type === EventGroup.LATE_ROTATION
        })
        json._events = rotationEventsFilter.fail

        const boostEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.BOOST
        })
        json._events = boostEventsFilter.fail

        const bpmEventsFilter = arraySplit(json._events, (x) => {
            return x._type === EventGroup.BPM
        })
        json._events = bpmEventsFilter.fail

        const lightEvents = lightEventsFilter.success.map((o) => backLasers().fromJsonV2(o as bsmap.v2.IEventLight))
        const laserSpeedEvents = laserSpeedEventsFilter.success.map((o) => leftLaserSpeed({}).fromJsonV2(o as bsmap.v2.IEventLaser))
        const ringZoomEvents = ringZoomEventsFilter.success.map((o) => ringZoom(0).fromJsonV2(o as bsmap.v2.IEventZoom))
        const ringSpinEvents = ringSpinEventsFilter.success.map((o) => ringSpin({}).fromJsonV2(o as bsmap.v2.IEventRing))
        const rotationEvents = rotationEventsFilter.success.map((o) => {
            if (o._type === EventGroup.EARLY_ROTATION) {
                return earlyRotation({}).fromJsonV2(o as bsmap.v2.IEventLaneRotation)
            } else {
                return lateRotation({}).fromJsonV2(o as bsmap.v2.IEventLaneRotation)
            }
        })
        const boostEvents = boostEventsFilter.success.map((o) => boost({}).fromJsonV2(o))
        const baseBasicEvents = json._events.map((o) => abstract({}).fromJsonV2(o))
        const bpmEvents = [
            ...bpmEventsFilter.success.map((o) => officialBpmEvent({}).fromJsonV2(o)),
            ...[
                ...json._customData?._BPMChanges ?? [],
                ...json._customData?._bpmChanges ?? [],
            ].map((o) => communityBpmEvent({}).fromJsonV2(o)),
        ]
        delete json._customData?._BPMChanges
        delete json._customData?._bpmChanges

        // Fog
        const fogEvents: FogEvent[] = []

        if (json._customData?._customEvents) {
            json._customData._customEvents = json._customData._customEvents.filter(
                (x) => {
                    const hasFogFields =
                        // @ts-ignore 2322
                        x._data._attenuation !== undefined |
                        // @ts-ignore 2322
                        x._data._height !== undefined |
                        // @ts-ignore 2322
                        x._data._offset !== undefined |
                        // @ts-ignore 2322
                        x._data._startY !== undefined

                    const isFogEvent = x._type === 'AnimateTrack' && hasFogFields
                    if (!isFogEvent) {
                        return true
                    }

                    const fog: AnyFog = {
                        // @ts-ignore 2322
                        attenuation: x._data._attenuation,
                        // @ts-ignore 2322
                        height: x._data._height,
                        // @ts-ignore 2322
                        offset: x._data._offset,
                        // @ts-ignore 2322
                        startY: x._data._startY,
                    }

                    fogEvents.push(new FogEvent(fog, x._time, x._data._duration))
                    return false
                },
            )
        }

        // Custom events
        let customEvents = json._customData?._customEvents ?? []
        delete json._customData?._customEvents

        const diffCustomEvents: Partial<BeatmapCustomEvents> = {}

        function extractCustomEvents<
            T extends CustomEvent,
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

            customEvents = filter.fail

            const result = filter.success.map((x) => obj({}).fromJsonV2(x as bsmap.v2.ICustomEventAnimateTrack))
            diffCustomEvents[property] = result as unknown as BeatmapCustomEvents[K]
        }

        extractCustomEvents(animateTrack, 'animateTrackEvents')
        extractCustomEvents(assignPathAnimation, 'assignPathAnimationEvents')
        extractCustomEvents(assignPlayerToTrack, 'assignPlayerTrackEvents')
        extractCustomEvents(assignTrackParent, 'assignTrackParentEvents')

        diffCustomEvents.abstractCustomEvents = customEvents.map((x) => abstractCustomEvent({}).fromJsonV2(x))

        // Environment
        const environmentArr =
            json._customData?._environment?.filter((x) => x._geometry === undefined).map((x) =>
                environment().fromJsonV2(x as bsmap.v2.IChromaEnvironmentID)
            ) ?? []

        const geometryArr =
            json._customData?._environment?.filter((x) => x._geometry !== undefined).map((x) =>
                geometry().fromJsonV2(x as bsmap.v2.IChromaEnvironmentGeometry)
            ) ?? []

        delete json._customData?._environment

        // Point definitions
        const pointDefinitions: RMDifficulty['pointDefinitions'] = {}

        json._customData?._pointDefinitions?.forEach((x) => {
            pointDefinitions[x._name] = x._points as RuntimeRawKeyframesAny
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

                colorNotes,
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
                abstractBasicEvents: baseBasicEvents,
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
        const sortItems = (a: { _time: number }, b: { _time: number }) => a._time - b._time

        // Notes
        const notes = [...this.colorNotes, ...this.bombs]
            .map((e) => e.toJsonV2(true))
            .sort(sortItems)

        // Walls
        const obstacles = this.walls
            .map((e) => e.toJsonV2(true))
            .sort(sortItems)

        // Environment
        const environment = [
            ...this.environment.map((e) => e.toJsonV2(true)),
            ...this.geometry.map((e) => e.toJsonV2(true)),
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
            bpmEventsFilter.fail as CommunityBPMEvent[],
            (x) => x.mediocreMapper,
        )

        const basicEvents = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.rotationEvents,
            ...this.boostEvents,
            ...this.abstractBasicEvents,
            ...bpmEventsFilter.success,
        ].map((o) => o.toJsonV2(true))
            .sort(sortItems) as bsmap.v2.IEvent[]

        // Custom Events
        const customEvents = (Object.values(
            this.customEvents,
        ) as CustomEvent[][])
            .map((a) => a.map((e) => e.toJsonV2(true)))
            .flat()
            .sort(sortItems) as bsmap.v2.ICustomEvent[]

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
            customEvents.push(x.exportV2(true))
        })

        return {
            _version: '2.6.0',
            _notes: notes,
            _events: basicEvents,
            _obstacles: obstacles,
            _sliders: [],
            _waypoints: this.waypoints,
            _customData: shallowPrune({
                ...this.customData,
                _environment: environment,
                _pointDefinitions: pointDefinitions,
                _customEvents: customEvents,
                _materials: materials,
                _bpmChanges: mediocreEventsFilter.success
                    .map((o) => o.toJsonV2(true))
                    .sort(sortItems) as bsmap.v2.IBPMChangeOld[],
                _BPMChanges: mediocreEventsFilter.fail
                    .map((o) => o.toJsonV2(true))
                    .sort(sortItems) as bsmap.v2.IBPMChange[],
            }) satisfies bsmap.v2.ICustomDataDifficulty,
            _specialEventsKeywordFilters: this.specialEventsKeywordFilters,
        }
    }
}
