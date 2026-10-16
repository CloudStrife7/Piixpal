/* RPG BOX: a JRPG dialogue box. A pal talks, the words type out, you pick an answer.   @component rpg-box
 *
 *   <piix-rpg-box pal="kitty" name="Kit">
 *     <p>Oh! A visitor. Nobody comes down here anymore.</p>
 *     <p>Want to see what I've been <b>building</b>?</p>
 *     <menu>
 *       <button value="yes" data-goto="tour">Show me!</button>
 *       <button value="no">Maybe later</button>
 *     </menu>
 *     <p data-end>Alright. I'll be here, typing.</p>
 *     <p id="tour" data-clip="hop">Follow me!</p>
 *   </piix-rpg-box>
 *
 * Every child is one page of dialogue. The words type out letter by letter (bold, links and
 * line breaks included) while the pal's portrait talks, with a short beat after every full
 * stop. Click, Enter or Space finishes the page, or turns to the next one. A <menu> of buttons
 * becomes a choice: arrow keys move the cursor, Enter picks. data-goto="an id" jumps to that
 * page, so dialogue can branch. It starts when it scrolls into view.
 *
 * On any page:  data-pal, data-name   who says this one (else the box's own)
 *               data-clip             the portrait's mood: any of that pal's clips (alarm, hop…)
 *               data-speed            letters per second for this page
 *               data-end              the conversation ends here
 *
 *   pal       the pal in the portrait (any pal name, or none)     default: none
 *   name      the speaker's name, shown on the box
 *   theme     classic | dark | paper | lime                       default: classic
 *   speed     letters per second                                  default: 40
 *   voice     how high the typing blips are, 0.5 to 2             default: 1
 *   lines     the text area is at least this many lines tall      default: 3
 *   auto      turn the page by itself after this many ms
 *   loop      start again after the last page
 *   font      pixel | inherit (use the page's font)               default: pixel
 *   sound     make sounds even without <piix-chiptune> ("off" to stay silent)
 *
 *   methods: next(), restart(), say(html, { pal, name, clip })
 *   events: page (detail: { index, id }), choice (detail: { value, label, index }), done */
