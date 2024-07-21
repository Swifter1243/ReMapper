import { hashString } from './random.ts'
import { arrayAdd } from '../array/operation.ts'
import { getDistance } from './vector.ts'

function getVoronoiPoint<T extends number[]>(point: Readonly<T>, seed: number) {
    const hash = hashString(seed + `${point}`)
    return point.map((x, i) => x + hashString(`${hash + i}`)) as T
}

function getVoronoiOffsets<T extends number>(dimensions: T) {
    type Vec = number[] & { length: T }
    const offsets: Vec[] = []

    // Generate all possible offsets from -1 to 1 in each dimension
    for (let i = 0; i < Math.pow(3, dimensions); i++) {
        const offset = []
        let temp = i
        for (let j = 0; j < dimensions; j++) {
            offset.push(temp % 3 - 1)
            temp = Math.floor(temp / 3)
        }
        offsets.push(offset as Vec)
    }

    return offsets
}

/** Create a voronoi function for any dimension given a seed. */
export function voronoi<T extends number>(dimensions: T, seed: number) {
    type Vec = number[] & { length: T }

    const offsets = getVoronoiOffsets(dimensions)

    return function (...coordinates: Vec) {
        const origin = coordinates.map((x) => Math.floor(x))
        let minDistance = 1

        offsets.forEach((o) => {
            const addedPoint = arrayAdd(origin, o)
            const point = getVoronoiPoint(addedPoint, seed)

            const dist = getDistance(point, coordinates)
            if (dist < minDistance) minDistance = dist
        })

        return minDistance
    }
}

/** Create a 1D voronoi function given a seed. */
export const voronoi1D = (seed: number) => voronoi(1, seed)
/** Create a 2D voronoi function given a seed. */
export const voronoi2D = (seed: number) => voronoi(2, seed)
/** Create a 3D voronoi function given a seed. */
export const voronoi3D = (seed: number) => voronoi(3, seed)
