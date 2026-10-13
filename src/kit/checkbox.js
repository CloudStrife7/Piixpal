/* CHECKBOX: a pixel checkbox whose tick is drawn in, pixel by pixel.   @component checkbox
 *
 *   <piix-checkbox checked>Send me updates</piix-checkbox>
 *
 * A chunky pixel box. Tick it and the check mark draws itself in, block by block, with a puff
 * of pixels; untick and it un-draws. A real checkbox: it focuses, Space ticks it, screen readers
 * hear it, and it sends its value with the form it's in.
 *
 *   checked   ticked
 *   tone      the box colour when ticked                   default: lime
 *   name      the form field name
 *   value     sent when ticked                             default: on
 *   disabled  can't be ticked
 *
 *   events: change */
const CHECK_PX = [[1, 4], [2, 5], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2]];
class PiixCheckboxElement extends HTMLElement {
  static get observedAttributes() { return ['checked', 'tone', 'disabled']; }
  static get formAssociated() { return true; }
  constructor() { super(); this.attachShadow({ mode: 'open', delegatesFocus: true }); this._int = this.attachInternals ? this.attachInternals() : null; }
  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { this.toggleAttribute('checked', !!v); }
  connectedCallback() { if (!this.shadowRoot.firstChild) this._build(); this._sync(); }
  attributeChangedCallback(n) { if (!this.shadowRoot.firstChild) return; if (n === 'tone') this._build(); else this._sync(); }
  _build() {
    const [on, ink] = kitTone(this), p = 3;
    this.shadowRoot.innerHTML = `<style>${kitCss()}
:host{cursor:pointer}:host([disabled]){cursor:not-allowed;opacity:.5}
.row{display:inline-flex;align-items:center;gap:10px}
[role=checkbox]{outline:none}
[role=checkbox]:focus-visible .frame{outline:3px dashed ${on};outline-offset:3px}
.face{width:${p * 9}px;height:${p * 9}px;background:#fbf8f1;transition:background .12s steps(2)}
:host([checked]) .face{background:${on}}
.face b{position:absolute;width:${p}px;height:${p}px;background:${ink === '#ffffff' ? '#ffffff' : '#17121f'};transform:scale(0);transition:transform .06s steps(1)}
:host([checked]) .face b{transform:scale(1)}
${CHECK_PX.map(([x, y], i) => `.face b:nth-child(${i + 1}){left:${x * p}px;top:${y * p - p}px;transition-delay:${i * 30}ms}`).join('')}
.label{font-size:13px;text-transform:uppercase;letter-spacing:.04em}
:host(:active) .drop{transform:translateY(${KIT_U / 2}px)}
</style><span class="row"><span role="checkbox" tabindex="0" part="box"><span class="drop"><span class="frame"><span class="face">${'<b></b>'.repeat(CHECK_PX.length)}</span></span></span></span><span class="label"><slot></slot></span></span>`;
    this._box = this.shadowRoot.querySelector('[role=checkbox]');
    this.addEventListener('click', this._onClick || (this._onClick = () => this._flip()));
    this._box.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); this._flip(); } });
    const label = this.textContent.trim(); if (label) this._box.setAttribute('aria-label', label);
    this._sync();
  }
  _flip() {
    if (this.hasAttribute('disabled')) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }
  _sync() {
    if (!this._box) return;
    this._box.setAttribute('aria-checked', String(this.checked));
    this._box.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    if (this._int) this._int.setFormValue(this.checked ? (this.getAttribute('value') || 'on') : null);
  }
}
define('piix-checkbox', PiixCheckboxElement);
ELEMENTS.checkbox = 'piix-checkbox';
