import {Regex} from '../../utils/beatmap/object/environment/regex.ts'
import {regex} from '../../builder_functions/beatmap/object/environment/regex.ts'

import {EnvironmentModelPiece} from "../../types/model/model_scene/piece.ts";

/**
 * Known transforms for objects with ModelScene.
 * ModelScene is NOT limited to these!
 * You can figure out the transforms for ANY object.
 */
export const ENVIRONMENT_MODEL_PIECES = {
    BTS: {
        PILLAR: {
            id: regex().start().add('PillarPair').separate().add('PillarL').separate().add('Pillar').end(),
            lookupMethod: 'Regex',
            transform: {
                scale: [0.285714, 0.008868, 0.285714],
                position: [0, 0.4999, 0],
            },
        },
        SOLID_LASER: {
            id: regex().separate().add('PillarL').separate().add('LaserL').end(),
            lookupMethod: 'Regex',
            transform: {
                scale: [10, 1 / 2500, 10],
                position: [0, -0.5, 0],
            },
        },
        BLOOM_LIGHT: {
            id: new Regex('Environment').separate().add('LaserR').end(),
            lookupMethod: 'Regex',
            transform: {
                scale: [1, 0.00025, 1],
                position: [0, -0.25, 0],
            },
        },
        LOW_CLOUDS: {
            id: 'LowCloudsGenerator',
            lookupMethod: 'EndsWith',
            transform: {
                scale: [0.0064, 0.06, 0.0064],
                position: [0, 0.22, 0],
            }
        },
        HIGH_CLOUDS: {
            id: 'HighCloudsGenerator',
            lookupMethod: 'EndsWith',
            transform: {
                scale:  [0.0025, 0.0425, 0.0025],
                position: [0, -0.218, 0]
            }
        },
    },
    GAGA: {
        CUBE: {
            id: 'BackCube',
            lookupMethod: 'EndsWith',
            transform: {
                scale: [1 / 5.5, 4, 2],
                position: [0, 0.5, 0.5]
            }
        },
        SECOND_AURORA: {
            id: regex('Aurora').separate().add('AuroraSecondary').end(),
            lookupMethod: 'Regex',
            transform: {
                scale: [0.0025, 0.02, 0.012],
                position: [0, 0.6, 0.05]
            }
        },
    },
    BILLIE: {
        CUBE: {
            id: 'LeftFarRail1',
            lookupMethod: 'EndsWith',
            transform: {
                scale: [10, 10, 0.02306],
                position: [0, 0, -0.4974],
            }
        },
    },
    GREEN_DAY: {
        SOLID_LASER: {
            id: 'GlowLineR',
            lookupMethod: 'EndsWith',
            transform: {
                scale: [50, 0.002, 50]
            }
        },
        BLOOM_LASER: {
            id: 'FrontLight',
            lookupMethod: 'EndsWith',
            transform: {
                scale: [1, 0.001, 1],
                position: [0, -0.5, 0]
            }
        },
    },
    UNIVERSAL: {
        MIRROR: { // Mirror does not work with the "Spooky" environment, but it does work with everything else!
            id: regex('PlayersPlace').separate().add('Mirror').end(),
            lookupMethod: 'Regex',
            transform: {
                scale: [1 / 3, 0, 0.5]
            }
        },
    },
} satisfies Record<string, Record<string, EnvironmentModelPiece>>
