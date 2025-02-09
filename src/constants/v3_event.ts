/** The distribution types for V3 lights. */
export enum DistributionType {
    WAVE = 1,
    STEP,
}

/** The filter types for V3 lights. */
export enum FilterType {
    SECTIONS = 1,
    STEPANDOFFSET,
}

/** The transitions for V3 lights. */
export enum LightTransition {
    INSTANT,
    TRANSITION,
    EXTEND,
}

/** The transitions for V3 light rotations. */
export enum RotationTransition {
    TRANSITION,
    EXTEND,
}

/** The colors for V3 lights. */
export enum LightColor {
    NONE = -1,
    RED,
    BLUE,
    WHITE,
}

/** The rotation axis for V3 light rotations. */
export enum LightAxis {
    X,
    Y,
    Z,
}

/** The easings for V3 light rotations. */
export enum RotationEase {
    None = -1,
    Linear = 0,
    InQuad = 1,
    OutQuad = 2,
    InOutQuad = 3,
    InSine = 4,
    OutSine = 5,
    InOutSine = 6,
    InCubic = 7,
    OutCubic = 8,
    InOutCubic = 9,
    InQuart = 10,
    OutQuart = 11,
    InOutQuart = 12,
    InQuint = 13,
    OutQuint = 14,
    InOutQuint = 15,
    InExpo = 16,
    OutExpo = 17,
    InOutExpo = 18,
    InCirc = 19,
    OutCirc = 20,
    InOutCirc = 21,
    InBack = 22,
    OutBack = 23,
    InOutBack = 24,
    InElastic = 25,
    OutElastic = 26,
    InOutElastic = 27,
    InBounce = 28,
    OutBounce = 29,
    InOutBounce = 30,
    BeatSaberInOutBack = 100,
    BeatSaberInOutElastic = 101,
    BeatSaberInOutBounce = 102,
}

/** The direction of rotation for V3 light rotations. */
export enum RotationDirection {
    AUTOMATIC,
    CLOCKWISE,
    COUNTERCLOCKWISE,
}
