import type { CardAsset, GeneralAssetSubCategory } from '../types/assets.js';
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
  { id: 'extra-all', label: '全部扩展牌', order: 0, libraryType: 'extra' },
];

const categoryBySubCategory: Record<GeneralAssetSubCategory, { id: string; label: string }> = {
  standard: { id: 'gen-std', label: '标准包' },
  wind: { id: 'gen-feng', label: '风包' },
  fire: { id: 'gen-huo', label: '火包' },
  forest: { id: 'gen-lin', label: '林包' },
  mountain: { id: 'gen-shan', label: '山包' },
  fame: { id: 'gen-yijiang', label: '一将成名' },
  sp: { id: 'gen-sp', label: 'SP 武将包' },
  'other-expansions': { id: 'gen-other', label: '其他扩展武将' },
};

export function buildGeneralMetadataList(assets: CardAsset[]): ReserveCardMetadata[] {
  return assets
    .filter(asset => asset.category === 'generals')
    .map(asset => {
      const category = categoryBySubCategory[asset.subCategory as GeneralAssetSubCategory];
      if (!category) throw new Error(`Unsupported general sub-category: ${asset.subCategory}`);
      return {
        sequence: asset.sequence,
        cardWidgetId: `card-${asset.sequence}`,
        libraryType: 'general',
        categoryId: category.id,
        categoryLabel: category.label,
        cardLabel: asset.label,
        defaultSelected: true,
      };
    });
}

export function buildExtraMetadataList(assets: CardAsset[]): ReserveCardMetadata[] {
  return assets
    .filter(asset => asset.category === 'gameplay-extra')
    .map(asset => ({
      sequence: asset.sequence,
      cardWidgetId: `card-${asset.sequence}`,
      libraryType: 'extra',
      categoryId: 'extra-all',
      categoryLabel: '全部扩展牌',
      cardLabel: asset.label,
      defaultSelected: true,
    }));
}
