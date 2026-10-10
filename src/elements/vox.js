/* VOX: a small voxel engine. It puffs any pal's pixel art up into a real 3D model, turns it,
 * lights it from wherever the pointer is, and draws it as glossy cubes, clay, a cel-shaded toy,
 * a wireframe, a hologram, or through a print style: halftone dots, ordered dither or ASCII.
 * The 3D components (voxel, card, planet, globe, holo, room) are all built on it. */

const VOX_LOOKS = ['glossy', 'clay', 'toon', 'wire', 'holo', 'halftone', 'dither', 'ascii'];
const VOX_DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const voxKey = (x, y, z) => ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);
const voxNorm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

/* the pixel rows behind a pal or a sprite, for one frame of one clip */
const voxArt = (name, clip, i = 0) => {
  const s = SPRITES[name], f = FIGURES[name];
  i = Math.max(0, i | 0);
  if (s) {
    const c = s.frames[clip] || s.frames[Object.keys(s.frames)[0]];
    return { rows: c[i % c.length], palette: s.palette, h: s.h, n: c.length, fps: (typeof s.fps === 'object' ? s.fps[clip] : s.fps) || 6 };
  }
  if (f) return { rows: f.frames[i % f.frames.length], palette: figurePalette(f), h: f.h, n: f.frames.length, fps: f.fps || 2 };
  return null;
};

/* a model is the list of cube faces nobody else is hiding, plus its centre and size */
const voxModel = vox => {
  const has = new Set(vox.map(v => voxKey(v[0], v[1], v[2])));
  let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1e9, y1 = -1e9, z1 = -1e9;
  const faces = [];
  for (const v of vox) {
    x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); z0 = Math.min(z0, v[2]); z1 = Math.max(z1, v[2]);
    for (let d = 0; d < 6; d++) {
      const D = VOX_DIRS[d];
      if (!has.has(voxKey(v[0] + D[0], v[1] + D[1], v[2] + D[2]))) faces.push([v[0], v[1], v[2], d, v[3], v[4] || 0]);
    }
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, d = z1 - z0 + 1;
  return { faces, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, cz: (z0 + z1) / 2, w, h, d, r: Math.hypot(w, h, d) / 2, bottom: y1 + .5 };
};

/* puff pixel art up into voxels: the further a pixel is from the silhouette's edge, the thicker
 * the toy is there, so pals come out round like soft vinyl figures rather than flat slabs */
const VOX_MODELS = new WeakMap();
const voxFromArt = (art, depth = 3, at = [0, 0, 0]) => {
  const memo = VOX_MODELS.get(art.rows);
  if (memo && memo.depth === depth && !at[0] && !at[1] && !at[2]) return memo;
  const vox = voxCells(art, depth, at), m = voxModel(vox);
  m.depth = depth; m.cells = vox;
  if (!at[0] && !at[1] && !at[2]) VOX_MODELS.set(art.rows, m);
  return m;
};
const voxCells = (art, depth = 3, at = [0, 0, 0]) => {
  const rows = art.rows, h = rows.length, pad = (art.h || h) - h, w = Math.max(...rows.map(r => r.length));
  const on = (x, y) => y >= 0 && y < h && x >= 0 && x < (rows[y] || '').length && !!art.palette[rows[y][x]];
  const dist = rows.map(r => new Array(w).fill(0)), q = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (on(x, y) && (!on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1))) { dist[y][x] = 1; q.push([x, y]); }
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (on(x + dx, y + dy) && !dist[y + dy][x + dx]) { dist[y + dy][x + dx] = dist[y][x] + 1; q.push([x + dx, y + dy]); }
  }
  const vox = [], col = {};
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!on(x, y)) continue;
    const c = rows[y][x], rgb = col[c] || (col[c] = hexRGBA(art.palette[c]));
    const half = Math.min(depth, Math.floor((dist[y][x] - 1) * .85));
    for (let z = -half; z <= half; z++) vox.push([x + at[0], y + pad + at[1], z + at[2], rgb, 0]);
  }
  return vox;
};

