![ReMapperBanner](https://user-images.githubusercontent.com/86539501/184691427-0e8853fc-878a-4c0b-b976-970f7dac8818.png)

# Welcome to ReMapper!

This is a [TypeScript](https://www.typescriptlang.org/) library designed to help with making Beat Saber modcharts. It is designed to optimize the scripting experience, and reduce code to be very minimal, and sometimes single lines.

Normal way:

```js
map._notes.push({
  _time: 20,
  _lineIndex: 1,
  _lineLayer: 1,
  _type: 1,
  _cutDirection: 3,
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

While this library was designed for TypeScript, it is _technically_ useable with
JavaScript, but types will save you a lot of time in the long run, and makes
everything feel secure.

# Installation

Install [Deno](https://deno.land/). If you have VSCode open during installing this you'll need to restart it.

Next, you'll need to setup your map with ReMapper. This is done with the setup tool, which only needs to be installed once per system. It's installed with a terminal.

You can either open a terminal by pressing `Terminal > New Terminal` in your
VSCode window, or by pressing the Windows key and typing `cmd`, then running
`cd "your directory here"` to navigate to your map directory.

To install the template tool run:
```
deno install --allow-all -f --reload https://raw.githubusercontent.com/Swifter1243/ReMapper-Setup/master/setup/rm_setup.ts
```

From there, you can run `rm_setup` inside of your map directory in the terminal to add the
necessary files for scripting. If you want to create a new map, add `--map` to
the end of the command, or run the terminal from `CustomWIPLevels` and run
`rm_setup "Map Name"` to create a folder too.

It may do nothing and prompt you to download Git, if so then install it and restart VScode.

When opening the script, you'll first of all need to install the (verified) Deno extension in VScode. You'll also need to open your file in a folder so that it is part of a workspace, it should tell you to do this on the left side. Preferably save the workspace too.

After that, if you get an error on the import saying that your import must end with `.js`, you'll need to tell VScode that your workspace is using deno. Press `Ctrl + Shift + P` and search for `Deno Initialize Workspace Configuration` and say yes to everything.

Deno will tell you that the dependency at the top couldn't be resolved, but all you have to do is hold alt over the link, press `Quick Fix`, and press the button that shows up when you press quick fix that says cache the depedency.

If you want your script to reload when you save or when key files change
(**HIGHLY RECOMMENDED**), install [Denon](https://github.com/denosaurs/denon#denoland). This will
search for changes in key files and run deno.

If you are planning to use Blender, you will need
[ReMapper Blender Exporter](https://github.com/Swifter1243/ReMapper-Blender-Exporter).

# Running

If you are running your script with Deno, run
`deno run --no-check --allow-all script.ts`.

If you're running it with Denon, run `denon rm`.

Of course replace `script.ts` with the actual name of your script if it differs
(in the scripts.json too).

Have fun using **ReMapper**! Make sure to check out [documentation](https://github.com/Swifter1243/ReMapper/blob/master/DOCS.md) to get started.

Lastly, if you are interested in what is planned for ReMapper, consider checking out the [ReMapper Roadmap](https://github.com/users/Swifter1243/projects/1).
