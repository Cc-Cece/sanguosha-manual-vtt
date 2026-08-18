import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import JSZip from 'jszip';
import { vttAssetId } from '../src/data/vttAssetUrl.js';

const vttPath = process.argv[2] ?? 'dist/Sanguosha-Manual-4-12P.vtt';
const outDir = process.argv[3] ?? 'temp/vtt-library/Sanguosha-Manual';
const tag = process.env.SANGUOSHA_LIBRARY_TAG;

const zip = await JSZip.loadAsync(await readFile(vttPath));
const jsonFile = zip.file('0.json');
if (!jsonFile) throw new Error(`${vttPath} has no 0.json`);

const game = JSON.parse(await jsonFile.async('string')) as {
  _meta?: { info?: { attribution?: string } };
};

if (tag && game._meta?.info) {
  const line = `货架同步：sanguosha-manual-vtt ${tag}`;
  const current = game._meta.info.attribution ?? '';
  if (!current.includes(line)) {
    game._meta.info.attribution = current ? `${current}\n${line}` : line;
  }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(join(outDir, 'assets'), { recursive: true });
await writeFile(join(outDir, '0.json'), `${JSON.stringify(game, null, 2)}\n`);

let assets = 0;
for (const [name, file] of Object.entries(zip.files)) {
  if (file.dir) continue;
  const normalized = name.replaceAll('\\', '/');
  if (!normalized.replace(/^\//, '').startsWith('assets/')) continue;
  const buf = await file.async('nodebuffer');
  await writeFile(join(outDir, 'assets', vttAssetId(buf)), buf);
  assets += 1;
}

console.log(`Exported ${outDir} (${assets} assets) from ${vttPath}${tag ? ` [${tag}]` : ''}.`);
