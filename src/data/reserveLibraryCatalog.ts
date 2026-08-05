import type { ReserveCategory, ReserveCardMetadata } from '../types/reserveLibrary.js';

export const GENERAL_CATEGORIES: ReserveCategory[] = [
  { id: 'gen-all', label: '全部武将', order: 0, libraryType: 'general' },
  { id: 'gen-std', label: '标准包', order: 1, libraryType: 'general' },
  { id: 'gen-feng', label: '风包', order: 2, libraryType: 'general' },
  { id: 'gen-huo', label: '火包', order: 3, libraryType: 'general' },
  { id: 'gen-lin', label: '林包', order: 4, libraryType: 'general' },
  { id: 'gen-shan', label: '山包', order: 5, libraryType: 'general' },
  { id: 'gen-yijiang', label: '一将成名', order: 6, libraryType: 'general' },
  { id: 'gen-sp', label: 'SP 武将包', order: 7, libraryType: 'general' },
  { id: 'gen-other', label: '其他扩展武将', order: 8, libraryType: 'general' },
];

export const EXTRA_CATEGORIES: ReserveCategory[] = [
  { id: 'extra-all', label: '全部附加牌', order: 0, libraryType: 'extra' },
  { id: 'extra-equip', label: '装备附加牌', order: 1, libraryType: 'extra' },
  { id: 'extra-trick', label: '锦囊附加牌', order: 2, libraryType: 'extra' },
  { id: 'extra-special', label: '特殊模式牌', order: 3, libraryType: 'extra' },
];

export function getGeneralCategoryForSequence(sequence: number): { id: string; label: string } {
  if (sequence >= 1 && sequence <= 25) return { id: 'gen-std', label: '标准包' };
  if (sequence >= 26 && sequence <= 33) return { id: 'gen-feng', label: '风包' };
  if (sequence >= 34 && sequence <= 41) return { id: 'gen-huo', label: '火包' };
  if (sequence >= 42 && sequence <= 49) return { id: 'gen-lin', label: '林包' };
  if (sequence >= 50 && sequence <= 57) return { id: 'gen-shan', label: '山包' };
  if (sequence >= 58 && sequence <= 68) return { id: 'gen-yijiang', label: '一将成名' };
  if (sequence >= 69 && sequence <= 83) return { id: 'gen-sp', label: 'SP 武将包' };
  return { id: 'gen-other', label: '其他扩展武将' };
}

export function buildGeneralMetadataList(totalGenerals = 315): ReserveCardMetadata[] {
  return Array.from({ length: totalGenerals }, (_, i) => {
    const seq = i + 1;
    const cat = getGeneralCategoryForSequence(seq);
    return {
      sequence: seq,
      cardWidgetId: `card-${seq}`,
      libraryType: 'general',
      categoryId: cat.id,
      categoryLabel: cat.label,
      cardLabel: `武将 #${seq}`,
      defaultSelected: true,
    };
  });
}

export function buildExtraMetadataList(totalExtras = 31): ReserveCardMetadata[] {
  return Array.from({ length: totalExtras }, (_, i) => {
    const seq = i + 1;
    const cardWidgetId = `card-${seq + 315}`; // Extra cards sequence offset after 315 generals
    let catId = 'extra-special';
    let catLabel = '特殊模式牌';

    if (seq <= 12) {
      catId = 'extra-equip';
      catLabel = '装备附加牌';
    } else if (seq <= 24) {
      catId = 'extra-trick';
      catLabel = '锦囊附加牌';
    }

    return {
      sequence: seq,
      cardWidgetId,
      libraryType: 'extra',
      categoryId: catId,
      categoryLabel: catLabel,
      cardLabel: `附加牌 #${seq}`,
      defaultSelected: true,
    };
  });
}
