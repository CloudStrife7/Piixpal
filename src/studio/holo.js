/* HOLO: a pal projected as a hologram.   @component holo
 *
 *   <piix-holo pal="astronaut"></piix-holo>
 *
 * A little projector puck throws a cone of light, and the pal hangs in it in cyan scanlines,
 * turning slowly, bobbing, flickering, and glitching sideways now and then. Drag to spin it.
 *
 *   pal     any pal or sprite name                       default: astronaut
 *   color   the light: cyan | lime | pink | amber         default: cyan
 *   size    width in px                                   default: 220 */
const HOLO_TINT = { cyan: 0, lime: -95, pink: 130, amber: 175 };
class PiixHoloElement extends VoxStage {
  constructor() { super(); this._defSize = 220; this._aspect = 1.25; this._defSpin = 5; this._defTilt = 10; this._defPal = 'astronaut'; this._defLook = 'holo'; }
  _label() { return `${this.palName} as a hologram`; }
  _css() { const hue = HOLO_TINT[this.getAttribute('color')] || 0; return hue ? `canvas{filter:hue-rotate(${hue}deg) saturate(1.2)}` : ''; }
  _draw(dt, t) {
    const g = this._g, w = this._cv.width, h = this._cv.height, dpr = this._dpr;
    const cx = w / 2, base = h * .86, rx = w * .3, ry = w * .07;
    g.clearRect(0, 0, w, h);
    /* the beam: a soft cone from the puck up to the figure */
    g.save(); g.globalCompositeOperation = 'lighter';
    const cone = g.createLinearGradient(0, base, 0, h * .12);
    cone.addColorStop(0, 'rgba(88,232,255,.42)'); cone.addColorStop(1, 'rgba(88,232,255,0)');
    g.fillStyle = cone; g.beginPath(); g.moveTo(cx - rx * .8, base); g.lineTo(cx + rx * .8, base); g.lineTo(cx + w * .46, h * .12); g.lineTo(cx - w * .46, h * .12); g.closePath(); g.fill();
    /* motes drifting up the beam */
    for (let i = 0; i < 16; i++) {
      const a = Math.sin(i * 12.98) * 43758.5, f = a - Math.floor(a), k = ((reduced() ? 0 : t / 2600) + f) % 1, y = base - k * (base - h * .14);
      g.fillStyle = `rgba(150,240,255,${.7 * (1 - k)})`; g.fillRect(cx + (f - .5) * rx * 1.4 * (1 + k * .9), y, 2 * dpr, 2 * dpr);
    }
    g.restore();
    /* the figure */
    const art = voxArt(this.palName, null, reduced() ? 0 : Math.floor(t / 1000 * (voxArt(this.palName)?.fps || 4)));
    if (art) {
      const m = voxFromArt(art, 3), s = Math.min(w, h * .7) * .72 / Math.max(Math.hypot(m.w, m.d), m.h);
      const bob = reduced() ? 0 : Math.sin(t / 900) * 5 * dpr;
      voxPaint(g, m, { yaw: this._yaw, pitch: this._pitch, s, x: cx, y: h * .44 + bob + this._hop(t), light: [-.3, -.6, .8], look: this.look, dpr, t, persp: .01 });
    }
    /* the puck */
    g.fillStyle = '#17121f'; g.beginPath(); g.ellipse(cx, base + ry * .9, rx * 1.12, ry * 1.25, 0, 0, 6.283); g.fill();
    g.fillStyle = '#2b2436'; g.beginPath(); g.ellipse(cx, base, rx * 1.12, ry, 0, 0, 6.283); g.fill();
    const lens = g.createRadialGradient(cx, base, 0, cx, base, rx * .8);
    lens.addColorStop(0, 'rgba(160,245,255,.95)'); lens.addColorStop(.5, 'rgba(88,232,255,.55)'); lens.addColorStop(1, 'rgba(88,232,255,0)');
    g.fillStyle = lens; g.beginPath(); g.ellipse(cx, base, rx * .8, ry * .62, 0, 0, 6.283); g.fill();
    for (let i = 0; i < 5; i++) { const a = Math.PI * (.15 + i * .175); g.fillStyle = i === Math.floor(t / 400) % 5 ? '#c6f432' : '#4a4258'; g.fillRect(cx + Math.cos(a) * rx * 1.02 - dpr * 2, base + ry * .6 + Math.sin(a) * ry * .55, dpr * 4, dpr * 3); }
  }
}
define('piix-holo', PiixHoloElement);
ELEMENTS.holo = 'piix-holo';
