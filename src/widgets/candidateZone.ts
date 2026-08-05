import type { Widget } from '../types/vtt.js';
import { assembleGeneralDeckRoutine, sendGeneralsToMainTableRoutine } from '../routines/deckAssembly.js';
import { clearCandidatesRoutine } from '../routines/libraryReset.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createCandidateWidgets(): Widget[] {
  return [];
}
