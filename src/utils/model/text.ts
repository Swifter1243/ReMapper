import {modelToWall} from './wall.ts'
import {AnimationSettings} from '../animation/mod.ts'
import {getBoxBounds} from "../math/box.ts";
import {combineTransforms} from "../math/transform.ts";
import { copy } from '../object/copy.ts'
import {Vec3} from "../../types/math/vector.ts";
import {Transform} from "../../types/math/transform.ts";
import {Bounds} from "../../types/math/bounds.ts";
import {ReadonlyText, TextInfo, TextObject} from "../../types/model/text.ts";

export class Text implements TextInfo {
    horizontalAnchor: 'Left' | 'Center' | 'Right' = 'Center'
    verticalAnchor: 'Top' | 'Center' | 'Bottom' = 'Bottom'
    position: Vec3 | undefined = undefined
    rotation: Vec3 | undefined = undefined
    scale: Vec3 | undefined = undefined
    height = 2
    letterSpacing = 0.8
    wordSpacing = 0.8

    /** The model properties of the text. */
    model: ReadonlyText = []
    /** The height of the text model. Generated from input. */
    readonly modelHeight: number;

    /**
     * An interface to generate objects from text.
     * Each object forming a letter in your model should have a track for the letter it's assigned to.
     * @param input The model properties of the text.
     */
    constructor(input: ReadonlyText) {
        this.model = input
        const bounds = getBoxBounds(input as TextObject[])
        this.modelHeight = bounds.highBound[1]
    }

    /**
     * Generate an array of objects containing model properties for a string of text.
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
     * @param distribution Beats to spread spawning of walls out.
     * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
     * @param animationSettings Settings used to process the animation.
     */
    toWalls(
        text: string,
        start: number,
        end: number,
        distribution = 1,
        animationSettings = new AnimationSettings()
    ) {
        return modelToWall(
            this.toObjects(text),
            start,
            end,
            distribution,
            animationSettings
        )
    }
}

