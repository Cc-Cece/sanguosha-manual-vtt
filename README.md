# Sanguosha Manual VirtualTabletop

An initialization scaffold for a future `.vtt` game package importable into [ArnoldSmith86/virtualtabletop](https://github.com/ArnoldSmith86/virtualtabletop). The project will use cards, characters, identity-mode terminology, and interaction ideas from [libnoname/noname](https://github.com/libnoname/noname) as reference material.

This is deliberately not an automated rules engine. VirtualTabletop will provide rooms, synchronization, seats, private hands, cards, and tabletop state; players will discuss rules through external voice chat and manually perform and resolve actions. The backend and package must not decide whether a Sanguosha action is legal.

## Status

**Initialization complete; P0 has not started.** No cards, characters, identities, routines, layouts, formal `0.json`, playable package, or rules have been implemented. The expected future artifact is `dist/*.vtt`.

## Read-only upstream references

- `../virtualtabletop` — upstream platform and `.vtt` format reference.
- `../noname-main` — read-only data and interaction reference.

Never modify these directories or install dependencies inside them. New work belongs only in this repository.

## Recommended development workflow

1. Work from typed, separable sources under `src/` and keep assets under `assets/`.
2. Keep data, layouts, widgets, routines, variants, and assets independently maintainable.
3. Validate source and Widget ID uniqueness before packaging.
4. Generate VirtualTabletop-compatible JSON and `.vtt` artifacts into `dist/` only through future build tooling.

## Commands

```text
pnpm install
pnpm validate
pnpm test
pnpm build
pnpm check
```

The current build and validation commands are initialization placeholders; `build` does not create a `.vtt` package.

## License, sources, and current use

Project code is provisionally licensed under GPL-3.0; see `LICENSE`. VirtualTabletop (`ArnoldSmith86/virtualtabletop`) and noname (`libnoname/noname`) remain upstream platform/reference projects. Any future direct code copy must preserve its source, copyright notices, and applicable license.

Images, card faces, character artwork, fonts, and audio must not be presumed GPL-licensed. Their provenance and permission must be assessed and recorded separately. This project is currently intended only for non-commercial testing in private games among friends.

