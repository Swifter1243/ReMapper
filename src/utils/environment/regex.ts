/** Used for building regex statements for environment objects.
 * ```ts
 * rm.regex("Parent").separate().add("Child").end()
 * // "Parent\.\[\d*\]Child$"
 * ```
 */
export const regex = (...params: ConstructorParameters<typeof Regex>) =>
    new Regex(...params)

export class Regex {
    string = ''

    /**
     * Regex wrapper for easier regex statement creation.
     * String together methods to make a statement.
     * You'll want to access the "string" property after.
     */
    constructor(initial?: string) {
        if (initial) this.string = initial
    }

    /** Specifies the start with the end of a previous seperator: "]". */
    start() {
        this.string += '\\]'
        return this
    }

    /** Specifies the end of the entire string */
    end() {
        return this.string + '$'
    }

    /**
     * Adds a string.
     */
    add(string: string) {
        this.string += string
        return this
    }

    /**
     * Refers to seperation of gameObjects: ".[x]". E.X. "Thing.[0]Thing".
     * @param index Option to specify index of the seperator.
     */
    separate(index?: number) {
        if (index === undefined) this.string += '\\.\\[\\d*\\]'
        else this.string += `\\.\\[${index}\\]`
        return this
    }

    /**
     * Refers to gameObject name variation: " (x)". E.X. "Thing", "Thing (1)".
     * @param number Option to specify number on variation..
     */
    vary(number?: number) {
        if (number === undefined) this.string += '(|\\s\\(\\d*\\))'
        else {
            if (number === 0) this.string += ''
            else this.string += ` \\(${number}\\)`
        }
        return this
    }

    /** Tests the regex expression's validity. */
    verify() {
        new RegExp(this.string)
        console.log(`Regex ${this.string} is valid`)

        return this
    }
}
