import { getModel, Text } from '../../mod.ts'
import {getActiveDifficulty} from "../../data/active_difficulty.ts";
import {ReadonlyText} from "../../types/model/text.ts";

/** Create a class to handle a single line of text, based on a model.
 * The inputter properties can either be object model properties, or a path to the model.
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
