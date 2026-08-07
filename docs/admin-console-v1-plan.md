# VTT Admin Console integration plan

## Goal

Expose only game-specific inspection intent from the `.vtt` package while leaving transport, security, and rendering to the VTT engine.

## V1 scope

- Extend `GameInfo` with a typed, declarative `adminPanels` field.
- Declare one `holderInspector` panel for `draw-pile`.
- Do not add any admin controls to the tabletop itself.
- Do not add game-supplied JavaScript or executable admin hooks.

## Declaration

```ts
adminPanels: [
  {
    id: 'draw-pile-audit',
    type: 'holderInspector',
    title: '摸牌堆审计',
    holder: 'draw-pile',
  },
]
```

The VTT admin client resolves card labels and source metadata through each card's `deck` and `cardType`, so the game does not duplicate card-order logic.

## Extension path

Additional game-specific panels should remain data declarations. New behavior belongs in generic VTT panel types rather than arbitrary code embedded in the game package.

## Acceptance criteria

- Built game metadata contains the draw-pile inspector declaration.
- Existing game/tabletop widgets and routines are unchanged.
- TypeScript validates the declaration shape.
