import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import { expect, it } from 'vitest';
import { vttAssetId, vttAssetUrl } from '../src/data/vttAssetUrl.js';

it('matches VirtualTabletop zip asset ids used after upload', async () => {
  const bytes = readFileSync(resolve('assets', 'cards-webp', 'other', 'Cover.webp'));
  const zip = new JSZip();
  zip.file('assets/cover.webp', bytes);
  const generated = await zip.generateAsync({ type: 'uint8array' });
  const loaded = await JSZip.loadAsync(generated);
  const internal = (loaded.file('assets/cover.webp') as { _data: { crc32: number; uncompressedSize: number } })._data;

  expect(vttAssetId(bytes)).toBe(`${internal.crc32}_${internal.uncompressedSize}`);
  expect(vttAssetUrl(bytes)).toBe(`/assets/${internal.crc32}_${internal.uncompressedSize}`);
});
