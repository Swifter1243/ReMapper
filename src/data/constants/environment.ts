import { Regex } from '../../utils/environment/regex.ts'
import { Vec3 } from '../../types/data.ts'

/**
 * Known transforms for objects with ModelScene.
 * ModelScene is NOT limited to these!
 * You can figure out the transforms for ANY object.
 */
export const Environment = {
    BTS: {
        PILLAR: {
            ID: new Regex().start().add('PillarPair').separate().add('PillarL')
                .separate().add('Pillar').end(),
            TRANSFORM: <Vec3[]> [
                [0.285714, 0.008868, 0.285714], //? SCALE
                [0, 0.4999, 0], //? ANCHOR
            ],
        },
        SOLID_LASER: {
            ID: new Regex('SmallPillarPair').separate().add('PillarL')
                .separate().add(
                    'LaserL',
                ).end(),
            TRANSFORM: <Vec3[]> [
                [10, 1 / 2500, 10], //? SCALE
                [0, -0.5, 0], //? ANCHOR
            ],
        },
        BLOOM_LIGHT: {
            ID: new Regex('Environment').separate().add('LaserR').end(),
            TRANSFORM: <Vec3[]> [
                [1, 0.00025, 1], //? SCALE
                [0, -0.25, 0], //? ANCHOR
            ],
        },
        LOW_CLOUDS: {
            ID: 'LowCloudsGenerator$',
            TRANSFORM: <Vec3[]> [
                [0.0064, 0.06, 0.0064], //? SCALE
                [0, 0.22, 0], //? ANCHOR
            ],
        },
        HIGH_CLOUDS: {
            ID: 'HighCloudsGenerator$',
            TRANSFORM: <Vec3[]> [
                [0.0025, 0.0425, 0.0025], //? SCALE
                [0, -0.218, 0], //? ANCHOR
            ],
        },
    },
    GAGA: {
        CUBE: {
            ID: 'BackCube$',
            TRANSFORM: <Vec3[]> [
                [1 / 5.5, 4, 2], //? SCALE
                [0, 0.5, 0.5], //? ANCHOR
            ],
        },
        SECOND_AURORA: {
            ID: new Regex('Aurora').separate().add('AuroraSecondary').end(),
            TRANSFORM: <Vec3[]> [
                [0.0025, 0.02, 0.012], //? SCALE
                [0, 0.6, 0.05], //? ANCHOR
            ],
        },
    },
    BILLIE: {
        CUBE: {
            ID: 'LeftFarRail1$',
            TRANSFORM: <Vec3[]> [
                [10, 10, 0.02306], //? SCALE
                [0, 0, -0.4974], //? ANCHOR
            ],
        },
    },
    GREEN_DAY: {
        SOLID_LASER: {
            ID: 'GlowLineR$',
            TRANSFORM: <Vec3[]> [
                [50, 0.002, 50], //? SCALE
            ],
        },
        BLOOM_LASER: {
            ID: 'FrontLight$',
            TRANSFORM: <Vec3[]> [
                [1, 0.001, 1], //? SCALE
                [0, -0.5, 0], //? ANCHOR
            ],
        },
    },
    UNIVERSAL: {
        MIRROR: { // Mirror does not work with the "Spooky" environment, but it does work with everything else!
            ID: new Regex('PlayersPlace').separate().add('Mirror').end(),
            TRANSFORM: <Vec3[]> [
                [1 / 3, 0, 0.5], //? SCALE
            ],
        },
    },
}
