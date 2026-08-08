import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import type { AssetCatalog } from '../src/types/assets.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { validatePrototype } from '../src/validation/validate.js';

const catalog = JSON.parse(await readFile(resolve('temp', 'asset-catalog.json'), 'utf8')) as AssetCatalog;
const game = createFourPlayerPrototype(catalog);
const errors = validatePrototype(game);
if (errors.length) throw new Error(errors.join('\n'));

const zip = new JSZip();
const packagedAssets = new Set<string>();
const usedAssets = catalog.assets.filter(asset => asset.category !== 'markers-and-reference');

for (const asset of usedAssets) {
  if (packagedAssets.has(asset.asset)) continue;
  packagedAssets.add(asset.asset);
  zip.file(`assets/${asset.optimizedFile}`, await readFile(resolve('temp', 'optimized-assets', asset.optimizedFile)));
}

if (catalog.backAssets) {
  for (const back of catalog.backAssets) {
    if (packagedAssets.has(back.asset)) continue;
    packagedAssets.add(back.asset);
    zip.file(`assets/${back.optimizedFile}`, await readFile(resolve('temp', 'optimized-assets', back.optimizedFile)));
  }
}

try {
  let coverBuf: Buffer;
  try {
    coverBuf = await readFile(resolve('temp', 'optimized-assets', 'other', 'Cover.webp'));
  } catch (e) {
    coverBuf = await readFile(resolve('assets', 'cards-webp', 'other', 'Cover.webp'));
  }
  // Keep the VTT-internal cover path stable while the repository uses the semantic filename.
  zip.file('assets/other/cover.webp', coverBuf);
} catch (e) {
  console.warn('Warning: Could not add assets/other/cover.webp to zip:', e);
}

zip.file('0.json', JSON.stringify(game, null, 2));

const output = resolve('dist', 'Sanguosha-Manual-4-12P.vtt');
const outputLegacy = resolve('dist', 'Sanguosha-Manual-4P-Prototype.vtt');
await mkdir(resolve('dist'), { recursive: true });
const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
await writeFile(output, buffer);
await writeFile(outputLegacy, buffer);
console.log(`Built ${output} with 0.json (image: ${game._meta?.info?.image}), ${usedAssets.length} asset cards and ${packagedAssets.size} unique assets.`);
