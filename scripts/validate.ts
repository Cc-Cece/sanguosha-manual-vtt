import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { AssetCatalog } from '../src/types/assets.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { validatePrototype } from '../src/validation/validate.js';
// The sibling upstream checkout is a required read-only reference in this workspace.
// @ts-expect-error Upstream intentionally ships this validator without TypeScript declarations.
import { validateGameFile } from '../../virtualtabletop/validator/validate_gamefile.js';

const catalog = JSON.parse(await readFile(resolve('temp', 'asset-catalog.json'), 'utf8')) as AssetCatalog;
const game = createFourPlayerPrototype(catalog);
const errors = validatePrototype(game);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const upstreamProblems = validateGameFile(game, true) as unknown[];
  if (upstreamProblems.length) {
    console.error(JSON.stringify(upstreamProblems, null, 2));
    process.exitCode = 1;
  } else console.log('Project and upstream VirtualTabletop validation passed.');
}
