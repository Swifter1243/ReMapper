import { combineTransforms, getBoxBounds } from '../utils/math.ts'

import { OptimizeSettings } from '../animation/anim_optimizer.ts'

import { Wall } from '../internals/wall.ts'
import { modelToWall } from './wall.ts'
import { getModel } from './model.ts'
import { Bounds, Transform, Vec3 } from '../types/data_types.ts'
import { ReadonlyText, TextObject } from '../types/model_types.ts'
import { copy } from '../utils/general.ts'
import { getActiveDifficulty } from '../mod.ts'

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

    importPromise: Promise<void>

    /**
     * An interface to generate objects from text.
     * Each object forming a letter in your model should have a track for the letter it's assigned to.
     * @param input The model data of the text. Can be either a path to a model or a collection of objects.
     */
    constructor(input: string | TextObject[]) {
        this.importPromise = this.import(input)
    }

    /**
     * Import a model for the text.
     * @param input The model data of the text. Can be either a path to a model or a collection of objects.
     */
    async import(input: string | TextObject[]) {
        if (typeof input === 'string') {
            this.model = await getModel(input) as ReadonlyText
        } else this.model = input
        const bounds = getBoxBounds(this.model as TextObject[])
        this.modelHeight = bounds.highBound[1]
    }

    /**
     * Generate an array of objects containing model data for a string of text.
     * @param text The string of text to generate.
     */
    async toObjects(text: string) {
        const info: TextInfo = {
            height: this.height,
            horizontalAnchor: this.horizontalAnchor,
            letterSpacing: this.letterSpacing,
            position: copy(this.position),
            rotation: copy(this.rotation),
            scale: copy(this.scale),
            verticalAnchor: this.verticalAnchor,
            wordSpacing: this.wordSpacing,
        }

        await this.importPromise

        const letters: Record<string, {
            model: ReadonlyText
            bounds: Bounds
        }> = {}

        const model: {
            pos: Vec3
            rot: Readonly<Vec3>
            scale: Readonly<Vec3>
        }[] = []

        function getLetter(char: string, self: Text) {
            if (letters[char]) return letters[char]
            const letterModel = self.model.filter((x) => x.track === char)
            if (letterModel.length === 0) return undefined

            letters[char] = {
                model: letterModel,
                bounds: getBoxBounds(letterModel),
            }
            return letters[char]
        }

        let length = 0
        const letterWidth = this.modelHeight * info.letterSpacing

        for (let i = 0; i < text.length; i++) {
            const char = text[i]

            if (char === ' ') {
                length += letterWidth * info.wordSpacing
                continue
            }

            const letter = getLetter(char, this)
            if (letter === undefined) continue

            letter.model.forEach((x) => {
                const letterModel = {
                    pos: copy(x.pos) as Vec3,
                    rot: x.rot,
                    scale: x.scale,
                }
                letterModel.pos[0] -= letter.bounds.lowBound[0]
                letterModel.pos[2] -= letter.bounds.lowBound[2]
                letterModel.pos[0] += length
                letterModel.pos[0] += (letterWidth - letter.bounds.scale[0]) / 2
                model.push(letterModel)
            })
            length += letterWidth
        }

        const scalar = info.height / this.modelHeight
        let transform: undefined | Transform = undefined
        if (info.position || info.rotation || info.scale) {
            transform = {
                pos: info.position,
                rot: info.rotation,
                scale: info.scale,
            }
        }

        model.forEach((x) => {
            if (info.horizontalAnchor === 'Center') x.pos[0] -= length / 2
            if (info.horizontalAnchor === 'Right') x.pos[0] -= length

            x.pos = x.pos.map((y) => y * scalar) as Vec3
            x.scale = x.scale.map((y) => y * scalar) as Vec3

            if (transform) {
                const combined = combineTransforms(x, transform)
                x.pos = combined.pos
                x.rot = combined.rot
                x.scale = combined.scale
            }

            if (info.verticalAnchor === 'Center') x.pos[1] -= info.height / 2
            if (info.verticalAnchor === 'Top') x.pos[1] -= info.height
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
     * @param animFreq The frequency for the animation baking (if using array of objects).
     * @param animOptimizer The optimizer for the animation baking (if using array of objects).
     */
    async toWalls(
        text: string,
        start: number,
        end: number,
        wall?: (wall: Wall) => void,
        distribution = 1,
        animFreq?: number,
        animOptimizer = new OptimizeSettings(),
    ) {
        await getActiveDifficulty().runAsync(async () => {
            const model = await this.toObjects(text)
            modelToWall(
                model,
                start,
                end,
                wall,
                distribution,
                animFreq,
                animOptimizer,
            )
        })
    }
}

export function text(
    ...params: ConstructorParameters<typeof Text>
): Text {
    return new Text(...params)
}
