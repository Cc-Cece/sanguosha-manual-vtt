import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AssetCatalog } from '../src/types/assets.js';

let catalog: AssetCatalog | undefined;
export function loadTestCatalog(): AssetCatalog {
  return catalog ??= JSON.parse(readFileSync(resolve('temp', 'asset-catalog.json'), 'utf8')) as AssetCatalog;
}
