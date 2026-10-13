/* PROGRESS: a segmented pixel progress bar with a pal running along the front.   @component progress
 *
 *   <piix-progress value="40"></piix-progress>
 *
 * Blocks fill in one segment at a time and a pal runs along the leading edge, keeping pace.
 * At 100% it stops and cheers. Leave out the value and it's indeterminate: the pal paces back
 * and forth. Screen readers hear it as a progress bar.
 *
 *   value     how far, 0 to max (leave out for "working…")
 *   max       the end                                    default: 100
 *   pal       who runs (pix, bitbug, penguin…)           default: pix
 *   tone      the fill colour                            default: lime
 *   segments  how many blocks                            default: 20
 *   label     what's loading, for screen readers         default: Loading */
class PiixProgressElement extends HTMLElement {
  static get observedAttributes() { return ['value', 'max', 'tone', 'pal', 'segments', 'label']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._tick = this._tick.bind(this); this._shown = 0; }
  get value() { return +this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
  connectedCallback() { this._build(); sub(this._tick); }
  disconnectedCallback() { unsub(this._tick); }
  attributeChangedCallback(n) { if (!this.shadowRoot.firstChild) return; if (n === 'value' || n === 'max' || n === 'label') this._aria(); else this._build(); }
  _build() {
    const [on] = kitTone(this), n = Math.max(4, +this.getAttribute('segments') || 20);
    this.shadowRoot.innerHTML = `<style>${kitCss()}
:host{display:block;padding-top:34px;max-width:100%}
.face{height:22px;background:#2b2436;display:grid;grid-template-columns:repeat(${n},1fr);gap:${KIT_U / 2}px;padding:${KIT_U}px}
.face i{background:rgba(255,255,255,.07)}
.face i.on{background:${on};box-shadow:inset 0 -${KIT_U / 2}px 0 rgba(0,0,0,.2)}
canvas{position:absolute;top:0;image-rendering:pixelated;pointer-events:none}
</style><div class="drop" role="progressbar" part="bar"><div class="frame"><div class="face">${'<i></i>'.repeat(n)}</div></div></div><canvas aria-hidden="true"></canvas>`;
    this._bar = this.shadowRoot.querySelector('[role=progressbar]');
    this._cells = [...this.shadowRoot.querySelectorAll('.face i')];
    this._cv = this.shadowRoot.querySelector('canvas');
    this._aria();
  }
  _aria() {
    if (!this._bar) return;
    const has = this.hasAttribute('value'), max = +this.getAttribute('max') || 100;
    this._bar.setAttribute('aria-label', this.getAttribute('label') || 'Loading');
    this._bar.setAttribute('aria-valuemin', '0'); this._bar.setAttribute('aria-valuemax', String(max));
    if (has) this._bar.setAttribute('aria-valuenow', String(clamp(this.value, 0, max))); else this._bar.removeAttribute('aria-valuenow');
  }
  _tick(dt) {
    if (!this._cv) return;
    const has = this.hasAttribute('value'), max = +this.getAttribute('max') || 100, k = has ? clamp(this.value / max, 0, 1) : null;
    this._t = (this._t || 0) + dt;
    /* the fill eases toward the value, so jumps animate */
    const want = has ? k : .5 + .5 * Math.sin(this._t * 1.4);
    this._shown += (want - this._shown) * Math.min(1, reduced() ? 1 : dt * 6);
    const n = this._cells.length, lit = has ? Math.round(this._shown * n) : -1;
    this._cells.forEach((c, i) => c.classList.toggle('on', has ? i < lit : Math.abs(i / n - this._shown) < .12));
    const name = this.getAttribute('pal') || 'pix', sp = SPRITES[name]; if (!sp) return;
    const s = 2, w = sp.w * s, bw = this._bar.offsetWidth, x = clamp(this._shown * (bw - KIT_U * 4) + KIT_U * 2 - w / 2, 0, bw - w);
    const done = has && k >= 1 && this._shown > .995, moving = Math.abs(want - this._shown) > .002 || !has;
    kitPal(this._cv, name, kitClip(name, done ? ['happy', 'jump', 'idle'] : moving ? ['run', 'walk'] : ['idle']), this._t * (moving ? 12 : 4), s);
    this._cv.style.left = x + 'px';
    this._cv.style.top = (34 - sp.h * s + KIT_U) + 'px';
    const back = !has && Math.cos(this._t * 1.4) < 0;
    this._cv.style.transform = back ? 'scaleX(-1)' : '';
  }
}
