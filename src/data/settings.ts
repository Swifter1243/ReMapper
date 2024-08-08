import { ReMapperSettings } from '../types/rm_settings.ts'

/** Various settings to control ReMapper. */
export const settings: ReMapperSettings = {
    forceJumpsForNoodle: true,
    decimalPrecision: 7 as number | undefined,
    convertRotationEventsToObjectRotation: false,
}
