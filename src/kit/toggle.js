/* TOGGLE: a pixel switch, and a pal walks across to flip it.   @component toggle
 *
 *   <piix-toggle checked>Dark mode</piix-toggle>
 *
 * The knob is a pal standing in the track. Switch it and the pal walks to the other end, turns,
 * and the track lights up behind it. It's a real switch: it focuses, Space and Enter flip it,
 * screen readers hear on and off, and it sends its value with the form it's in.
 *
 *   checked   on
 *   pal       who flips it (bitbug, pinch, penguin…)       default: bitbug
 *   tone      the colour when on                          default: lime
 *   name      the form field name
 *   value     sent when on                                default: on
 *   disabled  can't be flipped
 *
 *   events: change, piix:toggle { checked } */
const TOGGLE_W = 64;
class PiixToggleElement extends HTMLElement {
  static get observedAttributes() { return ['checked', 'tone', 'pal', 'disabled']; }
  static get formAssociated() { return true; }
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._int = this.attachInternals ? this.attachInternals() : null;
    this._tick = this._tick.bind(this);
    this._x = null;
  }
  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
  connectedCallback() { if (!this.shadowRoot.firstChild) this._build(); this._sync(); sub(this._tick); }
  disconnectedCallback() { unsub(this._tick); }
  attributeChangedCallback(n) { if (!this.shadowRoot.firstChild) return; if (n === 'checked' || n === 'disabled') this._sync(); else this._build(); }
  _build() {
    const [on] = kitTone(this);
    this.shadowRoot.innerHTML = `<style>${kitCss()}
:host{cursor:pointer}:host([disabled]){cursor:not-allowed;opacity:.5}
.row{display:inline-flex;align-items:center;gap:12px}
[role=switch]{outline:none}
[role=switch]:focus-visible .frame{outline:3px dashed ${on};outline-offset:3px}
.face{width:${TOGGLE_W}px;height:26px;background:#3b3448;transition:background .2s steps(3)}
:host([checked]) .face{background:${on}}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.25) 1px,transparent 1.5px);background-size:${KIT_U * 2}px ${KIT_U * 2}px}
canvas{position:absolute;bottom:${KIT_U + 2}px;left:0;image-rendering:pixelated;pointer-events:none}
.label{font-size:13px;text-transform:uppercase;letter-spacing:.04em}
</style><span class="row"><span role="switch" tabindex="0" part="switch"><span class="drop"><span class="frame"><span class="face"><i class="dots"></i></span></span></span></span><span class="label"><slot></slot></span></span><canvas aria-hidden="true"></canvas>`;
    this._sw = this.shadowRoot.querySelector('[role=switch]');
    this._cv = this.shadowRoot.querySelector('canvas');
    this.addEventListener('click', this._onClick || (this._onClick = () => this._flip()));
    this._sw.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this._flip(); } });
    const label = this.textContent.trim();
    if (label) this._sw.setAttribute('aria-label', label);
    this._sync();
  }
  _flip() {
    if (this.hasAttribute('disabled')) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('piix:toggle', { bubbles: true, detail: { checked: this.checked } }));
  }
  _sync() {
    if (!this._sw) return;
    this._sw.setAttribute('aria-checked', String(this.checked));
    this._sw.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    if (this._int) this._int.setFormValue(this.checked ? (this.getAttribute('value') || 'on') : null);
  }
  /* the pal walks to its end of the track */
  _tick(dt) {
    const name = this.getAttribute('pal') || 'bitbug', sp = SPRITES[name];
    if (!sp || !this._cv) return;
    const s = 2, w = sp.w * s, sw = this._sw.getBoundingClientRect(), host = this.getBoundingClientRect();
    const x0 = sw.left - host.left + KIT_U + 2, x1 = sw.left - host.left + TOGGLE_W + KIT_U * 2 - w - 2, want = this.checked ? x1 : x0;
    if (this._x == null) this._x = want;
    const step = reduced() ? Infinity : 70 * dt, d = want - this._x, moving = Math.abs(d) > .5;
    this._x += Math.sign(d) * Math.min(Math.abs(d), step);
    this._t = (this._t || 0) + dt;
    kitPal(this._cv, name, kitClip(name, moving ? ['walk', 'run', 'slide'] : ['idle', 'sit']), this._t * (moving ? 10 : 3), s);
    this._cv.style.left = this._x + 'px';
    this._cv.style.transform = (moving ? d < 0 : !this.checked) ? 'scaleX(-1)' : '';
  }
}
define('piix-toggle', PiixToggleElement);
ELEMENTS.toggle = 'piix-toggle';
