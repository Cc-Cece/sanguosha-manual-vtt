import { describe, expect, it } from 'vitest';
import { clearCandidatesRoutine, resetDeckbuildingTableRoutine } from '../src/routines/libraryReset.js';

describe('library reset routines', () => {
  it('validates clearCandidatesRoutine recalls candidate and excluded zones to general-reserve', () => {
    const serialized = JSON.stringify(clearCandidatesRoutine);
    expect(serialized).toContain('general-candidate-zone');
    expect(serialized).toContain('general-excluded-zone');
    expect(serialized).toContain('general-staging-zone');
    expect(serialized).toContain('general-reserve');
  });

  it('validates resetDeckbuildingTableRoutine confirms and recalls deckbuilding zones to reserve holders', () => {
    const serialized = JSON.stringify(resetDeckbuildingTableRoutine);
    expect(serialized).toContain('重置编组桌？');
    expect(serialized).toContain('general-reserve');
    expect(serialized).toContain('identity-reserve');
    expect(serialized).toContain('final-general-deck-zone');
  });
});
