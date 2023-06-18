# Xentu Creator

A cross-platform IDE for creating games with the [Xentu](https://github.com/xentu/xentu-engine) game engine.

![Screenshot of the editor in Windows 11](https://github.com/xentu/xentu-creator-js/blob/main/screenshot.png?raw=true)

## Features

- Written in Electron (TypeScript and ReactJS).
- Game debugging, with a built-in console output window.
- Uses the Monaco code editor (also used in VSCode), which provides a rich coding experience.
- Code completion and contextual insights for all the Xentu API.
- Comes with a dual customisable theme editor, with a toggle for dark and light modes.
- Support for internationalisation (languages other than English coming soon).

## About

Xentu Create already exists as a project built in C# .NET. After recent changes
to licensing on the AvaloniaUI project, I reluctantly decided to rebuild the
editor in JavaScript instead to make sure that future versions of the app will
not get hindered by things out of my control. 

Fortunately with this rebuild project has come a lot of really cool perks. We now
get the Monaco editor by Microsoft which is MIT licensed, the XTerm terminal,
the cross-platform ability of ReactJS, and the power of JavaScript which means
I can add more tools to the IDE more easily.

Personally I am not a fan of carrying Chromium around with the app, so I will be
looking to add a compile option for Neutralino on this project too once the first
fully working build of this app has had some time to stretch it's legs.

## How To Run

Make sure you have a recent version of NodeJS installed (preferably v16 or higher),
then clone this repo (green code button at the top right) into a folder on your
computer, then in a terminal run this to install dependencies:

```
npm install --legacy-bundling
```

The `legacy-building` argument will allow **xterm-for-react** to get installed. Currently
the author has not yet updated it, but I've checked and the old one does work without
issue or security concern, so the warnings can be ignored. Once complete, run this 
command to start the app:

```
npm start
```

If you would prefer to just use a build of the engine, binaries will be coming early
next week!

## Donate

Free software still requires a lot of work, if you'd like to donate to help the
project, please use the link below:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U2YUV6)

## License

This project is free to use, modify and redistribute under the same [ZLIB](LICENSE.md)
license as the engine itself.