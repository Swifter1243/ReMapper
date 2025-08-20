import madge from 'npm:madge@^6.0.0'

// deno run --allow-all "madge/check_circular.ts"

madge('src/mod.ts', {
    detectiveOptions: {
        ts: {
            skipTypeImports: true,
        },
    },
// deno-lint-ignore no-explicit-any
}).then((res: any) => {
    const circular = res.circular()
    const circularNoTypes = circular.filter((a: string[]) => !a.some(s => s.includes('types')))
    Deno.writeTextFileSync('madge/circular.txt', JSON.stringify(circularNoTypes, undefined, 2))
})
