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
    animateComponent,
    animateTrack,
    assignPathAnimation,
    assignPlayerToTrack,
    assignTrackParent,
} from './custom_event.ts'
import { GeoShader, RawGeometryMaterial } from '../types/environment_types.ts'

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

        // 0-3 laser
        const lasersEvents = json._events.filter((x) =>
            (x._type >= 0 && x._type <= 3) ||
            (x._type === EventGroup.LEFT_EXTRA ||
                x._type === EventGroup.RIGHT_EXTRA)
        )
        const lasersRotateEvents = json._events.filter((x) =>
            x._type === EventGroup.LEFT_ROTATING ||
            x._type === EventGroup.RIGHT_ROTATING
        )

        // 4 to 7 are lights
        const lightEvents = json._events.filter((x) =>
            x._type >= 4 && x._type <= 7 && x._type !== 5
        )
        const boostEvents = json._events.filter((x) => x._type === 5)
        const zoomEvents = json._events.filter((x) =>
            x._type === EventGroup.RING_ZOOM
        )
        const ringRotateEvents = json._events.filter((x) =>
            x._type === EventGroup.RING_SPIN
        )
        // 90/360 maps
        const laneEvents = json._events.filter((x) =>
            x._type === 13 || x._type === 14
        )
        // idk
        const utilityEvents = json._events.filter((x) =>
            x._type >= 16 && x._type <= 19
        )
        // bts?
        const specialEvents = json._events.filter((x) =>
            x._type >= 40 && x._type <= 43
        )

        const bpmRotationEvents = json._events.filter((x) => x._type === 100)

        /// custom events
        const customEvents = json?._customData?._customEvents

        const animateTracks =
            customEvents?.filter((x) => x._type === 'AnimateTrack').map((x) =>
                animateTrack(0, '').fromJson(
                    x as bsmap.v2.ICustomEventAnimateTrack,
                    false,
                )
            ) ?? []

        const assignPathTracks =
            customEvents?.filter((x) => x._type === 'AssignPathAnimation').map((
                x,
            ) => assignPathAnimation(0, '').fromJson(
                x as bsmap.v2.ICustomEventAssignPathAnimation,
                false,
            )) ?? []

        const assignParent =
            customEvents?.filter((x) => x._type === 'AssignTrackParent').map((
                x,
            ) => assignTrackParent(0, [], '').fromJson(
                x as bsmap.v2.ICustomEventAssignTrackParent,
                false,
            )) ?? []

        const assignPlayer =
            customEvents?.filter((x) => x._type === 'AssignPlayerToTrack').map((
                x,
            ) => assignPlayerToTrack(0, '').fromJson(
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

                basicEvents: [],
                laserSpeedEvents: [],
                ringSpinEvents: [],
                ringZoomEvents: [],
                rotationEvent: [],

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

        const notes = [...this.notes, ...this.bombs].map((e) =>
            jsonPrune(e.toJson(false))
        ).sort(sortItems)

        const environmentArr = this.environment.map((e) => e.toJson(false))
        const geometryArr = this.geometry.map((e) => e.toJson(false))

        const pointDefinitions = [] as bsmap.v2.IPointDefinition[]

        Object.entries(this.pointDefinitions).forEach((x) => {
            pointDefinitions.push({
                _name: x[0],
                _points: x[1] as bsmap.v2.IPointDefinition['_points'],
            })
        })

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
            _events: [],
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
