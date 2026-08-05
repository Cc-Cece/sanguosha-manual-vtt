import { spawn } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import type { AssetCatalog, AssetCategory, CardAsset } from '../src/types/assets.js';

const sourceRoot = resolve('..', 'tabletop-simulator-reference', '3765935052', 'cleaned-and-classified-cards');
const outputRoot = resolve('temp', 'optimized-assets');
const catalogPath = resolve('temp', 'asset-catalog.json');
const categories: AssetCategory[] = ['gameplay-standard-junzheng-160', 'gameplay-extra', 'generals', 'identities', 'markers-and-reference'];

type SourceItem = { sequence: number; cardId: number; classification: AssetCategory; cleanedFile: string; cleanedDimensions: string };

function crc32(buffer: Buffer): number {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) | 0;
}

function runFfmpeg(source: string, target: string): Promise<void> {
  return new Promise((accept, reject) => {
    const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-vf', "scale='min(480,iw)':-2", '-c:v', 'libwebp', '-quality', '82', target], { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += String(chunk); });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? accept() : reject(new Error(`ffmpeg failed for ${source}: ${stderr}`)));
  });
}

async function concurrent<T>(items: T[], limit: number, task: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (cursor < items.length) await task(items[cursor++]);
  }));
}

await mkdir(outputRoot, { recursive: true });
const manifest = JSON.parse(await readFile(resolve(sourceRoot, 'manifest.json'), 'utf8')) as SourceItem[];
const selected = manifest.filter(item => categories.includes(item.classification));

await concurrent(selected, 6, async item => {
  const target = resolve(outputRoot, `${String(item.sequence).padStart(4, '0')}.webp`);
  try { await stat(target); } catch {
    const relative = item.cleanedFile.replace(/^cleaned-and-classified-cards[\\/]/, '');
    await runFfmpeg(resolve(sourceRoot, relative), target);
  }
});

const assets: CardAsset[] = [];
for (const item of selected) {
  const optimizedFile = `${String(item.sequence).padStart(4, '0')}.webp`;
  const data = await readFile(resolve(outputRoot, optimizedFile));
  const [width, height] = item.cleanedDimensions.split('x').map(Number);
  const sourceName = basename(item.cleanedFile);
  const label = sourceName.replace(/^\d+-[a-f0-9]+-\d+-/, '').replace(/\.png$/i, '').replace(/-unnamed$/, '') || `${item.classification} ${item.sequence}`;
  assets.push({ id: `asset-${item.sequence}`, sequence: item.sequence, cardId: item.cardId, category: item.classification,
    source: item.cleanedFile.replaceAll('\\', '/'), optimizedFile, asset: `/assets/${crc32(data)}_${data.length}`, bytes: data.length, width, height, label });
}
const backDefinitions = [
  { key: 'generals' as const, file: '014_i.imgur.com_v4N5Crs.jpg', optimizedFile: 'back-generals.webp' },
  { key: 'identities' as const, file: '009_i.imgur.com_ONX2QEr.jpg', optimizedFile: 'back-identities.webp' },
  { key: 'main' as const, file: '008_i.imgur.com_Gej0gnH.jpg', optimizedFile: 'back-main.webp' },
];

const otherRoot = resolve('temp', 'other');

const backAssets: { key: 'generals' | 'identities' | 'main'; file: string; optimizedFile: string; asset: string; bytes: number }[] = [];
for (const back of backDefinitions) {
  const sourcePath = resolve(otherRoot, back.file);
  const targetPath = resolve(outputRoot, back.optimizedFile);
  try { await stat(targetPath); } catch {
    await runFfmpeg(sourcePath, targetPath);
  }
  const data = await readFile(targetPath);
  const asset = `/assets/${crc32(data)}_${data.length}`;
  backAssets.push({ key: back.key, file: back.file, optimizedFile: back.optimizedFile, asset, bytes: data.length });
}

const backs = {
  generals: backAssets.find(b => b.key === 'generals')!.asset,
  identities: backAssets.find(b => b.key === 'identities')!.asset,
  main: backAssets.find(b => b.key === 'main')!.asset,
};

const catalog: AssetCatalog = {
  sourceRoot: sourceRoot.replaceAll('\\', '/'),
  generatedAt: new Date().toISOString(),
  assets,
  backs,
  backAssets,
};
await writeFile(catalogPath, JSON.stringify(catalog, null, 2));
console.log(`Prepared ${assets.length} card faces and 3 custom card backs (${Math.round(assets.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024)} MiB).`);
