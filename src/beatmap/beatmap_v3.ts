import { bomb, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import {
    ColorType,
    DIFFNAME,
    DIFFPATH,
    KeyframesAny,
    Vec3,
} from '../data/types.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import {Bomb, Note} from "../internals/note.ts";
import { noteAnimation, wallAnimation } from "../animation/animation.ts";
import { Track } from "../animation/track.ts";

function toNoteOrBomb(
    obj: bsmap.v3.IColorNote | bsmap.v3.IBombNote,
): Note | Bomb {
    const params:
        | Parameters<typeof note>
        | Parameters<typeof bomb> = [{
            time: obj.b,
            lineLayer: obj.x,
            lineIndex: obj.y,
            customData: obj.customData,

            localRotation: obj.customData?.localRotation,
            fake: obj.customData?.fake,
            color: obj.customData?.color as ColorType,
            flip: obj.customData?.flip,
            interactable: obj.customData?.interactable,
            localNJS: obj.customData?.noteJumpMovementSpeed,
            localBeatOffset: obj.customData?.noteJumpStartBeatOffset,

            rotation: typeof obj.customData?.localRotation === 'number'
                ? [0, obj.customData.localRotation, 0]
                : obj.customData?.localRotation,
            noteLook: !obj.customData?.disableNoteLook ?? false,
            noteGravity: !obj.customData?.disableNoteGravity ?? false,
            spawnEffect: obj.customData?.spawnEffect ?? false,
            coordinates: obj.customData?.coordinates,
            track: new Track(obj.customData?.track),
            animation: noteAnimation(
                undefined,
                obj.customData?.animation as Record<string, KeyframesAny>,
            ),
        }]

    if (!Object.hasOwn(obj, 'c')) {
        return bomb(...params as Parameters<typeof bomb>)
    }

    const colorNote = obj as bsmap.v3.IColorNote
    return note({
        type: colorNote.c,
        direction: colorNote.d,
        angleOffset: colorNote.a,
        ...params,
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
            (notes) => notes.map(toNoteOrBomb) as Note[],
        ) ?? []
        const bombs: Bomb[] = runProcess(
            'bombNotes',
            (notes) => notes.map(toNoteOrBomb) as Bomb[],
        ) ?? []

        const obstacles = runProcess(
            'obstacles',
            (obstacles) =>
                obstacles.map((o) =>
                    wall({
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
                                KeyframesAny
                            >,
                        ),
                        color: o.customData?._color,
                        coordinates: o.customData?._position,
                        customData: o.customData,

                        fake: o.customData?.fake,
                        interactable: !o.customData?.uninteractable,

                        localNJS: o.customData?.noteJumpMovementSpeed,
                        localBeatOffset: o.customData
                            ?.noteJumpStartBeatOffset,
                        localRotation: o.customData?.localRotation,
                        rotation: o.customData?.localRotation as
                            | Vec3
                            | undefined,
                        track: new Track(o.customData?.track),
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

        return {
            colorNotes: this.notes.map((e) => e.toJson(true))
                .sort(
                    sortItems,
                ),
            bombNotes: this.bombs.map((e) => e.toJson(true))
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
            obstacles: this.walls.map((o) => o.toJson(true)),
            sliders: [],
            version: '3.2.0',
            waypoints: [],
            customData: this.customData,
            useNormalEventsAsCompatibleEvents: true,
            basicEventTypesWithKeywords: {
                d: [],
            },
        }
    }
}
