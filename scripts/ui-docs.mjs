// Generates the Pixel UI docs (ui/*.html): one page per component, grouped into sections,
// like any UI library. The pages come from scripts/ui-data.mjs.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { UI, SECTIONS, PALETTES } from './ui-data.mjs';
import { navBar } from './docs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'ui');
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f.endsWith('.html')) unlinkSync(join(out, f));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* the palette colours, read from the engine so they never drift */
