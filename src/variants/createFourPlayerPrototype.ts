import { animatedQuickShuffleRoutine, animatedShuffleRecycleZoneRoutine } from '../routines/animatedShuffle.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { createShuffleAnimationWidgets } from '../widgets/shuffleAnimation.js';
import { createUniversalPrototype as createBaseUniversalPrototype } from './createUniversalPrototype.js';

function installShuffleAnimation(game: GameFile): GameFile {
  for (const animationWidget of createShuffleAnimationWidgets()) {
    game[animationWidget.id] = animationWidget;
  }

  const quickShuffleButton = game['quick-shuffle-btn'] as Widget | undefined;
  if (quickShuffleButton) quickShuffleButton.clickRoutine = animatedQuickShuffleRoutine;

  const recycleShuffleButton = game['recycle-shuffle-btn'] as Widget | undefined;
  if (recycleShuffleButton) recycleShuffleButton.clickRoutine = animatedShuffleRecycleZoneRoutine;

  return game;
}

export function createUniversalPrototype(catalog: AssetCatalog): GameFile {
  return installShuffleAnimation(createBaseUniversalPrototype(catalog));
}

export const createFourPlayerPrototype = createUniversalPrototype;
