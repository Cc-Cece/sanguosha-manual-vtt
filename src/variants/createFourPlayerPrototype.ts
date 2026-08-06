import { animatedQuickShuffleRoutine, animatedShuffleRecycleZoneRoutine } from '../routines/animatedShuffle.js';
import { applyRecycleZoneRuntimeFixes } from '../routines/recycleZoneRuntime.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { createShuffleAnimationWidgets } from '../widgets/shuffleAnimation.js';
import { createUniversalPrototype as createBaseUniversalPrototype } from './createUniversalPrototype.js';

function installShuffleAnimation(game: GameFile, catalog: AssetCatalog): GameFile {
  // The base prototype already applies these fixes during finalization. Reapply them defensively
  // before installing animation wrappers so alternate builders cannot reintroduce legacy routines.
  applyRecycleZoneRuntimeFixes(game);

  for (const animationWidget of createShuffleAnimationWidgets(catalog.backs)) {
    game[animationWidget.id] = animationWidget;
  }

  const quickShuffleButton = game['quick-shuffle-btn'] as Widget | undefined;
  if (quickShuffleButton) quickShuffleButton.clickRoutine = animatedQuickShuffleRoutine;

  const recycleShuffleButton = game['recycle-shuffle-btn'] as Widget | undefined;
  if (recycleShuffleButton) recycleShuffleButton.clickRoutine = animatedShuffleRecycleZoneRoutine;

  return game;
}

export function createUniversalPrototype(catalog: AssetCatalog): GameFile {
  return installShuffleAnimation(createBaseUniversalPrototype(catalog), catalog);
}

export const createFourPlayerPrototype = createUniversalPrototype;
