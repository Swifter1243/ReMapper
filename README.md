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
- Blender to Environment stuff w/ [ScuffedWalls](https://github.com/thelightdesigner/ScuffedWalls)
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

Firstly, open a terminal in VSCode (Ctrl + Shift + `) or Command Prompt (Windows Key > Search "cmd")

Run `npm install -g typescript ts-node` in the terminal in order to get started with TypeScript.

Next, get the terminal running inside of your map project folder with `cd "directory here"` (yes quotes are needed)

Finally, install this package with `npm install swifter_remapper`

For faster startup times, you can add this `tsconfig.json` to your project folder:
```jsonc
{
    "include": [
        "./**/*"
    ],
    "exclude": [
        "node_modules"
    ],
    "ts-node": {
        "transpileOnly": true
    },
    "compilerOptions": {
        "target": "ES2015",
        "module": "commonjs",
        "esModuleInterop": true,
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "allowJs": true,
    }
}
```
Only include this if you are ok with ignoring type errors at runtime, but of course they'll still show up in your IDE.

If you want to update the package, you can run `npm uninstall swifter_remapper` and then `npm install swifter_remapper` again.

You would run this script with `ts-node "script name here"`.

# Troubleshooting

If you have an error that looks like this, run the following command in an admin cmd/pwsh instance.

`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine`
![image](https://media.discordapp.net/attachments/878480179528351775/950766613676834906/unknown.png?width=1025&height=95) 

For more information on this, read [this](https://go.microsoft.com/fwlink/?LinkID=135170)


# Contributing

## Unit Tests
Run `npm test` in main repository folder to run unit tests.