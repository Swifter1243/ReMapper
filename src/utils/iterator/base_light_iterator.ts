import {getActiveDifficulty} from "../../data/active_difficulty.ts";
import {LightEvent} from "../../internals/beatmap/object/basic_event/light_event.ts";
import {LightEventCondition, LightEventProcess} from "../../types/iterator.ts";
import {lightEvent} from "../../builder_functions/beatmap/object/basic_event/light_event.ts";

/*
 * Class used to iterate through every event in the map.
 * Has various tools to transform the events.
 */
export class BaseLightIterator {
    /** Conditions that each event needs to pass. */
    conditions: LightEventCondition[] = []
    /** Function to run on each event. */
    processes: LightEventProcess[] = []

    /**
     * Add a condition that events must pass.
     * @param condition Input condition.
     */
    addCondition(condition: LightEventCondition) {
        this.conditions.push(condition)
        return this
    }

    /**
     * Add a function to edit the event.
     * @param process Input function.
     */
    addProcess(process: LightEventProcess) {
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
     * Events will pass if they have this type.
     * @param type Input type.
     */
    isType = (type: number) => this.addCondition((e) => e.type === type)

    /**
     * Multiplies the colors of the event.
     * @param rgb Multiplier for r, g, and b values.
     * @param alpha Multiplier for alpha.
     */
    multiplyColor = (rgb: number, alpha = 1) =>
        this.addProcess((x) => {
            if (x.chromaColor) {
                x.chromaColor[0] *= rgb
                x.chromaColor[1] *= rgb
                x.chromaColor[2] *= rgb
                if (x.chromaColor[3]) x.chromaColor[3] *= alpha
            }
        })

    /**
     * Test processes only on light IDs. IDs before and after will be logged.
     * @param ids IDs to test.
     */
    testOnIDs(ids: number[]) {
        this.conditions = []

        const event = lightEvent({}).on('Red', ids)
        console.log('Input IDs: ' + ids)
        this.processEvents([event])
        console.log('Output IDs: ' + event.lightID)
    }

    /**
     * Run the iterator on light events in the active difficulty.
     * @param log Log the output JSON of each event.
     */
    run = (log = false) => this.processEvents(getActiveDifficulty().lightEvents, log)

    /**
     * Process events through the iterator.
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
            if (log) console.log(x.toJsonV3())
        })
    }
}
