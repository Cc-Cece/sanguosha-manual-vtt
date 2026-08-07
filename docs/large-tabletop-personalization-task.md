# Large Tabletop Personalization — Implementation Task

## Goal

Complete the large 3:2 tabletop experience by adding player-owned hand areas, safe temporary public hand-back interaction, host-controlled component/card sizing, restored hover-card readability, and a coordinated 20x camera-zoom change in the `Cc-Cece/virtualtabletop` fork.

This remains a manual tabletop. These changes improve presentation and physical-table interaction only; they must not add automatic Sanguosha legality, skill, turn, damage, distance, response, hand-limit, or victory rules.

## Repositories and branches

- Game repo: `Cc-Cece/sanguosha-manual-vtt`
  - base: `master`
  - implementation branch: `agent/private-hand-and-scaling-controls`
- VTT fork: `Cc-Cece/virtualtabletop`
  - base: `main`
  - implementation branch: `agent/zoom-20x`

## 1. Preserve the large board

Keep the merged 3600×2400 logical board and 3:2 aspect ratio. Do not resize, relocate, or rescale the reserve/library preparation drawer as part of this task.

## 2. Player-owned movable hand areas

Replace the single shared `personal-hand` holder with one private hand holder per seat (`personal-hand-seat-1` … `personal-hand-seat-12`).

Requirements:

- each private hand is visible only to its linked seat;
- each player can move their own hand area without moving any other player's hand area;
- public layout locking must not remove a player's ability to position their own private hand area;
- cards entering a private hand keep the current hand privacy model and hand-count updates;
- ordinary cards become privately readable in hand while identity-card privacy remains protected;
- hand counts continue to report the real number of cards owned by each seat.

## 3. Replace blind proxies with real-card public hand backs

Delete the legacy blind-selection system:

- `blind-zone-*`;
- `show-blind-*` / `hide-blind-*`;
- all `blind-proxy-*` widgets and proxy-count logic.

Add a compact button to each player's own hand UI:

- private state: `👁 展示牌背`;
- public state: `🔒 收起牌背`.

Opening public hand backs must:

1. select the real cards currently in that player's private hand;
2. force them to inactive/back face before public display;
3. move them to that seat's temporary public hand-back holder;
4. randomize their displayed order;
5. make the public holder visible to everyone;
6. keep the cards unflippable while public but individually movable by other players.

Closing public hand backs must:

1. select only cards that are still inside that public hand-back holder at close time;
2. return those remaining cards to the owner's private hand;
3. restore normal private-hand behavior through the existing hand-entry privacy logic;
4. hide the public holder.

Cards already dragged away by another player must never be recalled by closing the public view.

The public hand-back holder must track the private hand's position/size so publishing does not jump to an unrelated fixed location.

## 4. Host component scaling

Productize the existing widget `scale` support as host-visible component controls using the compact `− 100% +` pattern.

Supported component scale presets:

- 50%
- 75%
- 100%
- 125%
- 150%
- 200%
- 250%
- 300%
- 400%

Requirements:

- 100% remains the default;
- controls are host/seat-1 only;
- scale the component root so child UI scales together;
- scaling does not promise collision avoidance; the host is responsible for placement on the large board;
- retain the recycle area's existing true-area resize semantics; do not replace its width/height resizing with generic root scaling.

Target root components should include player modules and the principal movable tabletop panels where a root scale is meaningful. Avoid adding independent scale controls to every child button/zone.

## 5. Host global card scale

Add a host control for global in-world card size, independent from camera zoom and component scale.

Initial presets:

- 75%
- 100%
- 125%
- 150%
- 175%
- 200%
- 250%

Requirements:

- 100% default;
- update all real card widgets, not decorative non-card proxies;
- adjust hand/public-hand spacing with the selected card scale so enlarged cards do not collapse into the old 54px spacing;
- keep this independent from hover-preview sizing.

## 6. Hover-card readability

Because the board dimensions doubled, compensate the game-level `enlarge` values by 2× so hover previews return approximately to their pre-expansion screen size.

Target values:

- gameplay and extra cards: 4.7 → 9.4
- generals and identities: 5.0 → 10.0
- health and conversion-state cards: 4.6 → 9.2

Do not multiply hover preview size by current camera zoom.

## 7. Layout/reset semantics

Separate game-state reset from layout preferences:

- normal full-table reset must preserve manually chosen component positions/scales and global card scale;
- `自动整理` may restore default positions but should not silently erase scale preferences unless explicitly defined as a layout-default action;
- provide an explicit host action for restoring default sizing/layout preferences if needed.

## 8. VTT fork — unified 20x camera zoom

In `Cc-Cece/virtualtabletop`, raise the client camera maximum from 10x to 20x and make all zoom inputs consistent.

Requirements:

- define shared zoom bounds rather than scattering new magic numbers where practical;
- wheel zoom: 1x–20x;
- touch/pinch zoom: 1x–20x;
- toolbar slider: 1x–20x;
- keyboard/PageUp/PageDown path must remain valid and not be capped at the old 2x-only preset range;
- panning must continue to clamp using the current zoom value;
- 1x reset behavior remains unchanged.

This fork change is a generic VTT UX improvement. It must not contain Sanguosha-specific logic.

## 9. Validation

Game repo tests should cover at minimum:

- 12 separate private hand holders with seat visibility/linking and movability;
- absence of blind proxy widgets;
- public hand-back open/close routines enforce face-down behavior and use real cards;
- public hand-back holders follow their private hand geometry;
- component scale preset range reaches 400%;
- global card scale presets and hand spacing changes;
- hover `enlarge` compensation values;
- existing 3600×2400 board and unchanged library drawer remain intact.

VTT fork validation should cover at minimum:

- wheel/touch/slider maximum is 20x;
- slider exposes 20x;
- keyboard zoom path can advance beyond 2x;
- zoom never drops below 1x;
- existing pan/zoom-to-cursor behavior is preserved.

## Acceptance criteria

The task is complete when:

1. both repositories have focused implementation branches;
2. relevant checks/tests pass, or any unrelated pre-existing failure is documented explicitly;
3. a PR is opened from `agent/private-hand-and-scaling-controls` to `sanguosha-manual-vtt:master`;
4. a PR is opened from `agent/zoom-20x` to `virtualtabletop:main`;
5. each PR explains its dependency/boundary clearly.
