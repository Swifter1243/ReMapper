export interface JsonWrapper<T extends object> {
    toJson(v3: boolean): T
}