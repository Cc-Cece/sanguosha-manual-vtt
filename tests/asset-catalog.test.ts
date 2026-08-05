import { expect, it } from 'vitest';
import { loadTestCatalog } from './helpers.js';

it('includes all classified faces with traceable sources and VTT asset hashes', () => {
  const catalog = loadTestCatalog();
  expect(catalog.assets.length).toBeGreaterThan(500);
  for (const asset of catalog.assets) {
    expect(asset.source).toContain(`cleaned-and-classified-cards/${asset.category}/`);
    expect(asset.asset).toMatch(/^\/assets\/-?\d+_\d+$/);
    expect(asset.bytes).toBeLessThan(10 * 1024 * 1024);
  }
  expect(catalog.backs).toBeDefined();
  expect(catalog.backs.generals).toMatch(/^\/assets\/-?\d+_\d+$/);
  expect(catalog.backs.identities).toMatch(/^\/assets\/-?\d+_\d+$/);
  expect(catalog.backs.main).toMatch(/^\/assets\/-?\d+_\d+$/);
});