/* ---------- drawing ---------- */
/* o: { yaw, pitch, s (px per voxel), x, y (centre on the canvas), light [x,y,z], look, amb, back, persp } */
const voxDraw = (g, m, o) => {
  const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
  const rot = (x, y, z) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy; return [x1, y * cp - z1 * sp, y * sp + z1 * cp]; };
  const N = VOX_DIRS.map(D => rot(D[0], D[1], D[2]));
  const U = VOX_DIRS.map(D => D[0] ? rot(0, 1, 0) : rot(1, 0, 0));
  const V = VOX_DIRS.map(D => D[2] ? rot(0, 1, 0) : rot(0, 0, 1));
  const L = voxNorm(o.light || [-.5, -.8, .7]), H = voxNorm([L[0], L[1], L[2] + 1]);
  const look = o.look || 'glossy', amb = o.amb ?? (look === 'clay' ? .58 : .44), back = o.back || look === 'wire';
  const list = [];
  for (const f of m.faces) {
    const n = N[f[3]], front = n[2] > 0;
    if (!front && !back) continue;
    const c = rot(f[0] - m.cx, f[1] - m.cy, f[2] - m.cz);
    list.push([c[0] + n[0] * .5, c[1] + n[1] * .5, c[2] + n[2] * .5, f, front]);
  }
  list.sort((a, b) => a[2] - b[2]);
  const s = o.s, P = o.persp || 0;
  g.lineJoin = 'round';
  for (const [x, y, z, f, front] of list) {
    const d = f[3], u = U[d], v = V[d], n = N[d], k = P ? 1 / (1 - z * P) : 1;
    const X = (a, b) => o.x + (x + u[0] * a + v[0] * b) * s * k, Y = (a, b) => o.y + (y + u[1] * a + v[1] * b) * s * k;
    g.beginPath();
    g.moveTo(X(-.5, -.5), Y(-.5, -.5)); g.lineTo(X(.5, -.5), Y(.5, -.5)); g.lineTo(X(.5, .5), Y(.5, .5)); g.lineTo(X(-.5, .5), Y(-.5, .5)); g.closePath();
    if (look === 'wire') {
      g.strokeStyle = front ? (o.ink || 'rgba(198,244,50,.95)') : (o.ink2 || 'rgba(198,244,50,.16)');
      g.lineWidth = Math.max(1, s * .06); g.stroke();
      continue;
    }
    const diff = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
    const [r, gg, b] = f[4];
    let k2, add = 0;
    if (f[5]) { k2 = 1.08; }
    else if (look === 'toon') k2 = diff > .55 ? 1.05 : diff > .2 ? .82 : .62;
    else if (look === 'clay') k2 = amb + .5 * diff;
    else { k2 = amb + .62 * diff; add = Math.pow(Math.max(0, n[0] * H[0] + n[1] * H[1] + n[2] * H[2]), 26) * (look === 'holo' ? 120 : 150); }
    let fill;
    if (look === 'holo') { const t = (r * .3 + gg * .59 + b * .11) / 255 * .5 + .5; fill = `rgba(${90 * k2 * t + add | 0},${235 * k2 * t + add | 0},${255 * k2 * t + add | 0},.85)`; }
    else if (look === 'clay') { const p = v => Math.min(255, (v * .78 + 255 * .22) * k2) | 0; fill = `rgb(${p(r)},${p(gg)},${p(b)})`; }
    else fill = `rgb(${Math.min(255, r * k2 + add) | 0},${Math.min(255, gg * k2 + add) | 0},${Math.min(255, b * k2 + add) | 0})`;
    g.fillStyle = fill; g.fill();
    /* the same colour round the edge closes the hairline cracks between faces */
    g.strokeStyle = fill; g.lineWidth = Math.max(.6, s * .04); g.stroke();
  }
};

/* scratch canvases, kept per size */
const VOX_BUF = {};
const voxBuf = (key, w, h) => {
  let c = VOX_BUF[key];
  if (!c) c = VOX_BUF[key] = document.createElement('canvas');
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
};
const VOX_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - .5);
const VOX_RAMP = ' .:-=+*#%@';

