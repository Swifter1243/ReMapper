export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    toJson(v3: true): TV3
    toJson(v3: false): TV2
    toJson(v3: boolean): TV2 | TV3
}
type ExcludeFunctionPropertyNames<T> = Pick<T, {
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]>;

// https://stackoverflow.com/questions/61272153/typescript-keyof-exclude-methods
export type Fields<T> = ExcludeFunctionPropertyNames<T>

// export type Fields<T, K extends keyof T> = {
//     [P in K]: T[P] extends Function ? never : T[P]
// }