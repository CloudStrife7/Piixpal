/* BUTTON: a chunky pixel button that presses down into its shadow.   @component button
 *
 *   <piix-button tone="lime">Get started</piix-button>
 *   <piix-button tone="coral" pal="bitbug">Deploy</piix-button>
 *
 * Stepped pixel corners, an ink frame and a hard shadow it sinks into when pressed. Hover sends
 * a puff of pixels off its corners. Give it a pal and a little character sits on its top edge,
 * looks round when you hover, and hops when you click. It is a real button: it focuses, works
 * with the keyboard, and submits or resets the form it's in.
 *
 *   tone      lime | coral | violet | sky | sun | mint | ink | paper     default: lime
 *   size      sm | md | lg                                              default: md
 *   pal       a pal to sit on top (bitbug, pip, frog…)
 *   type      button | submit | reset                                   default: button
 *   disabled  greyed out, can't be pressed */
class PiixButtonElement extends HTMLElement {
  static get observedAttributes() { return ['tone', 'size', 'pal', 'disabled']; }
  static get formAssociated() { return true; }
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._int = this.attachInternals ? this.attachInternals() : null;
    this._tick = this._tick.bind(this);
  }
  connectedCallback() { this._build(); }
  disconnectedCallback() { unsub(this._tick); }
  attributeChangedCallback() { if (this.shadowRoot.firstChild) this._build(); }
  _build() {
    const [bg, fg] = kitTone(this), size = { sm: [12, '7px 12px'], lg: [18, '14px 24px'] }[this.getAttribute('size')] || [14, '10px 18px'];
    const off = this.hasAttribute('disabled');
    this.shadowRoot.innerHTML = `<style>${kitCss()}
button{all:unset;display:block;cursor:${off ? 'not-allowed' : 'pointer'};border-radius:2px}
button:focus-visible .frame{outline:3px dashed ${bg};outline-offset:3px}
.face{padding:${size[1]};background:${bg};color:${fg};font-size:${size[0]}px;letter-spacing:.04em;text-transform:uppercase;box-shadow:inset 0 -${KIT_U}px 0 rgba(0,0,0,.18),inset 0 ${KIT_U}px 0 rgba(255,255,255,.35)}
button:hover .drop{transform:translateY(-1px)}
button:active .drop,:host([pressed]) .drop{transform:translateY(${KIT_U}px);filter:drop-shadow(0 0 0 var(--ink))}
:host([disabled]) .drop{opacity:.45;filter:none}
.pal{position:absolute;right:14px;bottom:100%;margin-bottom:-${KIT_U}px;image-rendering:pixelated;pointer-events:none;transition:transform .15s}
.puff{position:absolute;width:${KIT_U}px;height:${KIT_U}px;background:${bg};pointer-events:none;animation:puff .5s steps(5) forwards}
@keyframes puff{to{transform:translate(var(--dx),var(--dy));opacity:0}}
</style><button part="button" type="button"${off ? ' disabled' : ''}><span class="drop"><span class="frame"><span class="face" part="face"><slot></slot></span></span></span></button>${this.getAttribute('pal') ? '<canvas class="pal" aria-hidden="true"></canvas>' : ''}`;
    const b = this.shadowRoot.querySelector('button');
    b.addEventListener('click', () => this._click());
    b.addEventListener('pointerenter', () => this._puff());
    this._pal = this.shadowRoot.querySelector('.pal');
    unsub(this._tick);
    if (this._pal) { this._t0 = now(); sub(this._tick); }
  }
  _click() {
    if (this.hasAttribute('disabled')) return;
    this._hop = now();
    const t = this.getAttribute('type'), form = this._int && this._int.form;
    if (form && t === 'submit') form.requestSubmit ? form.requestSubmit() : form.submit();
    if (form && t === 'reset') form.reset();
  }
  /* four pixels fly off the corners on hover */
  _puff() {
    if (reduced() || this.hasAttribute('disabled')) return;
    const w = this.shadowRoot.querySelector('.drop');
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, y]) => {
      const p = document.createElement('i'); p.className = 'puff';
      p.style.left = (x < 0 ? 0 : w.offsetWidth - KIT_U) + 'px'; p.style.top = (y < 0 ? 0 : w.offsetHeight - KIT_U) + 'px';
      p.style.setProperty('--dx', x * 14 + 'px'); p.style.setProperty('--dy', y * 12 + 'px');
      w.appendChild(p); setTimeout(() => p.remove(), 520);
    });
  }
  _tick() {
    const name = this.getAttribute('pal'), e = (now() - this._t0) / 1000, hover = this.matches(':hover'), hopT = (now() - (this._hop || -1e9)) / 1000;
    if (!kitPal(this._pal, name, kitClip(name, hover ? ['look', 'happy', 'idle'] : ['idle', 'sit', 'rest']), e * 4, 2)) return;
    this._pal.style.transform = hopT < .4 ? `translateY(${-Math.sin(hopT / .4 * Math.PI) * 14}px)` : '';
  }
}
define('piix-button', PiixButtonElement);
ELEMENTS.button = 'piix-button';
