import type { Widget } from '../types/vtt.js';
import { assembleExtraDeckRoutine, assembleIdentityDeckRoutine, sendIdentitiesToMainTableRoutine } from '../routines/deckAssembly.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createIdentityComposerWidgets(): Widget[] {
  return [];
}
