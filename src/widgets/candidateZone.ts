import type { Widget } from '../types/vtt.js';
import { assembleGeneralDeckRoutine, sendGeneralsToMainTableRoutine } from '../routines/deckAssembly.js';
import { clearCandidatesRoutine } from '../routines/libraryReset.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createCandidateWidgets(): Widget[] {
  return [
    label('candidate-title', '⭐ 本局武将候选区｜自由排列・比较・确认构成', 2460, 42, 600),
    freeZone('general-candidate-zone', '⭐ 武将候选区｜从牌库选出的本局候选武将（保持正面）', 2460, 75, 620, 240),
    widget('assemble-generals-btn', 'button', { x: 3100, y: 75, width: 140, height: 38, text: '📦 盖回洗牌合成',
      color: '#2b5746', css: { fontSize: '13px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleGeneralDeckRoutine }),
    pileZone('final-general-deck-zone', '🎴 编组武将牌堆', 3100, 125, 140, 190),
    widget('send-generals-btn', 'button', { x: 3100, y: 325, width: 140, height: 38, text: '🚀 送入主游戏桌',
      color: '#74322b', css: { fontSize: '13px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendGeneralsToMainTableRoutine }),

    label('excluded-title', '🚫 排除区 & 暂存区', 2460, 335, 600),
    freeZone('general-excluded-zone', '🚫 排除区（本轮不参与）', 2460, 365, 300, 160),
    freeZone('general-staging-zone', '📥 暂存区（待定选人）', 2780, 365, 300, 160),
    widget('clear-candidates-btn', 'button', { x: 2460, y: 535, width: 140, height: 32, text: '🧹 清空候选归位',
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: clearCandidatesRoutine }),
  ];
}
