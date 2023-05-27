import madge from 'npm:madge@^6.0.0'

// deno run --allow-all "madge/generate_image.ts"

madge('src/mod.ts').then((res: any) => {
    res.image("madge/image.png")
    console.log(res.circular())
})
