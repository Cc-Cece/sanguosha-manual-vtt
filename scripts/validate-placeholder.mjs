import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const requiredPaths = [
  '.gitignore',
  'AGENTS.md',
  'README.md',
  'LICENSE',
  'package.json',
  'tsconfig.json',
  'docs',
  'src',
  'assets',
  'scripts',
  'tests',
  'temp',
  'dist',
];

await Promise.all(requiredPaths.map((entry) => access(resolve(process.cwd(), entry))));
console.log('Initialization structure is valid.');

