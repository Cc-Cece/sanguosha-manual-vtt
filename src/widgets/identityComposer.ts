import type { Widget } from '../types/vtt.js';
import { assembleIdentityDeckRoutine, sendIdentitiesToMainTableRoutine } from '../routines/deckAssembly.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createIdentityComposerWidgets(): Widget[] {
  const parent = 'library-tray';
  return [
    label('identity-composer-title', '👑 身份牌构成区｜人工抽取所需身份放入下区核对', 15, 555, 500, parent, { display: false }),
    freeZone('identity-composer-zone', '👑 本局身份构成区｜取出各模式身份牌（主/忠/反/内）放入此区', 15, 585, 500, 280, parent, { display: false }),
    widget('assemble-identities-btn', 'button', { parent, x: 535, y: 600, width: 140, height: 38, text: '📦 盖回洗牌合成', display: false,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleIdentityDeckRoutine }),
    pileZone('final-identity-deck-zone', '🎴 编组身份牌堆', 535, 650, 140, 160, parent, { display: false }),
    widget('send-identities-btn', 'button', { parent, x: 535, y: 825, width: 140, height: 38, text: '🚀 送入主游戏桌', display: false,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendIdentitiesToMainTableRoutine }),
  ];
}
