import { AbstractDifficulty } from "./beatmap.ts";
import { bsmap, DIFFNAME, DIFFPATH, Track } from "./mod.ts";
import { note } from "./note.ts";
import { ColorType } from "./general.ts";

export class V2Difficulty extends AbstractDifficulty {
  constructor(
    diffSet: bsmap.IInfoSetDifficulty,
    diffSetMap: bsmap.IInfoSet,
    mapFile: DIFFPATH,
    relativeMapFile: DIFFNAME,
    json: bsmap.v2.IDifficulty,
  ) {
    const notes = json._notes.filter((e) => e._type != 3).map((e) =>
      note(
        {
          time: e._time,
          type: e._type as 0 | 1,
          direction: e._cutDirection,
          lineLayer: e._lineLayer,
          lineIndex: e._lineIndex,
          customData: e._customData,

          localRotation: e._customData?._localRotation,
          fake: e._customData?._fake,
          color: e._customData?._color as ColorType,
          flip: e._customData?._flip,
          interactable: e._customData?._interactable,
          localNJS: e._customData?._noteJumpMovementSpeed,
          localBeatOffset: e._customData?._noteJumpStartBeatOffset,

          rotation: typeof e._customData?._rotation === "number"
            ? [0, e._customData._rotation, 0]
            : e._customData?._rotation,
          noteLook: !e._customData?._disableNoteLook ?? false,
          noteGravity: !e._customData?._disableNoteGravity ?? false,
          spawnEffect: !e._customData?._disableSpawnEffect ?? false,
          coordinates: e._customData?._position,
          track: new Track(e._customData?._track),
        },
      )
    );

    super(
      json,
      diffSet,
      diffSetMap,
      mapFile,
      relativeMapFile,
      {
        notes,
        version: "",
        bombs: [],
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
    );
  }

  toJSON(): bsmap.v2.IDifficulty {
    return {
      _notes: this.notes.map((e) => e.toJson(false)),
      _events: [],
      _obstacles: [],
      _sliders: [],
      _version: "2.6.0",
      _waypoints: [],
      _customData: {},
      _specialEventsKeywordFilters: { _keywords: [] },
    };
  }
}
