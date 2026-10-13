// Pixel UI: one entry per docs page. scripts/ui-docs.mjs turns these into ui/*.html.
//
//   slug      the page: ui/<slug>.html
//   name      its title
//   tag       the element it's built from
//   file      the single-file build in dist/c (and the @component name)
//   brief     one line, for the sidebar search, the overview grid and the page head
//   about     a paragraph under the preview
//   demo      the main preview's markup (also its code, unless `code` is given)
//   stage     how the preview box looks: { h: px, light, top, pad: px }
//   controls  live controls on the main preview: [attr, label, kind, options]
//             kind: seg (buttons), palette (swatches), range ([min, max, step])
//   examples  [{ name, note, demo, code, stage }]
//   props     [attribute, what it does, default]
//   events    [name, when]
//   a11y      notes on keyboard, screen readers and reduced motion

import { SCENE_PAGES } from './ui-scenes.mjs';

export const PALETTES = ['lime', 'aurora', 'sunset', 'ocean', 'candy', 'violet', 'fire', 'gameboy', 'paper', 'mono'];
const PAL_PROP = (def) => ['palette', `the colours: ${PALETTES.map(p => `<code>${p}</code>`).join(' ')}, or your own, dark to light: <code>"#000,#6b4cff,#fff"</code>`, def];
const PX_PROP = (def) => ['pixel', 'size of one pixel, in px', String(def)];
const TONES = 'lime | coral | violet | sky | sun | mint | ink | paper';

/* ---------- backgrounds: one page per shader kind ---------- */
const BG = [
  ['mesh', 'mesh-gradient', 'Mesh gradient', 'candy', 'Soft colour blobs that drift into each other, the classic SaaS gradient, rebuilt out of pixels.',
    'Four colour fields drift on slow noise and blend into each other, then get dithered down into the palette on a pixel grid. The pointer pulls the nearest blob toward it. Calm enough to sit behind body text.'],
  ['warp', 'warp', 'Marble warp', 'aurora', 'Domain-warped noise that folds over itself like marbled paper.',
    'Noise feeding into noise feeding into noise: the classic domain-warp trick, so the colour bands fold and curl like ink on water. Busy, so it suits short sections and headers more than long reading.'],
  ['aurora', 'aurora', 'Aurora', 'aurora', 'Curtains of light rippling over a night sky.',
    'Long vertical curtains of colour sway and shimmer over a dark sky with a few stars in it. The pointer pushes the curtains aside.'],
  ['crystal', 'crystal', 'Crystal cells', 'violet', 'Glowing crystal cells whose edges catch the light.',
    'Voronoi cells that slowly shift, each lit from inside, with bright seams where they meet. Move the pointer and the nearest cell lights up.'],
  ['liquid', 'liquid-metal', 'Liquid metal', 'mono', 'A chrome surface that ripples like mercury.',
    'A height field shaded like polished metal, with sharp highlights sliding over it. In mono it is pure chrome; in a colour palette it turns into anodised metal.'],
  ['horizon', 'horizon', 'Synthwave horizon', 'sunset', 'A sun setting behind a grid that scrolls toward you forever.',
    'The retro horizon: a striped sun, a glowing perspective grid racing toward you, and haze where they meet. The pointer steers the grid.'],
  ['nebula', 'nebula', 'Nebula', 'candy', 'Deep-space gas clouds with stars twinkling through.',
    'Layered fractal noise as glowing gas, with a starfield behind it. Slow and dark, so it makes a great backdrop for white text.'],
  ['topo', 'topographic', 'Topographic', 'paper', 'Contour lines like a living map.',
    'Height lines from a slowly shifting landscape, drawn as a contour map. In paper it looks like an old survey sheet; in lime it looks like a radar screen.'],
  ['dots', 'dot-matrix', 'Dot matrix', 'lime', 'A field of dots that ripples out from the pointer.',
    'A grid of round dots whose size and colour ride a slow wave, plus a ripple that spreads from wherever the pointer is. Click-free and very calm.'],
  ['fire', 'fire', 'Fire', 'fire', 'Pixel flames licking up from the bottom.',
    'Classic demo-scene fire: turbulent noise rising and cooling as it climbs. Put it at the bottom of a section, or make a whole "hot deals" banner out of it.']
];
const bgPage = ([kind, slug, name, pal, brief, about]) => ({
  slug, name, section: 'Backgrounds', tag: 'piix-shader', file: 'shader', brief, about,
  demo: `<piix-shader kind="${kind}" height="420px"></piix-shader>`,
  stage: { h: 420, pad: 0 },
  controls: [['palette', 'Palette', 'palette', pal], ['pixel', 'Pixel', 'range', [2, 10, 1, 4]], ['dither', 'Dither', 'range', [0, 1, .1, 1]], ['speed', 'Speed', 'range', [0, 3, .25, 1]]],
  examples: [
    { name: 'Behind your content', note: 'With <code>fill</code> it sits behind everything else in the element it\'s in. Give that element <code>position: relative</code> (the shader does this for you if it\'s static).',
      demo: `<section class="ex-fill">\n  <piix-shader kind="${kind}" fill pixel="5"></piix-shader>\n  <h2>Ship it loud</h2>\n  <p>Your content sits on top.</p>\n</section>`, stage: { h: 300, pad: 0 } },
    { name: 'Other palettes', note: 'Every palette works with every background.',
      demo: `<div class="ex-row">\n  <piix-shader kind="${kind}" palette="${pal === 'ocean' ? 'candy' : 'ocean'}" height="180px"></piix-shader>\n  <piix-shader kind="${kind}" palette="${pal === 'gameboy' ? 'sunset' : 'gameboy'}" height="180px"></piix-shader>\n  <piix-shader kind="${kind}" palette="#0b0a10,#3a2a6b,#ff6b4a,#ffe8a8" height="180px"></piix-shader>\n</div>`, stage: { pad: 0 } },
    { name: 'Smooth bands', note: '<code>dither="0"</code> swaps the dither pattern for flat colour bands, like a poster.',
      demo: `<piix-shader kind="${kind}" dither="0" pixel="6" height="220px"></piix-shader>`, stage: { pad: 0 } }
  ],
  props: [
    ['kind', `<code>mesh</code> <code>warp</code> <code>aurora</code> <code>crystal</code> <code>liquid</code> <code>horizon</code> <code>nebula</code> <code>topo</code> <code>dots</code> <code>fire</code>`, 'mesh'],
    PAL_PROP(`${pal}`), PX_PROP(4),
    ['dither', '0 for flat colour bands, 1 for full dither', '1'],
    ['speed', '1 is normal, 0 holds still', '1'],
    ['height', 'when not filling: px or any CSS length', '360px'],
    ['fill', 'sit behind the content of the parent element', '']
  ],
  a11y: ['It is decoration: hidden from screen readers.', 'With reduced motion it renders one still frame.', 'It only draws while it is on screen, and every Pixel UI component shares one GPU context.']
});

