import {DeepReadonly} from '../../util/mutability.ts'
import {ExcludedObjectFields} from './object.ts'
import {TrackValue} from "../../animation/track.ts";
import {UniqueTypes} from "../../util/object.ts";
import {bsmap} from '../../../deps.ts'

/** Properties to replace on constructor objects for gameplay objects. */
export type GameplayObjectReplacedFields = {
    track?: TrackValue
}

export type IV2GameplayObject = bsmap.v2.INote | bsmap.v2.IObstacle

export type IV3GameplayObject = bsmap.v3.IGridObject

export type GameplayObjectExcludedFields = UniqueTypes<GameplayObjectGetters, GameplayObjectSetters>

export type GameplayObjectConstructor<Class> = Partial<ExcludedObjectFields<Class, GameplayObjectReplacedFields, GameplayObjectExcludedFields>>

export type GameplayObjectDefaults<Class> = DeepReadonly<
    ExcludedObjectFields<Class, object, GameplayObjectGetters & GameplayObjectSetters>
>

export interface GameplayObjectSetters {
    set halfJumpDuration(value: number)
    set jumpDistance(value: number)
    set reactionTime(value: number)
    set life(value: number)
    set lifeStart(value: number)
    set lifeEnd(value: number)
}

export interface GameplayObjectGetters {
    get implicitNoteJumpMovementSpeed(): number
    get implicitNoteJumpStartBeatOffset(): number
    get halfJumpDuration(): number
    get jumpDistance(): number
    get reactionTime(): number
    get spawnPositionZ(): number
    get despawnPositionZ(): number
    get life(): number
    get lifeStart(): number
    get lifeEnd(): number
    get isGameplayModded(): boolean
}
