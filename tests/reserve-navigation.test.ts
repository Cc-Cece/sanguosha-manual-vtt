import { describe, expect, it } from 'vitest';
import { selectExtrasTabRoutine, selectGeneralsTabRoutine, switchGenAllRoutine, switchGenStdRoutine } from '../src/routines/reserveRoutines.js';
import { toggleLibraryTrayRoutine } from '../src/routines/tableActions.js';

describe('reserve panel navigation and page display routines', () => {
  it('validates toggleLibraryTrayRoutine displays ONLY gen-page-1 when opening drawer', () => {
    const elseRoutine = toggleLibraryTrayRoutine[0].elseRoutine;
    const routineJson = JSON.stringify(elseRoutine);

    expect(routineJson).toContain('gen-page-1');
    const setGenPage1 = elseRoutine.find(step => step.func === 'SET' && (step.collection as readonly string[])?.includes('gen-page-1') && step.value === true);
    expect(setGenPage1).toBeDefined();

    const setGenPage2False = elseRoutine.find(step => step.func === 'SET' && (step.collection as readonly string[])?.includes('gen-page-2') && step.value === false);
    expect(setGenPage2False).toBeDefined();
  });

  it('ensures tab and sub-category switching routines do NOT contain INPUT popups', () => {
    const routines = [selectGeneralsTabRoutine, selectExtrasTabRoutine, switchGenAllRoutine, switchGenStdRoutine];
    for (const routine of routines) {
      const routineJson = JSON.stringify(routine);
      expect(routineJson).not.toContain('"func":"INPUT"');
    }
  });
});
