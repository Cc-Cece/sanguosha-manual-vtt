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
zip.file('0.json', JSON.stringify(game, null, 2));
const packagedAssets = new Set<string>();
const usedAssets = catalog.assets.filter(asset => asset.category !== 'markers-and-reference');
for (const asset of usedAssets) {
  if (packagedAssets.has(asset.asset)) continue;
  packagedAssets.add(asset.asset);
  zip.file(`assets/${asset.optimizedFile}`, await readFile(resolve('temp', 'optimized-assets', asset.optimizedFile)));
}
const output = resolve('dist', 'Sanguosha-Manual-4P-Prototype.vtt');
await mkdir(resolve('dist'), { recursive: true });
await writeFile(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(`Built ${output} with 0.json, ${usedAssets.length} asset cards and ${packagedAssets.size} unique face assets.`);
