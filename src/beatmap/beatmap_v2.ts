import { bomb, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Bomb, Note } from '../internals/note.ts'
import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'
import { ColorVec } from '../types/data_types.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune } from '../utils/json.ts'
import { Wall } from '../internals/wall.ts'
import { environment, geometry } from './environment.ts'
import {
    animateTrack,
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from './custom_event.ts'
import { GeoShader, RawGeometryMaterial } from '../types/environment_types.ts'
import { arrSplit } from '../utils/array_utils.ts'
import { event } from './mod.ts'

export class V2Difficulty extends AbstractDifficulty<bsmap.v2.IDifficulty> {
    declare version: bsmap.v2.IDifficulty['_version']

    constructor(
        info: bsmap.v2.IInfoSetDifficulty,
        setInfo: bsmap.v2.IInfoSet,
        mapFile: DIFFPATH,
        relativeMapFile: DIFFNAME,
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

        const obstacles: Wall[] = runProcess(
            '_obstacles',
            (obstacles) => obstacles.map((o) => wall().fromJson(o, false)),
        ) ?? []

        // Events
        const lightEventsFilter = arrSplit(json._events, (x) => {
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

        const laserSpeedEventsFilter = arrSplit(
            json._events,
            (x) => {
                return x._type === EventGroup.LEFT_ROTATING_LASERS ||
                    x._type === EventGroup.RIGHT_ROTATING_LASERS
            },
        )
        json._events = laserSpeedEventsFilter[1]

        const ringZoomEventsFilter = arrSplit(json._events, (x) => {
            return x._type === EventGroup.RING_ZOOM
        })
        json._events = ringZoomEventsFilter[1]

        const ringSpinEventsFilter = arrSplit(json._events, (x) => {
            return x._type === EventGroup.RING_SPIN
        })
        json._events = ringSpinEventsFilter[1]

        const rotationEventsFilter = arrSplit(json._events, (x) => {
            return x._type === EventGroup.EARLY_ROTATION ||
                x._type === EventGroup.LATE_ROTATION
        })
        json._events = rotationEventsFilter[1]

        const boostEventsFilter = arrSplit(json._events, (x) => {
            return x._type === EventGroup.BOOST
        })
        json._events = boostEventsFilter[1]

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

        /// custom events
        const customEvents = json?._customData?._customEvents

        const animateTracks =
            customEvents?.filter((x) => x._type === 'AnimateTrack').map((x) =>
                animateTrack({}).fromJson(
                    x as bsmap.v2.ICustomEventAnimateTrack,
                    false,
                )
            ) ?? []

        const assignPathTracks =
            customEvents?.filter((x) => x._type === 'AssignPathAnimation').map((
                x,
            ) => assignPathAnimation({}).fromJson(
                x as bsmap.v2.ICustomEventAssignPathAnimation,
                false,
            )) ?? []

        const assignParent =
            customEvents?.filter((x) => x._type === 'AssignTrackParent').map((
                x,
            ) => assignTrackParent({}).fromJson(
                x as bsmap.v2.ICustomEventAssignTrackParent,
                false,
            )) ?? []

        const assignPlayer =
            customEvents?.filter((x) => x._type === 'AssignPlayerToTrack').map((
                x,
            ) => assignPlayerToTrack({}).fromJson(
                x as bsmap.v2.ICustomEventAssignPlayerToTrack,
                false,
            )) ?? []

        // environment
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

        // point definitions
        const pointDefinitions: Record<string, unknown> = {}

        json._customData?._pointDefinitions?.forEach((x) => {
            pointDefinitions[x._name] = x._points
        })

        // geometry materials
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

        super(
            json,
            info,
            setInfo,
            mapFile,
            relativeMapFile,
            {
                notes,
                bombs,
                version: json._version,
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

                animateComponents: [],
                animateTracks: animateTracks,
                assignPathAnimations: assignPathTracks,
                assignPlayerTracks: assignPlayer,
                assignTrackParents: assignParent,

                geoMaterials: materials,
                pointDefinitions: pointDefinitions,
                customData: json._customData ?? {},
                environment: environmentArr,
                geometry: geometryArr,
            },
        )
    }

    toJSON(): bsmap.v2.IDifficulty {
        const sortItems = (a: { _time: number }, b: { _time: number }) =>
            a._time - b._time

        // Notes
        const notes = [...this.notes, ...this.bombs].map((e) =>
            jsonPrune(e.toJson(false))
        ).sort(sortItems)

        // Environment
        const environmentArr = this.environment.map((e) => e.toJson(false))
        const geometryArr = this.geometry.map((e) => e.toJson(false))

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

        Object.entries(this.geoMaterials).forEach(
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
        const basicEvents = [
            ...this.lightEvents,
            ...this.laserSpeedEvents,
            ...this.ringZoomEvents,
            ...this.ringSpinEvents,
            ...this.rotationEvents,
            ...this.boostEvents,
            ...this.baseBasicEvents,
        ].map((o) => o.toJson(false))
            .sort(sortItems)

        // Custom Events
        const customEvents = [
            ...this.animateTracks,
            ...this.assignPathAnimations,
            ...this.assignTrackParents,
            ...this.assignPlayerTracks,
            ...this.animateComponents,
        ].map((x) => x.toJson(false))
            .sort(sortItems)

        return {
            _notes: notes,
            _events: basicEvents,
            _obstacles: this.walls.map((o) => jsonPrune(o.toJson(false))),
            _sliders: [],
            _version: '2.6.0',
            _waypoints: [],
            _customData: jsonPrune({
                ...this.customData,
                environment: [
                    ...environmentArr,
                    ...geometryArr,
                ],
                pointDefinitions: pointDefinitions,
                customEvents: customEvents,
                materials: materials,
            }),
            _specialEventsKeywordFilters: { _keywords: [] },
        }
    }
}
