import { IDENTITIES } from '../data/placeholders.js';
import { PLAYER_MODULES } from '../layouts/table.js';
import { safeSeatClickRoutine } from '../routines/seatSafety.js';
import type { Widget } from '../types/vtt.js';
import { cardBack, label, textCardFace, widget, zone } from './factory.js';

export function createPlayerModule(index: number): Widget[] {
  const number = index + 1;
  const moduleId = `player-module-${number}`;
  const seatId = `seat-${number}`;
  const handId = `hand-${number}`;
  const identityHolderId = `identity-private-${number}`;
  const position = PLAYER_MODULES[index];
  return [
    widget(moduleId, 'basic', { ...position, layer: 0, movable: true, color: '#10251fdd',
      css: { border: '3px solid #80683e', borderRadius: '12px', boxShadow: '0 4px 12px #0008' },
    }),
    widget(seatId, 'seat', { parent: moduleId, x: 10, y: 10, width: 112, height: 40, color: '#6a2420',
      clickRoutine: safeSeatClickRoutine }),
    label(`player-label-${number}`, `玩家 ${number} 模块`, 130, 16, 215, moduleId),
    zone(`general-zone-${number}`, '武将区', 10, 60, 90, 126, moduleId),
    widget(`health-${number}`, 'basic', { parent: moduleId, x: 110, y: 60, width: 150, height: 126, enlarge: 1.8,
      faces: [textCardFace('体力牌', '手动放置标记\n1  2  3  4  5', '#d9aa88')], movable: true }),
    widget(`identity-cover-${number}`, 'basic', { parent: moduleId, x: 270, y: 60, width: 80, height: 112,
      faces: [cardBack('身份牌')], movable: false, enlarge: 2.2 }),
    widget(identityHolderId, 'holder', { parent: moduleId, x: 270, y: 60, width: 80, height: 112,
      onlyVisibleForSeat: [seatId], linkedToSeat: [seatId], alignChildren: true, childrenPerOwner: true,
      preventPiles: true, dropTarget: true, css: { border: '2px solid #d3b16b', borderRadius: '7px' } }),
    widget(`identity-${number}`, 'card', { parent: identityHolderId, deck: 'identity-deck', cardType: `identity-${number}`,
      activeFace: 1 }),
    widget(handId, 'holder', { parent: moduleId, x: 360, y: 10, width: 145, height: 176, text: '私密手牌',
      onlyVisibleForSeat: [seatId], linkedToSeat: [seatId], childrenPerOwner: true, alignChildren: true,
      stackOffsetX: 17, stackOffsetY: 1, preventPiles: false, dropTarget: true, color: '#23372dcc', textColor: '#f2ddae',
      css: { border: '2px solid #d1ad64', borderRadius: '9px' } }),
    zone(`equipment-${number}`, '装备区', 10, 205, 150, 75, moduleId),
    zone(`judgment-${number}`, '判定区', 170, 205, 150, 75, moduleId),
    zone(`attachment-${number}`, '附加牌区', 330, 205, 175, 75, moduleId),
  ];
}
