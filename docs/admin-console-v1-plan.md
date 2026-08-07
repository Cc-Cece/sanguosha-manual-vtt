# VTT Admin Console integration plan

## Goal

Expose only game-specific inspection intent from the `.vtt` package while leaving transport, security, and rendering to the VTT engine.

## V1 scope

- Define a typed, declarative `AdminPanel` schema.
- Add one hidden `admin-console-config` widget to normal room state.
- Declare one `holderInspector` panel for `draw-pile` inside that widget.
- Do not add any admin controls to the tabletop itself.
- Do not add game-supplied JavaScript or executable admin hooks.

## Declaration

```ts
{
  id: 'admin-console-config',
  type: 'basic',
  display: false,
  adminPanels: [
    {
      id: 'draw-pile-audit',
      type: 'holderInspector',
      title: '摸牌堆审计',
      holder: 'draw-pile',
    },
  ],
}
```

The VTT admin client resolves card labels and source metadata through each card's `deck` and `cardType`, so the game does not duplicate card-order logic.

## Why a hidden state widget

VTT's existing read-only `/state/:room` endpoint intentionally strips most `_meta` fields. A hidden normal widget therefore provides the smallest transport-neutral declaration that is available to the separate admin page without changing the server protocol.

## Extension path

Additional game-specific panels should remain data declarations. New behavior belongs in generic VTT panel types rather than arbitrary code embedded in the game package.

## Acceptance criteria

- The built game contains a hidden `admin-console-config` widget with the draw-pile inspector declaration.
- Existing gameplay widgets and routines are unchanged apart from the inert config widget.
- TypeScript validates the declaration shape.
