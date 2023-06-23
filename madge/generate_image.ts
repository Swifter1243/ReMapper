import madge from 'npm:madge@^6.0.0'

// deno run --allow-all "madge/generate_image.ts" --no-check

madge('src/mod.ts', {
    detectiveOptions: {
        ts: {
            skipTypeImports: true,
        },
    },
// deno-lint-ignore no-explicit-any
}).then((res: any) => {
    res.image('madge/image.png')
    res.image('madge/circular.png', true)
    console.log(res.circular())
})
