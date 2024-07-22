import { EASE } from '../easing.ts'

/** All splines. */
export type SPLINE = 'splineCatmullRom'
/** Easings and splines. */
export type Interpolation = EASE | SPLINE
/** Modifiers */
export type PointModifier = `op${'None' | 'Add' | 'Sub' | 'Mul' | 'Div'}`
/** Any flag that could be in a keyframe. E.g. easings, splines */
export type KeyframeFlag = Interpolation | 'lerpHSV'
/** Time value in a keyframe. */
export type TimeValue = number
