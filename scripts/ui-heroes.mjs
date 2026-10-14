// Pixel UI docs: ready-made 3D hero sections. Each one is a <piix-fx> plus a small layout you copy.
const H = [
  ["hero-visor","Visor hero","visor","A silhouette behind hammered glass with a glowing orange visor.","<section class=\"hx hx-visor\">\n  <piix-fx kind=\"visor\" fill></piix-fx>\n  <p class=\"hx-k\">Collection 04 · Anonymous</p>\n  <h1>Seen through<br>the glass.</h1>\n</section>"],
  ["hero-hood","Hooded figure hero","hood","An orange poster: a hooded figure behind glass, with a clear window that follows the pointer.","<section class=\"hx hx-hood\">\n  <piix-fx kind=\"hood\" fill></piix-fx>\n  <p class=\"hx-k\">Made by you</p>\n  <h1>Look closer.</h1>\n</section>"],
  ["hero-bust","Burning bust hero","bust","A carved bust in profile with iridescent flames rising from its head.","<section class=\"hx hx-bust\">\n  <piix-fx kind=\"bust\" fill></piix-fx>\n  <h1>Ideas that<br><i>catch fire.</i></h1>\n  <p class=\"hx-k\">Conference · 2026</p>\n</section>"],
  ["hero-ghost","Motion blur hero","ghost","A profile in violet haze, trailing light as it moves.","<section class=\"hx hx-ghost\">\n  <piix-fx kind=\"ghost\" fill></piix-fx>\n  <p class=\"hx-k\">New single</p>\n  <h1>Afterimage</h1>\n</section>"],
  ["hero-codehead","Code portrait hero","codehead","A profile built from rows of glitching colour glyphs.","<section class=\"hx hx-code\">\n  <piix-fx kind=\"codehead\" fill></piix-fx>\n  <h1>ONE FLAIR<br>DESIGN.</h1>\n</section>"],
  ['hero-laser', 'Laser hero', 'beam', 'Lasers strike a rocky peak; the headline sits in the haze above.',
`<section class="hx hx-laser">
  <piix-fx kind="beam" fill></piix-fx>
  <p class="hx-k">Live · 12.09 · Berlin</p>
  <h1>Strike<br>the summit.</h1>
  <piix-glow-button palette="fire" size="lg">Get tickets</piix-glow-button>
</section>`],
  ['hero-disc', 'Disc hero', 'disc', 'A spinning rainbow disc beside the title, for music and launches.',
`<section class="hx hx-disc">
  <div class="hx-copy">
    <p class="hx-k">New album · out Friday</p>
    <h1>Spectrum</h1>
    <p>Eleven songs, pressed on light.</p>
    <piix-glow-button look="chrome">Pre-save</piix-glow-button>
  </div>
  <piix-fx kind="disc" bg="none"></piix-fx>
</section>`],
  ['hero-flame', 'Flame hero', 'flame', 'Soft fire rising behind a big serif statement.',
`<section class="hx hx-flame">
  <piix-fx kind="flame" fill></piix-fx>
  <h1><i>Burn</i> the<br>old playbook.</h1>
  <p class="hx-k">A studio for loud ideas</p>
</section>`],
  ['hero-keycap', 'Glass keycap hero', 'glass', 'A glass keycap splitting light, with the title set huge on black.',
`<section class="hx hx-key">
  <piix-fx kind="glass" bg="none"></piix-fx>
  <h1>Escape<br><b>the ordinary.</b></h1>
  <piix-glow-button look="chrome">Pre-order</piix-glow-button>
</section>`],
  ['hero-podium', 'Podium hero', 'podium', 'A stone slab in a spotlight, with thin wide-spaced type above.',
`<section class="hx hx-pod">
  <piix-fx kind="podium" fill></piix-fx>
  <h1>MONOLITH</h1>
  <p class="hx-k">Edition of 300</p>
</section>`],
  ['hero-orb', 'Orb hero', 'orb', 'A breathing orb with an input underneath: an AI product hero.',
`<section class="hx hx-orb">
  <piix-fx kind="orb"></piix-fx>
  <h1>Meet Nova.</h1>
  <piix-input look="glass" placeholder="Ask anything…">Ask</piix-input>
</section>`],
  ['hero-ink', 'Ink hero', 'ink', 'Marbled red ink behind editorial serif type.',
`<section class="hx hx-ink">
  <piix-fx kind="ink" fill></piix-fx>
  <h1>We make things<br>that <i>burn</i> bright.</h1>
</section>`],
  ['hero-portrait', 'Frosted portrait hero', 'image', 'A photo behind hammered glass with a clear window, beside the title.',
`<section class="hx hx-por">
  <piix-image-fx src="portrait.jpg" effect="frosted" alt="A portrait behind glass"></piix-image-fx>
  <div class="hx-copy"><p class="hx-k">Autumn · Winter</p><h1>Seen,<br>not shown.</h1></div>
</section>`]
];
export const HERO_CSS = `.hx{position:relative;min-height:520px;overflow:hidden;color:#fff;font-family:"Bricolage Grotesque",system-ui,sans-serif;display:grid;align-content:end;justify-items:start;gap:18px;padding:56px;box-sizing:border-box}
.hx h1{position:relative;margin:0;font-size:clamp(44px,7vw,96px);font-weight:800;letter-spacing:-.05em;line-height:.88}
.hx p{position:relative;margin:0}
.hx-k{font:400 12px/1 "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;opacity:.75}
.hx-laser{background:#050100;align-content:start;padding-top:70px}
.hx-laser h1{text-shadow:0 0 40px rgba(255,77,0,.6)}
.hx-disc{background:#000;grid-template-columns:1fr 1fr;align-items:center;align-content:center}
.hx-disc piix-fx{height:460px}
.hx-flame{background:#03040a;justify-items:center;text-align:center;align-content:center}
.hx-flame h1,.hx-ink h1{font:400 clamp(52px,8vw,120px)/.86 "Instrument Serif",serif;letter-spacing:-.03em}
.hx-flame i,.hx-ink i{color:#ff4d2e}
.hx-key{background:#000}
.hx-key piix-fx{position:absolute;inset:0 0 10% 35%;width:auto;height:auto}
.hx-key h1{font-weight:300}
.hx-pod{background:#050506;align-content:start;justify-items:center;text-align:center}
.hx-pod h1{font-weight:200;letter-spacing:.24em;padding-left:.24em}
.hx-orb{background:radial-gradient(ellipse at 50% 30%,#1d1452,#04030a 65%);justify-items:center;text-align:center;align-content:center;gap:10px}
.hx-orb piix-fx{height:300px;width:100%}
.hx-orb piix-input{width:min(460px,100%)}
.hx-por{background:#e4e2df;color:#111;grid-template-columns:1fr 1fr;align-items:center;align-content:center;padding:0}
.hx-por piix-image-fx{height:520px}
.hx-por .hx-copy{padding:40px}
@media (max-width:760px){.hx-disc,.hx-por{grid-template-columns:1fr}}`;
const page = ([slug, name, fx, brief, demo]) => ({
  slug, name, section: 'Hero sections', tag: fx === 'image' ? 'piix-image-fx' : 'piix-fx', file: fx === 'image' ? 'image-fx' : 'fx', brief,
  about: 'A complete hero section: a moving 3D layer and a layout around it. Copy the markup and the CSS, swap the words, and it is yours. Every hero answers the pointer.',
  demo: demo.replace('src="portrait.jpg"', 'src="../site/pixelui-launch-poster.jpg"'),
  code: `${demo}\n\n<style>\n${HERO_CSS.split('\n').filter(l => l.startsWith('.hx{') || l.startsWith('.hx h1') || l.startsWith('.hx p') || l.startsWith('.hx-k') || l.includes('.' + demo.match(/class="hx (hx-\w+)"/)[1])).join('\n')}\n</style>`,
  stage: { pad: 0, block: true, h: 520 },
  a11y: ['The words are real HTML headings and paragraphs.', 'The 3D layer is decoration, or described for screen readers when it carries meaning.', 'With reduced motion everything holds still.']
});
export const HERO_PAGES = H.map(page);

