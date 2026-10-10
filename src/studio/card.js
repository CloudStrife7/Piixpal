/* CARD: a holographic trading card for any pal.   @component card
 *
 *   <piix-card pal="frog"></piix-card>
 *
 * The card tilts toward your pointer, a rainbow foil slides across it as it turns, and the pal stands
 * in 3D a little in front of the card, slowly turning. Drag the pal to spin it, tap to make it hop.
 * Every pal and sprite has a number, a type and a line about what it does.
 *
 *   pal      any pal or sprite name                                         default: bitbug
 *   rarity   common | rare | holo  (holo has the foil)                        default: holo
 *   look     how the pal is drawn: glossy | clay | toon | wire | holo | halftone | dither | ascii
 *   size     card width in px; it is 1.4 times as tall                       default: 240
 *   color    the card's colour                                              default: from the pal */
const CARD_DOES = {
  crawl: 'Crawls along the tops of your headings and climbs over the letters.', bounce: 'Bounces on whatever is underneath it.',
  lounge: 'Finds a paragraph and naps on it.', perch: 'Perches on your buttons and pecks at them.', toss: 'Throw it across the page. It bounces back.',
  follow: 'Follows your pointer around, at a polite distance.', peek: 'Peeks over the edge of things and hides when you look.',
  float: 'Floats up the page. Poke it and it pops.', climb: 'Climbs the sides of your boxes.', snap: 'Snaps at your cursor when it gets close.',
  slide: 'Slides along your text like it is ice.', mimic: 'Copies what your pointer does.', pop: 'Pops up out of the ground to see what you are doing.',
  mind: 'Reads your page. Gets annoyed if you scroll too fast.', drop: 'Parachutes onto the page and waves.', guard: 'Covers its eyes while you type a password.',
  launch: 'Launches when you scroll back to the top.', sweep: 'Sweeps the bottom of your page clean.', signal: 'Shows how good your connection is.',
  progress: 'Runs along the top as you scroll down.', creep: 'Creeps along slowly, hides in its shell.', select: 'Snips around whatever text you select.',
  type: 'Types along when you type.', hang: 'Hangs from a thread and wiggles.', captcha: 'Gets nervous when you are a robot.',
  player: 'Turns your page into a platformer.', courier: 'Delivers your notifications by air.', cord: 'A pull chain for dark mode.',
  pet: 'Hatches into a pet that belongs to each visitor.', munch: 'Eats the crumbs of your page.', mood: 'Shows the mood of whatever you are typing.'
};
class PiixCardElement extends VoxStage {
  constructor() { super(); this._defSize = 240; this._aspect = 1.4; this._defSpin = 4; this._defTilt = 14; }
  _info() {
    const n = this.palName, s = SPRITES[n], f = FIGURES[n];
    const all = [...Object.keys(SPRITES).filter(k => k[0] !== '_'), ...Object.keys(FIGURES)], no = Math.max(1, all.indexOf(n) + 1);
    const type = s ? s.does || 'pal' : 'sprite';
    const line = f ? (f.tag || '').replace(/^A |^An /, m => m) : CARD_DOES[type] || 'Lives somewhere on your website.';
    /* its colour: the commonest colour in its art that isn't nearly black or white */
    const art = voxArt(n), count = {};
    if (art) for (const r of art.rows) for (const c of r) if (art.palette[c]) count[c] = (count[c] || 0) + 1;
    let accent = '#c6f432', best = 0;
    for (const c in count) { const [r, g, b] = hexRGBA(art.palette[c]), l = (r * .3 + g * .59 + b * .11) / 255; if (l > .22 && l < .93 && count[c] > best) { best = count[c]; accent = art.palette[c]; } }
    return { name: n.replace(/^./, c => c.toUpperCase()), no: String(no).padStart(3, '0'), total: all.length, type, line, accent: this.getAttribute('color') || accent };
  }
  _label() { const i = this._info(); return `${i.name} trading card, number ${i.no}: ${i.line}`; }
  _html(w, h) {
    const i = this._info(), r = this.getAttribute('rarity') || 'holo', stars = { common: 1, rare: 2, holo: 3 }[r] || 3;
    this._cvW = Math.round(w * .82); this._cvH = Math.round(h * .5);
    const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    return `<div class="p"><div class="c" part="card" style="--a:${e(i.accent)}">
<div class="in"><i class="sun"></i><i class="dots"></i></div>
<div class="top"><b>${e(i.name)}</b><span>#${i.no}</span></div>
<div class="art"><canvas part="canvas"></canvas></div>
<div class="panel"><div class="type">${e(i.type)}<span>${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div><p>${e(i.line)}</p></div>
${r === 'holo' ? '<i class="foil"></i>' : ''}<i class="glare"></i></div></div>`;
  }
  _css(w, h) {
    const u = w / 240;
    return `.p{perspective:${900 * u}px;width:${w}px;height:${h}px}
.c{position:relative;width:100%;height:100%;border-radius:${16 * u}px;background:#17121f;transform-style:preserve-3d;box-shadow:0 ${20 * u}px ${44 * u}px -${14 * u}px rgba(23,18,31,.55);--mx:50%;--my:50%;--fo:.4}
.in{position:absolute;inset:${9 * u}px;border-radius:${10 * u}px;overflow:hidden;background:var(--a)}
.sun{position:absolute;left:50%;top:38%;width:${h * 2}px;height:${h * 2}px;margin:-${h}px 0 0 -${h}px;background:repeating-conic-gradient(rgba(255,255,255,.24) 0 7deg,transparent 7deg 14deg);animation:sp 60s linear infinite}
@keyframes sp{to{transform:rotate(1turn)}}@media (prefers-reduced-motion:reduce){.sun{animation:none}}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(23,18,31,.26) ${1.1 * u}px,transparent ${1.5 * u}px);background-size:${7 * u}px ${7 * u}px;-webkit-mask:linear-gradient(transparent 25%,#000 70%);mask:linear-gradient(transparent 25%,#000 70%)}
.top{position:absolute;left:${20 * u}px;right:${20 * u}px;top:${18 * u}px;display:flex;justify-content:space-between;align-items:baseline;transform:translateZ(${10 * u}px);font:800 ${21 * u}px/1 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.02em;color:#17121f}
.top span{font:600 ${11 * u}px ui-monospace,Menlo,monospace;opacity:.7}
.art{position:absolute;left:${(w - this._cvW) / 2}px;top:${h * .1}px;transform:translateZ(${42 * u}px);pointer-events:none}
.panel{position:absolute;left:${16 * u}px;right:${16 * u}px;bottom:${16 * u}px;height:${h * .3}px;box-sizing:border-box;padding:${11 * u}px ${12 * u}px;border-radius:${10 * u}px;background:#fffdf7;transform:translateZ(${16 * u}px);box-shadow:0 ${3 * u}px 0 #17121f}
.type{display:flex;justify-content:space-between;font:700 ${10 * u}px/1 ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em;color:#6c6477}
.type span{color:#17121f;letter-spacing:.1em}
.panel p{margin:${7 * u}px 0 0;font:500 ${12.5 * u}px/1.35 "Bricolage Grotesque",system-ui,sans-serif;color:#17121f}
.foil,.glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;transform:translateZ(${44 * u}px)}
.foil{background:linear-gradient(115deg,transparent 22%,rgba(255,0,170,.55) 36%,rgba(0,255,234,.5) 48%,rgba(255,240,0,.5) 60%,transparent 74%);background-size:260% 260%;background-position:var(--mx) var(--my);mix-blend-mode:color-dodge;opacity:var(--fo)}
.glare{background:radial-gradient(circle at var(--mx) var(--my),rgba(255,255,255,.6),transparent 46%);mix-blend-mode:overlay}`;
  }
  _setup() { this._card = this.shadowRoot.querySelector('.c'); this._tilt = [0, 0]; }
  _draw(dt, t) {
    /* the tilt: toward the pointer while it's over the card, a slow sway otherwise */
    const r = this.getBoundingClientRect(), px = (ptr.cx - r.left) / r.width, py = (ptr.cy - r.top) / r.height;
    const over = px > -.1 && px < 1.1 && py > -.1 && py < 1.1, R = reduced();
    const want = over ? [(.5 - py) * 22, (px - .5) * 26] : R ? [0, 0] : [Math.sin(t / 1700) * 4, Math.sin(t / 2300) * 8];
    this._tilt[0] = lerp(this._tilt[0], want[0], Math.min(1, dt * 8)); this._tilt[1] = lerp(this._tilt[1], want[1], Math.min(1, dt * 8));
    const mx = over ? px * 100 : 50 + this._tilt[1] * 3, my = over ? py * 100 : 50 - this._tilt[0] * 3;
    const c = this._card;
    c.style.transform = `rotateX(${this._tilt[0].toFixed(2)}deg) rotateY(${this._tilt[1].toFixed(2)}deg)`;
    c.style.setProperty('--mx', mx.toFixed(1) + '%'); c.style.setProperty('--my', my.toFixed(1) + '%'); c.style.setProperty('--fo', over ? .8 : .38);
    /* the pal */
    const g = this._g, w = this._cv.width, h = this._cv.height, first = voxArt(this.palName);
    if (!first) return;
    const art = R ? first : voxArt(this.palName, null, Math.floor(t / 1000 * first.fps));
    const m = voxFromArt(art, 3), s = Math.min(w, h) * .8 / Math.max(Math.hypot(m.w, m.d), m.h);
    g.clearRect(0, 0, w, h);
    voxPaint(g, m, { yaw: this._yaw + this._tilt[1] * .02, pitch: this._pitch - this._tilt[0] * .012, s, x: w / 2, y: h / 2 + this._hop(t), light: this._L, look: this.look, dpr: this._dpr, t, persp: .012 });
  }
}
define('piix-card', PiixCardElement);
ELEMENTS.card = 'piix-card';
