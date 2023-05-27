import {Bounds, ColorType, Transform, Vec3} from "../data/types.ts";
import {combineTransforms, getBoxBounds} from "../utils/math.ts";

import {OptimizeSettings} from "../animation/anim_optimizer.ts";

import {Wall} from "../internals/wall.ts";
import {modelToWall} from "./wall.ts";
import {getModel} from "./model.ts";

type TextObject = {
    pos: Vec3
    rot: Vec3
    scale: Vec3
    color?: ColorType
    track?: string
}

export class Text {
    /** How the text will be anchored horizontally. */
    horizontalAnchor: 'Left' | 'Center' | 'Right' = 'Center'
    /** How the text will be anchored vertically. */
    verticalAnchor: 'Top' | 'Center' | 'Bottom' = 'Bottom'
    /** The position of the text box. */
    position: Vec3 | undefined = undefined
    /** The rotation of the text box. */
    rotation: Vec3 | undefined = undefined
    /** The scale of the text box. */
    scale: Vec3 | undefined = undefined
    /** The height of the text box. */
    height = 2
    /** The height of the text model. Generated from input. */
    modelHeight = 0
    /** A scalar of the model height which is used to space letters. */
    letterSpacing = 0.8
    /** A scalar of the letter spacing which is used as the width of a space. */
    wordSpacing = 0.8
    /** The model data of the text. */
    model: TextObject[] = []

    /**
     * An interface to generate objects from text.
     * Each object forming a letter in your model should have a track for the letter it's assigned to.
     * @param input The model data of the text. Can be either a path to a model or a collection of objects.
     */
    constructor(input: string | TextObject[]) {
        this.import(input)
    }

    /**
     * Import a model for the text.
     * @param input The model data of the text. Can be either a path to a model or a collection of objects.
     */
    async import(input: string | TextObject[]) {
        if (typeof input === 'string') {
            this.model = await getModel(input) as TextObject[]
        } else this.model = input
        const bounds = getBoxBounds(this.model)
        this.modelHeight = bounds.highBound[1]
    }

    /**
     * Generate an array of objects containing model data for a string of text.
     * @param text The string of text to generate.
     */
    toObjects(text: string) {
        const letters: Record<string, {
            model: TextObject[]
            bounds: Bounds
        }> = {}
        const model: TextObject[] = []

        function getLetter(char: string, self: Text) {
            if (letters[char]) return letters[char]
            const letterModel: TextObject[] = self.model.filter((x) =>
                x.track === char
            )
            if (letterModel.length === 0) return undefined

            letters[char] = {
                model: letterModel,
                bounds: getBoxBounds(letterModel),
            }
            return letters[char]
        }

        let length = 0
        const letterWidth = this.modelHeight * this.letterSpacing

        for (let i = 0; i < text.length; i++) {
            const char = text[i]

            if (char === ' ') {
                length += letterWidth * this.wordSpacing
                continue
            }

            const letter = getLetter(char, this)
            if (letter === undefined) continue

            letter.model.forEach((x) => {
                const letterModel = {
                    pos: structuredClone(x.pos),
                    rot: structuredClone(x.rot),
                    scale: structuredClone(x.scale),
                }
                letterModel.pos[0] -= letter.bounds.lowBound[0]
                letterModel.pos[2] -= letter.bounds.lowBound[2]
                letterModel.pos[0] += length
                letterModel.pos[0] += (letterWidth - letter.bounds.scale[0]) / 2
                model.push(letterModel)
            })
            length += letterWidth
        }

        const scalar = this.height / this.modelHeight
        let transform: undefined | Transform = undefined
        if (this.position || this.rotation || this.scale) {
            transform = {
                pos: this.position,
                rot: this.rotation,
                scale: this.scale,
            }
        }

        model.forEach((x) => {
            if (this.horizontalAnchor === 'Center') x.pos[0] -= length / 2
            if (this.horizontalAnchor === 'Right') x.pos[0] -= length

            x.pos = x.pos.map((y) => y * scalar) as Vec3
            x.scale = x.scale.map((y) => y * scalar) as Vec3

            if (transform) {
                const combined = combineTransforms(x, transform)
                x.pos = combined.pos
                x.rot = combined.rot
                x.scale = combined.scale
            }

            if (this.verticalAnchor === 'Center') x.pos[1] -= this.height / 2
            if (this.verticalAnchor === 'Top') x.pos[1] -= this.height
        })

        return model
    }

    /**
     * Generate walls from a string of text.
     * @param text The string of text to generate.
     * @param start Wall's lifespan start.
     * @param end Wall's lifespan end.
     * @param wall A callback for each wall being spawned.
     * @param distribution Beats to spread spawning of walls out.
     * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
     * @param animFreq The frequency for the animation baking (if using array of objects).
     * @param animOptimizer The optimizer for the animation baking (if using array of objects).
     */
    toWalls(
        text: string,
        start: number,
        end: number,
        wall?: (wall: Wall) => void,
        distribution = 1,
        animFreq?: number,
        animOptimizer = new OptimizeSettings(),
    ) {
        const model = this.toObjects(text)
        modelToWall(
            model,
            start,
            end,
            wall,
            distribution,
            animFreq,
            animOptimizer,
        )
    }
}