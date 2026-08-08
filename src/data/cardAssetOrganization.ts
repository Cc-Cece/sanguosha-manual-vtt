import type { AssetCatalog, CardAsset } from '../types/assets.js';
import {
  resolveBackOptimizedFile,
  resolveCardAssetFromIndex,
} from './cardAssetIndex.js';

export function organizeCardAsset(asset: CardAsset): CardAsset {
  const resolved = resolveCardAssetFromIndex(asset);
  return {
    ...asset,
    subCategory: resolved.subCategory,
    optimizedFile: resolved.optimizedFile,
    label: resolved.label,
  };
}

export function organizeAssetCatalog(catalog: AssetCatalog): AssetCatalog {
  return {
    ...catalog,
    sourceRoot: 'assets/cards-webp',
    assets: catalog.assets.map(organizeCardAsset),
    backAssets: catalog.backAssets.map(back => ({
      ...back,
      optimizedFile: resolveBackOptimizedFile(back.optimizedFile),
    })),
  };
}
