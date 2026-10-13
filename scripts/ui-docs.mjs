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
const glSrc = readFileSync(join(root, 'src/elements/gl.js'), 'utf8');
const PAL = Object.fromEntries(PALETTES.map(p => [p, glSrc.match(new RegExp(`\\b${p}: \\[([^\\]]+)\\]`))[1].match(/#\w+/g)]));

const VERSION = '0.6';
const CDN = `https://cdn.jsdelivr.net/npm/piixpal@${VERSION}`;
const START = [['index', 'Introduction'], ['showcase', 'Showcase'], ['installation', 'Installation'], ['looks', 'Looks'], ['palettes', 'Palettes']];
const bySection = SECTIONS.map(s => [s, UI.filter(u => u.section === s)]);
const ORDER = [...START.map(([s]) => s), ...bySection.flatMap(([, l]) => l.map(u => u.slug))];
const nameOf = s => (START.find(x => x[0] === s) || [])[1] || UI.find(u => u.slug === s).name;
const href = s => s === 'index' ? './' : s + '.html';

/* ---------- layout ---------- */
const sidebar = active => `<aside class="side ui-side" aria-label="Pixel UI">
    <input class="side-find" type="search" placeholder="Find a component…" aria-label="Find a component">
    <h4>Get started</h4>
    <nav class="side-start">${START.map(([s, n]) => `<a href="${href(s)}"${s === active ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
    ${bySection.map(([sec, list]) => `<details class="sg" open>
      <summary><a href="./#${slug(sec)}">${sec}</a><span class="n">${list.length}</span></summary>
      ${list.map(u => `<a href="${u.slug}.html"${u.slug === active ? ' aria-current="page"' : ''}>${esc(u.name)}</a>`).join('')}
    </details>`).join('\n    ')}
    <p class="side-none" hidden>Nothing by that name.</p>
  </aside>`;

