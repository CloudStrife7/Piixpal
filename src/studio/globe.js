/* GLOBE: a pal in a snow globe. Shake it.   @component globe
 *
 *   <piix-globe pal="penguin"></piix-globe>
 *
 * A glass dome on a little stand with a 3D pal inside, standing on a snowdrift. Drag it about or tap
 * it to shake it: the snow flies up and drifts back down round the pal, and settles again.
 *
 *   pal     any pal or sprite name                      default: penguin
 *   sky     night | dusk | day                          default: night
 *   snow    how many flakes, 20–300                     default: 140
 *   size    width in px                                 default: 220
 *   look    how the pal is drawn                        default: glossy
 *
 *   el.shake()   shake it from code */
const GLOBE_SKY = { night: ['#2a1f5c', '#5b3fa8'], dusk: ['#ff8a5c', '#6b4cff'], day: ['#7fd0ff', '#dff4ff'] };
class PiixGlobeElement extends VoxStage {
  constructor() { super(); this._defSize = 220; this._aspect = 1.18; this._defSpin = 2; this._defTilt = 12; this._defPal = 'penguin'; }
  _label() { return `${this.palName} in a snow globe`; }
  _setup() {
    const n = clamp(+this.getAttribute('snow') || 140, 20, 300);
    this._flakes = [...Array(n)].map((_, i) => ({ x: Math.random() * 1.6 - .8, y: Math.random() * 1.4 - .8, vx: 0, vy: 0, z: .5 + Math.random(), rest: false }));
    this.shake(.6);
  }
  shake(k = 1) {
    for (const f of this._flakes || []) { f.rest = false; f.vx += (Math.random() - .5) * 2.4 * k; f.vy -= Math.random() * 2.2 * k; }
    this._hopAt = now();
  }
  _poke() { this.shake(1); }
  _shake(dx, dy) { for (const f of this._flakes) { f.rest = false; f.vx += dx * .01 + (Math.random() - .5) * .06; f.vy += dy * .01 - Math.random() * .05; } }
  _draw(dt, t) {
    const g = this._g, w = this._cv.width, h = this._cv.height, dpr = this._dpr;
    const r = w * .41, cx = w / 2, cy = r + w * .06, ground = y => .58 - .07 * Math.cos(y * 2.2);
    const sky = GLOBE_SKY[this.getAttribute('sky')] || GLOBE_SKY.night;
    g.clearRect(0, 0, w, h);
    /* the stand */
    const by = cy + r * .78, bw = r * 1.02;
    g.fillStyle = '#17121f';
    g.beginPath(); g.moveTo(cx - bw, by); g.lineTo(cx + bw, by); g.lineTo(cx + bw * 1.18, h - w * .03); g.lineTo(cx - bw * 1.18, h - w * .03); g.closePath(); g.fill();
    g.fillStyle = '#c6f432'; g.fillRect(cx - bw * 1.08, by + (h - w * .03 - by) * .38, bw * 2.16, 3 * dpr);
    g.fillStyle = '#fffdf7'; g.font = `700 ${w * .05}px ui-monospace,Menlo,monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(this.palName.toUpperCase(), cx, by + (h - w * .03 - by) * .7);
    /* inside the glass */
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.clip();
    const bg = g.createLinearGradient(0, cy - r, 0, cy + r); bg.addColorStop(0, sky[0]); bg.addColorStop(1, sky[1]);
    g.fillStyle = bg; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.fillStyle = 'rgba(255,255,255,.6)';
    for (let i = 0; i < 18; i++) { const a = Math.sin(i * 91.7) * 43758.5, b = Math.sin(i * 17.3) * 9137.1; g.fillRect(cx + ((a - Math.floor(a)) - .5) * r * 1.6, cy - r * .9 + (b - Math.floor(b)) * r * .9, dpr * 1.5, dpr * 1.5); }
    /* the drift */
    g.fillStyle = '#f4f8ff'; g.beginPath(); g.moveTo(cx - r, cy + r);
    for (let x = -1; x <= 1.001; x += .05) g.lineTo(cx + x * r, cy + ground(x) * r);
    g.lineTo(cx + r, cy + r); g.closePath(); g.fill();
    /* the pal, standing on it */
    const art = voxArt(this.palName, null, reduced() ? 0 : Math.floor(t / 1000 * (voxArt(this.palName)?.fps || 4)));
    if (art) {
      const m = voxFromArt(art, 3), s = r * .95 / Math.max(Math.hypot(m.w, m.d), m.h);
      const foot = cy + ground(0) * r + s * .4, y = foot - (m.bottom - m.cy) * s * Math.cos(this._pitch) + this._hop(t) * .6;
      voxPaint(g, m, { yaw: this._yaw, pitch: this._pitch, s, x: cx, y, light: this._L, look: this.look, dpr, t, persp: .01 });
    }
    /* the snow: falls, drifts, comes to rest on the drift until the next shake */
    const step = Math.min(dt, .05);
    for (const f of this._flakes) {
      if (!f.rest) {
        f.vy += .28 * step; f.vx *= 1 - 1.8 * step; f.vy *= 1 - 1.4 * step;
        f.vx += Math.sin(t / 700 + f.z * 9) * .02 * step;
        f.x += f.vx * step; f.y += f.vy * step;
        const d = Math.hypot(f.x, f.y);
        if (d > .96) { f.x *= .96 / d; f.y *= .96 / d; f.vx *= -.3; f.vy *= -.3; }
        if (f.y > ground(f.x) - .01) { f.y = ground(f.x) - .01; f.rest = f.vy > 0; f.vx = f.vy = 0; }
      }
      g.fillStyle = `rgba(255,255,255,${.65 + f.z * .25})`;
      const z = (1.4 + f.z * 1.6) * dpr;
      g.fillRect(cx + f.x * r - z / 2, cy + f.y * r - z / 2, z, z);
    }
    g.restore();
    /* the glass: a tint at the rim and two reflections */
    const rim = g.createRadialGradient(cx, cy, r * .7, cx, cy, r);
    rim.addColorStop(0, 'rgba(200,235,255,0)'); rim.addColorStop(1, 'rgba(200,235,255,.32)');
    g.fillStyle = rim; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = r * .045; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, cy, r * .86, Math.PI * 1.08, Math.PI * 1.38); g.stroke();
    g.beginPath(); g.arc(cx, cy, r * .86, Math.PI * 1.46, Math.PI * 1.52); g.stroke();
    g.strokeStyle = 'rgba(23,18,31,.85)'; g.lineWidth = 2.5 * dpr; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.stroke();
  }
}
define('piix-globe', PiixGlobeElement);
ELEMENTS.globe = 'piix-globe';
