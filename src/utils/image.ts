import {pngs} from '../deps.ts'

import {ColorVec, Vec4} from "../types/math/vector.ts";
import {generateArray} from "./array/generate.ts";

export class Image {
    /** Width of the image in pixels. */
    width: number
    /** Height of the image in pixels. */
    height: number
    /** RGBA array of image pixels. */
    data: number[]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.data = this.init()
    }

    private init() {
        const size = this.height * this.width
        const arr = []
        for (let i = 0; i < size; i++) arr.push(0, 0, 0, 255)
        return arr
    }

    private coordToIndex(x: number, y: number) {
        if (x >= this.width || x < 0) throw new Error('x coordinate exceeds image bounds.')
        if (y >= this.height || y < 0) {
            throw new Error('y coordinate exceeds image bounds.')
        }

        return (x + y * this.width) * 4
    }

    private indexToCoord(index: number) {
        index /= 4

        return {
            x: index % this.width,
            y: Math.floor(index / this.width),
        }
    }

    /** Set a pixel at given coordinates to a color. */
    setPixel(x: number, y: number, color: ColorVec) {
        const uIntColor = color.map((e) => (e ?? 1) * 255) as Vec4
        const index = this.coordToIndex(x, y)

        for (let i = 0; i < 3; i++) {
            this.data[index + i] = uIntColor[i]
        }
    }

    /** Get a pixel color at the given coordinates. */
    getPixel(x: number, y: number) {
        const index = this.coordToIndex(x, y)
        return generateArray(4, (i) => this.data[i + index] / 255) as Vec4
    }

    /** Save the image to a file. */
    async save(file: string) {
        const data = new Uint8Array(this.data)
        const png = pngs.encode(data, this.width, this.height)
        await Deno.writeFile(file, png)
    }
}

/** Simple image wrapper for debugging. */
export function image(
    ...params: ConstructorParameters<typeof Image>
): Image {
    return new Image(...params)
}