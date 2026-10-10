/* BACKDROP: animated pixel backgrounds for sections.   @component backdrop
 *
 *   <section>
 *     <piix-backdrop kind="aurora" fill></piix-backdrop>
 *     <h2>Your content stays on top</h2>
 *   </section>
 *
 * Ten moving pictures drawn as ASCII, ordered dither, halftone dots or chunky pixels: an aurora,
 * a sunburst, plasma, digital rain, a starfield warp, clouds, a tunnel, a synthwave grid, pixel
 * fire, and moonlit waves. The pointer stirs them. With "fill" it sits behind everything else in
 * the element it's in; without, it's a block of its own.
 *
 *   kind      aurora | sunburst | plasma | rain | stars | clouds | tunnel | synthwave | fire | waves
 *   look      ascii | dither | halftone | pixel       default: the kind's own
 *   palette   lime | aurora | sunset | ocean | candy | fire | gameboy | paper | mono,
 *             or your own colours, dark to light: "#000,#f0f,#fff"
 *   ink       draw everything in one colour
 *   paper     the background colour                   default: the darkest palette colour
 *   cell      size of a character, dot or block, px    default: depends on the look
 *   ramp      the characters for ascii: classic | soft | blocks | binary | dots | hearts | code, or your own
 *   speed     1 is normal, 0 holds still              default: 1
 *   height    px, when it isn't filling               default: 320
 *   fill      sit behind the content of the parent element */
