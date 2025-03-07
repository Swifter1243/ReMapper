import { arraySubtract } from '../array/operation.ts'
import { dotProduct } from './vector.ts'
import { lerp } from './lerp.ts'
import { hashString } from './random.ts'

function getGradientVector<T extends number[]>(point: Readonly<T>, seed: number) {
    const hash = hashString(seed + `${point}`)
    return point.map((_x, i) => hashString(`${hash + i}`) * 2 - 1) as T
}

/** Create a gradient noise function for any dimension given a seed. */
export function gradientNoise<T extends number>(dimensions: T, seed: number) {
    type Vec = number[] & { length: T }

    function bilinearGradient(
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
        const a = bilinearGradient(point, gridPoint, index + 1)
        const b = bilinearGradient(point, newGridPoint, index + 1)
        let f = point[index] % 1
        // quintic interpolant https://www.shadertoy.com/view/Xsl3Dl
        f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0)
        return lerp(a, b, f)
    }

    return function (...coordinates: Vec) {
        const origin = coordinates.map((x) => Math.floor(x)) as Vec

        return bilinearGradient(
            coordinates,
            origin,
            0,
        )
    }
}

/** Create a 1D gradient noise function given a seed. */
export function gradientNoise1D(seed: number) {
    return gradientNoise(1, seed)
}
/** Create a 2D gradient noise function given a seed. */
export function gradientNoise2D(seed: number) {
    return gradientNoise(2, seed)
}
/** Create a 3D gradient noise function given a seed. */
export function gradientNoise3D(seed: number) {
    return gradientNoise(3, seed)
}
