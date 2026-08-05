import type { Widget } from '../types/vtt.js';
import { assembleExtraDeckRoutine, assembleIdentityDeckRoutine, sendIdentitiesToMainTableRoutine } from '../routines/deckAssembly.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createIdentityComposerWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    label('identity-composer-title', '👑 身份牌构成区｜人工抽取所需身份放入下区核对', 15, 580, 620, parent, { display: false }),
    freeZone('identity-composer-zone', '👑 本局身份构成区｜取出各模式身份牌（主/忠/反/内）放入此区', 15, 610, 620, 210, parent, { display: false }),
    widget('assemble-identities-btn', 'button', { parent, x: 655, y: 610, width: 140, height: 38, text: '📦 盖回洗牌合成', display: false,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleIdentityDeckRoutine }),
    pileZone('final-identity-deck-zone', '🎴 备用身份牌堆', 655, 660, 140, 160, parent, { display: false }),
    widget('send-identities-btn', 'button', { parent, x: 655, y: 835, width: 140, height: 38, text: '🚀 送入主桌身份位', display: false,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendIdentitiesToMainTableRoutine }),

    label('extra-composer-title', '🗡️ 扩展牌 & 玩法牌构成分组区', 815, 580, 560, parent, { display: false }),
    freeZone('extra-card-composer-zone', '🗡️ 扩展/玩法牌构成区｜挑拣放入本局需追加的扩展玩法牌', 815, 610, 400, 210, parent, { display: false }),
    widget('assemble-extras-btn', 'button', { parent, x: 1230, y: 610, width: 145, height: 38, text: '📦 盖回洗牌合成', display: false,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleExtraDeckRoutine }),
    pileZone('final-extra-deck-zone', '🎴 备用扩展牌堆', 1230, 660, 145, 160, parent, { display: false }),
  ];
}
