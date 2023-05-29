import { bomb, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Bomb, Note } from '../internals/note.ts'
import { noteAnimation, wallAnimation } from '../animation/animation.ts'
import { Track } from '../animation/track.ts'
import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'
import { ColorVec, Vec3 } from '../types/data_types.ts'
import { PointDefinitionAny, jsonPrune } from '../mod.ts'

function toNoteOrBomb(
    obj: bsmap.v3.IColorNote | bsmap.v3.IBombNote,
    fake: boolean,
): Note | Bomb {
    const params:
        | Parameters<typeof note>
        | Parameters<typeof bomb> = [{
            time: obj.b,
            lineLayer: obj.x,
            lineIndex: obj.y,
            customData: obj.customData,

            localRotation: obj.customData?.localRotation,
            fake: fake,
            color: obj.customData?.color as ColorVec,
            flip: obj.customData?.flip,
            interactable: obj.customData?.uninteractable !== undefined
            ? !obj.customData?.uninteractable
            : undefined,
            localNJS: obj.customData?.noteJumpMovementSpeed,
            localOffset: obj.customData?.noteJumpStartBeatOffset,

            rotation: typeof obj.customData?.localRotation === 'number'
                ? [0, obj.customData.localRotation, 0]
                : obj.customData?.localRotation,
            noteLook: obj.customData?.disableNoteLook !== undefined
                ? !obj.customData?.disableNoteLook
                : undefined,
            noteGravity: obj.customData?.disableNoteGravity !== undefined
            ? !obj.customData?.disableNoteGravity
            : undefined,
            spawnEffect: obj.customData?.spawnEffect,
            coordinates: obj.customData?.coordinates,
            track: new Track(obj.customData?.track),
            animation: noteAnimation(
                undefined,
                obj.customData?.animation as Record<string, PointDefinitionAny>,
            ),
        }]

    if (!Object.hasOwn(obj, 'c')) {
        return bomb(...params as Parameters<typeof bomb>)
    }

    const colorNote = obj as bsmap.v3.IColorNote
    const n = note({
        type: colorNote.c,
        direction: colorNote.d,
        angleOffset: colorNote.a,
        ...params[0],
    })

    return n
}

function toWall(
    o: bsmap.v3.IObstacle,
    fake: boolean,
) {
    return wall({
        time: o.b,
        lineIndex: o.x,
        lineLayer: o.y,
        width: o.w,
        height: o.h,
        duration: o.d,
        animation: wallAnimation(
            undefined,
            o.customData?.animation as Record<
                string,
                PointDefinitionAny
            >,
        ),
        color: o.customData?._color,
        coordinates: o.customData?._position,
        customData: o.customData,

        fake: fake,
        interactable: !o.customData?.uninteractable,

        localNJS: o.customData?.noteJumpMovementSpeed,
        localOffset: o.customData
            ?.noteJumpStartBeatOffset,
        localRotation: o.customData?.localRotation,
        rotation: o.customData?.localRotation as
            | Vec3
            | undefined,
        track: new Track(o.customData?.track),
        // TODO: height
    })
}

export class V3Difficulty extends AbstractDifficulty<bsmap.v3.IDifficulty> {
    declare version: bsmap.v3.IDifficulty['version']

    constructor(
        diffSet: bsmap.IInfoSetDifficulty,
        diffSetMap: bsmap.IInfoSet,
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

        const notes: Note[] = runProcess(
            'colorNotes',
            (notes) => notes.map((o) => toNoteOrBomb(o, false)) as Note[],
        ) ?? []

        const bombs: Bomb[] = runProcess(
            'bombNotes',
            (notes) => notes.map((o) => toNoteOrBomb(o, false)) as Bomb[],
        ) ?? []

        const obstacles = runProcess(
            'obstacles',
            (obstacles) => obstacles.map((o) => toWall(o, false)),
        ) ?? []

        // Fake stuff
        if (json.customData?.fakeColorNotes) {
            notes.push(
                ...json.customData.fakeColorNotes.map((o) =>
                    toNoteOrBomb(o, true)
                ) as Note[],
            )
            delete json.customData.fakeColorNotes
        }

        if (json.customData?.fakeBombNotes) {
            bombs.push(
                ...json.customData.fakeBombNotes.map((o) =>
                    toNoteOrBomb(o, true)
                ) as Bomb[],
            )
            delete json.customData.fakeBombNotes
        }

        if (json.customData?.fakeObstacles) {
            obstacles.push(
                ...json.customData.fakeObstacles.map((o) => toWall(o, true)),
            )
            delete json.customData.fakeObstacles
        }

        super(
            json,
            diffSet,
            diffSetMap,
            mapFile,
            relativeMapFile,
            {
                notes,
                bombs,
                version: json.version,
                arcs: [],
                chains: [],
                walls: obstacles,
                events: [],
                customEvents: [],
                pointDefinitions: {},
                customData: json.customData ?? {},
                environment: [],
                geometry: [],
            },
        )
    }

    toJSON(): bsmap.v3.IDifficulty {
        const sortItems = (a: { b: number }, b: { b: number }) => a.b - b.b

        const colorNotes = this.notes.filter((e) => !e.fake)
        .map((e) => (e.toJson(true)))
        .sort(
            sortItems,
        )

        // console.log(this.notes[0].toJson(true))

        return {
            colorNotes: colorNotes,
            bombNotes: this.bombs.filter((e) => !e.fake)
                .map((e) => (e.toJson(true)))
                .sort(
                    sortItems,
                ),
            basicBeatmapEvents: [],
            bpmEvents: [],
            burstSliders: [],
            colorBoostBeatmapEvents: [],
            lightColorEventBoxGroups: [],
            lightRotationEventBoxGroups: [],
            lightTranslationEventBoxGroups: [],
            rotationEvents: [],
            obstacles: this.walls.map((o) => (o.toJson(true))),
            sliders: [],
            version: '3.2.0',
            waypoints: [],
            customData: jsonPrune({
                fakeColorNotes: this.notes.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(
                        sortItems,
                    ),
                fakeBombNotes: this.bombs.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(
                        sortItems,
                    ),
                ...this.customData,
            }),
            useNormalEventsAsCompatibleEvents: true,
            basicEventTypesWithKeywords: {
                d: [],
            },
        }
    }
}
