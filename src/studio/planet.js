/* PLANET: a tiny voxel world with pals walking round it.   @component planet
 *
 *   <piix-planet pals="bitbug,frog,penguin"></piix-planet>
 *
 * Seas, beaches, grass, hills with snow on top and little trees, all in voxels, with a soft
 * atmosphere round the edge. The pals walk round it and disappear over the horizon. Drag to spin
 * it, the light follows your pointer, tap it for a hop.
 *
 *   pals    comma-separated pal names                 default: bitbug,frog,penguin
 *   seed    a number: a different world for each      default: 7
 *   size    width in px                               default: 260
 *   spin    turns per minute when idle                default: 3
 *   look    glossy | clay | toon | wire | holo | halftone | dither | ascii   default: glossy */
class PiixPlanetElement extends VoxStage {
  constructor() { super(); this._defSize = 260; this._defSpin = 3; this._defTilt = 18; this._needsPal = false; }
  _label() { return 'A tiny voxel planet with pals walking round it'; }
  _setup() {
    const R = 10, seed = +this.getAttribute('seed') || 7;
    /* smooth noise on the sphere: a few waves in different directions */
    const waves = [...Array(7)].map((_, i) => { const a = Math.sin(seed * 9.1 + i * 3.7) * 43758.5; const r = a - Math.floor(a), b = Math.sin(seed * 4.3 + i * 7.9) * 2e4; const q = b - Math.floor(b); return [Math.cos(r * 6.283) * Math.sin(q * 3.14), Math.cos(q * 3.14), Math.sin(r * 6.283) * Math.sin(q * 3.14), 1.4 + i * .55, r * 6.283]; });
    const height = (x, y, z) => waves.reduce((a, w) => a + Math.sin((x * w[0] + y * w[1] + z * w[2]) * w[3] / R * 2.2 + w[4]) / (1 + w[3] * .4), 0);
    const C = { deep: [47, 151, 214], sea: [88, 200, 255], sand: [255, 217, 138], grass: [123, 214, 58], grass2: [92, 184, 45], rock: [154, 143, 122], snow: [255, 255, 255], trunk: [138, 90, 52], leaf: [61, 158, 74] };
    /* sea level and hill heights by percentile, so every seed gets about half land */
    const hs = [];
    for (let i = 0; i < 600; i++) { const z = 1 - 2 * (i + .5) / 600, rr = Math.sqrt(1 - z * z), a = i * 2.399963; hs.push(height(Math.cos(a) * rr, z, Math.sin(a) * rr)); }
    hs.sort((a, b) => a - b);
    const q = p => hs[Math.floor(p * (hs.length - 1))], SEA = q(.48), SAND = q(.55), HILL = q(.8), PEAK = q(.93), DEEP = q(.25);
    const vox = [];
    for (let x = -R - 3; x <= R + 3; x++) for (let y = -R - 3; y <= R + 3; y++) for (let z = -R - 3; z <= R + 3; z++) {
      const d = Math.hypot(x, y, z);
      if (d > R + 2.5 || d < R - 1.6) continue;
      const hgt = height(x / d, y / d, z / d), land = hgt > SEA;
      /* the surface sits at R; land rises a step, hills two */
      const top = R + (hgt > PEAK ? 2 : hgt > HILL ? 1 : 0);
      if (d > top + .5) continue;
      let c;
      if (!land) c = d > R - .5 ? (hgt > DEEP ? C.sea : C.deep) : C.deep;
      else if (hgt < SAND) c = C.sand;
      else if (hgt > PEAK && d > top - .5) c = C.snow;
      else if (hgt > HILL) c = C.rock;
      else c = (x + y + z) & 1 ? C.grass : C.grass2;
      vox.push([x, y, z, c, 0]);
    }
    /* trees: a trunk and a puff of leaves, pointing straight out from the ground */
    for (let i = 0; i < 26; i++) {
      const u = Math.sin(seed * 13 + i * 12.9898) * 43758.5, v = Math.sin(seed * 7 + i * 78.233) * 12345.6;
      const th = (u - Math.floor(u)) * 6.283, ph = Math.acos(2 * (v - Math.floor(v)) - 1), n = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
      const hgt = height(...n);
      if (hgt < SAND || hgt > HILL) continue;
      const base = R;
      for (let k = 1; k <= 2; k++) vox.push([...n.map(c => Math.round(c * (base + k))), C.trunk, 0]);
      const top = n.map(c => c * (base + 3.2));
      for (const [a, b, c] of [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) vox.push([Math.round(top[0] + a), Math.round(top[1] + b), Math.round(top[2] + c), C.leaf, 0]);
    }
    const seen = new Set();
    this._model = voxModel(vox.filter(v => { const k = voxKey(v[0], v[1], v[2]); if (seen.has(k)) return false; seen.add(k); return true; }));
    this._R = R;
    this._walkers = (this.getAttribute('pals') || 'bitbug,frog,penguin').split(',').map(s => s.trim()).filter(n => SPRITES[n]).slice(0, 8)
      .map((n, i) => ({ n, lat: (i % 2 ? -1 : 1) * (.15 + i * .18), speed: .32 + i * .07, off: i * 2.1 }));
  }
  _draw(dt, t) {
    const g = this._g, w = this._cv.width, h = this._cv.height, m = this._model, R = this._R;
    const s = Math.min(w, h) * .4 / (R + 2.5), cx = w / 2, cy = h / 2 + this._hop(t);
    g.clearRect(0, 0, w, h);
    /* the atmosphere: a soft halo behind it */
    const halo = g.createRadialGradient(cx, cy, R * s * .9, cx, cy, R * s * 1.5);
    halo.addColorStop(0, 'rgba(160,226,255,.55)'); halo.addColorStop(1, 'rgba(160,226,255,0)');
    g.fillStyle = halo; g.fillRect(0, 0, w, h);
    const o = { yaw: this._yaw, pitch: this._pitch, s, x: cx, y: cy, light: this._L, look: this.look, dpr: this._dpr, t };
    voxPaint(g, m, o);
    /* the walkers: a point on the sphere, turned like the planet, drawn upright from the ground if it's on our side */
    const cyw = Math.cos(o.yaw), syw = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
    const rot = (x, y, z) => { const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw; return [x1, y * cp - z1 * sp, y * sp + z1 * cp]; };
    for (const wk of this._walkers) {
      const lon = (reduced() ? 0 : t / 1000) * wk.speed + wk.off, la = wk.lat;
      const n = [Math.cos(la) * Math.cos(lon), Math.sin(la), Math.cos(la) * Math.sin(lon)], p = rot(...n.map(c => c * (R + 1.5)));
      if (p[2] < 1) continue;
      const up = rot(...n), sp2 = SPRITES[wk.n], frames = baked(sp2), clip = frames.walk || frames[Object.keys(frames)[0]];
      const img = clip[Math.floor(t / 1000 * 8) % clip.length], k = s * .36;
      g.save(); g.translate(cx + p[0] * s, cy + p[1] * s); g.rotate(Math.atan2(up[0], -up[1]));
      const dir = rot(-Math.sin(lon), 0, Math.cos(lon));
      if (dir[0] < 0) g.scale(-1, 1);
      g.globalAlpha = Math.min(1, (p[2] - 1) / 3);
      g.imageSmoothingEnabled = false; g.drawImage(img, -sp2.w * k / 2, -sp2.h * k, sp2.w * k, sp2.h * k);
      g.restore();
    }
  }
}
define('piix-planet', PiixPlanetElement);
ELEMENTS.planet = 'piix-planet';
