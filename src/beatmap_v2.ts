import { AbstractDifficulty } from './beatmap.ts'
import { bsmap, DIFFNAME, DIFFPATH, Track } from './mod.ts'
import { Bomb, bomb, Note, note } from './note.ts'
import { ColorType } from './general.ts'
import { KeyframesAny, noteAnimation } from './animation.ts'

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
      color: b._customData?._color as ColorType,
      flip: b._customData?._flip,
      interactable: b._customData?._interactable,
      localNJS: b._customData?._noteJumpMovementSpeed,
      localBeatOffset: b._customData?._noteJumpStartBeatOffset,

      rotation: typeof b._customData?._rotation === "number"
        ? [0, b._customData._rotation, 0]
        : b._customData?._rotation,
      noteLook: !b._customData?._disableNoteLook ?? false,
      noteGravity: !b._customData?._disableNoteGravity ?? false,
      spawnEffect: !b._customData?._disableSpawnEffect ?? false,
      coordinates: b._customData?._position,
      track: new Track(b._customData?._track),
      animation: noteAnimation(
        undefined,
        b._customData?._animation as Record<string, KeyframesAny>,
      ),
    }];

  if (b._type === 3) {
    return bomb(...params);
  }

  return note(...params);
}
export class V2Difficulty extends AbstractDifficulty {
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
      if (process && !process.some((s) => s === key)) return;

      return callback(json[key]);
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

        super(
            json,
            diffSet,
            diffSetMap,
            mapFile,
            relativeMapFile,
            {
                notes,
                bombs,
                version: '',
                arcs: [],
                chains: [],
                walls: [],
                events: [],
                customEvents: [],
                pointDefinitions: {},
                customData: {},
                environment: [],
                geometry: [],
            },
        )
    }

    toJSON(): bsmap.v2.IDifficulty {
        const sortItems = (a: { _time: number }, b: { _time: number }) =>
            a._time - b._time

        return {
            _notes: [...this.notes, ...this.bombs].map((e) => e.toJson(false))
                .sort(
                    sortItems,
                ),
            _events: [],
            _obstacles: [],
            _sliders: [],
            _version: '2.6.0',
            _waypoints: [],
            _customData: {},
            _specialEventsKeywordFilters: { _keywords: [] },
        }
    }
}
