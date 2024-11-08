import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";
import {destroyObject} from "../../builder_functions/beatmap/object/custom_event/vivify.ts";
import {Destroyable} from "../../internals/beatmap/object/custom_event/vivify/destroyable.ts";

export function destroyObjects(difficulty: AbstractDifficulty, objects: Destroyable[], beat = 0) {
    const event = destroyObject(difficulty, {
        beat,
    })
    objects.forEach((o) => o.destroyObject(event))
}
