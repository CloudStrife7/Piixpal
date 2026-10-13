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
