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

