import type { Widget } from '../types/vtt.js';
import { assembleGeneralDeckRoutine, sendGeneralsToMainTableRoutine } from '../routines/deckAssembly.js';
import { clearCandidatesRoutine } from '../routines/libraryReset.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createCandidateWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    label('candidate-title', '⭐ 本局武将候选区｜自由排列・比较・确认构成', 715, 65, 770, parent, { display: false, layer: 101 }),
    freeZone('general-candidate-zone', '⭐ 武将候选区｜从全集库选出的本局候选武将（保持正面）', 715, 95, 580, 270, parent, { display: false, layer: 101 }),
    widget('assemble-generals-btn', 'button', { parent, x: 1315, y: 95, width: 165, height: 38, text: '📦 盖回洗牌合成', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleGeneralDeckRoutine }),
    pileZone('final-general-deck-zone', '🎴 备用武将牌堆', 1315, 145, 165, 160, parent, { display: false, layer: 101 }),
    widget('send-generals-btn', 'button', { parent, x: 1315, y: 315, width: 165, height: 38, text: '🚀 送入主桌备牌位', display: false, layer: 101,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendGeneralsToMainTableRoutine }),

    label('excluded-title', '🚫 排除区 & 暂存区', 715, 375, 770, parent, { display: false, layer: 101 }),
    freeZone('general-excluded-zone', '🚫 排除区（本轮不参与）', 715, 405, 370, 160, parent, { display: false, layer: 101 }),
    freeZone('general-staging-zone', '📥 暂存区（待定选人）', 1110, 405, 370, 160, parent, { display: false, layer: 101 }),
    widget('clear-candidates-btn', 'button', { parent, x: 715, y: 575, width: 140, height: 32, text: '🧹 清空候选归位', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: clearCandidatesRoutine }),
  ];
}
