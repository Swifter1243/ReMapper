import { ReMapperSettings } from '../types/remapper/rm_settings.ts'

/** Various settings to control ReMapper. */
export const settings: ReMapperSettings = {
    forceNoteJumpStartBeatOffset: true,
    forceNoteJumpMovementSpeed: true,
    forceDefaultScale: true,
    decimalPrecision: 7 as number | undefined,
    convertRotationEventsToObjectRotation: false,
}