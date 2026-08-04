# Upstream Notes

This is a limited initialization-time map of read-only references. No data, extractor, or game implementation was copied.

## VirtualTabletop

- Repository: `../virtualtabletop` (`ArnoldSmith86/virtualtabletop`).
- A `.vtt` file is a ZIP container, normally containing `0.json` and an `assets/` resource directory; some examples also contain additional numbered JSON files.
- Public game examples are under `../virtualtabletop/library/games/<game>/`, including examples such as `Blue/0.json`, `blob/0.json`, and `Zookeeper/0.json`.
- Later research should focus on `../virtualtabletop/client/js/widgets/`, particularly `widget.js`, `holder.js`, `seat.js`, `card.js`, `deck.js`, `pile.js`, and `button.js`, plus the Routine representation and usage in public game JSON.

## noname

- Repository: `../noname-main` (`libnoname/noname`).
- Identity mode is broadly represented by `../noname-main/apps/core/mode/identity.js`.
- Base card data is broadly represented by `../noname-main/apps/core/card/standard.js` and `extra.js`.
- Character packs are broadly located under `../noname-main/apps/core/character/<pack>/`, commonly with `character.js`, translation, and related pack files.
- noname is only a data and interaction reference. Its event tree, skill execution system, automated rules, and legality logic must not be ported.

## Licensing and provenance

VirtualTabletop and noname are upstream platform/reference projects only. If code is directly copied later, retain the corresponding source, copyright, and license information. Images, card faces, character artwork, fonts, and audio must not be assumed to be GPL-licensed; each asset requires traceable provenance and permission. This project is currently for non-commercial testing in private games among friends.

