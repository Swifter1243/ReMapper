import { arraySubtract } from './array_utils.ts'
import { arrayAdd } from './array_utils.ts'
import { dotProduct } from './math.ts'
import { lerp } from './math.ts'
import { getDistance, hashString } from './math.ts'

function getVoronoiPoint<T extends number[]>(point: T, seed: number) {
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

export const voronoi1D = (seed: number) => voronoi(1, seed)
export const voronoi2D = (seed: number) => voronoi(2, seed)
export const voronoi3D = (seed: number) => voronoi(3, seed)

function getGradientVector<T extends number[]>(point: T, seed: number) {
    const hash = hashString(seed + `${point}`)
    return point.map((_x, i) => hashString(`${hash + i}`) * 2 - 1) as T
}

export function gradientNoise<T extends number>(dimensions: T, seed: number) {
    type Vec = number[] & { length: T }

    function billinearGradient(
        point: Vec,
        gridPoint: Vec,
        index: number,
    ): number {
        if (index === dimensions) {
            const gradientVec = getGradientVector(gridPoint, seed)

            const toGridPoint = arraySubtract(
                gridPoint as number[],
                point,
            )

            const dot = dotProduct(toGridPoint, gradientVec)
            return dot * 0.5 + 0.5
        }

        const newGridPoint = [...gridPoint] as Vec
        newGridPoint[index]++
        const a = billinearGradient(point, gridPoint, index + 1)
        const b = billinearGradient(point, newGridPoint, index + 1)
        let f = point[index] % 1
        // quintic interpolant https://www.shadertoy.com/view/Xsl3Dl
        f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0)
        return lerp(a, b, f)
    }

    return function (...coordinates: Vec) {
        const origin = coordinates.map((x) => Math.floor(x)) as Vec

        return billinearGradient(
            coordinates,
            origin,
            0,
        )
    }
}

export const gradientNoise1D = (seed: number) => gradientNoise(1, seed)
export const gradientNoise2D = (seed: number) => gradientNoise(2, seed)
export const gradientNoise3D = (seed: number) => gradientNoise(3, seed)