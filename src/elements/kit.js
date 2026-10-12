/* KIT: the shared look of the pixel UI kit. Stepped pixel corners, chunky ink borders, a hard
 * shadow the control presses down into, a few colour tones, and a tiny pal painter. Every kit
 * component (button, toggle, progress, slider, checkbox…) is built from these. */

const KIT_U = 4;
/* a clip-path with two-step pixel corners, u px per step */
const kitCorners = (u = KIT_U) => `polygon(0 ${2 * u}px,${u}px ${2 * u}px,${u}px ${u}px,${2 * u}px ${u}px,${2 * u}px 0,calc(100% - ${2 * u}px) 0,calc(100% - ${2 * u}px) ${u}px,calc(100% - ${u}px) ${u}px,calc(100% - ${u}px) ${2 * u}px,100% ${2 * u}px,100% calc(100% - ${2 * u}px),calc(100% - ${u}px) calc(100% - ${2 * u}px),calc(100% - ${u}px) calc(100% - ${u}px),calc(100% - ${2 * u}px) calc(100% - ${u}px),calc(100% - ${2 * u}px) 100%,${2 * u}px 100%,${2 * u}px calc(100% - ${u}px),${u}px calc(100% - ${u}px),${u}px calc(100% - ${2 * u}px),0 calc(100% - ${2 * u}px))`;

/* tones: [fill, text on it] */
const KIT_TONES = {
  lime: ['#c6f432', '#17121f'], coral: ['#ff6b4a', '#ffffff'], violet: ['#6b4cff', '#ffffff'], sky: ['#58c8ff', '#17121f'],
  sun: ['#ffd23f', '#17121f'], mint: ['#25b89a', '#ffffff'], ink: ['#17121f', '#ffffff'], paper: ['#fbf8f1', '#17121f']
};
const kitTone = el => KIT_TONES[el.getAttribute('tone')] || KIT_TONES[el._defTone || 'lime'];
const KIT_FONT = '"Silkscreen","Press Start 2P",ui-monospace,Menlo,Consolas,monospace';

/* the styles every kit component shares: the ink frame, the face inside it, the shadow under it */
const kitCss = () => `
:host{--ink:#17121f;--u:${KIT_U}px;display:inline-block;vertical-align:middle;font:400 14px/1.1 ${KIT_FONT};-webkit-tap-highlight-color:transparent}
:host([hidden]){display:none}
.frame{position:relative;background:var(--ink);clip-path:${kitCorners()};padding:var(--u)}
.face{position:relative;clip-path:${kitCorners(KIT_U / 2)}}
.drop{position:relative;filter:drop-shadow(0 var(--u) 0 var(--ink));transition:filter .08s,transform .08s}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`;

/* a pal's frame, drawn crisp into a canvas at s px per pixel */
const kitPal = (cv, name, clip, i, s) => {
  const sp = SPRITES[name]; if (!sp) return false;
  const b = baked(sp), fr = b[clip] || b[Object.keys(b)[0]], img = fr[Math.max(0, i | 0) % fr.length];
  if (cv.width !== sp.w * s || cv.height !== sp.h * s) { cv.width = sp.w * s; cv.height = sp.h * s; }
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
  return true;
};
const kitClip = (name, want) => { const sp = SPRITES[name], c = sp ? Object.keys(sp.frames) : []; return want.find(w => c.includes(w)) || c[0]; };
