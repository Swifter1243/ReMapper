// deno-lint-ignore ban-types
export interface JsonWrapper<TV2 extends object, TV3 extends object> {
  toJson(v3: true): TV3;
  toJson(v3: false): TV2;
  toJson(v3: boolean): TV2 | TV3;
}
export type FilterTypes<T, U> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends U ? K : never;
  }[keyof T]
>;
export type ExcludeTypes<T, U> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends U ? never : K;
  }[keyof T]
>;

// deno-lint-ignore ban-types
type ExcludeFunctionPropertyNames<T> = ExcludeTypes<T, Function>;

// https://stackoverflow.com/questions/61272153/typescript-keyof-exclude-methods
export type Fields<T> = ExcludeFunctionPropertyNames<T>;

export type OnlyNumbers<T> = FilterTypes<T, number>;
export type OnlyNumbersOptional<T> = FilterTypes<T, number | undefined>;

// export type Fields<T, K extends keyof T> = {
//     [P in K]: T[P] extends Function ? never : T[P]
// }
