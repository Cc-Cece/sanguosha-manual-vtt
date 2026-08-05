import { describe, expect, it } from 'vitest';
import { selectExtrasTabRoutine, selectGeneralsTabRoutine, switchGenAllRoutine, switchGenStdRoutine } from '../src/routines/reserveRoutines.js';
import { toggleLibraryTrayRoutine } from '../src/routines/tableActions.js';

describe('reserve panel navigation and page display routines', () => {
  it('validates toggleLibraryTrayRoutine displays ONLY active page holder when opening drawer', () => {
    const elseRoutine = toggleLibraryTrayRoutine[0].elseRoutine;
    const routineJson = JSON.stringify(elseRoutine);

    expect(routineJson).toContain('gen-page-std-1');
    const setGenPageStd1 = elseRoutine.find(step => step.func === 'SET' && (step.collection as readonly string[])?.includes('gen-page-std-1') && step.value === true);
    expect(setGenPageStd1).toBeDefined();
  });

  it('ensures tab and sub-category switching routines do NOT contain INPUT popups', () => {
    const routines = [selectGeneralsTabRoutine, selectExtrasTabRoutine, switchGenAllRoutine, switchGenStdRoutine];
    for (const routine of routines) {
      const routineJson = JSON.stringify(routine);
      expect(routineJson).not.toContain('"func":"INPUT"');
    }
  });
});
