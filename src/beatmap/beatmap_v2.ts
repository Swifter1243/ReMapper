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
    animationToJson,
    jsonToAnimation,
} from '../internals/animation.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune } from '../utils/json.ts'

function toNoteOrBomb(b: bsmap.v2.INote): Note | Bomb {
    const params:
        | Parameters<typeof note>
        | Parameters<typeof bomb> = [{
            time: b._time,
            type: b._type as 0 | 1,
            direction: b._cutDirection,
            lineLayer: b._lineLayer,
            lineIndex: b._lineIndex,
            customData: b._customData,

            localRotation: b._customData?._localRotation,
            fake: b._customData?._fake,
            color: b._customData?._color as ColorVec,
            flip: b._customData?._flip,
            interactable: b._customData?._interactable,
            localNJS: b._customData?._noteJumpMovementSpeed,
            localOffset: b._customData?._noteJumpStartBeatOffset,

            rotation: typeof b._customData?._rotation === 'number'
                ? [0, b._customData._rotation, 0]
                : b._customData?._rotation,
            noteLook: b._customData?._disableNoteLook !== undefined
                ? b._customData?._disableNoteLook
                : undefined,
            noteGravity: b._customData?._disableNoteGravity !== undefined
                ? b._customData?._disableNoteGravity
                : undefined,
            spawnEffect: b._customData?._disableSpawnEffect !== undefined
                ? b._customData?._disableSpawnEffect
                : undefined,
            coordinates: b._customData?._position,
            track: new Track(b._customData?._track),
            animation: jsonToAnimation(
                b._customData?._animation as AnimationPropertiesV2 ?? {},
            ),
        }]

    if (b._type === 3) {
        return bomb(...params)
    }

    return note(...params)
}
export class V2Difficulty extends AbstractDifficulty<bsmap.v2.IDifficulty> {
    declare version: bsmap.v2.IDifficulty['_version']

    constructor(
        diffSet: bsmap.v2.IInfoSetDifficulty,
        diffSetMap: bsmap.v2.IInfoSet,
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
                notes.filter((n) => n._type !== 3).map(toNoteOrBomb) as Note[],
        ) ?? []
        const bombs: Bomb[] = runProcess(
            '_notes',
            (notes) =>
                notes.filter((n) => n._type === 3).map(toNoteOrBomb) as Bomb[],
        ) ?? []

        const obstacles = runProcess(
            '_obstacles',
            (obstacles) =>
                obstacles.map((o) =>
                    wall({
                        time: o._time,
                        animation: jsonToAnimation(
                            o._customData
                                ?._animation as AnimationPropertiesV2 ?? {},
                        ),
                        color: o._customData?._color as ColorVec,
                        coordinates: o._customData?._position,
                        customData: o._customData,
                        duration: o._duration,
                        fake: o._customData?._fake,
                        interactable: o._customData?._interactable,
                        lineIndex: o._lineIndex,
                        lineLayer: o._type,
                        width: o._width,
                        localNJS: o._customData?._noteJumpMovementSpeed,
                        localOffset: o._customData
                            ?._noteJumpStartBeatOffset,
                        localRotation: o._customData?._localRotation,
                        rotation: o._customData?._rotation as Vec3 | undefined,
                        scale: o._customData?._scale as Vec3,
                        track: new Track(o._customData?._track),
                        // TODO: height
                    })
                ),
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
        const boostEvents = json._events.filter((x) =>
            x._type ===5
        )
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

        super(
            json,
            diffSet,
            diffSetMap,
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
                environment: [],
                geometry: [],
            },
        )
    }

    toJSON(): bsmap.v2.IDifficulty {
        const sortItems = (a: { _time: number }, b: { _time: number }) =>
            a._time - b._time

        return {
            _notes: [...this.notes, ...this.bombs].map((e) =>
                jsonPrune(e.toJson(false))
            )
                .sort(
                    sortItems,
                ),
            _events: [],
            _obstacles: this.walls.map((o) => jsonPrune(o.toJson(false))),
            _sliders: [],
            _version: '2.6.0',
            _waypoints: [],
            _customData: this.customData,
            _specialEventsKeywordFilters: { _keywords: [] },
        }
    }
}
