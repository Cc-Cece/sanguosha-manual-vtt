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
    expect(asset.label).not.toMatch(/^(武将牌|基本牌|扩展牌|其他牌|体力牌)\s+\d+$/);
    // Semantic filenames allow PascalCase, digits, underscore, slash, hyphen.
    expect(asset.optimizedFile).toMatch(/^[A-Za-z0-9/_-]+\.webp$/);
    expect(asset.optimizedFile).not.toContain('\\');
    expect(optimizedFiles.has(asset.optimizedFile)).toBe(false);
    optimizedFiles.add(asset.optimizedFile);
  }

  expect(catalog.backs).toBeDefined();
  expect(catalog.backs.generals).toMatch(/^\/assets\/-?\d+_\d+$/);
  expect(catalog.backs.identities).toMatch(/^\/assets\/-?\d+_\d+$/);
  expect(catalog.backs.main).toMatch(/^\/assets\/-?\d+_\d+$/);

  for (const back of catalog.backAssets) {
    expect(back.optimizedFile).toMatch(/^other\/Back_[A-Za-z]+\.webp$/);
  }
});

it('uses readable Chinese labels for sample generals and playing cards', () => {
  const catalog = loadTestCatalog();
  const byCardId = new Map(catalog.assets.map(asset => [asset.cardId, asset]));

  expect(byCardId.get(11500)?.label).toBe('典韦');
  expect(byCardId.get(12300)?.optimizedFile).toBe('playing-cards/basic/Equip_S_2_IceSword.webp');
  expect(byCardId.get(12300)?.label).toContain('寒冰剑');

  const lord = catalog.assets.find(asset => asset.category === 'identities' && asset.sequence === 83);
  expect(lord?.label).toBe('主公');
  expect(lord?.optimizedFile).toBe('identity-cards/Role_Lord.webp');
});
