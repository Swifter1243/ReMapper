# Welcome to ReMapper!
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

You'll likely need to do some exploring with this package to get comfortable. Check out the [examples](/examples/) and [read the documentation](/documentation.md) to find out what each different thing does.

# Installation

## Using TS

Usage with typescript itself will require a typescript project to be setup.

[See this guide on how to create a typescript project for noodle.](https://gist.github.com/cal117/f3fdaa3990fc683be072a1a67b1d43eb)

Firstly, open a terminal and run the following to install Remapper globally:

```bash
# Yarn
yarn global add swifter_remapper
# NPM
npm install -g swifter_remapper
```

### Usage

```ts
import * as Remapper from 'swifter_remapper'

// ... do stuff
```

If a Remapper update releases, feel free to run `npm install -g swifter_remapper` again (this will install the latest).

## Using JS

*Using JS or any other derivative (such as CoffeeScript) is not recommended, however it is not required to use typescript.*

Remapper provides type declarations (d.ts) that are read by IDEs and compilers, these can catch errors and allows you to use the typescript library without needing to use typescript for scripting.

Firstly, open a terminal and run the following to install Remapper globally:

```bash
# Yarn
yarn global add swifter_remapper
# NPM
npm install -g swifter_remapper
```

Remapper can be imported from anywhere now, you do not need to create a nodejs project.

### Usage:

```js
const Remapper = require('swifter_remapper');

// do stuff
```

If a Remapper update releases, feel free to run `npm install -g swifter_remapper` again (this will install the latest).