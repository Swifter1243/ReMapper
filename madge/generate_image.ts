import madge from 'npm:madge@^6.0.0'

// deno run --allow-all "madge/generate_image.ts" --no-check

madge('src/mod.ts').then((res) => {
    res.image("madge/image.png")
    res.image("madge/circular.png", true)
    console.log(res.circular())
})
