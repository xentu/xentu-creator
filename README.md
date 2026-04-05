# Xentu Creator

Xentu Creator is a free, all-in one development environment for creating games 
with the [Xentu](https://github.com/xentu/xentu-engine) game engine. Although 
you can create games in Xentu using any code editor, Xentu Creator adds a lot of 
convenient features that makes building games much easier and faster.

![Screenshot of the editor in Windows 11](https://github.com/xentu/xentu-creator-js/blob/main/screenshot.png?raw=true)


## Current Status (5th April 2026)

This version of creator heavily used dependencies that kept on breaking the build cylce. It's important
for the longevity of the proejct that anyone can donwnload and build the editor safely and without issue,
so there is a lot of work underway to transition over to a more sustainable build without monaco & electron.

The current release binaries will still work and are safe, so please give that a download if you wish to
use the current version!


## Features

- Written in Electron (TypeScript and ReactJS).
- Game debugging, with a built-in console output window.
- Uses the Monaco code editor (also used in VSCode), which provides a rich coding experience.
- Editors for sprite map's, and conversations (for visual novels).
- Code completion and contextual insights for all the Xentu API.
- Comes with a dual customisable theme editor, with a toggle for dark and light modes.
- Support for internationalisation (languages other than English coming soon).


## Getting Started

Check the [releases](https://github.com/xentu/xentu-creator/releases) page to 
find and download an installer for your operating system. Windows, Linux (Debian)
and MacOS are all currently catered for.

If you would prefer to build it yourself, please keep reading;

## Donate

Free software still requires a lot of work, if you'd like to donate to help the
project, please use the link below:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U2YUV6)

## License

This project is free to use, modify and redistribute under the same [ZLIB](LICENSE.md)
license as the engine itself.
