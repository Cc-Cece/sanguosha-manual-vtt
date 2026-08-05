import type { Widget } from '../types/vtt.js';
import { assembleGeneralDeckRoutine, sendGeneralsToMainTableRoutine } from '../routines/deckAssembly.js';
import { clearCandidatesRoutine } from '../routines/libraryReset.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createCandidateWidgets(): Widget[] {
  const parent = 'library-tray';
  return [
    label('candidate-title', '⭐ 本局武将候选区｜自由排列・比较・确认构成', 535, 62, 540, parent, { display: false }),
    freeZone('general-candidate-zone', '⭐ 武将候选区｜从牌库选出的本局候选武将（保持正面）', 535, 92, 380, 240, parent, { display: false }),
    widget('assemble-generals-btn', 'button', { parent, x: 935, y: 92, width: 140, height: 38, text: '📦 盖回洗牌合成', display: false,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleGeneralDeckRoutine }),
    pileZone('final-general-deck-zone', '🎴 编组武将牌堆', 935, 142, 140, 140, parent, { display: false }),
    widget('send-generals-btn', 'button', { parent, x: 935, y: 294, width: 140, height: 38, text: '🚀 送入主游戏桌', display: false,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendGeneralsToMainTableRoutine }),

    label('excluded-title', '🚫 排除区 & 暂存区', 535, 345, 540, parent, { display: false }),
    freeZone('general-excluded-zone', '🚫 排除区（本轮不参与）', 535, 375, 260, 165, parent, { display: false }),
    freeZone('general-staging-zone', '📥 暂存区（待定选人）', 815, 375, 260, 165, parent, { display: false }),
    widget('clear-candidates-btn', 'button', { parent, x: 535, y: 550, width: 140, height: 32, text: '🧹 清空候选归位', display: false,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: clearCandidatesRoutine }),
  ];
}
