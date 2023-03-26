export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    toJson(v3: true): TV3
    toJson(v3: false): TV2
    toJson(v3: boolean): TV2 | TV3
}