const BD_KINDS = {
  aurora: ['aurora', 'dither'], sunburst: ['sunset', 'halftone'], plasma: ['candy', 'ascii'], rain: ['lime', 'ascii'], stars: ['ocean', 'ascii'],
  clouds: ['ocean', 'halftone'], tunnel: ['lime', 'ascii'], synthwave: ['sunset', 'dither'], fire: ['fire', 'pixel'], waves: ['ocean', 'halftone']
};
class PiixBackdropElement extends PrintStage {
  get kind() { const k = this.getAttribute('kind'); return BD_KINDS[k] ? k : 'aurora'; }
  get look() { const l = this.getAttribute('look'); return PRINT_LOOKS.includes(l) ? l : BD_KINDS[this.kind][1]; }
  _label() { return `An animated ${this.kind} background`; }
  _setup() {
    const name = this.getAttribute('palette') || BD_KINDS[this.kind][0];
    this._pal = printPalette(name);
    this._paper = (PRINT_PALETTES[name] || (name.includes('#') ? name.split(',') : PRINT_PALETTES.lime))[0].trim();
    this._scramble = this.kind === 'rain';
    this._ramp = this.kind === 'rain' ? 'ｱｲｳｴｵｶｷｸ01<>{}[]/*+=#' : null;
    const { cols, rows } = this._grid;
    this._val = new Float32Array(cols * rows);
    this._img = this._src.getContext('2d').createImageData(cols, rows);
    this._heat = this.kind === 'fire' ? new Float32Array(cols * rows) : null;
    this._last = 0;
  }
  _paint(src, T) {
    const { cols, rows, cw, ch } = this._grid, val = this._val, aspect = cols * cw / (rows * ch), kind = this.kind, P = this._pt;
    val.fill(0);
    if (kind === 'stars') {
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) val[y * cols + x] = pFbm(x / cols * 3 + T * .02, y / rows * 3) * .16;
      for (let i = 0; i < 320; i++) {
        const a = pHash(i, 1) * 6.283, sp = .08 + pHash(i, 2) * .14, z = (T * sp + pHash(i, 3)) % 1, r = z * z * .95;
        for (let s = 0; s < 3; s++) {
          const rr = r * (1 - s * .05 * z), x = Math.round((.5 + Math.cos(a) * rr / aspect * 1.1) * cols), y = Math.round((.5 + Math.sin(a) * rr) * rows);
          if (x >= 0 && x < cols && y >= 0 && y < rows) val[y * cols + x] = Math.max(val[y * cols + x], z * (1 - s * .3));
        }
      }
    } else if (kind === 'fire') {
      /* the classic: heat rises from the bottom row, cooling and drifting at random */
      const H = this._heat, steps = Math.min(4, Math.floor((T - this._last) * 30));
      if (steps > 0) this._last = T;
      for (let n = 0; n < steps; n++) {
        for (let x = 0; x < cols; x++) H[(rows - 1) * cols + x] = .75 + pNoise(x * .3, T * 4) * .25;
        for (let y = 0; y < rows - 1; y++) for (let x = 0; x < cols; x++) {
          const r = Math.random(), from = (y + 1) * cols + x, to = y * cols + clamp(x - Math.round(r * 2 - 1), 0, cols - 1);
          H[to] = Math.max(0, H[from] - r * (2.6 / rows));
        }
        if (P.on) { const px = Math.round(P.x * cols), py = Math.round(P.y * rows); for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) { const x = px + dx, y = py + dy; if (x >= 0 && x < cols && y >= 0 && y < rows) H[y * cols + x] = Math.min(1, H[y * cols + x] + .5); } }
      }
      val.set(H);
    } else {
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const u = x / cols, v = y / rows, X = (u - .5) * aspect, Y = v - .5;
        let k = 0;
        if (kind === 'aurora') {
          const s = Math.sin(u * 5 + T * .35 + Math.sin(u * 9 - T * .25) * .8), yc = .32 + .1 * s, wd = .07 + .04 * Math.sin(u * 7 + T * .5);
          const b1 = Math.exp(-(((v - yc) / wd) ** 2) * (v < yc ? 1.6 : .3)) * (.55 + .45 * Math.sin(u * 48 + T * 1.6 + Math.sin(u * 13) * 3));
          const yc2 = .52 + .07 * Math.sin(u * 4 - T * .3), b2 = Math.exp(-(((v - yc2) / .06) ** 2) * (v < yc2 ? 1.6 : .4)) * (.5 + .5 * Math.sin(u * 31 - T * 1.1));
          k = .05 * (1 - v) + b1 * .95 + b2 * .45 + (pHash(x, y) > .993 ? .5 + .4 * Math.sin(T * 3 + x) : 0);
        } else if (kind === 'sunburst') {
          const dx = X, dy = Y - .12, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
          k = r < .17 ? 1 : .12 + .55 * (.5 + .5 * Math.sin(a * 14 + T * .3)) * Math.exp(-r * 1.3) + .35 * Math.exp(-r * 5);
        } else if (kind === 'plasma') {
          const px = X * 3, py = Y * 3;
          k = .5 + (Math.sin(px * 3 + T) + Math.sin(py * 2.6 - T * 1.3) + Math.sin((px + py) * 2.2 + T * .7) + Math.sin(Math.hypot(px, py) * 4.4 - T * 1.6)) / 8;
        } else if (kind === 'rain') {
          const sp = .22 + pHash(x, 0) * .55, len = .12 + pHash(x, 1) * .4, head = ((T * sp + pHash(x, 2) * 5) % 1.7) - .35, dd = head - v;
          k = dd >= 0 && dd < len ? (dd < 1.2 / rows ? 1 : .85 * (1 - dd / len)) : .02;
        } else if (kind === 'clouds') {
          const n = pFbm(X * 2.4 + T * .07, Y * 2.4 + T * .02);
          k = .18 * (1 - v) + clamp((n - .38) * 2.6, 0, 1) * .85;
        } else if (kind === 'tunnel') {
          const r = Math.hypot(X, Y) + .001, a = Math.atan2(Y, X) / Math.PI, uu = .32 / r + T * .7, vv = a + T * .06;
          k = (Math.sin(uu * 11) * Math.sin(vv * Math.PI * 8) > 0 ? .95 : .3) * Math.min(1, r * 2.4);
        } else if (kind === 'synthwave') {
          const hz = .6;
          if (v < hz) {
            const sx = X, sy = v - (hz - .2), r = Math.hypot(sx, sy * 1.1);
            k = .14 + .42 * (v / hz) ** 2;
            if (r < .22 && !(sy > 0 && Math.sin(v * rows * .9 - T * 2) > .2 + (1 - sy / .22) * .6)) k = .7 + .3 * (1 - sy / .44);
            if (pHash(x, y) > .99 && v < .35) k = .6;
          } else {
            const z = .07 / (v - hz + .002), gx = X * z, line = ((z * 2.2 + T * .9) % 1) < .07 * Math.min(1, z * 1.6) || Math.abs(gx * 1.4 - Math.round(gx * 1.4)) < .04 * z;
            k = (line ? .8 : .06) * Math.min(1, (v - hz) * 9) + .25 * Math.exp(-(v - hz) * 30);
          }
        } else if (kind === 'waves') {
          const hz = .52;
          if (v < hz) k = .06 + .12 * (v / hz) + (Math.hypot(X, v - .24) < .085 ? .95 : .3 * Math.exp(-Math.hypot(X, v - .24) * 12)) + (pHash(x, y) > .994 ? .45 : 0);
          else {
            const dv = v - hz, wv = .5 + .5 * Math.sin(dv * 140 / (dv * 4 + .4) - T * 2.2 + Math.sin(X * 14 + T) * 1.5);
            const glint = Math.exp(-((X / (.03 + dv * .9)) ** 2)) * wv;
            k = .1 + .34 * wv * (1 - dv * .8) + glint * .85;
          }
        }
        if (P.on) { const d = Math.hypot((u - P.x) * aspect, v - P.y); k += .32 * Math.exp(-d * d * 55) * (.5 + .5 * Math.sin(d * 70 - T * 9)); }
        val[y * cols + x] = k;
      }
    }
    const img = this._img, d = img.data, pal = this._pal;
    for (let i = 0; i < val.length; i++) printShade(pal, val[i], d, i * 4);
    src.getContext('2d').putImageData(img, 0, 0);
  }
}
define('piix-backdrop', PiixBackdropElement);
ELEMENTS.backdrop = 'piix-backdrop';
