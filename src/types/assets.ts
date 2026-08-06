export type AssetCategory = 'gameplay-standard-junzheng-160' | 'gameplay-extra' | 'generals' | 'identities' | 'markers-and-reference';

export type GeneralAssetSubCategory =
  | 'standard'
  | 'wind'
  | 'fire'
  | 'forest'
  | 'mountain'
  | 'fame'
  | 'sp'
  | 'other-expansions';

export type AssetSubCategory = GeneralAssetSubCategory | 'basic' | 'expansions' | 'identity' | 'health' | 'other';

export interface CardAsset {
  id: string;
  sequence: number;
  cardId: number;
  category: AssetCategory;
  subCategory?: AssetSubCategory;
  source: string;
  optimizedFile: string;
  asset: string;
  bytes: number;
  width: number;
  height: number;
  label: string;
}

export interface AssetCatalog {
  sourceRoot: string;
  generatedAt: string;
  assets: CardAsset[];
  backs: {
    generals: string;
    identities: string;
    main: string;
  };
  backAssets: {
    file: string;
    optimizedFile: string;
    asset: string;
    bytes: number;
  }[];
}
