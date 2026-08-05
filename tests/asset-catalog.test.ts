import { expect, it } from 'vitest';
import { loadTestCatalog } from './helpers.js';

it('includes all classified faces with stable names, traceable sources and VTT asset hashes', () => {
  const catalog = loadTestCatalog();
  expect(catalog.assets.length).toBeGreaterThan(500);

  const optimizedFiles = new Set<string>();
  for (const asset of catalog.assets) {
    expect(asset.source).toContain(`cleaned-and-classified-cards/${asset.category}/`);
    expect(asset.asset).toMatch(/^\/assets\/-?\d+_\d+$/);
    expect(asset.bytes).toBeLessThan(10 * 1024 * 1024);
    expect(asset.subCategory).toBeTruthy();
    expect(asset.label).not.toBe('unnamed');
    expect(asset.optimizedFile).toMatch(/^[a-z0-9/_-]+\.webp$/);
    expect(asset.optimizedFile).not.toContain('\\');
    expect(optimizedFiles.has(asset.optimizedFile)).toBe(false);
    optimizedFiles.add(asset.optimizedFile);
  }

  expect(catalog.backs).toBeDefined();
  expect(catalog.backs.generals).toMatch(/^\/assets\/-?\d+_\d+$/);
  expect(catalog.backs.identities).toMatch(/^\/assets\/-?\d+_\d+$/);
  expect(catalog.backs.main).toMatch(/^\/assets\/-?\d+_\d+$/);
});
