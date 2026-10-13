/* Pixel UI launch film. The stage is real Pixel UI components; every frame is set from film time T
 * (seconds) and the shared clock, so a render is the same every time. Cuts land on video/beat.mjs:
 * 128 BPM; intro bars 0-3, drop 1 bars 4-11, breakdown 12-13, drop 2 14-19, outro from bar 20. */
const B = 60 / 128, BR = B * 4, at = (bar, beat = 0) => bar * BR + beat * B, DUR = 42, WARM = 60000;
const $ = s => document.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), prog = (T, a, b) => cl((T - a) / (b - a));
const E = { out: k => 1 - Math.pow(1 - k, 3), in: k => k * k * k, inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  back: k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const GLTAGS = 'piix-scene,piix-shader,piix-glow-card,piix-glow-button,piix-input,piix-chart,piix-slider,piix-text,piix-loader';

/* ---------- the scene shots ---------- */
const NAMES = { sakura: 'Sakura', castle: 'Castle', galaxy: 'Galaxy', rays: 'Riso rays', train: 'Train window', poppies: 'Poppies', alps: 'Alpine', vista: 'Vista' };
$$('.sc').forEach((s, i) => {
  const k = s.dataset.kind;
  s.innerHTML = `<div class="cam"><div class="bg"><piix-scene kind="${k}" fill pixel="5"></piix-scene></div></div>
<div class="label pix">Scenes</div><div class="count pix">${String(i + 1).padStart(2, '0')} / 10</div>
<div class="word">${NAMES[k]}</div><div class="tag mono">&lt;piix-scene kind="${k}"&gt;</div>`;
});

/* ---------- the timeline ---------- */
const sc = $$('.sc');
const SHOTS = [
  [$('#s-intro'), 0, at(4) - B / 2],
  ...sc.map((s, i) => [s, at(4 + i), at(5 + i)]),
  [$('#s-looks'), at(12), at(14) - B / 2],
  [$('#s-board'), at(14), at(15)],
  [$('#s-dash'), at(15), at(16)],
  [$('#s-dialog'), at(16), at(17)],
  [$('#s-keys'), at(17), at(18)],
  ...['#q-glitch', '#q-glass', '#q-riso', '#q-crt'].map((q, i) => [$(q), at(18, i), at(18, i + 1)]),
  [$('#s-grid'), at(19), at(20)],
  [$('#s-outro'), at(20), DUR]
];
/* short intros: scenes dissolve in fast on the cut */
$$('.sc piix-scene').forEach(e => { e._introLen = .3; });
$$('#s-grid piix-scene, #s-looks piix-scene, #s-dialog piix-scene, #q-glass piix-scene').forEach(e => { e._introLen = .45; });

const LOOKS = ['glow', 'chrome', 'glass', 'riso', 'crt'];
const FLASH = [[at(4), .9], [at(14), .9], [at(20), 1], ...[5, 6, 7, 8, 9, 10, 11, 15, 16, 17, 19].map(b => [at(b), .35]), ...[1, 2, 3].map(i => [at(18, i), .3])];
const state = { title: '', look: '', dlg: 0 };

const pulseAt = T => {
  const inDrop = (T >= at(4) && T < at(12)) || (T >= at(14) && T < at(20));
  if (!inDrop) return 0;
  const since = (T - (T < at(12) ? at(4) : at(14))) % B;
  return Math.exp(-since * 16) * .016;
};
const cam = (shot, s, x = 0, y = 0, extra = '') => { shot.querySelector('.cam').style.transform = `translate(${x}px,${y}px) scale(${s})${extra}`; };
const reveal = (el, k) => { const q = Math.floor(cl(k) * 5) / 5; el.style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`; };

function setShots(T) {
  for (const [el, a, b] of SHOTS) {
    const on = T >= a && T < b;
    el.classList.toggle('on', on);
    for (const g of $$(GLTAGS, el)) {
      g._vis = on;
      if (on && g.__shot !== a) { g.__shot = a; g._seen = WARM + a * 1000; g._t0 = g._t0 ?? WARM; }
    }
  }
}

/* ---------- per shot ---------- */
function intro(T) {
  const s = $('#s-intro');
  const dot = s.querySelector('.dot');
  dot.style.display = T < at(1) ? '' : 'none';
  $('#ftitle').style.visibility = T < at(1) ? 'hidden' : '';
  dot.style.transform = `scale(${1 + 1.6 * Math.exp(-((T % B)) * 7)})`;
  const kick = 'PIIXPAL PRESENTS';
  $('#kicker').textContent = T >= at(1) ? kick.slice(0, Math.floor(prog(T, at(1), at(1, 2)) * kick.length)) : '';
  const want = T < at(1) ? '' : T < at(2) ? 'PIXEL UI' : T < at(3) ? 'ON THE GPU' : 'NOW LIVE';
  if (want !== state.title) { state.title = want; $('#ftitle').setAttribute('text', want); }
  $('#intro-bg').style.opacity = String(prog(T, at(2), at(3)) * .45);
  const push = E.in(prog(T, at(3, 2), at(4) - B / 2));
  cam(s, (1 + push * 1.4) * (1 + Math.exp(-((T % B)) * 10) * .01 * (T > at(2) ? 1 : 0)), 0, 0);
  s.querySelector('.cam').style.filter = push > 0 ? `blur(${push * 8}px) brightness(${1 + push * 1.5})` : '';
}
function scene(T, s, a) {
  const u = T - a;
  cam(s, (1.12 - .07 * E.out(u / BR)) * (1 + pulseAt(T)));
  reveal(s.querySelector('.word'), prog(u, .04, .24));
  s.querySelector('.word').style.transform = `translateY(${Math.round((1 - E.out(prog(u, .04, .3))) * 60 / 12) * 12}px)`;
  s.querySelector('.tag').style.opacity = u > .2 ? 1 : 0;
  s.querySelector('.count').style.opacity = u > .1 ? 1 : 0;
}
function looks(T, s, a) {
  const u = T - a, i = u < BR ? Math.floor(u / B) : 4 + Math.floor((u - BR) / (B / 2));
  const look = LOOKS[i % LOOKS.length];
  if (look !== state.look) {
    state.look = look;
    ['#lk-card', '#lk-input', '#lk-btn'].forEach(q => $(q).setAttribute('look', look));
    $('#lookname').textContent = `look="${look}"`;
  }
  const build = E.in(prog(u, BR, BR * 2 - B / 2)), sh = build * 14;
  cam(s, 1 + build * .22, (hash(T * 91) - .5) * sh, (hash(T * 37) - .5) * sh);
  s.querySelector('.cam').style.filter = build > .6 ? `brightness(${1 + (build - .6) * 2})` : '';
}
function board(T, s, a) {
  const u = T - a;
  $$('.row', s).forEach((r, i) => {
    r.setAttribute('stagger', '16');
    const want = u >= i * B / 6 ? r.dataset.text : '';
    if (r.getAttribute('text') !== want) r.setAttribute('text', want);
  });
  cam(s, (1.04 - .04 * E.out(u / BR)) * (1 + pulseAt(T)));
}
function dash(T, s, a) {
  const u = T - a;
  if (!s.__mounted) { s.__mounted = true; $$('piix-stat', s).forEach(e => e.replaceWith(e.cloneNode(true))); }
  cam(s, (1.06 - .06 * E.out(u / BR)) * (1 + pulseAt(T)));
}
function dialog(T, s, a) {
  const u = T - a, d = $('#dlg');
  $('#dlg-go')._vis = state.dlg === 1;
  if (u >= .12 && state.dlg === 0) { state.dlg = 1; d.show(); }
  if (u >= at(0, 2) + .05 && state.dlg === 1) {
    state.dlg = 2; d.close();
    let t = document.querySelector('piix-toaster');
    if (!t) { t = document.createElement('piix-toaster'); t.setAttribute('position', 'bottom-right'); t.style.zoom = '1.9'; document.body.appendChild(t); }
    Piixpal.toast('14 changes are live on production.', { tone: 'ok', title: 'Shipped', duration: 3 });
  }
  cam(s, (1.08 - .06 * E.out(u / BR)) * (1 + pulseAt(T)));
}
function keys(T, s, a) {
  const u = T - a, beat = Math.floor(u / B), inBeat = u % B;
  $('#k1').toggleAttribute('data-down', beat === 0 || beat === 3);
  $('#k2').toggleAttribute('data-down', (beat === 1 && inBeat < .16) || (beat === 3 && inBeat > .05));
  $('#k3').toggleAttribute('data-down', beat === 2 && inBeat < .16);
  const sl = $('#sl');
  sl._drag = true;
  const tr = sl.shadowRoot && sl.shadowRoot.querySelector('.track'); if (tr) tr.classList.add('live');
  const v = Math.round(20 + 75 * E.inOut(prog(u, .1, BR - .2)));
  if (+sl.getAttribute('value') !== v) sl.setAttribute('value', v);
  cam(s, (1.05 - .05 * E.out(u / BR)) * (1 + pulseAt(T)));
}
function quick(T, s, a) { const u = T - a; cam(s, (1.1 - .1 * E.out(prog(u, 0, B * 2))) * (1 + pulseAt(T))); }
function grid(T, s, a) {
  const u = T - a, k = E.inOut(prog(u, .05, BR - .15));
  cam(s, (1.25 - k * .57) * (1 + pulseAt(T)));
}
function outro(T, s, a) {
  const u = T - a;
  const pop = E.back(prog(u, 0, .55));
  s.querySelector('img').style.transform = `scale(${pop})`;
  reveal(s.querySelector('h1'), prog(u, .2, .45));
  s.querySelector('.sub').style.opacity = u > .7 ? 1 : 0;
  s.querySelector('.url').style.opacity = u > 1.1 ? 1 : 0;
  s.querySelector('.url').style.transform = `scale(${u > 1.1 ? 1 + .12 * Math.exp(-(u - 1.1) * 10) : 1})`;
  cam(s, 1 + u * .012);
}

/* ---------- flashes, fades: drawn on top, in pixels ---------- */
const fx = $('#fx').getContext('2d');
const BAY = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
function dither(a, color, cell = 12) {
  if (a <= 0) return;
  fx.fillStyle = color;
  if (a >= 1) { fx.fillRect(0, 0, 1920, 1080); return; }
  for (let y = 0, j = 0; y < 1080; y += cell, j++) for (let x = 0, i = 0; x < 1920; x += cell, i++) if (BAY[(j % 8) * 8 + (i % 8)] < a) fx.fillRect(x, y, cell, cell);
}
function overlay(T) {
  fx.clearRect(0, 0, 1920, 1080);
  for (const [t, s] of FLASH) { const k = (T - t) / .32; if (k >= 0 && k < 1) dither(s * Math.pow(1 - k, 1.6), '#ffffff'); }
  dither(prog(T, DUR - 1.4, DUR - .2), '#000000', 16);
}

/* ---------- CSS animations follow the film clock too ---------- */
function shadowRoots(root, out = []) { for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { out.push(el.shadowRoot); shadowRoots(el.shadowRoot, out); } return out; }
function syncAnims() {
  const roots = [document, ...shadowRoots(document)];
  for (const r of roots) for (const a of r.getAnimations ? r.getAnimations() : []) {
    if (a.__t0 == null) a.__t0 = __clock.ms - (a.currentTime || 0);
    a.pause(); a.currentTime = Math.max(0, __clock.ms - a.__t0);
  }
}

/* ---------- one frame ---------- */
function frame(T) {
  setShots(T);
  for (const [el, a, b] of SHOTS) {
    if (T < a || T >= b) continue;
    if (el.id === 's-intro') intro(T);
    else if (el.classList.contains('sc')) scene(T, el, a);
    else if (el.id === 's-looks') looks(T, el, a);
    else if (el.id === 's-board') board(T, el, a);
    else if (el.id === 's-dash') dash(T, el, a);
    else if (el.id === 's-dialog') dialog(T, el, a);
    else if (el.id === 's-keys') keys(T, el, a);
    else if (el.id === 's-grid') grid(T, el, a);
    else if (el.id === 's-outro') outro(T, el, a);
    else quick(T, el, a);
  }
  if (T >= at(17) && state.dlg) { const t = document.querySelector('piix-toaster'); if (t) t.remove(); $('#dlg').close(); state.dlg = 3; }
  __clock.step(WARM + T * 1000 - __clock.ms);
  syncAnims();
  overlay(T);
}

/* warm up: compile every shader once, out of shot, before the film starts */
async function warm() {
  for (const [el] of SHOTS) el.classList.add('on');
  $$(GLTAGS).forEach(g => { g._vis = true; });
  for (let i = 0; i < 160; i++) { __clock.step(20); await new Promise(r => window.__realSetInterval ? setTimeoutReal(r, 15) : r()); }
  for (const [el] of SHOTS) el.classList.remove('on');
}
const setTimeoutReal = (fn, ms) => { const id = __realSetInterval(() => { clearIntervalReal(id); fn(); }, ms); };
const clearIntervalReal = id => window.__realClearInterval(id);

const ready = document.fonts.ready.then(() => Promise.all(['800 100px "Bricolage Grotesque"', '400 30px Silkscreen', '400 30px "JetBrains Mono"', 'italic 400 100px "Instrument Serif"'].map(f => document.fonts.load(f)))).then(warm);
window.__film = { DUR, ready, frame, cues: () => [] };

/* live preview: open video/ui-launch.html in a browser (not ?render) */
if (!location.search.includes('render')) {
  const start = +(new URLSearchParams(location.search).get('t') || 0);
  ready.then(() => { const t0 = __realNow(); __realSetInterval(() => frame((start + (__realNow() - t0) / 1000) % DUR), 1000 / 30); });
}
