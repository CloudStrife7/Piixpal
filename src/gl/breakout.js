/* BREAKOUT: your words are the bricks.   @component breakout
 *
 *   <piix-breakout pal="bitbug">
 *     <h2>Break every word in this heading</h2>
 *     <p>And this paragraph too, <b data-solid>if</b> you can.</p>
 *   </piix-breakout>
 *
 * Whatever you put inside stays normal, readable content until someone presses Play. Then
 * every word becomes a brick, right where it sits on the page: a ball comes off a paddle (with
 * a pal riding it), and each word it hits shatters into pixels of its own colour and is gone.
 * Clear them all to win; lose every ball and the words fly back into place. Move with the
 * pointer, a finger or the arrow keys; Space launches, Escape pauses. Words inside an element
 * with data-solid are steel: the ball bounces off, but they never break.
 *
 *   pal       the pal riding the paddle (any pal name, or none)      default: bitbug
 *   lives     balls you get                                           default: 3
 *   speed     how fast the ball is, 0.5 to 2                          default: 1
 *   tone      ball and paddle: lime | coral | violet | sky | sun | mint | ink | paper
 *   field     room under the words for the paddle, in px              default: 150
 *   sound     make sounds even without <piix-chiptune> ("off" to stay silent)
 *
 *   methods: play(), pause(), reset()
 *   events: start, brick (detail: { word, score }), win (detail: { score }), lose (detail: { score }) */
