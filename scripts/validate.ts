import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { validatePrototype } from '../src/validation/validate.js';
// The sibling upstream checkout is a required read-only reference in this workspace.
// @ts-expect-error Upstream intentionally ships this validator without TypeScript declarations.
import { validateGameFile } from '../../virtualtabletop/validator/validate_gamefile.js';

const errors = validatePrototype(createFourPlayerPrototype());
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const upstreamProblems = validateGameFile(createFourPlayerPrototype(), true) as unknown[];
  if (upstreamProblems.length) {
    console.error(JSON.stringify(upstreamProblems, null, 2));
    process.exitCode = 1;
  } else {
    console.log('Project and upstream VirtualTabletop validation passed.');
  }
}
