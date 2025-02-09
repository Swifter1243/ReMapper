/** Given a number N, generate a union of whole numbers from 0 to N */
export type RangeOf<N extends number, R extends unknown[] = []> = R['length'] extends N ? R[number] : RangeOf<N, [...R, R['length']]>;

/** Decrease a number by 1. */
export type DecreaseNumber<N extends number, T extends unknown[] = []> = [...T, unknown]['length'] extends N ? T['length']
    : DecreaseNumber<N, [...T, unknown]>