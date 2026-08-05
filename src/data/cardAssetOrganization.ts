import { posix } from 'node:path';
import type { AssetCatalog, AssetSubCategory, CardAsset } from '../types/assets.js';

const generalPackageByDeckId: Partial<Record<number, AssetSubCategory>> = {
  114: 'forest',
  115: 'fire',
  116: 'mountain',
  117: 'fame',
  120: 'fame',
  135: 'wind',
  136: 'fame',
  155: 'sp',
  156: 'sp',
};

const identityNamesBySequence: Record<number, string> = {
  74: 'role_renegade_01.webp',
  75: 'role_renegade_02.webp',
  76: 'role_rebel_01.webp',
  77: 'role_rebel_02.webp',
  78: 'role_rebel_03.webp',
  79: 'role_rebel_04.webp',
  80: 'role_loyalist_01.webp',
  81: 'role_loyalist_02.webp',
  82: 'role_loyalist_03.webp',
  83: 'role_lord.webp',
};

const identityLabelsBySequence: Record<number, string> = {
  74: '内奸 1',
  75: '内奸 2',
  76: '反贼 1',
  77: '反贼 2',
  78: '反贼 3',
  79: '反贼 4',
  80: '忠臣 1',
  81: '忠臣 2',
  82: '忠臣 3',
  83: '主公',
};

export function organizeCardAsset(asset: CardAsset): CardAsset {
  if (asset.category === 'generals') {
    const subCategory = generalPackageByDeckId[Math.floor(asset.cardId / 100)] ?? 'other-expansions';
    const prefix = subCategory === 'other-expansions' ? 'other' : subCategory;
    return {
      ...asset,
      subCategory,
      optimizedFile: posix.join('generals', subCategory, `${prefix}_${asset.cardId}.webp`),
      label: `武将牌 ${asset.cardId}`,
    };
  }

  if (asset.category === 'gameplay-standard-junzheng-160') {
    return {
      ...asset,
      subCategory: 'basic',
      optimizedFile: posix.join('playing-cards', 'basic', `basic_${asset.cardId}.webp`),
      label: `基本牌 ${asset.cardId}`,
    };
  }

  if (asset.category === 'gameplay-extra') {
    return {
      ...asset,
      subCategory: 'expansions',
      optimizedFile: posix.join('playing-cards', 'expansions', `expansion_${asset.cardId}.webp`),
      label: `扩展牌 ${asset.cardId}`,
    };
  }

  if (asset.category === 'identities') {
    const fileName = identityNamesBySequence[asset.sequence];
    if (!fileName) throw new Error(`Missing identity naming rule for sequence ${asset.sequence}`);
    return {
      ...asset,
      subCategory: 'identity',
      optimizedFile: posix.join('identity-cards', fileName),
      label: identityLabelsBySequence[asset.sequence],
    };
  }

  if (asset.category === 'markers-and-reference') {
    if (asset.sequence >= 84 && asset.sequence <= 95) {
      return {
        ...asset,
        subCategory: 'health',
        optimizedFile: posix.join('health-cards', `hp_${asset.cardId}.webp`),
        label: `体力牌 ${asset.cardId}`,
      };
    }
    return {
      ...asset,
      subCategory: 'other',
      optimizedFile: posix.join('other', `other_${asset.cardId}.webp`),
      label: `其他牌 ${asset.cardId}`,
    };
  }

  throw new Error(`Unsupported asset category: ${asset.category}`);
}

export function organizeAssetCatalog(catalog: AssetCatalog): AssetCatalog {
  return {
    ...catalog,
    sourceRoot: 'assets/cards-webp',
    assets: catalog.assets.map(organizeCardAsset),
    backAssets: catalog.backAssets.map(back => ({
      ...back,
      optimizedFile: back.optimizedFile.replaceAll('\\', '/'),
    })),
  };
}
