# Welcome to ReMapper!
This is a [TypeScript](https://www.typescriptlang.org/) library designed to help with making Beat Saber modcharts. It is designed to optimize the scripting experience, and reduce code to be very minimal, and sometimes single lines.

Normal way:
```js
map._notes.push({
  _time: 20,
  _lineIndex: 1,
  _lineLayer: 1,
  _type: 1,
  _cutDirection: 3
});
```
ReMapper: `new Note(20, NOTE.RED, NOTE.RIGHT, [1, 1]).push();`

Here are some notable features:
- Wrappers for Notes, Walls, Events, Custom Events, and Environment Objects.
- Class for handling colors (you can make pretty rainbows!!!).
- Wrapper for optimizing and managing animations.
- Blender Model Exporting
    - Switch environments
    - Supports animations
    - Compatible with any environment piece (including multiple at once!)
- LightID remapping tools.
- Difficulty and Info.dat wrappers.
- Various random useful functions.
- Much more!!!

While this library was designed for TypeScript, it is *technically* useable with JavaScript, but types will save you a lot of time in the long run, and makes everything feel secure.

You'll likely need to do some exploring with this package to get comfortable. Check out [examples](https://github.com/Swifter1243/ReMapper/blob/master/examples.md) and thoroughly read the descriptions of what different things do.

# Installation

Install [Deno](https://deno.land/).

If you want your script to reload when you save or when key files change (**HIGHLY RECOMMENDED**), install [Denon](https://deno.land/x/denon) and add `scripts.json` to your project folder:
```json
{
    "allow": [
        "all"
    ],
    "scripts": {
        "rm": {
            "cmd": "deno run --no-check script.ts",
            "desc": "start ReMapper"
        }
    },
    "watcher": {
        "exts": [
            "ts",
            "js",
            "rmmodel"
        ],
        "legacy": false
    }
}
```

If you are planning to use Blender, you will need [ReMapper Blender Exporter](https://github.com/Swifter1243/ReMapper-Blender-Exporter).

Go to releases, download the `script.py` from the latest release and put it somewhere in your computer.

In Blender, open `Edit > Preferences > Add-ons > Install` and navigate to the `script.py`.

Make sure to enable the plugin after installing. A tab should show up on the right side called `RM Exporter`.

# Running

You can either open a terminal by pressing `Terminal > New Terminal` in your VSCode window, or by pressing the Windows key and typing `cmd`, then running `cd "your directory here"` to navigate to your map directory.

If you are running your script with Deno, run `deno run --no-check --allow-all script.ts`.

If you're running it with Denon, run `denon rm`.

Of course replace `script.ts` with the actual name of your script (in the scripts.json too).

