[![Build Status](https://travis-ci.org/6502ts/6502.ts.svg?branch=master)](https://travis-ci.org/6502ts/6502.ts)

# What is it?

6502.ts strives to be a collection of emulators for 6502 based systems written in Typescript.
It currently provides

 * A cycle-exact [CPU emulator](doc/cpu.md) and a generic [debugging environment](doc/vanilla_debugger.md)
   any attached hardware.
 * A minimal [hardware monitor](doc/ehbasic_monitor.md) for executing the
   [EhBasic interpreter](https://github.com/jefftranter/6502/tree/master/asm/ehbasic)
   and Klaus Dormann's
   [6502 testsuite](https://github.com/Klaus2m5/6502_65C02_functional_tests)
 * A full-featured [Atari 2600 emulator](doc/internals/stella.md), including sound, CRT phosphor simulation,
   debugging environment and a more user oriented ["stellerator" frontend](doc/stellerator.md).

The projects targets both NodeJS and the browser as runtime environments (no video or audio on node,
of course).

# Pre-build applications

You can find recent builds of the various applications on the project's github.io page.

 * [vanilla debugger](https://6502ts.github.io/dev/debugger.html)
 * [hardware monitor frontend / debugger](https://6502ts.github.io/dev/)
 * [Atari 2600 debugger frontend](https://6502ts.github.io/dev/stella.html)
 * [Atari 2600 stellerator, development build](https://6502ts.github.io/dev/stellerator.html)
 * [Atari 2600 stellerator, production build](https://6502ts.github.io/stellerator)

# Atari 2600 emulation

6502.ts implements a full-fledged emulator for the Atari 2600 VCS. Apart from the
debugger, there are two ways to use the emulator

 * **Stellerator** allows to import, manage and play VCS ROMs in the browser. ROMs are
   stored locally in the browser. Stellerator is hosted on github.io
   [here](https://6502ts.github.io/stellerator).
 * **Stellerator embedded** offers a rich API to embed VCS emulation into web sites
   and web applications. Please check out the
   [documentation](https://6502ts.github.io/typedoc/stellerator-embedded/)
   for more information.

# Building and development

6502.ts uses [Yarn](https://yarnpkg.com/lang/en/) for package management, so you'll
have to install it first. After checking out the repos, doing

    yarn install
    grunt initial

will initialize the development environment. You can then do a development build of all
apps with a simple `grunt`. Production versions can be build with `grunt build` (currently
only stellerator). `grunt test` will run the testsuite. A web server can be fired up with
`grunt serve`.

After building, additional NodeJS applications for commandline debugging can be found in
`bin`.

Please check the `Gruntfile.js` for more build targets.

# NPM package

The core parts of the emulator are available as `6502.ts` on
[NPM](https://www.npmjs.com).
The package includes TypeScript typings and can be used directly in TypeScript projects.

Most APIs are pretty stable by now, but not documented yet, with the exception
of Stellerator embedded. Please check out the
[documentation](https://6502ts.github.io/typedoc/stellerator-embedded/)
of Stellerator embedded for more details.

# License and credits

## The MIT license

Copyright (c) 2014 -- 2020 Christian Speckner and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Third party code

These license conditions do not apply to the contents of the `aux` directory which
mostly were written by folks other than me. Specifically:

 * `ehBasic` was taken from Jeff Tranters repository
   [here](https://github.com/jefftranter/6502/tree/master/asm/ehbasic)
 * Klaus Dormann's 6502 testsuite (found in `aux/6502_suite`) was taken from his
   repository on github [here](https://github.com/Klaus2m5/6502_65C02_functional_tests)
   and is licensed under the GPL.
 * The `red_line` sample was taken from Kirk Israel's 2600 programming tutorial on
   [AtariAge](http://www.atariage.com/2600/programming/2600_101/03first.html). The
   `line_test` is a modified version of this code.
 * The `playfield_1` sample was taken from Kirk Israel's [2600 cookbook](http://alienbill.com/2600/cookbook/playfield.html).
 * `playfield_2` was taken from Andrew Davie's 2600 programming excercises on
   [AtariAge](http://atariage.com/forums/topic/28219-session-15-playfield-continued/).
 * The `macro.h` and `vcs.h` headers can be found free-floating on the internet
 * `flapping` is a homebrew game written by Kirk Israel available
   [here](http://alienbill.com/2600/flapping/).

2600 cartridge type detection code (and some of the more exotic cartridge types)
were modelled after the excellent [Stella](https://stella-emu.github.io)
emulator. Initial 2600 audio code was contributed by Martin Schröder. ARM
support in DPC+ is powered by David Welch's
[thumbulator](https://github.com/dwelch67/thumbulator), transpiled to JS with
[emscripten](http://kripken.github.io/emscripten-site/). Cycle-accurate PCM
audio is derives from work done by Chris Brenner. The favicon and homescreen icons
in Stellerator were taken from Stella.
