import { wall } from '../../builder_functions/beatmap/object/gameplay_object/wall.ts'
import { bsmap } from '../../deps.ts'
import { AbstractDifficulty } from './abstract_difficulty.ts'
import { GeoShader } from '../../types/beatmap/object/environment.ts'
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
import { shallowPrune } from '../../utils/object/prune.ts'
import { EventGroup } from '../../constants/basic_event.ts'
import { officialBpmEvent } from '../../builder_functions/beatmap/object/v3_event/bpm.ts'
import { OfficialBPMEvent } from './object/v3_event/bpm/official_bpm.ts'
import { CommunityBPMEvent } from './object/v3_event/bpm/community_bpm.ts'
import { ColorVec } from '../../types/math/vector.ts'
import { RuntimeRawPointsAny } from '../../types/animation/points/runtime/any.ts'
import { CustomEvent } from './object/custom_event/base/custom_event.ts'
import { NoteColor } from '../../constants/note.ts'
import {FOG_TRACK} from "../../constants/fog.ts";

/** Difficulty V2 beatmap. */
export class V2Difficulty extends AbstractDifficulty<bsmap.v2.IDifficulty> {
    declare version: bsmap.v2.IDifficulty['_version']
    declare waypoints: bsmap.v2.IWaypoint[]
    specialEventsKeywordFilters: bsmap.v2.IDifficulty['_specialEventsKeywordFilters']

