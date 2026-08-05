import type { CardAsset } from '../types/assets.js';

export interface ReserveSubCategory {
  id: string;
  name: string;
  category: 'generals' | 'extra';
  filter: (asset: CardAsset) => boolean;
}

export const GENERAL_SUB_CATEGORIES: ReserveSubCategory[] = [
  { id: 'gen-all', name: '全部武将', category: 'generals', filter: () => true },
  { id: 'gen-std', name: '标准包 (25)', category: 'generals', filter: a => a.sequence >= 1 && a.sequence <= 25 },
  { id: 'gen-feng', name: '风包 (8)', category: 'generals', filter: a => a.sequence >= 26 && a.sequence <= 33 },
  { id: 'gen-huo', name: '火包 (8)', category: 'generals', filter: a => a.sequence >= 34 && a.sequence <= 41 },
  { id: 'gen-lin', name: '林包 (8)', category: 'generals', filter: a => a.sequence >= 42 && a.sequence <= 49 },
  { id: 'gen-shan', name: '山包 (8)', category: 'generals', filter: a => a.sequence >= 50 && a.sequence <= 57 },
  { id: 'gen-yijiang', name: '一将成名 (11)', category: 'generals', filter: a => a.sequence >= 58 && a.sequence <= 68 },
  { id: 'gen-sp', name: 'SP 武将包 (15)', category: 'generals', filter: a => a.sequence >= 69 && a.sequence <= 83 },
  { id: 'gen-other', name: '其他扩展武将', category: 'generals', filter: a => a.sequence >= 84 },
];

export const EXTRA_SUB_CATEGORIES: ReserveSubCategory[] = [
  { id: 'extra-all', name: '全部附加牌', category: 'extra', filter: () => true },
  { id: 'extra-equip', name: '装备类附加牌', category: 'extra', filter: a => a.label.includes('剑') || a.label.includes('刀') || a.label.includes('马') || a.label.includes('甲') || a.label.includes('弓') || a.label.includes('枪') || a.label.includes('斧') || a.label.includes('盾') },
  { id: 'extra-trick', name: '锦囊类附加牌', category: 'extra', filter: a => a.label.includes('锦') || a.label.includes('策') || a.label.includes('书') || a.label.includes('图') },
  { id: 'extra-special', name: '特殊与模式牌', category: 'extra', filter: a => !a.label.includes('剑') && !a.label.includes('刀') && !a.label.includes('马') && !a.label.includes('甲') && !a.label.includes('弓') && !a.label.includes('枪') && !a.label.includes('斧') && !a.label.includes('盾') && !a.label.includes('锦') && !a.label.includes('策') },
];
