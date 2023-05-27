import * as rm from "../src/mod.ts"
import {readDifficultyV3} from "../src/data/beatmap_file.ts";

const map = await readDifficultyV3("ExpertPlusLawless", "ExpertPlusStandard")


for (let i = 0; i < 1000; i++) {
    // rm.note({
    //     time: 2,

    // })

    
    rm.note({
        time: i,
        type: i % 2,
        fake: i % 2 === 0
    }).push()
}

await map.save()
