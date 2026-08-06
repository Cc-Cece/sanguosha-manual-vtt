import type { CardAsset, GeneralAssetSubCategory } from '../types/assets.js';
import type { ReserveCategory, ReserveCardMetadata, ReserveLibraryType } from '../types/reserveLibrary.js';

interface CategoryBlueprint {
  id: string;
  label: string;
  order: number;
  libraryType: ReserveLibraryType;
  subCategory?: GeneralAssetSubCategory;
}

export const GENERAL_CATEGORY_BLUEPRINTS: readonly CategoryBlueprint[] = [
  { id: 'gen-std', label: '标准包', order: 1, libraryType: 'general', subCategory: 'standard' },
  { id: 'gen-feng', label: '风包', order: 2, libraryType: 'general', subCategory: 'wind' },
  { id: 'gen-huo', label: '火包', order: 3, libraryType: 'general', subCategory: 'fire' },
  { id: 'gen-lin', label: '林包', order: 4, libraryType: 'general', subCategory: 'forest' },
  { id: 'gen-shan', label: '山包', order: 5, libraryType: 'general', subCategory: 'mountain' },
  { id: 'gen-yijiang', label: '一将成名', order: 6, libraryType: 'general', subCategory: 'fame' },
  { id: 'gen-sp', label: 'SP 武将', order: 7, libraryType: 'general', subCategory: 'sp' },
  { id: 'gen-other', label: '其他扩展', order: 8, libraryType: 'general', subCategory: 'other-expansions' },
] as const;

export const EXTRA_CATEGORY_BLUEPRINTS: readonly CategoryBlueprint[] = [
  { id: 'extra-all', label: '全部扩展牌', order: 1, libraryType: 'extra' },
] as const;

const generalBlueprintBySubCategory = new Map(
  GENERAL_CATEGORY_BLUEPRINTS.map(category => [category.subCategory, category] as const),
);

export function buildReserveCategories(assets: CardAsset[]): ReserveCategory[] {
  const generalAssets = assets.filter(asset => asset.category === 'generals');
  const extraCount = assets.filter(asset => asset.category === 'gameplay-extra').length;

  const actualGeneralCategories = GENERAL_CATEGORY_BLUEPRINTS
    .map(category => ({
      id: category.id,
      label: category.label,
      order: category.order,
      libraryType: category.libraryType,
      count: generalAssets.filter(asset => asset.subCategory === category.subCategory).length,
    }))
    .filter(category => category.count > 0);

  return [
    { id: 'gen-all', label: '全部武将', order: 0, libraryType: 'general', count: generalAssets.length },
    ...actualGeneralCategories,
    { id: 'extra-all', label: '全部扩展牌', order: 0, libraryType: 'extra', count: extraCount },
  ];
}

export function buildGeneralMetadataList(assets: CardAsset[]): Omit<ReserveCardMetadata, 'homePageId' | 'homeRowId' | 'homeIndex'>[] {
  return assets
    .filter(asset => asset.category === 'generals')
    .sort((a, b) => a.sequence - b.sequence)
    .map((asset, index) => {
      const category = generalBlueprintBySubCategory.get(asset.subCategory as GeneralAssetSubCategory);
      if (!category) throw new Error(`Unsupported general sub-category: ${asset.subCategory}`);
      return {
        assetId: asset.id,
        sequence: asset.sequence,
        cardWidgetId: `card-${asset.sequence}`,
        libraryType: 'general' as const,
        categoryId: category.id,
        categoryLabel: category.label,
        categoryOrder: category.order,
        cardLabel: asset.label,
        cardOrder: index,
        defaultSelected: true,
      };
    });
}

export function buildExtraMetadataList(assets: CardAsset[]): Omit<ReserveCardMetadata, 'homePageId' | 'homeRowId' | 'homeIndex'>[] {
  return assets
    .filter(asset => asset.category === 'gameplay-extra')
    .sort((a, b) => a.sequence - b.sequence)
    .map((asset, index) => ({
      assetId: asset.id,
      sequence: asset.sequence,
      cardWidgetId: `card-${asset.sequence}`,
      libraryType: 'extra' as const,
      categoryId: 'extra-all',
      categoryLabel: '全部扩展牌',
      categoryOrder: 1,
      cardLabel: asset.label,
      cardOrder: index,
      defaultSelected: true,
    }));
}
