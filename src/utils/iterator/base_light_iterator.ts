import {LightEvent} from "../../internals/beatmap/object/basic_event/light_event.ts";
import {LightEventCondition, LightEventProcess} from "../../types/iterator.ts";
import {lightEvent} from "../../builder_functions/beatmap/object/basic_event/light_event.ts";
import {AbstractDifficulty} from "../../internals/beatmap/abstract_difficulty.ts";

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
    setType(type: number) {
        return this.addProcess((x) => {
            x.type = type
        })
    }

    /**
     * Events will pass if they have this type.
     * @param type Input type.
     */
    isType(type: number) {
        return this.addCondition((e) => e.type === type)
    }

    /**
     * Multiplies the colors of the event.
     * @param rgb Multiplier for r, g, and b values.
     * @param alpha Multiplier for alpha.
     */
    multiplyColor(rgb: number, alpha = 1) {
        return this.addProcess((x) => {
            if (x.chromaColor) {
                x.chromaColor[0] *= rgb
                x.chromaColor[1] *= rgb
                x.chromaColor[2] *= rgb
                if (x.chromaColor[3]) x.chromaColor[3] *= alpha
            }
        })
    }

    /**
     * Test processes only on light IDs. IDs before and after will be logged.
     * @param difficulty Difficulty to test on.
     * @param ids IDs to test.
     */
    testOnIDs(difficulty: AbstractDifficulty, ids: number[]) {
        this.conditions = []

        const event = lightEvent(difficulty, {}).on('Red', ids)
        console.log('Input IDs: ' + ids)
        this.processEvents([event])
        console.log('Output IDs: ' + event.lightID)
    }

    /**
     * Run the iterator on light events in the active difficulty.
     * @param difficulty Difficulty to run this light iterator on.
     * @param log Log the output JSON of each event.
     */
    run(difficulty: AbstractDifficulty, log = false) {
        return this.processEvents(difficulty.lightEvents, log)
    }

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
