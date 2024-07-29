// I literally don't know how to do this with Records
/** Object that deserializes from beatmap properties and serializes back. */
export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    /** Imports raw JSON into the fields of this class in beatmap V2. */
    fromJsonV2(json: TV2): this
    /** Imports raw JSON into the fields of this class in beatmap V3. */
    fromJsonV3(json: TV3): this

    /** Outputs this class into JSON that will be stored in the output difficulty in beatmap V2. */
    toJsonV2(prune?: boolean): TV2
    /** Outputs this class into JSON that will be stored in the output difficulty in beatmap V3. */
    toJsonV3(prune?: boolean): TV3
}
