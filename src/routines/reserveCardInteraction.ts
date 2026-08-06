import type { ReserveLibraryType } from '../types/reserveLibrary.js';
import type { RoutineStep } from '../types/vtt.js';
import { hostOnlyRoutine, selectedCss, unselectedCss } from './reserveCardRoutines.js';

const routineSteps = (...steps: RoutineStep[]): RoutineStep[] => steps;

/**
 * Reserve cards use one durable click routine across their whole lifecycle:
 * - draft: player 1 toggles Allow/Ban (or selected/unselected)
 * - reserved: the tray keeps the card non-clickable
 * - in-use: any player can use the card's normal face cycle
 */
export function createReserveCardClickRoutine(libraryType: ReserveLibraryType): RoutineStep[] {
  const toggleDraftSelection = hostOnlyRoutine(routineSteps(
    {
      func: 'IF',
      operand1: '${PROPERTY reserveSelected}',
      relation: '==',
      operand2: true,
      thenRoutine: routineSteps(
        { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: false },
        { func: 'SET', collection: 'thisButton', property: 'reserveVisualState', value: 'unselected' },
        { func: 'SET', collection: 'thisButton', property: 'css', value: unselectedCss(libraryType) },
      ),
      elseRoutine: routineSteps(
        { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: true },
        { func: 'SET', collection: 'thisButton', property: 'reserveVisualState', value: 'selected' },
        { func: 'SET', collection: 'thisButton', property: 'css', value: selectedCss(libraryType) },
      ),
    },
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
  ));

  return routineSteps({
    func: 'IF',
    operand1: '${PROPERTY reserveState}',
    relation: '==',
    operand2: 'draft',
    thenRoutine: toggleDraftSelection,
    elseRoutine: routineSteps({
      func: 'IF',
      operand1: '${PROPERTY reserveState}',
      relation: '==',
      operand2: 'in-use',
      thenRoutine: routineSteps({ func: 'FLIP', collection: 'thisButton' }),
    }),
  });
}
