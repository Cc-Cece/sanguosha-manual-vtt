import { animatedQuickShuffleRoutine } from '../routines/animatedShuffle.js';
import { applyFaceDownPrivacyRuntime } from '../routines/faceDownPrivacyRuntime.js';
import { applyGeneralDisplayStateRuntime } from '../routines/generalDisplayState.js';
import { normalizeGeneratedRoutines } from '../routines/inputDialog.js';
import { applyRecycleZoneRuntimeFixes } from '../routines/recycleZoneRuntime.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { applyMovableDrawPilePanel } from '../widgets/drawPilePanel.js';
import { createShuffleAnimationWidgets } from '../widgets/shuffleAnimation.js';
import { createUniversalPrototype as createBaseUniversalPrototype } from './createUniversalPrototype.js';

function installFinalRuntime(game: GameFile, catalog: AssetCatalog): GameFile {
  for (const animationWidget of createShuffleAnimationWidgets(catalog.backs)) {
    game[animationWidget.id] = animationWidget;
  }

  const quickShuffleButton = game['quick-shuffle-btn'] as Widget | undefined;
  if (quickShuffleButton) quickShuffleButton.clickRoutine = animatedQuickShuffleRoutine;

  // The draw pile remains a fixed child holder, while its panel, controls and animation proxies
  // move as one layout unit when the host unlocks the table layout.
  applyMovableDrawPilePanel(game);

  // Install the four-state display lifecycle after all general cards and reset controllers exist.
  applyGeneralDisplayStateRuntime(game);

  // Apply privacy after every card, holder and player module has been assembled. This removes
  // legacy peek widgets and installs the identity-card hand exit guard on the final hand holder.
  applyFaceDownPrivacyRuntime(game);

  // Reapply after the animation widgets exist. This installs the free-area recycle behavior and
  // the animated recycle-to-draw-pile routines for both host and approved-player operations.
  applyRecycleZoneRuntimeFixes(game);

  // Runtime routines are attached after the base prototype's normalizer has run.
  return normalizeGeneratedRoutines(game);
}

export function createUniversalPrototype(catalog: AssetCatalog): GameFile {
  return installFinalRuntime(createBaseUniversalPrototype(catalog), catalog);
}

export const createFourPlayerPrototype = createUniversalPrototype;
