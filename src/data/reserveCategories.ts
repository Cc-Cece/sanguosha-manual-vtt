import type { CardAsset, GeneralAssetSubCategory } from '../types/assets.js';

export interface ReserveSubCategory {
  id: string;
  name: string;
  category: 'generals' | 'extra';
  filter: (asset: CardAsset) => boolean;
}

const generalFilter = (subCategory: GeneralAssetSubCategory) => (asset: CardAsset): boolean =>
  asset.category === 'generals' && asset.subCategory === subCategory;

export const GENERAL_SUB_CATEGORIES: ReserveSubCategory[] = [
  { id: 'gen-all', name: '全部武将', category: 'generals', filter: asset => asset.category === 'generals' },
  { id: 'gen-std', name: '标准包', category: 'generals', filter: generalFilter('standard') },
  { id: 'gen-feng', name: '风包', category: 'generals', filter: generalFilter('wind') },
  { id: 'gen-huo', name: '火包', category: 'generals', filter: generalFilter('fire') },
  { id: 'gen-lin', name: '林包', category: 'generals', filter: generalFilter('forest') },
  { id: 'gen-shan', name: '山包', category: 'generals', filter: generalFilter('mountain') },
  { id: 'gen-yijiang', name: '一将成名', category: 'generals', filter: generalFilter('fame') },
  { id: 'gen-sp', name: 'SP 武将包', category: 'generals', filter: generalFilter('sp') },
  { id: 'gen-other', name: '其他扩展武将', category: 'generals', filter: generalFilter('other-expansions') },
];

export const EXTRA_SUB_CATEGORIES: ReserveSubCategory[] = [
  { id: 'extra-all', name: '全部扩展牌', category: 'extra', filter: asset => asset.category === 'gameplay-extra' },
];
