import { combineTransforms, getBoxBounds } from '../utils/math.ts'

import { Wall } from '../internals/wall.ts'
import { modelToWall } from './wall.ts'
import { getModel } from './model.ts'
import { Bounds, Transform, Vec3 } from '../types/data_types.ts'
import { ReadonlyText, TextObject } from '../types/model_types.ts'
import { copy } from '../utils/general.ts'
import { getActiveDifficulty } from '../mod.ts'
import { AnimationSettings } from '../animation/mod.ts'

interface TextInfo {
    /** How the text will be anchored horizontally. */
    horizontalAnchor: 'Left' | 'Center' | 'Right'
    /** How the text will be anchored vertically. */
    verticalAnchor: 'Top' | 'Center' | 'Bottom'
    /** The position of the text box. */
    position: Vec3 | undefined
    /** The rotation of the text box. */
    rotation: Vec3 | undefined
    /** The scale of the text box. */
    scale: Vec3 | undefined
    /** The height of the text box. */
    height: number
    /** A scalar of the model height which is used to space letters. */
    letterSpacing: number
    /** A scalar of the letter spacing which is used as the width of a space. */
    wordSpacing: number
}

export class Text implements TextInfo {
    horizontalAnchor: 'Left' | 'Center' | 'Right' = 'Center'
    verticalAnchor: 'Top' | 'Center' | 'Bottom' = 'Bottom'
    position: Vec3 | undefined = undefined
    rotation: Vec3 | undefined = undefined
    scale: Vec3 | undefined = undefined
    height = 2
    letterSpacing = 0.8
    wordSpacing = 0.8

    /** The model data of the text. */
    model: ReadonlyText = []
    /** The height of the text model. Generated from input. */
    modelHeight = 0

    /**
     * An interface to generate objects from text.
     * Each object forming a letter in your model should have a track for the letter it's assigned to.
     * @param input The model data of the text.
     */
    constructor(input: ReadonlyText) {
        this.model = input
        const bounds = getBoxBounds(input as TextObject[])
        this.modelHeight = bounds.highBound[1]
    }

    /**
     * Generate an array of objects containing model data for a string of text.
     * @param text The string of text to generate.
     */
    toObjects(text: string) {
        const letters: Record<string, {
            model: ReadonlyText
            bounds: Bounds
        }> = {}

        const model: {
            position: Vec3
            rotation: Readonly<Vec3>
            scale: Readonly<Vec3>
        }[] = []

        function getLetter(char: string, self: Text) {
            if (letters[char]) return letters[char]
            const letterModel = self.model.filter((x) => x.group === char)
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
                    position: copy(x.position) as Vec3,
                    rotation: x.rotation,
                    scale: x.scale,
                }
                letterModel.position[0] -= letter.bounds.lowBound[0]
                letterModel.position[2] -= letter.bounds.lowBound[2]
                letterModel.position[0] += length
                letterModel.position[0] += (letterWidth - letter.bounds.scale[0]) / 2
                model.push(letterModel)
            })
            length += letterWidth
        }

        const scalar = this.height / this.modelHeight
        let transform: undefined | Transform = undefined
        if (this.position || this.rotation || this.scale) {
            transform = {
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
            }
        }

        model.forEach((x) => {
            if (this.horizontalAnchor === 'Center') x.position[0] -= length / 2
            if (this.horizontalAnchor === 'Right') x.position[0] -= length

            x.position = x.position.map((y) => y * scalar) as Vec3
            x.scale = x.scale.map((y) => y * scalar) as Vec3

            if (transform) {
                const combined = combineTransforms(x, transform)
                x.position = combined.position
                x.rotation = combined.rotation
                x.scale = combined.scale
            }

            if (this.verticalAnchor === 'Center') x.position[1] -= this.height / 2
            if (this.verticalAnchor === 'Top') x.position[1] -= this.height
        })

        return model as ReadonlyText
    }

    /**
     * Generate walls from a string of text.
     * @param text The string of text to generate.
     * @param start Wall's lifespan start.
     * @param end Wall's lifespan end.
     * @param wall A callback for each wall being spawned.
     * @param distribution Beats to spread spawning of walls out.
     * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
     */
    toWalls(
        text: string,
        start: number,
        end: number,
        wall?: (wall: Wall) => void,
        distribution = 1,
        animationSettings = new AnimationSettings()
    ) {
        const model = this.toObjects(text)
        modelToWall(
            model,
            start,
            end,
            wall,
            distribution,
            animationSettings
        )
    }
}

/** Create a class to handle a single line of text, based on a model.
 * The inputter data can either be object model data, or a path to the model.
 * The "track" component on each object corresponds directly to what character it represents.
 */
export async function text(
    input: string | ReadonlyText,
) {
    return await getActiveDifficulty().runAsync(async () => {
        const model = typeof input === 'string' ? await getModel(input) : input
        return new Text(model as ReadonlyText)
    })
}
