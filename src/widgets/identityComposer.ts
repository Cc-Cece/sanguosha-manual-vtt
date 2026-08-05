import type { Widget } from '../types/vtt.js';
import { assembleExtraDeckRoutine, assembleIdentityDeckRoutine, sendIdentitiesToMainTableRoutine } from '../routines/deckAssembly.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createIdentityComposerWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    label('identity-composer-title', '👑 身份牌构成区 (☑️主 ☑️忠2 ☑️反4 ☑️内2)', 15, 595, 680, parent, { display: false, layer: 101 }),
    freeZone('identity-composer-zone', '👑 本局身份构成区｜取出各模式身份牌（主/忠/反/内）放入此区', 15, 625, 680, 220, parent, { display: false, layer: 101 }),
    widget('assemble-identities-btn', 'button', { parent, x: 715, y: 625, width: 140, height: 38, text: '📦 盖回洗牌合成', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleIdentityDeckRoutine }),
    pileZone('final-identity-deck-zone', '🎴 备用身份牌堆', 715, 675, 140, 170, parent, { display: false, layer: 101 }),
    widget('send-identities-btn', 'button', { parent, x: 715, y: 855, width: 140, height: 38, text: '🚀 送入主桌身份位', display: false, layer: 101,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendIdentitiesToMainTableRoutine }),

    label('extra-composer-title', '🗡️ 游戏主牌 & 扩展牌 (☑️标准104 ☑️军争52 ☑️勾玉卡)', 880, 595, 600, parent, { display: false, layer: 101 }),
    freeZone('extra-card-composer-zone', '🗡️ 扩展/主牌构成区｜挑选勾选放入本局追加的游戏扩展牌', 880, 625, 440, 220, parent, { display: false, layer: 101 }),
    widget('assemble-extras-btn', 'button', { parent, x: 1340, y: 625, width: 140, height: 38, text: '📦 盖回洗牌合成', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleExtraDeckRoutine }),
    pileZone('final-extra-deck-zone', '🎴 备用扩展/主牌堆', 1340, 675, 140, 170, parent, { display: false, layer: 101 }),
  ];
}
