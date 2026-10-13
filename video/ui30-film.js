/* Pixel UI: the 30-second sunset cut. Real components in one warm, psychedelic world, cut to beat30.mjs:
 * 128 BPM; intro bars 0-3, the drop 4-11 (sixteen shots, one per half bar), the lift and build 12-13
 * (a mosaic of everything), the last hit and the logo 14-15. Every frame is set from film time T. */
const B = 60 / 128, BR = B * 4, at = (bar, beat = 0) => bar * BR + beat * B, DUR = 30, WARM = 60000;
const $ = s => document.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), prog = (T, a, b) => cl((T - a) / (b - a));
const E = { out: k => 1 - Math.pow(1 - k, 3), in: k => k * k * k, inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  back: k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const GLTAGS = 'piix-scene,piix-shader,piix-glow-card,piix-glow-button,piix-input,piix-chart,piix-slider,piix-text,piix-loader,piix-tabs,piix-pixel-image,piix-divider,piix-cursor';

/* ---------- the timeline ---------- */
const DROP = ['#h-hero', '#h-text', '#h-bgs', '#h-scenes', '#h-buttons', '#h-cards', '#h-forms', '#h-data', '#h-over', '#h-board', '#h-feed', '#h-media', '#h-motion', '#h-keys', '#h-layout', '#h-looks'];
/* sakura gets the first bar of the drop in its own colours; the sixteen sunset shots share the rest */
const SLOT = (at(12) - at(5)) / DROP.length;
const SHOTS = [
  [$('#s-intro'), 0, at(4) - B / 2],
  [$('#s-sakura'), at(4), at(5)],
  ...DROP.map((q, i) => [$(q), at(5) + i * SLOT, at(5) + (i + 1) * SLOT]),
  [$('#s-mosaic'), at(12), at(14) - B / 2],
  [$('#s-outro'), at(14), DUR]
];
$$('piix-scene, piix-shader').forEach(e => { e._introLen = .28; });
$$('#s-mosaic piix-scene, #s-mosaic piix-shader').forEach(e => { e._introLen = .5; });
const CUTS = SHOTS.slice(2).map(s => s[1]);
const state = { title: '', dlg: 0, toast: 0, tip: 0 };

/* the kick: every beat from the drop until the build ends */
const kickPulse = T => (T >= at(4) && T < at(14) - B / 2) || (T >= at(14) && T < at(15)) ? Math.exp(-(((T % B) + B) % B) * 13) : 0;
const cam = (shot, s, x = 0, y = 0, extra = '') => { shot.querySelector('.cam').style.transform = `translate(${x}px,${y}px) scale(${s})${extra}`; };

function preroll(T) {
  const a = SHOTS.find(s => s[0].id === 'h-board')[1];
  $$('#h-board .row2').forEach((r, i) => { r.setAttribute('stagger', '12'); const w = T >= a - .7 + i * .08 ? r.dataset.text : ''; if (r.getAttribute('text') !== w) r.setAttribute('text', w); });
}
function setShots(T) {
  for (const [el, a, b] of SHOTS) {
    const on = T >= a && T < b;
    el.classList.toggle('on', on);
    const gls = $$(GLTAGS, el);
    const hero = el.querySelector('piix-hero');
    if (hero && hero.shadowRoot) { const s = hero.shadowRoot.querySelector('piix-shader'); if (s) { s._introLen = .28; gls.push(s); } hero.toggleAttribute('data-in', true); }
    for (const g of gls) {
      g._vis = on;
      if (on && g.__shot !== a) { g.__shot = a; g._seen = WARM + a * 1000; }
    }
  }
}

/* ---------- intro: the cut you liked, unchanged ---------- */
function intro(T) {
  const s = $('#s-intro'), dot = s.querySelector('.dot');
  dot.style.display = T < at(1) ? '' : 'none';
  $('#ftitle').style.visibility = T < at(1) ? 'hidden' : '';
  dot.style.transform = `scale(${1 + 1.6 * Math.exp(-(T % B) * 7)})`;
  const kick = 'PIIXPAL PRESENTS';
  $('#kicker').textContent = T >= at(1) ? kick.slice(0, Math.floor(prog(T, at(1), at(1, 2)) * kick.length)) : '';
  const want = T < at(1) ? '' : T < at(2) ? 'PIXEL UI' : T < at(3) ? 'ON THE GPU' : 'NOW LIVE';
  if (want !== state.title) { state.title = want; $('#ftitle').setAttribute('text', want); }
  $('#intro-bg').style.opacity = String(prog(T, at(2), at(3)) * .45);
  const push = E.in(prog(T, at(3, 2), at(4) - B / 2));
  cam(s, (1 + push * 1.4) * (1 + Math.exp(-(T % B) * 10) * .01 * (T > at(2) ? 1 : 0)));
  s.querySelector('.cam').style.filter = push > 0 ? `blur(${push * 8}px) brightness(${1 + push * 1.5})` : '';
}

/* ---------- the drop: sixteen shots ---------- */
function shot(T, el, a) {
  const u = T - a, id = el.id, k = kickPulse(T);
  cam(el, (1.07 - .07 * E.out(prog(u, 0, SLOT))) * (1 + k * .014));
  const ttl = el.querySelector('.ttl');
  if (ttl) { const q = Math.floor(E.out(prog(u, .02, .2)) * 6) / 6; ttl.style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`; ttl.style.transform = `translateY(${Math.round((1 - q) * 30)}px)`; }
  if (id === 'h-data' && !el.__m) { el.__m = 1; $$('piix-stat', el).forEach(e => e.replaceWith(e.cloneNode(true))); }
  if (false) $('.row2', el).forEach((r, i) => { r.setAttribute('stagger', '14'); const w = u >= i * .08 ? r.dataset.text : ''; if (r.getAttribute('text') !== w) r.setAttribute('text', w); });
  if (id === 'h-forms') { const tb = el.querySelector('piix-tabs'), sel = u > B ? '1' : '0'; if (tb.getAttribute('selected') !== sel) tb.setAttribute('selected', sel); }
  if (id === 'h-over') {
    const d = $('#dlg');
    $('#dlg-go')._vis = state.dlg === 1;
    if (u >= .04 && state.dlg === 0) { state.dlg = 1; d.show(); }
    if (u >= .08 && !state.tip) { state.tip = 1; $('#tip').show(); }
    if (u >= .42 && !state.toast) {
      state.toast = 1;
      const t = document.createElement('piix-toaster'); t.setAttribute('position', 'bottom-right'); t.style.zoom = '1.9'; document.body.appendChild(t);
      Piixpal.toast('Your sunset is live.', { tone: 'ok', title: 'Shipped', duration: 2.4 });
    }
  }
  if (id === 'h-motion') {
    /* a pointer swinging across the frame, so the cursor trail has something to follow */
    const x = 960 + Math.sin(u * 7) * 700, y = 540 + Math.sin(u * 11 + 1) * 330;
    dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'mouse', bubbles: true }));
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'mouse', bubbles: true }));
  }
  if (id === 'h-keys') {
    const e8 = Math.floor(u / (B / 2)), inE = u % (B / 2);
    $('#k1').toggleAttribute('data-down', e8 >= 0 && e8 < 3);
    $('#k2').toggleAttribute('data-down', (e8 === 1 || e8 === 3) && inE < .12);
    $('#k3').toggleAttribute('data-down', e8 === 2 && inE < .12);
  }
}
function endOverlays() {
  if (state.dlg === 1) { $('#dlg').close(); state.dlg = 2; }
  if (state.tip === 1) { $('#tip').hide(); state.tip = 2; }
  const t = document.querySelector('piix-toaster'); if (t) t.remove();
}

/* ---------- sakura: calm, full colour, the drop just landing ---------- */
function sakura(T, el, a) {
  const u = T - a, q = Math.floor(E.out(prog(u, .05, .3)) * 6) / 6;
  cam(el, (1.1 - .06 * E.out(prog(u, 0, BR))) * (1 + kickPulse(T) * .012));
  el.querySelector('.sw').style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`;
  el.querySelector('.stag').style.opacity = u > .3 ? 1 : 0;
  el.querySelector('.scount').style.opacity = u > .15 ? 1 : 0;
}

/* ---------- the mosaic: pull out to everything, then fall into it ---------- */
function mosaic(T, el, a) {
  const u = T - a, out = E.out(prog(u, 0, BR * .9)), fall = E.in(prog(u, BR, BR * 2 - B / 2));
  const s = (1.7 - out * 1.1) * (1 + fall * 5);
  cam(el, s * (1 + kickPulse(T) * .02), 0, 0, ` rotate(${fall * 14}deg)`);
  $('#mos-ttl').style.opacity = u < BR * .95 ? String(prog(u, .25, .5)) : '0';
  el.querySelector('.cam').style.filter = fall > .4 ? `brightness(${1 + (fall - .4) * 2.4}) saturate(${1 + fall})` : '';
}
function outro(T, el, a) {
  const u = T - a;
  el.querySelector('img').style.transform = `scale(${E.back(prog(u, 0, .5))})`;
  const big = el.querySelector('.big'), q = Math.floor(prog(u, .15, .45) * 6) / 6;
  big.style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`;
  el.querySelector('.sub').style.opacity = u > .6 ? 1 : 0;
  const url = el.querySelector('.url');
  url.style.opacity = u > .95 ? 1 : 0; url.style.transform = `scale(${u > .95 ? 1 + .14 * Math.exp(-(u - .95) * 9) : 1})`;
  cam(el, 1.04 - .04 * E.out(prog(u, 0, 3)));
}

/* ---------- the psychedelic pass: a liquid wobble and colour fringes on the kick ---------- */
const turb = $('#turb'), disp = $('#disp'), offr = $('#offr'), offb = $('#offb'), world = $('#world');
function trip(T) {
  if (T < at(5)) { world.style.filter = ''; $('#grade').style.opacity = '0'; return; }
  const sc = SHOTS.find(s => s[0].id === 'h-scenes'), onScenes = T >= sc[1] && T < sc[2];
  const snap = Math.exp(-Math.max(0, T - at(5)) * 7);
  $('#grade').style.opacity = onScenes ? '0' : '1';
  const k = kickPulse(T);
  const cut = CUTS.reduce((m, c) => (T >= c && T - c < m ? T - c : m), 9), spike = Math.exp(-cut * 18);
  const build = E.in(prog(T, at(13), at(14) - B / 2)), lift = T >= at(12) && T < at(13) ? .5 + .5 * Math.sin(T * 6) : 0;
  const tail = 0, calm = T >= at(14) ? 1 - .85 * prog(T, at(14) + .15, at(14) + .7) : 1;
  turb.setAttribute('baseFrequency', `${(.0032 + .0012 * Math.sin(T * .9)).toFixed(5)} ${(.007 + .003 * Math.sin(T * .6 + 1)).toFixed(5)}`);
  disp.setAttribute('scale', ((4 + k * 26 + spike * 60 + lift * 30 + build * 170 + tail * 40 + snap * 260) * calm * (onScenes ? .35 : 1)).toFixed(1));
  const ch = ((1.5 + k * 7 + spike * 10 + build * 18 + lift * 5 + snap * 30) * calm * (onScenes ? 0 : 1)).toFixed(1);
  offr.setAttribute('dx', ch); offb.setAttribute('dx', -ch);
  world.style.filter = onScenes ? 'url(#trip)' : 'url(#trip) saturate(1.12) contrast(1.04)';
}

/* ---------- flashes and fades, in pixels and sunset colours ---------- */
const fx = $('#fx').getContext('2d'), gr = $('#grain').getContext('2d');
const BAY = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => (v + .5) / 64);
function dither(a, color, cell = 12) {
  if (a <= 0) return;
  fx.fillStyle = color;
  if (a >= 1) { fx.fillRect(0, 0, 1920, 1080); return; }
  for (let y = 0, j = 0; y < 1080; y += cell, j++) for (let x = 0, i = 0; x < 1920; x += cell, i++) if (BAY[(j % 8) * 8 + (i % 8)] < a) fx.fillRect(x, y, cell, cell);
}
const FLASH = [[at(4), .95, '#ffffff'], [at(5), 1, '#ff9b45'], [at(14), 1, '#fff3c4'], [at(12), .5, '#ff9b45'], ...CUTS.filter(c => c !== at(5) && c !== at(12) && c !== at(14)).map((c, i) => [c, .32, i % 2 ? '#ff9b45' : '#ff5a6e'])];
function overlay(T) {
  fx.clearRect(0, 0, 1920, 1080);
  for (const [t, s, c] of FLASH) { const k = (T - t) / .3; if (k >= 0 && k < 1) dither(s * Math.pow(1 - k, 1.7), c); }
  if (T < at(14)) dither(E.in(prog(T, at(13, 2), at(14) - B / 2)) * .9, '#ffe08a', 16);
  dither(prog(T, DUR - 1.2, DUR - .15), '#0a0310', 16);
  /* grain */
  if (T >= at(5)) {
    const d = gr.createImageData(480, 270);
    let s = Math.floor(T * 30) * 7919 + 1;
    for (let i = 0; i < d.data.length; i += 4) { s = (s * 1103515245 + 12345) >>> 0; const v = s >>> 24; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    gr.putImageData(d, 0, 0);
    $('#grain').style.opacity = '.13';
  } else $('#grain').style.opacity = '0';
}

/* ---------- CSS animations follow the film clock too ---------- */
function shadowRoots(root, out = []) { for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { out.push(el.shadowRoot); shadowRoots(el.shadowRoot, out); } return out; }
function syncAnims() {
  for (const r of [document, ...shadowRoots(document)]) for (const a of r.getAnimations ? r.getAnimations() : []) {
    if (a.__t0 == null) a.__t0 = __clock.ms - (a.currentTime || 0);
    a.pause(); a.currentTime = Math.max(0, __clock.ms - a.__t0);
  }
}

function frame(T) {
  setShots(T);
  preroll(T);
  for (const [el, a, b] of SHOTS) {
    if (T < a || T >= b) continue;
    if (el.id === 's-intro') intro(T);
    else if (el.id === 's-mosaic') mosaic(T, el, a);
    else if (el.id === 's-sakura') sakura(T, el, a);
    else if (el.id === 's-outro') outro(T, el, a);
    else shot(T, el, a);
  }
  if (T >= SHOTS.find(s => s[0].id === 'h-over')[2]) endOverlays();
  trip(T);
  __clock.step(WARM + T * 1000 - __clock.ms);
  syncAnims();
  overlay(T);
}

/* warm up: compile every shader once, before the film starts */
const waitReal = ms => new Promise(r => { const id = __realSetInterval(() => { __realClearInterval(id); r(); }, ms); });
async function warm() {
  for (const [el] of SHOTS) el.classList.add('on');
  $$(GLTAGS).forEach(g => { g._vis = true; });
  for (let i = 0; i < 200; i++) { __clock.step(20); await waitReal(15); }
  for (const [el] of SHOTS) el.classList.remove('on');
}
const ready = document.fonts.ready.then(() => Promise.all(['800 100px "Bricolage Grotesque"', '400 30px Silkscreen', '400 30px "JetBrains Mono"', 'italic 400 100px "Instrument Serif"'].map(f => document.fonts.load(f)))).then(warm);
window.__film = { DUR, ready, frame, cues: () => [] };

if (!location.search.includes('render')) {
  const start = +(new URLSearchParams(location.search).get('t') || 0);
  ready.then(() => { const t0 = __realNow(); __realSetInterval(() => frame((start + (__realNow() - t0) / 1000) % DUR), 1000 / 30); });
}