/* ---------- text: one page per effect ---------- */
const TX = [
  ['shine', 'shine-text', 'Shine text', 'lime', 'A dithered band of colour that sweeps across the words.', 'A wide band of light slides through the letters every few seconds, stepping through the palette in dithered pixels. Good for one word in a headline.'],
  ['reveal', 'reveal-text', 'Reveal text', 'aurora', 'Words that resolve out of a mosaic when they scroll into view.', 'The words start as big chunky blocks and resolve, pixel size by pixel size, into crisp letters the first time they come on screen.'],
  ['glitch', 'glitch-text', 'Glitch text', 'candy', 'Colour split and slipping rows, in bursts.', 'Every so often the text tears: rows slip sideways, the colour channels split apart, and blocks of noise flash through. Between bursts it holds still, so it stays readable.'],
  ['wave', 'wave-text', 'Wave text', 'ocean', 'Letters that ripple like a flag.', 'The words ride a travelling wave, pixel column by pixel column, and the colour follows the crest. Hover and the wave grows.'],
  ['melt', 'melt-text', 'Melt text', 'fire', 'Letters that drip and melt down the page.', 'Columns of the letters slide down at different speeds and drip, then pull themselves back up. A bit unhinged, in a good way.'],
  ['scan', 'scan-text', 'Scan text', 'aurora', 'A scanline that sweeps down, lighting the letters as it passes.', 'A bright scanline rolls down through the words like an old CRT, lighting up each row as it passes and leaving a dithered afterglow.']
];
const txPage = ([effect, slug, name, pal, brief, about]) => ({
  slug, name, section: 'Text', tag: 'piix-text', file: 'text', brief, about,
  demo: `<h1 class="ex-h1"><piix-text effect="${effect}"${pal === 'lime' ? '' : ` palette="${pal}"`}>Pixel perfect</piix-text></h1>`,
  code: `<h1>\n  <piix-text effect="${effect}"${pal === 'lime' ? '' : ` palette="${pal}"`}>Pixel perfect</piix-text>\n</h1>`,
  stage: { h: 260 },
  controls: [['palette', 'Palette', 'palette', pal], ['pixel', 'Pixel', 'range', [1, 6, 1, 2]]],
  examples: [
    { name: 'One word in a headline', note: 'It takes the font, size and weight of wherever you put it, so it drops straight into your own heading.',
      demo: `<h2 class="ex-h2">Build something <piix-text effect="${effect}" palette="sunset">loud</piix-text></h2>` },
    { name: 'Chunkier pixels', demo: `<h2 class="ex-h2"><piix-text effect="${effect}" pixel="4" palette="${pal === 'candy' ? 'gameboy' : 'candy'}">Big pixels</piix-text></h2>` }
  ],
  props: [
    ['effect', '<code>shine</code> <code>reveal</code> <code>glitch</code> <code>wave</code> <code>melt</code> <code>scan</code>', 'shine'],
    PAL_PROP('lime'), PX_PROP(2)
  ],
  a11y: ['The real words stay in the page, so screen readers, search engines and copy-paste all see normal text.', 'With reduced motion the effect holds on a readable frame.', 'One line of text: it doesn\'t wrap.']
});

