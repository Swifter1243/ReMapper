import { EASE } from '../easing.ts'

/** All splines. */
export type SPLINE = 'splineCatmullRom'
/** Easings and splines. */
export type Interpolation = EASE | SPLINE
/** Modifiers */
export type PointModifier = `op${'None' | 'Add' | 'Sub' | 'Mul' | 'Div'}`
/** Any flag that could be in a points. E.g. easings, splines */
export type PointFlag = Interpolation | 'lerpHSV'
/** Time value in a points. */
export type TimeValue = number
