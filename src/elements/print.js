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

