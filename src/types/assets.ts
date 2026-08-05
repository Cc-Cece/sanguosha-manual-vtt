export type AssetCategory = 'gameplay-standard-junzheng-160' | 'gameplay-extra' | 'generals' | 'identities' | 'markers-and-reference';

export interface CardAsset {
  id: string;
  sequence: number;
  cardId: number;
  category: AssetCategory;
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
}