const BRK_SKIP = 'script,style,svg,canvas,video,audio,img,input,textarea,select,button,piix-pal,piix-sprite,[aria-hidden=true]';
const BRK_INK = '#17121f';
const BRK_HEART = '<svg viewBox="0 0 7 6" width="14" height="12" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/></svg>';
class PiixBreakoutElement extends HTMLElement {
  static get observedAttributes() { return ['tone', 'field', 'pal']; }
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._state = 'idle'; this._bricks = []; this._parts = []; this._pops = [];
    this._keys = 0; this._fi = 0; this._ft = 0; this._mood = ''; this._moodT = 0;
    this._loop = dt => this._tick(dt);
  }
  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    this.setAttribute('aria-label', 'Breakout: the words here are the bricks');
    this._build();
    this._ro = new ResizeObserver(() => { this._size(); if (this._state !== 'idle') this._measure(); this._draw(); });
    this._ro.observe(this);
    this._io = new IntersectionObserver(([en]) => { if (!en.isIntersecting && (this._state === 'play' || this._state === 'serve')) this.pause(); });
    this._io.observe(this);
    this.addEventListener('pointermove', this._pm = e => {
      if (!this._live()) return;
      this._tx = e.clientX - this.getBoundingClientRect().left; this._keys = 0;
    });
    this.addEventListener('pointerdown', this._pd = e => {
      if (e.composedPath().includes(this._go)) return;
      if (this._state === 'serve') { this._tx = e.clientX - this.getBoundingClientRect().left; this._launch(); }
    });
    this.addEventListener('keydown', this._kd = e => {
      const k = e.key, live = this._live();
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { if (live) { this._keys = -1; e.preventDefault(); } }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { if (live) { this._keys = 1; e.preventDefault(); } }
      else if (k === ' ' || k === 'Enter') {
        if (e.target !== this) return;
        e.preventDefault();
        if (this._state === 'serve') this._launch(); else if (this._state !== 'play') this.play();
      } else if ((k === 'Escape' || k === 'p' || k === 'P') && live) { e.preventDefault(); this.pause(); }
    });
    this.addEventListener('keyup', this._ku = e => { if (/^(Arrow(Left|Right)|[aAdD])$/.test(e.key)) this._keys = 0; });
  }
  disconnectedCallback() {
    unsub(this._loop);
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    this.removeEventListener('pointermove', this._pm); this.removeEventListener('pointerdown', this._pd);
    this.removeEventListener('keydown', this._kd); this.removeEventListener('keyup', this._ku);
  }
  attributeChangedCallback() { if (this.shadowRoot.firstChild) { this._build(); this._size(); this._draw(); } }
  _live() { return this._state === 'play' || this._state === 'serve'; }
  _field() { return Math.max(110, +this.getAttribute('field') || 150); }

  _build() {
    const [fill, ink] = kitTone(this);
    this._fill = fill;
    this.shadowRoot.innerHTML = `<style>
:host{position:relative;display:block;padding-bottom:${this._field()}px;outline:none;-webkit-tap-highlight-color:transparent}
:host(:focus-visible){outline:2px dashed ${BRK_INK};outline-offset:6px}
:host([data-live]){cursor:none;user-select:none;-webkit-user-select:none}
canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;z-index:2}
.go{all:unset;position:absolute;z-index:3;left:50%;bottom:${Math.round(this._field() / 2) - 4}px;transform:translateX(-50%);box-sizing:border-box;padding:4px;background:${BRK_INK};clip-path:${kitCorners(3)};cursor:pointer;text-align:center;white-space:nowrap}
.go i{display:block;padding:9px 16px 8px;background:${fill};color:${ink};clip-path:${kitCorners(2)};font:400 14px/1 ${KIT_FONT};font-style:normal;text-transform:uppercase;letter-spacing:.06em;transition:transform 60ms steps(1)}
.go small{display:block;margin-top:5px;font:400 10px/1 ${KIT_FONT};opacity:.75;letter-spacing:.04em}
.go:hover i{transform:translateY(-1px)}
.go:active i{transform:translateY(1px)}
.go:focus-visible{outline:2px dashed ${BRK_INK};outline-offset:3px}
.go[hidden]{display:none}
.hud{position:absolute;z-index:3;left:4px;right:4px;bottom:6px;display:flex;justify-content:space-between;align-items:center;font:400 13px/1 ${KIT_FONT};letter-spacing:.06em;color:currentColor;pointer-events:none;opacity:0;transition:opacity .2s steps(2)}
:host([data-hud]) .hud{opacity:.85}
.hearts{display:flex;gap:4px;fill:#ff4a6b}
.hearts svg.gone{fill:currentColor;opacity:.25}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style><slot></slot><canvas aria-hidden="true"></canvas><button class="go" type="button" part="button"><i></i></button><div class="hud" aria-hidden="true"><span class="hearts"></span><span class="score">0000</span></div><div class="sr" aria-live="polite"></div>`;
    const $ = s => this.shadowRoot.querySelector(s);
    this._cv = $('canvas'); this._g = this._cv.getContext('2d'); this._go = $('.go'); this._hearts = $('.hearts'); this._score = $('.score'); this._sr = $('.sr');
    this._go.addEventListener('click', e => { e.stopPropagation(); this._state === 'paused' ? this._resume() : this.play(); });
    this._label();
    this._palCv = document.createElement('canvas');
  }
  _label() {
    const [t, s] = { idle: ['▶ Play breakout', 'your words are the bricks'], paused: ['▶ Resume', 'paused'], won: ['▶ Play again', 'you cleared it!'], over: ['▶ Try again', 'game over'] }[this._state] || ['', ''];
    this._go.hidden = this._live();
    this._go.querySelector('i').innerHTML = `${t}<small>${s}</small>`;
    this._go.setAttribute('aria-label', `${t.slice(2)}, ${s}`);
  }
  _size() {
    const r = this.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    this._W = r.width; this._H = r.height;
    this._cv.width = Math.round(r.width * d); this._cv.height = Math.round(r.height * d);
    this._g.setTransform(d, 0, 0, d, 0, 0); this._g.imageSmoothingEnabled = false;
    this._pw = clamp(r.width * .16, 64, 120);
    this._py = r.height - 34;
    if (this._px == null) this._px = this._tx = r.width / 2;
    this._px = clamp(this._px, this._pw / 2, r.width - this._pw / 2);
    if (this._state === 'idle' || this._state === 'serve') { this._bx = this._px; this._by = this._py - 6; }
  }

  /* every word becomes a <span> of its own, so the ball can find it (done once, on first play) */
  _wrap() {
    if (this._wrapped) return;
    this._wrapped = true;
    const w = document.createTreeWalker(this, NodeFilter.SHOW_TEXT, { acceptNode: n => !n.data.trim() || (n.parentElement && n.parentElement.closest(BRK_SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const list = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) list.push(n);
    for (const n of list) {
      const f = document.createDocumentFragment();
      for (const part of n.data.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(part)); continue; }
        const s = document.createElement('span');
        s.className = 'piix-brick'; s.textContent = part;
        s.style.transition = 'opacity .15s steps(2)';
        f.appendChild(s);
        this._bricks.push({ el: s, word: part, alive: true, solid: !!n.parentElement.closest('[data-solid]') });
      }
      n.replaceWith(f);
    }
  }
  _measure() {
    const h = this.getBoundingClientRect();
    for (const b of this._bricks) {
      const r = b.el.getBoundingClientRect();
      b.x = r.left - h.left; b.y = r.top - h.top; b.w = r.width; b.h = r.height;
      if (!b.c) b.c = getComputedStyle(b.el).color;
    }
  }

  play() {
    this._wrap();
    this._bricks.forEach(b => { b.alive = true; b.el.style.opacity = ''; });
    this._measure();
    this._lives = clamp(+this.getAttribute('lives') || 3, 1, 9);
    this._pts = 0; this._hits = 0; this._parts = []; this._pops = [];
    this._serve();
    this.toggleAttribute('data-hud', true);
    this._hud();
    if (document.activeElement !== this) this.focus({ preventScroll: true });
    sfx('powerup', this);
    this.dispatchEvent(new Event('start'));
    this._say(`Breakout started. ${this._lives} balls. Arrow keys move, Space launches.`);
  }
  pause() {
    if (!this._live()) return;
    this._was = this._state; this._state = 'paused';
    this._setLive(false); this._label();
  }
  _resume() { this._state = this._was || 'serve'; this._setLive(true); this._label(); this.focus({ preventScroll: true }); }
  /* everything back to how it was before the game */
  reset() {
    this._state = 'idle'; this._setLive(false);
    this._bricks.forEach(b => { b.alive = true; b.el.style.opacity = ''; });
    this._parts = []; this._pops = [];
    this.removeAttribute('data-hud'); this._label(); this._size(); this._draw();
  }
  _serve() { this._state = 'serve'; this._bx = this._px; this._by = this._py - 6; this._setLive(true); this._label(); }
  _setLive(on) {
    this.toggleAttribute('data-live', on);
    this.style.touchAction = on ? 'none' : '';
    if (on) sub(this._loop);
  }
  _launch() {
    const sp = this._speed(), a = rnd(-.45, .45);
    this._vx = Math.sin(a) * sp; this._vy = -Math.cos(a) * sp;
    this._state = 'play';
    sfx('launch', this);
  }
  _speed() { return 340 * clamp(+this.getAttribute('speed') || 1, .5, 2) * Math.min(1.7, Math.pow(1.012, this._hits || 0)); }
  _hud() {
    this._hearts.innerHTML = Array.from({ length: +this.getAttribute('lives') || 3 }, (_, i) => BRK_HEART.replace('<svg', `<svg class="${i < this._lives ? '' : 'gone'}"`)).join('');
    this._score.textContent = String(this._pts).padStart(4, '0');
  }
  _say(t) { this._sr.textContent = t; }

  _tick(dt) {
    const W = this._W, H = this._H;
    if (!W) return;
    /* the paddle glides to where you point, or where the keys push it */
    if (this._live()) {
      if (this._keys) this._tx = this._px + this._keys * 90;
      const prev = this._px;
      this._px = clamp(this._px + (clamp(this._tx, 0, W) - this._px) * Math.min(1, dt * (this._keys ? 9 : 18)), this._pw / 2, W - this._pw / 2);
      this._moving = Math.abs(this._px - prev) > .4;
    }
    if (this._state === 'serve') { this._bx = this._px; this._by = this._py - 6; }
    if (this._state === 'play') {
      const n = Math.max(1, Math.ceil(Math.hypot(this._vx, this._vy) * dt / 4));
      for (let i = 0; i < n && this._state === 'play'; i++) this._step(dt / n);
    }
    for (const p of this._parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.t -= dt; }
    this._parts = this._parts.filter(p => p.t > 0 && p.y < H + 10);
    for (const p of this._pops) { p.y -= 40 * dt; p.t -= dt; }
    this._pops = this._pops.filter(p => p.t > 0);
    if (this._moodT > 0 && (this._moodT -= dt) <= 0) this._mood = '';
    this._draw(dt);
    if (!this._live() && !this._parts.length && !this._pops.length) unsub(this._loop);
  }
  _step(dt) {
    const W = this._W, H = this._H, r = 5;
    this._bx += this._vx * dt; this._by += this._vy * dt;
    if (this._bx < r) { this._bx = r; this._vx = Math.abs(this._vx); sfx('bounce', this, { pitch: 1.6 }); }
    if (this._bx > W - r) { this._bx = W - r; this._vx = -Math.abs(this._vx); sfx('bounce', this, { pitch: 1.6 }); }
    if (this._by < r) { this._by = r; this._vy = Math.abs(this._vy); sfx('bounce', this, { pitch: 1.6 }); }
    /* the paddle: where you hit it sets the angle you leave at */
    const half = this._pw / 2;
    if (this._vy > 0 && this._by + r >= this._py && this._by + r <= this._py + 14 && Math.abs(this._bx - this._px) <= half + r) {
      let off = clamp((this._bx - this._px) / half, -1, 1) * 1.05;
      /* never straight up: a dead-centre hit still leans a little, so the ball can't loop in one gap */
      if (Math.abs(off) < .12) off = (off < 0 || (off === 0 && chance(.5)) ? -1 : 1) * .12;
      const sp = this._speed();
      this._vx = Math.sin(off) * sp; this._vy = -Math.cos(off) * sp; this._by = this._py - r;
      sfx('bounce', this); this._mood = 'hop'; this._moodT = .25;
    }
    /* the words */
    for (const b of this._bricks) {
      if (!b.alive || !b.w) continue;
      const ox = Math.min(this._bx + r, b.x + b.w) - Math.max(this._bx - r, b.x);
      const oy = Math.min(this._by + r, b.y + b.h) - Math.max(this._by - r, b.y);
      if (ox <= 0 || oy <= 0) continue;
      if (ox < oy) { this._vx = this._bx < b.x + b.w / 2 ? -Math.abs(this._vx) : Math.abs(this._vx); }
      else { this._vy = this._by < b.y + b.h / 2 ? -Math.abs(this._vy) : Math.abs(this._vy); }
      if (b.solid) { sfx('hit', this); break; }
      this._smash(b);
      break;
    }
    if (this._by - r > H) this._miss();
  }
  _smash(b) {
    b.alive = false; b.el.style.opacity = '0';
    this._hits++;
    const pts = 10 * Math.ceil(b.word.length / 4);
    this._pts += pts; this._hud();
    /* the word falls apart into pixels of its own colour */
    const k = reduced() ? 6 : clamp(Math.round(b.w * b.h / 40), 10, 60);
    for (let i = 0; i < k; i++) this._parts.push({ x: b.x + rnd(0, b.w), y: b.y + rnd(0, b.h), vx: rnd(-160, 160), vy: rnd(-260, -40), t: rnd(.5, 1.1), c: b.c, s: chance(.3) ? 4 : 3 });
    this._pops.push({ x: b.x + b.w / 2, y: b.y, t: .7, txt: '+' + pts });
    sfx('break', this, { pitch: rnd(.9, 1.15), gap: 0 });
    this.dispatchEvent(new CustomEvent('brick', { detail: { word: b.word, score: this._pts } }));
    if (!this._bricks.some(o => o.alive && !o.solid)) this._win();
  }
  _miss() {
    this._lives--; this._hud();
    this._mood = 'alarm'; this._moodT = .8;
    if (this._lives > 0) { sfx('hit', this); this._say(`Missed. ${this._lives} left.`); this._serve(); return; }
    this._state = 'over'; this._setLive(false); this._label();
    sfx('lose', this);
    this._say(`Game over. Score ${this._pts}.`);
    this.dispatchEvent(new CustomEvent('lose', { detail: { score: this._pts } }));
    /* the words fly back, one after another */
    this._bricks.filter(b => !b.alive).forEach((b, i) => setTimeout(() => { if (this._state === 'over') { b.alive = true; b.el.style.opacity = ''; } }, 200 + i * 30));
  }
  _win() {
    this._state = 'won'; this._setLive(false); this._label();
    sfx('win', this);
    this._say(`You cleared every word! Score ${this._pts}.`);
    this.dispatchEvent(new CustomEvent('win', { detail: { score: this._pts } }));
    const W = this._W, cols = ['#c6f432', '#ff6b4a', '#6b4cff', '#58c8ff', '#ffd23f'];
    for (let i = 0; i < (reduced() ? 20 : 90); i++) this._parts.push({ x: rnd(0, W), y: rnd(-20, this._H * .4), vx: rnd(-80, 80), vy: rnd(-200, 40), t: rnd(.8, 1.8), c: pick(cols), s: 4 });
    sub(this._loop);
  }

  _draw(dt = 0) {
    const g = this._g, W = this._W, H = this._H;
    if (!g || !W) return;
    g.clearRect(0, 0, W, H);
    const snap = v => Math.round(v);
    for (const p of this._parts) { g.globalAlpha = clamp(p.t * 2, 0, 1); g.fillStyle = p.c; g.fillRect(snap(p.x), snap(p.y), p.s, p.s); }
    g.globalAlpha = 1;
    g.font = `400 12px ${KIT_FONT}`; g.textAlign = 'center';
    for (const p of this._pops) { g.globalAlpha = clamp(p.t * 2, 0, 1); g.fillStyle = BRK_INK; g.fillText(p.txt, snap(p.x) + 1, snap(p.y) + 1); g.fillStyle = this._fill; g.fillText(p.txt, snap(p.x), snap(p.y)); }
    g.globalAlpha = this._state === 'idle' || this._state === 'paused' ? .55 : 1;
    /* the paddle: an ink outline with notched corners, a bright top edge */
    const pw = Math.round(this._pw), x = snap(this._px - pw / 2), y = snap(this._py);
    g.fillStyle = BRK_INK; g.fillRect(x - 2, y, pw + 4, 12); g.fillRect(x, y - 2, pw, 16);
    g.fillStyle = this._fill; g.fillRect(x, y, pw, 10);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 2, y, pw - 4, 2);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y + 8, pw, 2);
    this._drawPal(g, dt, x + pw / 2, y - 2);
    /* the ball */
    if (this._state !== 'won' && this._state !== 'over') {
      const bx = snap(this._bx) - 5, by = snap(this._by) - 5;
      g.fillStyle = BRK_INK; g.fillRect(bx - 2, by, 14, 10); g.fillRect(bx, by - 2, 10, 14);
      g.fillStyle = this._fill; g.fillRect(bx, by, 10, 10);
      g.fillStyle = '#ffffff'; g.fillRect(bx + 2, by + 2, 3, 3);
    }
    g.globalAlpha = 1;
  }
  /* the pal rides the paddle: walks when it moves, hops on a bounce, panics on a miss */
  _drawPal(g, dt, cx, floor) {
    const name = this.getAttribute('pal') || 'bitbug';
    if (name === 'none' || !SPRITES[name]) return;
    const sp = SPRITES[name];
    const clip = kitClip(name, [this._mood, this._moving ? 'walk' : 'idle', 'idle'].filter(Boolean));
    if (clip !== this._clip) { this._clip = clip; this._fi = 0; }
    this._ft += dt;
    const fps = (sp.fps && sp.fps[clip]) || 6;
    if (!reduced() && this._ft > 1 / fps) { this._ft = 0; this._fi = (this._fi + 1) % sp.frames[clip].length; }
    const s = Math.max(1, Math.min(3, Math.floor(36 / sp.h)));
    kitPal(this._palCv, name, clip, this._fi, s);
    const hop = this._mood === 'hop' ? -4 : 0;
    g.save();
    if (this._vx < 0 && this._state === 'play') { g.translate(Math.round(cx), 0); g.scale(-1, 1); g.translate(-Math.round(cx), 0); }
    g.drawImage(this._palCv, Math.round(cx - sp.w * s / 2), Math.round(floor - sp.h * s + hop));
    g.restore();
  }
}
define('piix-breakout', PiixBreakoutElement);
ELEMENTS.breakout = 'piix-breakout';
