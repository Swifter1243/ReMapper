export class Regex {
    string: string = ""

    /**
     * Regex wrapper for easier regex statement creation. 
     * String together methods to make a statement.
     * You'll want to access the "string" property after.
     */
    constructor() { /* stop telling me it's empty sonarlint */ }

    /**
     * Specifies the start with the end of a previous seperator: "]".
     */
    start() { this.string += "\\]"; return this }

    /**
     * Specifies the end of the entire string.
     */
    end() { this.string += "$"; return this }

    /**
     * Adds a string.
     */
    add(string: string) { this.string += string; return this }

    /**
     * Refers to seperation of gameObjects: ".[x]". E.X. "Thing.[0]Thing".
     * @param index Option to specify index of the seperator.
     */
    seperate(index: number = undefined) {
        if (index === undefined) this.string += "\\.\\[\\d*\\]";
        else this.string += `\\.\\[${index}\\]`;
        return this;
    }

    /**
     * Refers to gameObject name variation: " (x)". E.X. "Thing", "Thing (1)".
     * @param number Option to specify number on variation..
     */
    vary(number: number = undefined) {
        if (number === undefined) this.string += "(|\\s\\(\\d*\\))";
        else {
            if (number === 0) this.string += "";
            else this.string += ` \\(${number}\\)`
        }
        return this;
    }

    /**
     * Tests the regex expression's validity.
     */
    verify() {
        try {
            new RegExp(this.string);
            console.log(`Regex ${this.string} is valid`)
        } catch (err) {
            throw err;
        }
        return this;
    }
}