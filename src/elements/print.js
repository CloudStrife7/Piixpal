/* PRINT: draws any moving picture as ASCII, ordered dither, halftone dots or chunky pixels.
 * A component paints its picture small (one pixel per character, dot or block), and this turns
 * it into type, dots or dither on the real canvas. Backdrops and scenes are built on it. */

const PRINT_LOOKS = ['ascii', 'dither', 'halftone', 'pixel'];
const PRINT_RAMPS = {
  classic: ' .:-=+*#%@', soft: " .'`^,:;!i><~+?]}1)|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  blocks: ' ░▒▓█', binary: ' 01', dots: ' ·•●', hearts: ' .·°♡♥', code: ' .:;=+<>{}[]#'
};
const PRINT_PALETTES = {
  lime: ['#0b0a10', '#1b3410', '#4f7d10', '#a8d81c', '#c6f432', '#f2ffd6'],
  aurora: ['#06050c', '#0d2b3a', '#127a74', '#25d6a0', '#9ef5cf', '#e4dcff'],
  sunset: ['#160925', '#4d1650', '#b0285e', '#ff5a6e', '#ff9b45', '#ffe08a'],
  ocean: ['#030b18', '#0a2c55', '#1d6fb0', '#58c8ff', '#bfeaff', '#ffffff'],
  candy: ['#1c0b2e', '#5b2bd6', '#c43bd8', '#ff6bb5', '#ffd23f', '#fffbe6'],
  fire: ['#050202', '#3c0806', '#9c1a0e', '#e5481a', '#ff9a2a', '#ffe36b', '#fffbe0'],
  gameboy: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  paper: ['#f3eee3', '#cdbfa8', '#6c6477', '#17121f'],
  mono: ['#000000', '#ffffff']
};
const PRINT_EDGES = '-/|\\';
const PRINT_BAYER = (() => { const m = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21]; return m.map(v => (v + .5) / 64); })();
/* hash and smooth value noise, for anything that wants to look natural */
const pHash = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
const pNoise = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(pHash(xi, yi), pHash(xi + 1, yi), u), lerp(pHash(xi, yi + 1), pHash(xi + 1, yi + 1), u), v);
};
const pFbm = (x, y) => pNoise(x, y) * .55 + pNoise(x * 2.1, y * 2.1) * .3 + pNoise(x * 4.3, y * 4.3) * .15;
const printPalette = p => (PRINT_PALETTES[p] || (p && p.includes('#') ? p.split(',').map(s => s.trim()) : null) || PRINT_PALETTES.lime).map(c => hexRGBA(c));
/* a value 0..1 through a palette */
const printShade = (pal, v, out, i) => {
  const f = clamp(v, 0, 1) * (pal.length - 1), a = Math.floor(f), b = Math.min(pal.length - 1, a + 1), k = f - a;
  out[i] = pal[a][0] + (pal[b][0] - pal[a][0]) * k; out[i + 1] = pal[a][1] + (pal[b][1] - pal[a][1]) * k; out[i + 2] = pal[a][2] + (pal[b][2] - pal[a][2]) * k; out[i + 3] = 255;
};

/* glyph atlases: each ramp drawn once in white, per cell size */
const PRINT_ATLAS = {};
const printAtlas = (ramp, cw, ch) => {
  const key = ramp + cw + 'x' + ch;
  if (PRINT_ATLAS[key]) return PRINT_ATLAS[key];
  const c = document.createElement('canvas'); c.width = Math.ceil(cw * ramp.length); c.height = Math.ceil(ch);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `600 ${ch * .92}px ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace`;
  [...ramp].forEach((ch2, i) => x.fillText(ch2, cw * i + cw / 2, ch / 2 + ch * .04));
  return (PRINT_ATLAS[key] = c);
};
const PRINT_BUF = {};
const printBuf = (k, w, h) => { let c = PRINT_BUF[k]; if (!c) c = PRINT_BUF[k] = document.createElement('canvas'); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return c; };
/* how many cells fit: characters are taller than wide, dots and blocks are square */
const printGrid = (look, w, h, cell) => {
  const cw = cell, ch = look === 'ascii' ? Math.round(cell * 1.7) : cell;
  return { cw, ch, cols: Math.max(4, Math.ceil(w / cw)), rows: Math.max(3, Math.ceil(h / ch)) };
};

/* paint: src is a canvas the size of the grid (cols x rows), g the real canvas.
 * o: { look, cw, ch, ramp, ink (one colour for everything, or null for the picture's colours),
 *      paper (background), scramble (random glyphs, for rain), t } */
