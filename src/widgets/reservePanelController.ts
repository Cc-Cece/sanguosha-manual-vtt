import type { ReserveModel } from '../types/reserveLibrary.js';
import type { Widget } from '../types/vtt.js';
import { createUpdateReserveSummaryRoutine } from '../routines/reserveCardRoutines.js';
import { createFullTableReserveResetRoutine, createRestoreReservedCardsRoutine } from '../routines/reserveImportRoutines.js';
import { createCloseReservePanelRoutine, createOpenReservePanelRoutine } from '../routines/reserveNavigation.js';
import { widget } from './factory.js';

export function createReservePanelController(model: ReserveModel): Widget {
  const initialView = model.views.find(view => view.key === 'general:gen-all');
  if (!initialView) throw new Error('Missing all-generals reserve view');
  return widget('reserve-panel-controller', 'basic', {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    display: false,
    movable: false,
    activeTab: 'general',
    activeCategoryId: 'gen-all',
    activeViewKey: initialView.key,
    currentPage: 1,
    pageCount: initialView.pageIds.length,
    draftState: 'editing',
    updateSummaryRoutine: createUpdateReserveSummaryRoutine(model),
    openPanelRoutine: createOpenReservePanelRoutine(model),
    closePanelRoutine: createCloseReservePanelRoutine(model),
    restoreReservedCardsRoutine: createRestoreReservedCardsRoutine(model),
    fullTableResetRoutine: createFullTableReserveResetRoutine(model),
  });
}
