// I literally don't know how to do this with Records
/** Object that deserializes from beatmap properties and serializes back. */
export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    /** Imports raw JSON into the fields of this class. */
    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV3 | TV2, v3: boolean): this

    /** Outputs this class into JSON that will be stored in the output difficulty. */
    toJson(v3: true, prune: boolean): TV3
    toJson(v3: false, prune: boolean): TV2
    toJson(v3: boolean, prune: boolean): TV2 | TV3
}