    protected loadJSON(json: bsmap.v2.IDifficulty) {
        function assertAndGet<K extends keyof typeof json>(
            key: K
        ): (typeof json)[K] {
            if (!Object.hasOwn(json, key)) {
                throw new Error(`Beatmap incomplete. Expected key '${key}' in beatmap but it wasn't there.`)
            }

            return json[key]
        }

        // Header
        this.version = assertAndGet('_version')
        this.v3 = false
        this.waypoints = assertAndGet('_waypoints')

        // Notes
        assertAndGet('_notes')
            .filter((n) => n._type === NoteColor.RED || n._type === NoteColor.BLUE)
            .forEach((o) => colorNote(this).fromJsonV2(o))
        assertAndGet('_notes')
            .filter((n) => n._type === 3)
            .forEach((o) => bomb(this).fromJsonV2(o))

        // Walls
        assertAndGet('_obstacles').forEach((o) => wall(this).fromJsonV2(o))

        // Events
        let events = assertAndGet('_events')
        const lightEventsFilter = arraySplit(events, (x) => {
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
        lightEventsFilter.success.forEach((o) => backLasers(this).fromJsonV2(o as bsmap.v2.IEventLight))
        events = lightEventsFilter.fail

        const laserSpeedEventsFilter = arraySplit(
            events,
            (x) => {
                return x._type === EventGroup.LEFT_ROTATING_LASERS ||
                    x._type === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        laserSpeedEventsFilter.success.forEach((o) => leftLaserSpeed(this, {}).fromJsonV2(o as bsmap.v2.IEventLaser))
        events = laserSpeedEventsFilter.fail

        const ringZoomEventsFilter = arraySplit(events, (x) => {
            return x._type === EventGroup.RING_ZOOM
        })
        ringZoomEventsFilter.success.forEach((o) => ringZoom(this, 0).fromJsonV2(o as bsmap.v2.IEventZoom))
        events = ringZoomEventsFilter.fail

        const ringSpinEventsFilter = arraySplit(events, (x) => {
            return x._type === EventGroup.RING_SPIN
        })
        ringSpinEventsFilter.success.forEach((o) => ringSpin(this, {}).fromJsonV2(o as bsmap.v2.IEventRing))
        events = ringSpinEventsFilter.fail

        const rotationEventsFilter = arraySplit(events, (x) => {
            return x._type === EventGroup.EARLY_ROTATION ||
                x._type === EventGroup.LATE_ROTATION
        })
        rotationEventsFilter.success.forEach((o) => {
            if (o._type === EventGroup.EARLY_ROTATION) {
                return earlyRotation(this, {}).fromJsonV2(o as bsmap.v2.IEventLaneRotation)
            } else {
                return lateRotation(this, {}).fromJsonV2(o as bsmap.v2.IEventLaneRotation)
            }
        })
        events = rotationEventsFilter.fail

        const boostEventsFilter = arraySplit(events, (x) => {
            return x._type === EventGroup.BOOST
        })
        boostEventsFilter.success.forEach((o) => boost(this, {}).fromJsonV2(o))
        events = boostEventsFilter.fail

        const bpmEventsFilter = arraySplit(events, (x) => {
            return x._type === EventGroup.BPM
        })
        bpmEventsFilter.success.forEach((o) => officialBpmEvent(this, {}).fromJsonV2(o))
        events = bpmEventsFilter.fail

        events.forEach((o) => abstract(this, {}).fromJsonV2(o))

        const bpmChanges = [
            ...json._customData?._BPMChanges ?? [],
            ...json._customData?._bpmChanges ?? [],
        ]
        bpmChanges.forEach((o) => communityBpmEvent(this, {}).fromJsonV2(o))
        delete json._customData?._BPMChanges
        delete json._customData?._bpmChanges

        // Fog
        if (json._customData?._customEvents) {
            const fogEvent = json._customData._customEvents
                .find((o) => o._type === 'AssignFogTrack')

            if (fogEvent) {
                const fogTrack = fogEvent._data._track as string

                json._customData._customEvents = json._customData._customEvents.filter((x) => {
                    const isFogRelated = x._type === 'AssignFogTrack' || x._type === 'AnimateTrack'

                    if (isFogRelated && x._data._track && x._data._track === fogTrack) {
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

                        new FogEvent(this, fog, x._time, x._data._duration)
                        return true
                    }
                    return false
                })
            }
        }

        // Custom events
        let customEvents = json._customData?._customEvents ?? []
        delete json._customData?._customEvents

        const extractCustomEvents = <
            T extends CustomEvent,
        >(
            obj: (difficulty: AbstractDifficulty, a: object) => T,
            type: bsmap.v2.ICustomEvent['_type'],
        ) => {
            const filter = arraySplit(
                customEvents,
                (x) => x._type === type,
            )

            customEvents = filter.fail
            filter.success.forEach((x) => obj(this, {}).fromJsonV2(x as bsmap.v2.ICustomEventAnimateTrack))
        }

        extractCustomEvents(animateTrack, 'AnimateTrack')
        extractCustomEvents(assignPathAnimation, 'AssignPathAnimation')
        extractCustomEvents(assignPlayerToTrack, 'AssignPlayerToTrack')
        extractCustomEvents(assignTrackParent, 'AssignTrackParent')

        customEvents.forEach((x) => abstractCustomEvent(this, {}).fromJsonV2(x))

        // Environment
        json._customData?._environment
            ?.filter((x) => x._geometry === undefined)
            .forEach((x) => environment(this).fromJsonV2(x as bsmap.v2.IChromaEnvironmentID))

        json._customData?._environment
            ?.filter((x) => x._geometry !== undefined)
            .forEach((x) => geometry(this).fromJsonV2(x as bsmap.v2.IChromaEnvironmentGeometry))

        delete json._customData?._environment

        // Point definitions
        json._customData?._pointDefinitions?.forEach((x) => {
            this.pointDefinitions[x._name] = x._points as RuntimeRawPointsAny
        })
        delete json._customData?._pointDefinitions

        // Geometry materials
        Object.entries(json._customData?._materials ?? {}).forEach(
            ([key, value]) => {
                this.geometryMaterials[key] = {
                    shader: value._shader as GeoShader,
                    color: value._color as ColorVec,
                    shaderKeywords: value._shaderKeywords,
                    track: value._track,
                }
            },
        )
        delete json._customData?._materials

        // Extra
        this.specialEventsKeywordFilters = assertAndGet('_specialEventsKeywordFilters')
        this.unsafeCustomData = json._customData ?? {}
    }

    toJSON(): bsmap.v2.IDifficulty {
        function sortItems(a: { _time: number }, b: { _time: number }) {
            return a._time - b._time
        }

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
                    _track: FOG_TRACK,
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
                ...this.unsafeCustomData,
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
