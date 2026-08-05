import type { Widget } from '../types/vtt.js';
import { assembleGeneralDeckRoutine, sendGeneralsToMainTableRoutine } from '../routines/deckAssembly.js';
import { clearCandidatesRoutine } from '../routines/libraryReset.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createCandidateWidgets(): Widget[] {
  return [
    label('candidate-title', '⭐ 本局武将候选区｜自由排列・比较・确认构成', 2020, 75, 420),
    freeZone('general-candidate-zone', '⭐ 武将候选区｜从牌库选出的本局候选武将（保持正面）', 2020, 105, 280, 240),
    widget('assemble-generals-btn', 'button', { x: 2315, y: 105, width: 125, height: 38, text: '📦 盖回洗牌合成',
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleGeneralDeckRoutine }),
    pileZone('final-general-deck-zone', '🎴 编组武将牌堆', 2315, 155, 125, 140),
    widget('send-generals-btn', 'button', { x: 2315, y: 305, width: 125, height: 38, text: '🚀 送入主游戏桌',
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendGeneralsToMainTableRoutine }),

    label('excluded-title', '🚫 排除区 & 暂存区', 2020, 355, 420),
    freeZone('general-excluded-zone', '🚫 排除区（本轮不参与）', 2020, 385, 205, 160),
    freeZone('general-staging-zone', '📥 暂存区（待定选人）', 2235, 385, 205, 160),
    widget('clear-candidates-btn', 'button', { x: 2020, y: 555, width: 135, height: 32, text: '🧹 清空候选归位',
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: clearCandidatesRoutine }),
  ];
}
