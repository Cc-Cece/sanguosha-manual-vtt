import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { validatePrototype } from '../src/validation/validate.js';

const game = createFourPlayerPrototype();
const errors = validatePrototype(game);
if (errors.length) throw new Error(errors.join('\n'));
const zip = new JSZip();
zip.file('0.json', JSON.stringify(game, null, 2));
const output = resolve('dist', 'Sanguosha-Manual-4P-Prototype.vtt');
await mkdir(resolve('dist'), { recursive: true });
await writeFile(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(`Built ${output} (0.json only).`);
