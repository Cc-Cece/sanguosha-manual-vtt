# Project Boundaries

This project builds a manually adjudicated Sanguosha table package for VirtualTabletop. It is not an automated Sanguosha rules engine. Players discuss rules over external voice chat and manually perform and resolve all game actions.

## Prohibited implementations

Do not implement or port:

- automatic skill triggers;
- card-play legality checks;
- attack-distance calculation;
- enforced turn rules;
- automatic response chains;
- automatic damage resolution;
- automatic hand-size limits;
- automatic victory determination;
- the noname event tree or skill execution framework.

## Allowed future scope

Future work may implement:

- cards and tabletop state;
- private hands and identities;
- seats and player areas;
- manual draw, play, discard, reveal, and card-transfer actions;
- manual current/max health adjustment;
- chaining, flipping, death state, and markers;
- a central processing area;
- operation-declaration helpers;
- shortcut buttons for common tabletop actions;
- `.vtt` generation, packaging, and validation.

## Development rules

1. `../noname-main` and `../virtualtabletop` are always read-only.
2. Write all new code only inside `sanguosha-manual-vtt`.
3. Use TypeScript and the Node.js toolchain.
4. Use pnpm; do not use npm or Yarn to manage this project's dependencies.
5. The eventual output is `dist/*.vtt`, but initialization must not generate a formal game package.
6. Keep game data, layouts, Routines, and assets separate.
7. Never directly maintain one monolithic, indivisible `0.json`.
8. Generate VirtualTabletop-compatible JSON from source in future development.
9. Every Widget ID must support automated uniqueness validation.
10. Every asset's source and license must be traceable.

