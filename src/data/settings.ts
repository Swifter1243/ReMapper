import { ReMapperSettings } from '../types/remapper/rm_settings.ts'

/** Various settings to control ReMapper. */
export const settings: ReMapperSettings = {
    forceNoteJumpOffset: true,
    forceNoteJumpSpeed: true,
    forceDefaultScale: true,
    decimalPrecision: 7 as number | undefined,
    convertRotationEventsToObjectRotation: false,
}