/* ---------- your own image, brought to life: <piix-hero image="…"> ---------- */
const IMGH = [
  ['beam', 'Laser image hero', 'Your still of lasers on rock, alive: the beams flicker and bloom, heat rises off the peak.', 'New drop', 'Strike the summit.'],
  ['disc', 'Disc image hero', 'A product shot of a disc, alive: the rainbow blooms and breathes, the whole shot drifts in depth.', 'Out Friday', 'Spectrum'],
  ['flame', 'Fire image hero', 'A photo of fire, alive: the flames flicker, heat haze ripples above them.', 'A studio for loud ideas', 'Burn the old playbook.'],
  ['glass', 'Glass image hero', 'A glass object on black, alive: its colours glow and pulse, the light sweeps across.', 'Set 001', 'Escape the ordinary.'],
  ['podium', 'Spotlight image hero', 'A product on a spotlit stone, alive: the camera breathes slowly, grain and light drift.', 'Edition of 300', 'Monolith'],
  ['ink', 'Ink image hero', 'An abstract artwork, alive: depth parallax under the pointer, glowing highlights.', 'Brand · Motion · Web', 'We make things that burn bright.']
];
export const IMAGE_HERO_PAGES = IMGH.map(([k, name, brief, kick, title]) => ({
  slug: 'hero-image-' + k, name, section: 'Hero sections', tag: 'piix-hero', file: 'hero', brief,
  about: 'Give <code>&lt;piix-hero&gt;</code> any picture with <code>image="…"</code> and it keeps the picture exactly as it is, but brings it to life on the GPU: brighter parts sit nearer and shift with the pointer, glowing areas breathe and bloom, heat haze ripples over the hottest parts, the camera breathes slowly and a soft light sweeps across. Same effect on its own: <code>&lt;piix-image-fx effect="alive"&gt;</code>.',
  demo: `<piix-hero image="../site/heroes/${k}.jpg" height="520px">\n  <p class="eyebrow">${kick}</p>\n  <h1>${title}</h1>\n  <piix-glow-button look="chrome">Find out more</piix-glow-button>\n</piix-hero>`,
  code: `<piix-hero image="your-picture.jpg">\n  <p class="eyebrow">${kick}</p>\n  <h1>${title}</h1>\n  <piix-glow-button look="chrome">Find out more</piix-glow-button>\n</piix-hero>`,
  stage: { pad: 0, block: true, h: 520 },
  props: [['image', 'any picture (on your site, or served with CORS)', ''], ['palette', 'tints the bloom and the light sweep', 'sunset'], ['height', 'any CSS length', 'min(88vh, 780px)'], ['align', '<code>center</code> or <code>left</code>', 'center']],
  a11y: ['The words are real HTML.', 'The moving picture is decoration; describe it in your copy if it matters.', 'With reduced motion the picture holds still.']
}));
