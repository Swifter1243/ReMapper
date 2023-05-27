import { LightEvent } from './event.ts'
import { activeDiffGet } from '../data/beatmap_handler.ts'

export type Condition = (event: LightEvent) => boolean
export type Process = (event: LightEvent) => void

export class BaseLightRemapper {
    /** Conditions that each event needs to pass. */
    conditions: Condition[] = []
    /** Function to run on each event. */
    processes: Process[] = []

    /**
     * Class used to iterate through every event in the map.
     * Has various tools to transform the events.
     * @param condition Optional initializing condition each event needs to pass.
     */
    constructor(condition?: Condition) {
        if (condition) this.conditions.push(condition)
    }

    /**
     * Add a condition that events must pass.
     * @param condition Input condition.
     */
    addCondition(condition: Condition) {
        this.conditions.push(condition)
        return this
    }

    /**
     * Add a function to edit the event.
     * @param process Input function.
     */
    addProcess(process: Process) {
        this.processes.push(process)
        return this
    }

    /**
     * Sets the type of the event.
     * @param type Input type.
     */
    setType = (type: number) =>
        this.addProcess((x) => {
            x.type = type
        })

    /**
     * Multiplies the colors of the event.
     * @param rgb Multiplier for r, g, and b values.
     * @param alpha Multiplier for alpha.
     */
    multiplyColor = (rgb: number, alpha = 1) =>
        this.addProcess((x) => {
            if (x.color) {
                x.color[0] *= rgb
                x.color[1] *= rgb
                x.color[2] *= rgb
                if (x.color[3]) x.color[3] *= alpha
            }
        })

    /**
     * Test the algorithm with some lightIDs which will be logged.
     * @param ids IDs to test.
     */
    test(ids: number[]) {
        this.conditions = []

        const event = new LightEvent({
            time: 0,
            type: 0,
            value: 0,
            floatValue: 1,
            customData: {
                lightID: ids,
            },
        })

        this.processEvents([event], true)
    }

    /**
     * Run the algorithm.
     * @param log Log the output JSON of each event.
     */
    run = (log = false) => this.processEvents(activeDiffGet().events, log)

    /**
     * Process events through the algorithm.
     * @param events Events to process.
     * @param log Whether passing events should be logged.
     */
    processEvents(events: LightEvent[], log = false) {
        events.forEach((x) => {
            let passed = true
            this.conditions.forEach((p) => {
                if (!p(x)) passed = false
            })
            if (!passed) return

            this.processes.forEach((p) => {
                p(x)
            })
            if (log) console.log(x.toJson(true))
        })
    }
}
