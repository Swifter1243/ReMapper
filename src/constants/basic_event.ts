/** Basic event groups/types. */
export enum EventGroup {
    BACK_LASERS,
    RING_LIGHTS,
    LEFT_LASERS,
    RIGHT_LASERS,
    CENTER_LASERS,
    BOOST,
    LEFT_EXTRA,
    RIGHT_EXTRA,
    RING_SPIN,
    RING_ZOOM,
    BILLIE_LEFT,
    BILLIE_RIGHT,
    LEFT_ROTATING_LASERS,
    RIGHT_ROTATING_LASERS,
    EARLY_ROTATION,
    LATE_ROTATION,
    LOWER_HYDRAULICS,
    RAISE_HYDRAULICS,
    GAGA_LEFT,
    GAGA_RIGHT,
    BPM = 100,
}

/** Basic lighting_v3 event actions. */
export enum EventAction {
    OFF,
    BLUE_ON,
    BLUE_FLASH,
    BLUE_FADE,
    BLUE_TRANSITION,
    RED_ON,
    RED_FLASH,
    RED_FADE,
    RED_TRANSITION,
    WHITE_ON,
    WHITE_FLASH,
    WHITE_FADE,
    WHITE_TRANSITION,
}

/** Interscope car groups. */
export enum InterscopeGroup {
    NO_HYDRAULICS,
    ALL_CARS,
    LEFT_CARS,
    RIGHT_CARS,
    FRONT_CARS,
    FRONT_MIDDLE_CARS,
    BACK_MIDDLE_CARS,
    BACK_CARS,
}

/** Direction of spin in ring spin and laser speed events. */
export enum SpinDirection {
    COUNTER_CLOCKWISE,
    CLOCKWISE
}

/** Rotation basic event values. */
export const RotationAction = {
    CCW_60: 0,
    CCW_45: 1,
    CCW_30: 2,
    CCW_15: 3,
    CW_15: 4,
    CW_30: 5,
    CW_45: 6,
    CW_60: 7,
}

/** Convert the value of a rotation event into it's corresponding angle. */
export const InverseRotationAction = {
    0: -60,
    1: -45,
    2: -30,
    3: -15,
    4: 15,
    5: 30,
    6: 45,
    7: 60,
}
