import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const parent = resolve(root, '..');

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true, () => false);
}

describe('project initialization', () => {
  it('contains the required root files', async () => {
    const files = ['.gitignore', 'AGENTS.md', 'README.md', 'LICENSE', 'package.json', 'tsconfig.json'];
    await expect(Promise.all(files.map((file) => exists(resolve(root, file))))).resolves.toEqual(files.map(() => true));
  });

  it('contains the required top-level directories', async () => {
    const directories = ['src', 'assets', 'scripts', 'tests', 'docs', 'dist'];
    await expect(Promise.all(directories.map((directory) => exists(resolve(root, directory))))).resolves.toEqual(directories.map(() => true));
  });

  it('finds both read-only upstream references in the parent directory', async () => {
    await expect(exists(resolve(parent, 'noname-main'))).resolves.toBe(true);
    await expect(exists(resolve(parent, 'virtualtabletop'))).resolves.toBe(true);
  });

  it('does not contain internal copies of either upstream repository', async () => {
    await expect(exists(resolve(root, 'noname-main'))).resolves.toBe(false);
    await expect(exists(resolve(root, 'virtualtabletop'))).resolves.toBe(false);
  });
});

