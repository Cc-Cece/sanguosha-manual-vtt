import { crc32 } from 'node:zlib';

/** VirtualTabletop stores uploaded files as signed CRC32 + byte length. */
export function vttAssetId(data: Uint8Array): string {
  return `${crc32(data) | 0}_${data.byteLength}`;
}

export function vttAssetUrl(data: Uint8Array): string {
  return `/assets/${vttAssetId(data)}`;
}
