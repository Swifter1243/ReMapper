import { TrackValue } from '../../animation.ts'
import { Track } from '../../../utils/animation/track.ts'
import { Fields, Replace } from '../../util.ts'

/** Properties to replace on constructor objects for gameplay objects. */
export type ObjectReplacements = {
    track?: TrackValue | Track
}
/** Get fields of a class, while replacing and excluding certain fields. */
export type ExcludedObjectFields<
    Class,
    Replacement = ObjectReplacements,
    Exclusion = ExcludeObjectFields,
> = Omit<
    Replace<Partial<Fields<Class>>, Replacement>,
    keyof Exclusion
>
/** Fields to exclude on the constructor object for gameplay objects. */
export type ExcludeObjectFields = {
    implicitNoteJumpSpeed: never
    implicitNoteJumpOffset: never
    isModded: never
    isGameplayModded: never
}
