/** Interface for ReMapper's internal settings. */
export type ReMapperSettings = {
    /** Force note offset for gameplay objects to combat against JDFixer and similar mods. */
    forceNoteJumpOffset: boolean,
    /** Force note jump speed for gameplay objects to combat against JDFixer and similar mods. */
    forceNoteJumpSpeed: boolean,
    /** Force initial `[1,1,1]` scale on notes, bombs, and chains to combat mods changing custom note sizes.  */
    forceDefaultScale: boolean,
    /** Decimal precision of file output. 7 by default. */
    decimalPrecision: number | undefined,
    /** Whether to run {@link convertRotationEventsToObjectRotation} on the difficulty before save. */
    convertRotationEventsToObjectRotation: boolean
}