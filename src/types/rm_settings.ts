/** Interface for ReMapper's internal settings. */
export type ReMapperSettings = {
    /** Force note offset for modcharts to combat against JDFixer and similar mods. */
    forceJumpsForNoodle: boolean,
    /** Decimal precision of file output. 7 by default. */
    decimals: number | undefined,
    /** Whether to run {@link convertRotationEventsToObjectRotation} on the difficulty before save. */
    convertRotationEventsToObjectRotation: boolean
}