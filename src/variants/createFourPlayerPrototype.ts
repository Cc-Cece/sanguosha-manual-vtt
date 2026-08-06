import { animatedQuickShuffleRoutine } from '../routines/animatedShuffle.js';
import { normalizeGeneratedRoutines } from '../routines/inputDialog.js';
import { applyRecycleZoneRuntimeFixes } from '../routines/recycleZoneRuntime.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { applyMovableDrawPilePanel } from '../widgets/drawPilePanel.js';
import { createShuffleAnimationWidgets } from '../widgets/shuffleAnimation.js';
import { createUniversalPrototype as createBaseUniversalPrototype } from './createUniversalPrototype.js';

function installShuffleAnimation(game: GameFile, catalog: AssetCatalog): GameFile {
  for (const animationWidget of createShuffleAnimationWidgets(catalog.backs)) {
    game[animationWidget.id] = animationWidget;
  }

  const quickShuffleButton = game['quick-shuffle-btn'] as Widget | undefined;
  if (quickShuffleButton) quickShuffleButton.clickRoutine = animatedQuickShuffleRoutine;

  // The draw pile remains a fixed child holder, while its panel, controls and animation proxies
  // move as one layout unit when the host unlocks the table layout.
  applyMovableDrawPilePanel(game);

  // Reapply after the animation widgets exist. This installs the free-area recycle behavior and
  // the animated recycle-to-draw-pile routines for both host and approved-player operations.
  applyRecycleZoneRuntimeFixes(game);

  // Animation routines are attached after the base prototype's normalizer has run.
  return normalizeGeneratedRoutines(game);
}

export function createUniversalPrototype(catalog: AssetCatalog): GameFile {
  return installShuffleAnimation(createBaseUniversalPrototype(catalog), catalog);
}

export const createFourPlayerPrototype = createUniversalPrototype;
