/* SFX: tiny 8-bit sounds, made on the spot with WebAudio. No audio files, nothing to load.
 *
 * Components call sfx('coin', this). It only makes a sound when the page asked for sound:
 * the component has a sound attribute, or a <piix-chiptune> lives on the page. A muted
 * speaker (remembered in localStorage) always wins. Browsers start audio on the first click
 * or key press, so a hover before that stays silent. */
const SFX = { ctx: null, out: null, noise: null, vol: .25, on: 0, last: {} };
const sfxMuted = () => { try { return localStorage.getItem('piix-sfx') === 'off'; } catch (_) { return false; } };
const sfxCtx = () => {
  if (!SFX.ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    const c = SFX.ctx = new C();
    SFX.out = c.createGain(); SFX.out.gain.value = SFX.vol; SFX.out.connect(c.destination);
    /* one second of white noise, reused by every hiss, crunch and snare */
    const b = SFX.noise = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (SFX.ctx.state === 'suspended') SFX.ctx.resume();
  return SFX.ctx;
};
/* one note: a wave sliding from f0 to f1 Hz, with a quick attack and a clean tail */
const sfxTone = (c, at, wave, f0, f1, dur, vol = 1) => {
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
  o.type = wave; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3 * vol, t + .004);
  g.gain.setValueAtTime(.3 * vol, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g); g.connect(SFX.out); o.start(t); o.stop(t + dur + .02);
};
/* a burst of noise through a low-pass that closes: crunches, thuds and hisses */
const sfxNoise = (c, at, dur, vol = 1, hz = 3000) => {
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
  s.buffer = SFX.noise; f.type = 'lowpass'; f.frequency.setValueAtTime(hz, t); f.frequency.exponentialRampToValueAtTime(200, t + dur);
  g.gain.setValueAtTime(.35 * vol, t); g.gain.linearRampToValueAtTime(0, t + dur);
  s.connect(f); f.connect(g); g.connect(SFX.out); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
};
/* a run of notes, one after another */
const sfxRun = (c, wave, notes, step, vol, hold = step) => notes.forEach((f, i) => sfxTone(c, i * step, wave, f, f, i === notes.length - 1 ? hold : step * .9, vol));
const SFX_BANK = {
  hover: (c, p) => sfxTone(c, 0, 'square', 1320 * p, 1320 * p, .025, .35),
  click: (c, p) => sfxTone(c, 0, 'square', 660 * p, 440 * p, .045, .7),
  blip: (c, p) => sfxTone(c, 0, 'square', 880 * p, 880 * p, .05, .6),
  select: (c, p) => sfxRun(c, 'square', [523 * p, 784 * p], .045, .55),
  type: (c, p) => sfxTone(c, 0, 'square', p * (560 + Math.random() * 60), p * 520, .03, .4),
  coin: (c, p) => sfxRun(c, 'square', [988 * p, 1319 * p], .07, .6, .28),
  jump: (c, p) => sfxTone(c, 0, 'square', 220 * p, 660 * p, .16, .6),
  bounce: (c, p) => sfxTone(c, 0, 'triangle', 330 * p, 190 * p, .07, 1),
  launch: (c, p) => sfxTone(c, 0, 'square', 330 * p, 990 * p, .11, .55),
  hit: (c, p) => { sfxNoise(c, 0, .09, .8, 1800); sfxTone(c, 0, 'square', 150 * p, 60 * p, .09, .6); },
  break: (c, p) => { sfxNoise(c, 0, .11, .9, 4200); sfxTone(c, 0, 'square', 520 * p, 160 * p, .08, .45); },
  powerup: (c, p) => sfxRun(c, 'square', [523, 659, 784, 1047, 1319].map(f => f * p), .05, .5, .16),
  success: (c, p) => { sfxRun(c, 'square', [523, 659, 784].map(f => f * p), .07, .45); sfxTone(c, .21, 'triangle', 1047 * p, 1047 * p, .3, 1); },
  error: (c, p) => { sfxTone(c, 0, 'square', 196 * p, 196 * p, .1, .6); sfxTone(c, .12, 'square', 147 * p, 147 * p, .22, .6); },
  open: (c, p) => sfxTone(c, 0, 'triangle', 392 * p, 784 * p, .12, 1),
  close: (c, p) => sfxTone(c, 0, 'triangle', 784 * p, 392 * p, .12, 1),
  lose: (c, p) => sfxRun(c, 'square', [494, 466, 440, 392].map(f => f * p), .14, .5, .5),
  win: (c, p) => sfxRun(c, 'square', [523, 659, 784, 1047, 784, 1047].map(f => f * p), .08, .5, .4),
  boot: (c, p) => { sfxTone(c, 0, 'square', 1047 * p, 1047 * p, .07, .5); sfxTone(c, .08, 'square', 2093 * p, 2093 * p, .55, .45); sfxTone(c, .08, 'triangle', 1047 * p, 1047 * p, .55, .6); }
};
/* is this element allowed to make a sound? */
const sfxAllowed = el => {
  if (sfxMuted()) return false;
  const a = el && el.getAttribute && el.getAttribute('sound');
  if (a === 'off') return false;
  return a !== null && a !== undefined ? true : SFX.on > 0;
};
/* play a sound by name. opts.pitch shifts it (1 = as written); opts.force skips the page switch */
const sfx = (name, el, opts = {}) => {
  if (!SFX_BANK[name] || (opts.force ? sfxMuted() : !sfxAllowed(el))) return;
  const t = now();
  if (t - (SFX.last[name] || 0) < (opts.gap == null ? 30 : opts.gap)) return;
  SFX.last[name] = t;
  const c = sfxCtx();
  if (c) SFX_BANK[name](c, opts.pitch || 1);
};
