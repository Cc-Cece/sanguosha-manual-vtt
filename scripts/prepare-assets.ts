import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { AssetCatalog } from '../src/types/assets.js';

const webpRepoRoot = resolve('assets', 'cards-webp');
const outputRoot = resolve('temp', 'optimized-assets');
const catalogPath = resolve('temp', 'asset-catalog.json');

await mkdir(outputRoot, { recursive: true });

const repoCatalogPath = resolve(webpRepoRoot, 'catalog.json');
try {
  await stat(repoCatalogPath);
  const catalogData = await readFile(repoCatalogPath, 'utf8');
  const catalog = JSON.parse(catalogData) as AssetCatalog;

  for (const asset of catalog.assets) {
    await copyFile(resolve(webpRepoRoot, asset.optimizedFile), resolve(outputRoot, asset.optimizedFile));
  }
  for (const back of catalog.backAssets) {
    await copyFile(resolve(webpRepoRoot, back.optimizedFile), resolve(outputRoot, back.optimizedFile));
  }

  await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Loaded ${catalog.assets.length} card faces and ${catalog.backAssets.length} card backs directly from repository assets/cards-webp.`);
} catch (err) {
  console.error('Failed to load assets/cards-webp:', err);
  process.exitCode = 1;
}