const printPaint = (g, src, o) => {
  const W = g.canvas.width, H = g.canvas.height, cols = src.width, rows = src.height, cw = o.cw, ch = o.ch;
  const sx = src.getContext('2d', { willReadFrequently: true }), img = sx.getImageData(0, 0, cols, rows), d = img.data;
  const paper = hexRGBA(o.paper || '#0b0910'), dark = (paper[0] * .3 + paper[1] * .59 + paper[2] * .11) < 128;
  const ink = o.ink ? hexRGBA(o.ink) : null;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.paper !== 'none') { g.fillStyle = o.paper || '#0b0910'; g.fillRect(0, 0, W, H); } else g.clearRect(0, 0, W, H);
  /* how strongly a cell should print: bright cells on dark paper, dark cells on light paper */
  const lo = o.floor ?? .1, gam = o.gamma ?? 1.3;
  const weight = i => { const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255 * (d[i + 3] / 255), k = dark ? l : 1 - l; return Math.pow(clamp((k - lo) / (1 - lo), 0, 1), gam); };
  if (o.look === 'pixel') {
    if (ink) for (let i = 0; i < d.length; i += 4) { const k = weight(i); d[i] = lerp(paper[0], ink[0], k); d[i + 1] = lerp(paper[1], ink[1], k); d[i + 2] = lerp(paper[2], ink[2], k); d[i + 3] = 255; }
    sx.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, cols * cw, rows * ch);
    g.restore(); return;
  }
  if (o.look === 'dither') {
    /* ordered dither: each channel to a few levels (or one ink), against an 8x8 Bayer matrix */
    const lv = o.levels || 3;
    for (let y = 0, i = 0; y < rows; y++) for (let x = 0; x < cols; x++, i += 4) {
      const b = PRINT_BAYER[(y & 7) * 8 + (x & 7)];
      if (ink) { const on = weight(i) > b; const c = on ? ink : paper; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
      else for (let c = 0; c < 3; c++) { const v = d[i + c] / 255 * (lv - 1); d[i + c] = Math.min(lv - 1, Math.floor(v) + (v - Math.floor(v) > b ? 1 : 0)) / (lv - 1) * 255; }
      d[i + 3] = 255;
    }
    sx.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, cols * cw, rows * ch);
    g.restore(); return;
  }
  /* measure every cell first, from the untouched picture */
  const Wt = new Float32Array(cols * rows), L = o.edges ? new Float32Array(cols * rows) : null;
  for (let i = 0; i < Wt.length; i++) { Wt[i] = weight(i * 4); if (L) { const j = i * 4, l = (d[j] * .3 + d[j + 1] * .59 + d[j + 2] * .11) / 255; L[i] = dark ? l : 1 - l; } }
  /* colour for each cell: the picture's colour brought up to full strength, or the ink */
  const col = printBuf('col', cols, rows), cx = col.getContext('2d');
  if (!ink) {
    for (let i = 0; i < d.length; i += 4) { const m = Math.max(d[i], d[i + 1], d[i + 2], 1), k = 255 / m * (.55 + .45 * Wt[i / 4]); d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k); }
    cx.putImageData(img, 0, 0);
  }
  const lay = printBuf('lay', W, H), lx = lay.getContext('2d');
  lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, W, H);
  if (o.look === 'halftone') {
    lx.fillStyle = '#fff';
    for (let y = 0, i = 0; y < rows; y++) for (let x = 0; x < cols; x++, i += 4) {
      const k = Wt[i / 4]; if (k < .04) continue;
      lx.beginPath(); lx.arc(x * cw + cw / 2 + (y & 1 ? cw / 2 : 0), y * ch + ch / 2, cw * .62 * Math.sqrt(k), 0, 6.283); lx.fill();
    }
  } else {
    const ramp = o.ramp || PRINT_RAMPS.classic, n = ramp.length, atlas = printAtlas(ramp, cw, ch), t = Math.floor((o.t || 0) * 12);
    /* edges: where brightness changes sharply, a line that follows it, like hand-made ASCII art */
    const edges = L ? printAtlas(PRINT_EDGES, cw, ch) : null;
    const at = (x, y) => L[clamp(y, 0, rows - 1) * cols + clamp(x, 0, cols - 1)];
    for (let y = 0, i = 0; y < rows; y++) for (let x = 0; x < cols; x++, i += 4) {
      if (L) {
        const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
        const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
        const m = Math.hypot(gx, gy);
        if (m > (o.edges === true ? .55 : o.edges)) {
          /* the line runs across the gradient: pick - / | \\ by its angle */
          const a = (Math.atan2(gy * ch / cw, gx) + Math.PI) % Math.PI, e = [2, 3, 0, 1][Math.round(a / (Math.PI / 4)) % 4];
          lx.drawImage(edges, e * cw, 0, cw, ch, x * cw, y * ch, cw, ch);
          continue;
        }
      }
      const k = Wt[i / 4];
      let c = o.scramble ? (k > .06 ? 1 + Math.floor(pHash(x + t * (pHash(x, 1) > .5 ? 1 : 0), y * 7.1 + Math.floor(t / 3)) * (n - 1)) : 0) : Math.min(n - 1, Math.floor(k * n));
      if (c > 0) lx.drawImage(atlas, c * cw, 0, cw, ch, x * cw, y * ch, cw, ch);
    }
  }
  /* tint the white marks: the picture's colours, or the ink */
  lx.globalCompositeOperation = 'source-in';
  if (ink) { lx.fillStyle = o.ink; lx.fillRect(0, 0, W, H); }
  else { lx.imageSmoothingEnabled = false; lx.drawImage(col, 0, 0, cols * cw, rows * ch); }
  lx.globalCompositeOperation = 'source-over';
  g.drawImage(lay, 0, 0);
  g.restore();
};

