import { bomb, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { KeyframesAny } from '../types/animation_types.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Bomb, Note } from '../internals/note.ts'
import { Track } from '../animation/track.ts'
import { noteAnimation, wallAnimation } from '../animation/animation.ts'
import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'
import { ColorVec, Vec3 } from '../types/data_types.ts'
import { fastJsonPruneV2, jsonPrune } from '../mod.ts'

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
            animation: noteAnimation(
                undefined,
                b._customData?._animation as Record<string, KeyframesAny>,
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
        diffSet: bsmap.IInfoSetDifficulty,
        diffSetMap: bsmap.IInfoSet,
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
                        animation: wallAnimation(
                            undefined,
                            o._customData?._animation as Record<
                                string,
                                KeyframesAny
                            >,
                        ),
                        color: o._customData?._color,
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
                events: [],
                customEvents: [],
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
