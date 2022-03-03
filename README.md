### Welcome to ReMapper!
This is a [TypeScript](https://www.typescriptlang.org/) library designed to help with making Beat Saber modcharts.

Here are some notable features:
- Wrappers for Notes, Walls, Events, Custom Events, and Environment Objects.
- Class for handling colors (you can make pretty rainbows!!!).
- Wrapper for optimizing and managing animations.
- Blender to Environment stuff w/ [ScuffedWalls](https://github.com/thelightdesigner/ScuffedWalls)
    - Switch environments
    - Supports animations
    - Compatible with any environment piece (including multiple at once!)
- LightID remapping tools.
- Difficulty and Info.dat wrappers.
- Various random useful functions.
- Much more!!!

While this library was designed for TypeScript, it is *technically* useable with JavaScript.

I would advise against using JS for this, because it doesn't properly autocomplete properties on objects, which defeats the purpose as you'd need to refer to documentation to use this package, it's much better to have everything just show up.

TypeScript will by default force you to specify the type (number, array, object.. etc) of every variable, if you don't like this, you can add a file to your project that will ignore this.

If you're a person coming from JavaScript, you'll need to do some exploring with this package to get comfortable. Check out examples and read the descriptions of what different things do.

### Installation

Firstly, open a terminal in VSCode (Ctrl + Shift + `) or Command Prompt (Windows Key > Search "cmd")

Run `npm install -g typescript ts-node` in the terminal in order to get started with TypeScript.

Next, get the terminal running inside of your map project folder with `cd "directory here"` (yes quotes are needed)

Finally, install this package with `npm install swifter_remapper`

If you want to define implicit any types (explained before), then add `tsconfig.json` to your project folder:
```js
{
    "include": [
        "node_modules/swifter_remapper/**/*",
        "./**/*"
    ],
    "exclude": [
        "node_modules"
    ],
    "compilerOptions": {
        "target": "ES2015",
        "module": "commonjs",
        "noImplicitAny": false,
        "types": [
            "node",
        ],
        "esModuleInterop": true,
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "allowJs": true,
    }
}```