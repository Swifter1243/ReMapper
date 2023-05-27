import * as rm from "../src/mod.ts"
import {readDifficulty} from "../src/data/beatmap_file.ts";

const map = await readDifficulty("ExpertPlusLawless", "ExpertPlusStandard")


for (let i = 0; i < 1000; i++) {
    // rm.note({
    //     time: 2,

    // })

    
    rm.note({
        time: i,
        type: i % 2,
        fake: i % 2 === 0
    })
}

await map.save()
