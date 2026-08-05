import type { Widget } from '../types/vtt.js';
import { assembleIdentityDeckRoutine, sendIdentitiesToMainTableRoutine } from '../routines/deckAssembly.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createIdentityComposerWidgets(): Widget[] {
  return [
    label('identity-composer-title', '👑 身份牌构成区｜人工抽取所需身份放入下区核对', 1940, 580, 500),
    freeZone('identity-composer-zone', '👑 本局身份构成区｜取出各模式身份牌（主/忠/反/内）放入此区', 1940, 615, 620, 200),
    widget('assemble-identities-btn', 'button', { x: 2580, y: 615, width: 140, height: 38, text: '📦 盖回洗牌合成',
      color: '#2b5746', css: { fontSize: '13px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: assembleIdentityDeckRoutine }),
    pileZone('final-identity-deck-zone', '🎴 编组身份牌堆', 2580, 665, 140, 150),
    widget('send-identities-btn', 'button', { x: 2580, y: 825, width: 140, height: 38, text: '🚀 送入主游戏桌',
      color: '#74322b', css: { fontSize: '13px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: sendIdentitiesToMainTableRoutine }),
  ];
}