const RPG_THEMES = {
  classic: ['#f4f1ff', 'linear-gradient(180deg,#3047c9,#141f78 70%,#0e1659)', '#ffffff', '#ffd23f', 'rgba(255,255,255,.08)'],
  dark: ['#f2eef8', '#17121f', '#f2eef8', '#c6f432', 'rgba(255,255,255,.06)'],
  paper: ['#17121f', '#fbf8f1', '#17121f', '#6b4cff', 'rgba(23,18,31,.06)'],
  lime: ['#17121f', '#c6f432', '#17121f', '#17121f', 'rgba(23,18,31,.1)']
};
/* a little pause after these, in letters' worth of time */
const RPG_BEAT = { '.': 7, '!': 7, '?': 7, ',': 3, ';': 3, ':': 3, '—': 3 };
class PiixRpgBoxElement extends HTMLElement {
  static get observedAttributes() { return ['theme', 'pal', 'name', 'lines', 'font']; }
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._state = 'idle'; this._i = -1; this._fi = 0; this._ft = 0; this._clip = '';
    this._loop = dt => this._tick(dt);
  }
  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    this._build();
    this.addEventListener('click', this._onClick = e => { if (!e.composedPath().includes(this._menu)) this.next(); });
    this.addEventListener('keydown', this._onKey = e => {
      if (e.target !== this || !['Enter', ' ', 'z', 'Z'].includes(e.key)) return;
      e.preventDefault(); this.next();
    });
    /* start when it scrolls into view, and only animate while it is on screen */
    this._io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { if (this._state === 'idle') this.restart(); sub(this._loop); } else unsub(this._loop);
    });
    this._io.observe(this);
  }
  disconnectedCallback() {
    if (this._io) this._io.disconnect();
    unsub(this._loop); clearTimeout(this._auto);
    this.removeEventListener('click', this._onClick); this.removeEventListener('keydown', this._onKey);
  }
  attributeChangedCallback() {
    if (!this.shadowRoot.firstChild) return;
    this._build();
    if (this._state !== 'idle' && this._pages) this._show(this._i, true);
  }

  _build() {
    const [edge, bg, ink, nameC, tint] = RPG_THEMES[this.getAttribute('theme')] || RPG_THEMES.classic;
    const font = this.getAttribute('font') === 'inherit' ? 'inherit' : `400 17px/1.55 ${KIT_FONT}`;
    const lines = +this.getAttribute('lines') || 3;
    this.shadowRoot.innerHTML = `<style>
:host{display:block;max-width:100%;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent}
:host(:focus-visible) .box{outline:2px dashed ${edge === '#17121f' ? '#6b4cff' : edge};outline-offset:4px}
.box{position:relative;background:${edge};clip-path:${kitCorners(4)};padding:4px}
.in{position:relative;display:flex;gap:16px;align-items:flex-start;padding:16px 20px 22px;background:${bg};color:${ink};clip-path:${kitCorners(2)}}
.por{flex:none;display:grid;place-items:end center;width:84px;height:84px;background:${tint};clip-path:${kitCorners(2)}}
.por[hidden]{display:none}
.por canvas{image-rendering:pixelated;transform-origin:50% 100%;margin-bottom:6px}
.main{flex:1;min-width:0}
.name{margin:0 0 6px;font:400 13px/1 ${KIT_FONT};letter-spacing:.08em;text-transform:uppercase;color:${nameC}}
.name:empty{display:none}
.txt{min-height:calc(${lines} * 1.55em);font:${font};overflow-wrap:break-word}
.txt>*{margin:0}
.txt a{color:${nameC}}
.txt b,.txt strong{color:${nameC};font-weight:inherit}
.more{position:absolute;right:16px;bottom:10px;width:12px;height:8px;background:${ink};clip-path:polygon(0 0,100% 0,100% 25%,75% 25%,75% 50%,62% 50%,62% 75%,50% 75%,50% 100%,38% 75%,38% 50%,25% 50%,25% 25%,0 25%);opacity:0}
:host([data-wait]) .more{opacity:1;animation:piixmore .7s steps(2) infinite}
@keyframes piixmore{50%{transform:translateY(3px)}}
.menu{display:flex;flex-direction:column;align-items:flex-start;gap:2px;margin-top:10px}
.menu:empty{display:none}
.menu button{all:unset;position:relative;padding:3px 10px 3px 24px;font:${font};color:${ink};cursor:pointer}
.menu button::before{content:'';position:absolute;left:4px;top:50%;width:8px;height:12px;margin-top:-6px;background:currentColor;clip-path:polygon(0 0,25% 0,25% 17%,50% 17%,50% 33%,75% 33%,75% 50%,100% 50%,75% 50%,75% 67%,50% 67%,50% 83%,25% 83%,25% 100%,0 100%);opacity:0}
.menu button:focus::before{opacity:1;animation:piixnudge .6s steps(2) infinite}
.menu button:focus{color:${nameC}}
@keyframes piixnudge{50%{transform:translateX(3px)}}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:520px){.por{width:60px;height:60px}.in{gap:12px;padding:12px 14px 20px}.txt,.menu button{font-size:15px}}
@media (prefers-reduced-motion:reduce){:host([data-wait]) .more,.menu button::before{animation:none!important}}
</style><div class="box" part="box"><div class="in"><div class="por" part="portrait" aria-hidden="true"><canvas></canvas></div><div class="main"><p class="name" part="name"></p><div class="txt" part="text" aria-hidden="true"></div><div class="menu" part="menu"></div></div><span class="more" aria-hidden="true"></span></div></div><div class="sr" aria-live="polite"></div>`;
    const $ = s => this.shadowRoot.querySelector(s);
    this._txt = $('.txt'); this._name = $('.name'); this._menu = $('.menu'); this._sr = $('.sr'); this._por = $('.por'); this._cv = $('canvas');
    this._menu.addEventListener('keydown', e => {
      const bs = [...this._menu.children], i = bs.indexOf(this.shadowRoot.activeElement);
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d || i < 0) return;
      e.preventDefault(); bs[(i + d + bs.length) % bs.length].focus(); sfx('blip', this);
    });
    this._paintSpeaker();
  }

  /* the pages, read fresh from the children */
  _read() { this._pages = [...this.children].filter(c => !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(c.tagName)); }
  restart() { this._read(); this._show(0); }
  say(html, o = {}) {
    const p = document.createElement('p'); p.innerHTML = html;
    if (o.pal) p.dataset.pal = o.pal;
    if (o.name) p.dataset.name = o.name;
    if (o.clip) p.dataset.clip = o.clip;
    this._pages = [p]; this._show(0);
  }
  /* finish the page if it's still typing, else turn to the next one */
  next() {
    clearTimeout(this._auto);
    if (this._state === 'typing') this._reveal(Infinity, true);
    else if (this._state === 'wait') { sfx('blip', this); this._show(this._i + 1); }
    else if (this._state === 'done' && this.hasAttribute('loop')) { sfx('blip', this); this.restart(); }
  }
  _isMenu(el) { return !!el && (el.tagName === 'MENU' || el.hasAttribute('data-choices')); }
  _show(i, quiet) {
    clearTimeout(this._auto);
    const pages = this._pages || [];
    while (this._isMenu(pages[i])) i++;
    const el = pages[i];
    this._menu.textContent = '';
    if (!el) return this._finish();
    this._i = i; this._page = el;
    this._paintSpeaker();
    /* a copy of the page's own markup, with every letter hidden */
    this._txt.textContent = '';
    for (const n of el.childNodes) this._txt.appendChild(n.cloneNode(true));
    const w = document.createTreeWalker(this._txt, NodeFilter.SHOW_TEXT);
    this._nodes = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) { this._nodes.push({ n, full: n.data }); n.data = ''; }
    this._total = this._nodes.reduce((a, o) => a + o.full.length, 0);
    this._pos = 0; this._ni = 0; this._off = 0; this._acc = 0; this._blips = 0;
    this._state = 'typing'; this.removeAttribute('data-wait');
    const who = el.dataset.name || this.getAttribute('name');
    this._sr.textContent = (who ? who + ': ' : '') + el.textContent.trim().replace(/\s+/g, ' ');
    this.setAttribute('aria-label', who ? `Dialogue with ${who}` : 'Dialogue');
    if (!quiet) this.dispatchEvent(new CustomEvent('page', { detail: { index: i, id: el.id || null } }));
    if (reduced() || quiet) this._reveal(Infinity, true);
  }
  /* uncover k more letters' worth of time; full stops and commas spend some of it waiting */
  _reveal(k, all) {
    while ((all || k >= 1) && this._pos < this._total) {
      const o = this._nodes[this._ni];
      if (this._off >= o.full.length) { this._ni++; this._off = 0; continue; }
      if (all) { o.n.data = o.full; this._pos += o.full.length - this._off; this._off = o.full.length; continue; }
      const ch = o.full[this._off++];
      o.n.data = o.full.slice(0, this._off);
      this._pos++; k -= 1 + (RPG_BEAT[ch] || 0);
      if (/\S/.test(ch) && ++this._blips % 2 === 0) sfx('type', this, { pitch: clamp(+this.getAttribute('voice') || 1, .5, 2), gap: 0 });
    }
    /* a beat that ran past this tick is paid back from the next one */
    this._acc = all ? 0 : k;
    if (this._pos >= this._total) this._pageDone();
  }
  _pageDone() {
    const el = this._page, after = this._pages[this._i + 1];
    if (this._isMenu(after) && !el.hasAttribute('data-end')) return this._choices(after);
    if (el.hasAttribute('data-end') || this._i >= this._pages.length - 1) return this._finish();
    this._state = 'wait'; this.setAttribute('data-wait', '');
    const a = this.getAttribute('auto');
    if (a !== null) this._auto = setTimeout(() => this.next(), +a || 2500);
  }
  _choices(menu) {
    this._state = 'menu'; this.removeAttribute('data-wait');
    const opts = [...menu.querySelectorAll('button,[data-value]')];
    const had = document.activeElement === this || this.shadowRoot.activeElement;
    opts.forEach((o, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = o.textContent.trim(); b.setAttribute('part', 'choice');
      b.addEventListener('pointerenter', () => { if (this.shadowRoot.activeElement !== b) { b.focus({ preventScroll: true }); sfx('blip', this); } });
      b.addEventListener('click', e => {
        e.stopPropagation(); sfx('select', this);
        const value = o.value || o.getAttribute('data-value') || b.textContent;
        this.dispatchEvent(new CustomEvent('choice', { detail: { value, label: b.textContent, index: k } }));
        const go = o.getAttribute('data-goto');
        const to = go ? this._pages.findIndex(p => p.id === go) : -1;
        this.focus({ preventScroll: true });
        this._show(to >= 0 ? to : this._pages.indexOf(menu) + 1);
      });
      this._menu.appendChild(b);
    });
    this._sr.textContent += ' Choices: ' + opts.map(o => o.textContent.trim()).join(', ') + '.';
    if (had && this._menu.firstChild) this._menu.firstChild.focus({ preventScroll: true });
  }
  _finish() {
    this._state = 'done'; this.removeAttribute('data-wait');
    this.dispatchEvent(new Event('done'));
    if (!this.hasAttribute('loop')) return;
    this.setAttribute('data-wait', '');
    const a = this.getAttribute('auto');
    if (a !== null) this._auto = setTimeout(() => this.next(), +a || 2500);
  }

  /* the portrait: talks while the words type, then idles */
  _who() { const el = this._page; return (el && el.dataset.pal) || this.getAttribute('pal') || ''; }
  _paintSpeaker() {
    if (!this._name) return;
    const el = this._page;
    this._name.textContent = (el && el.dataset.name) || this.getAttribute('name') || '';
    const pal = this._who();
    this._por.hidden = !pal || pal === 'none';
    this._drawn = '';
  }
  _tick(dt) {
    if (this._state === 'typing') {
      const sp = +((this._page && this._page.dataset.speed) || this.getAttribute('speed')) || 40;
      this._acc += dt * sp;
      if (this._acc >= 1) this._reveal(this._acc);
    }
    const pal = this._who();
    if (!pal || pal === 'none' || !SPRITES[pal]) return;
    const sp = SPRITES[pal], talking = this._state === 'typing' && !reduced();
    const mood = this._page && this._page.dataset.clip;
    const clip = kitClip(pal, (talking ? [mood, 'talk', 'walk', 'idle'] : [mood, 'idle', 'blink']).filter(Boolean));
    const fr = sp.frames[clip], fps = talking ? 8 : ((sp.fps && sp.fps[clip]) || 3);
    if (clip !== this._clip) { this._clip = clip; this._fi = 0; this._ft = 0; }
    this._ft += dt;
    if (!reduced() && this._ft > 1 / fps) { this._ft = 0; this._fi = (this._fi + 1) % fr.length; }
    const s = Math.max(1, Math.floor(70 / Math.max(sp.w, sp.h)));
    const key = pal + clip + this._fi + '/' + s;
    if (key === this._drawn) return;
    this._drawn = key;
    kitPal(this._cv, pal, clip, this._fi, s);
    this._cv.style.width = sp.w * s + 'px'; this._cv.style.height = sp.h * s + 'px';
    /* pals without a talking clip squash a little as they speak */
    this._cv.style.transform = talking && !sp.frames.talk && this._fi % 2 ? 'scale(1.05,.95)' : '';
  }
}
define('piix-rpg-box', PiixRpgBoxElement);
ELEMENTS['rpg-box'] = 'piix-rpg-box';
