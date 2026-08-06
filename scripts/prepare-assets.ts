import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { organizeAssetCatalog } from '../src/data/cardAssetOrganization.js';
import type { AssetCatalog } from '../src/types/assets.js';

const webpRepoRoot = resolve('assets', 'cards-webp');
const outputRoot = resolve('temp', 'optimized-assets');
const catalogPath = resolve('temp', 'asset-catalog.json');

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const repoCatalogPath = resolve(webpRepoRoot, 'catalog.json');
try {
  await stat(repoCatalogPath);
  const catalogData = await readFile(repoCatalogPath, 'utf8');
  const catalog = organizeAssetCatalog(JSON.parse(catalogData) as AssetCatalog);

  for (const asset of catalog.assets) {
    const destPath = resolve(outputRoot, asset.optimizedFile);
    await mkdir(resolve(destPath, '..'), { recursive: true });
    await copyFile(resolve(webpRepoRoot, asset.optimizedFile), destPath);
  }
  for (const back of catalog.backAssets) {
    const destPath = resolve(outputRoot, back.optimizedFile);
    await mkdir(resolve(destPath, '..'), { recursive: true });
    await copyFile(resolve(webpRepoRoot, back.optimizedFile), destPath);
  }

  const coverSrc = resolve(webpRepoRoot, 'other', 'cover.webp');
  try {
    await mkdir(resolve(outputRoot, 'other'), { recursive: true });
    await copyFile(coverSrc, resolve(outputRoot, 'other', 'cover.webp'));
  } catch (e) {}

  await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Loaded ${catalog.assets.length} card faces and ${catalog.backAssets.length} card backs directly from repository assets/cards-webp.`);
} catch (err) {
  console.error('Failed to load assets/cards-webp:', err);
  process.exitCode = 1;
}
