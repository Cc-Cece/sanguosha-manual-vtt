import type { ReserveModel } from '../types/reserveLibrary.js';
import type { Widget } from '../types/vtt.js';
import { createUpdateReserveSummaryRoutine } from '../routines/reserveCardRoutines.js';
import {
  createCleanupReturnedPendingCardsRoutine,
  createFullTableReserveResetRoutine,
  createImportToReserveTrayRoutine,
  createRestoreReservedCardsRoutine,
} from '../routines/reserveImportRoutines.js';
import {
  createOpenReservePanelRoutine,
  createSafeCloseReservePanelRoutine,
} from '../routines/reserveNavigation.js';
import { widget } from './factory.js';

export function createReservePanelController(model: ReserveModel): Widget {
  const initialView = model.views.find(view => view.key === 'general:gen-all');
  if (!initialView) throw new Error('Missing all-generals reserve view');
  const safeCloseRoutine = createSafeCloseReservePanelRoutine(model);
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
    closePanelRoutine: safeCloseRoutine,
    safeClosePanelRoutine: safeCloseRoutine,
    syncAndCloseRoutine: createImportToReserveTrayRoutine(model),
    restoreReservedCardsRoutine: createRestoreReservedCardsRoutine(model),
    cleanupReturnedPendingCardsRoutine: createCleanupReturnedPendingCardsRoutine(model),
    fullTableResetRoutine: createFullTableReserveResetRoutine(model),
  });
}
