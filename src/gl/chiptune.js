/* CHIPTUNE: 8-bit sounds for your whole page, from one tag.   @component chiptune
 *
 *   <piix-chiptune></piix-chiptune>
 *   <button data-sfx="coin">Collect</button>
 *
 * Drop it anywhere and the page gets sound: links and buttons blip when you hover and click
 * them, and every Piixpal game and dialogue box starts making noise. Every sound is made on
 * the spot with WebAudio, so there are no audio files. It shows as a little pixel speaker;
 * clicking it mutes the whole page, and the choice is remembered.
 *
 *   data-sfx="name"        on any element: play that sound when it's clicked
 *   data-sfx-hover="name"  on any element: play that sound when the pointer arrives
 *   sounds: hover click blip select type coin jump bounce launch hit break powerup success
 *           error open close lose win boot. From code: Piixpal.sfx('coin')
 *
 *   wire      what gets sound by itself: hover, click, both or none      default: hover click
 *   scope     a CSS selector: only wire things inside it                 default: the whole page
 *   volume    0 to 1                                                     default: .25
 *   float     pin the speaker to a corner: bottom-right | bottom-left | top-right | top-left
 *   tone      the speaker's colour: lime | coral | violet | sky | sun | mint | ink | paper
 *
 *   events: mute (detail: { muted }) */
const CHIP_HIT = 'a[href],button,[role=button],summary,label,input[type=checkbox],input[type=radio],select,piix-button,piix-glow-button,piix-toggle,piix-checkbox';
/* the speaker, 9 x 7 pixels: s = speaker, w = sound waves, x = the cross when muted */
const CHIP_ICON = [
  '...s.....',
  '..ss..w..',
  'ssss...w.',
  'ssss.w.w.',
  'ssss...w.',
  '..ss..w..',
  '...s.....'
];
const CHIP_MUTE = [
  '...s.....',
  '..ss.....',
  'ssss.x.x.',
  'ssss..x..',
  'ssss.x.x.',
  '..ss.....',
  '...s.....'
];
const chipSvg = rows => `<svg viewBox="0 0 9 7" width="27" height="21" shape-rendering="crispEdges" aria-hidden="true">${rows.map((r, y) => [...r].map((ch, x) => ch === '.' ? '' : `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')).join('')}</svg>`;
class PiixChiptuneElement extends HTMLElement {
  static get observedAttributes() { return ['volume', 'tone', 'float']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    SFX.on++;
    this._vol();
    this._build();
    const inScope = t => { const s = this.getAttribute('scope'); return !s || !!t.closest(s); };
    const wire = (this.getAttribute('wire') || 'hover click').split(/\s+/);
    /* hovers: one blip per thing you arrive at, not one per pixel you move */
    document.addEventListener('pointerover', this._over = e => {
      if (e.pointerType === 'touch' || !e.target.closest) return;
      const own = e.target.closest('[data-sfx-hover]');
      const hit = own || (wire.includes('hover') && e.target.closest(CHIP_HIT));
      if (!hit || hit === this._at || !inScope(hit)) return;
      if (e.relatedTarget && hit.contains(e.relatedTarget)) return;
      this._at = hit;
      sfx(own ? own.getAttribute('data-sfx-hover') : 'hover', this);
    });
    document.addEventListener('pointerout', this._out = e => { if (this._at && !this._at.contains(e.relatedTarget)) this._at = null; });
    document.addEventListener('click', this._click = e => {
      if (!e.target.closest || this.contains(e.target) || e.composedPath().includes(this)) return;
      const own = e.target.closest('[data-sfx]');
      if (own && inScope(own)) return sfx(own.getAttribute('data-sfx'), this);
      const hit = wire.includes('click') && e.target.closest(CHIP_HIT);
      if (hit && inScope(hit)) sfx(hit.matches('a[href]') ? 'click' : 'select', this);
    }, true);
  }
  disconnectedCallback() {
    SFX.on = Math.max(0, SFX.on - 1);
    document.removeEventListener('pointerover', this._over);
    document.removeEventListener('pointerout', this._out);
    document.removeEventListener('click', this._click, true);
  }
  attributeChangedCallback(n) { if (n === 'volume') this._vol(); else if (this.shadowRoot.firstChild) this._build(); }
  _vol() {
    const v = this.getAttribute('volume');
    SFX.vol = v === null ? .25 : clamp(+v || 0, 0, 1);
    if (SFX.out) SFX.out.gain.value = SFX.vol;
  }
  get muted() { return sfxMuted(); }
  set muted(m) {
    try { localStorage.setItem('piix-sfx', m ? 'off' : 'on'); } catch (_) {}
    this._paint();
    if (!m) sfx('coin', this);
    this.dispatchEvent(new CustomEvent('mute', { detail: { muted: !!m } }));
  }
  _build() {
    const [fill, ink] = kitTone(this);
    const f = this.getAttribute('float');
    const pin = f ? `position:fixed;z-index:2147483000;${f.includes('top') ? 'top' : 'bottom'}:16px;${f.includes('left') ? 'left' : 'right'}:16px;` : '';
    this.shadowRoot.innerHTML = `<style>
:host{display:inline-block;vertical-align:middle;${pin}}
:host([hidden]){display:none}
button{all:unset;box-sizing:border-box;display:grid;place-items:center;width:46px;height:42px;cursor:pointer;background:#17121f;clip-path:${kitCorners(3)};padding:3px}
i{display:grid;place-items:center;width:100%;height:100%;background:${fill};color:${ink};clip-path:${kitCorners(2)};transition:transform 60ms steps(1)}
svg{fill:currentColor}
button:hover i{transform:translateY(-1px)}
button:active i{transform:translateY(1px)}
button:focus-visible{outline:2px dashed #17121f;outline-offset:3px}
:host([data-muted]) i{filter:saturate(.25) brightness(.92)}
</style><button type="button" part="button"><i></i></button>`;
    this.shadowRoot.querySelector('button').addEventListener('click', () => { this.muted = !this.muted; });
    this._paint();
  }
  _paint() {
    const m = sfxMuted(), b = this.shadowRoot.querySelector('button');
    if (!b) return;
    b.querySelector('i').innerHTML = chipSvg(m ? CHIP_MUTE : CHIP_ICON);
    b.setAttribute('aria-label', 'Sound');
    b.setAttribute('aria-pressed', String(!m));
    this.toggleAttribute('data-muted', m);
  }
}
define('piix-chiptune', PiixChiptuneElement);
ELEMENTS.chiptune = 'piix-chiptune';
/* play any sound from your own code: Piixpal.sfx('coin'), Piixpal.sfx('jump', { pitch: 1.5 }) */
Piixpal.sfx = (name, opts = {}) => sfx(name, null, Object.assign({}, opts, { force: true }));
