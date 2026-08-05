import { expect, it } from 'vitest';
import { loadTestCatalog } from './helpers.js';

it('includes all classified faces with traceable sources and VTT asset hashes', () => {
  const catalog = loadTestCatalog();
  expect(catalog.assets).toHaveLength(552);
  expect(Object.fromEntries(['gameplay-standard-junzheng-160', 'gameplay-extra', 'generals', 'identities', 'markers-and-reference']
    .map(category => [category, catalog.assets.filter(asset => asset.category === category).length]))).toEqual({
      'gameplay-standard-junzheng-160': 160, 'gameplay-extra': 31, generals: 315, identities: 10, 'markers-and-reference': 36,
    });
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
