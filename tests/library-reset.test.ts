import { describe, expect, it } from 'vitest';
import { clearCandidatesRoutine, resetDeckbuildingTableRoutine } from '../src/routines/libraryReset.js';

describe('reserve reset compatibility routines', () => {
  it('delegates reset to the reserve panel controller', () => {
    expect(JSON.stringify(clearCandidatesRoutine)).toContain('fullTableResetRoutine');
    expect(JSON.stringify(resetDeckbuildingTableRoutine)).toContain('fullTableResetRoutine');
  });

  it('does not reference removed candidate and final-deck holders', () => {
    const serialized = JSON.stringify([clearCandidatesRoutine, resetDeckbuildingTableRoutine]);
    expect(serialized).not.toContain('general-candidate-zone');
    expect(serialized).not.toContain('final-general-deck-zone');
    expect(serialized).not.toContain('final-identity-deck-zone');
  });
});
