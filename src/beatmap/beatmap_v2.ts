import { bomb, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import {} from '../types/animation_types.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Bomb, Note } from '../internals/note.ts'
import { Track } from '../animation/track.ts'
import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'
import { ColorVec, Vec3 } from '../types/data_types.ts'
import {
    AnimationPropertiesV2,
    jsonToAnimation,
} from '../internals/animation.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune } from '../utils/json.ts'
import { Wall } from '../internals/wall.ts'
import { environment, geometry } from './environment.ts'

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
        const animateTracks = customEvents?.filter((x) =>
            x._type === 'AnimateTrack'
        )
        const assignPathTracks = customEvents?.filter((x) =>
            x._type === 'AssignPathAnimation'
        )
        const assignParent = customEvents?.filter((x) =>
            x._type === 'AssignTrackParent'
        )
        const assignPlayer = customEvents?.filter((x) =>
            x._type === 'AssignPlayerToTrack'
        )
        const assignFog = customEvents?.filter((x) =>
            x._type === 'AssignFogTrack'
        )
        // TODO: Deserialize

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
                animateTracks: [],
                assignPathAnimations: [],
                assignPlayerTracks: [],
                assignTrackParents: [],

                geoMaterials: {},
                pointDefinitions: {},
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
            }),
            _specialEventsKeywordFilters: { _keywords: [] },
        }
    }
}
