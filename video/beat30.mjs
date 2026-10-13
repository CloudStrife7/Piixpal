// node video/beat30.mjs -> video/out/pixelui30.wav  (the 30-second cut)
// The Pixel UI launch track: 128 BPM, F minor, synthesised from nothing. Big-room drums, a sidechained
// sub and offbeat bass, supersaw stabs and a hook, two drops. The film (ui-film.js) cuts on its beats.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, 'out');
const SR = 44100, DUR = 30, N = SR * DUR;

/* ---------- buses: dry, pumped (ducked by the kick), and the reverb send ---------- */
const bus = () => [new Float32Array(N), new Float32Array(N)];
const DRY = bus(), PUMP = bus(), SEND = bus();
let seed = 3;
const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2147483648) - 1;
const rand = () => (noise() + 1) / 2;
const hz = n => 440 * Math.pow(2, (n - 69) / 12);
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = s => (+s.slice(-1) + 1) * 12 + NOTE[s[0]] + (s[1] === '#' ? 1 : s[1] === 'b' ? -1 : 0);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const env = (t, a, d) => t < a ? t / a : Math.exp(-(t - a) / d);
/* write a voice: fn(t) -> sample. o: { pan, rev (send amount), pump (true = ducked bus) } */
function voice(start, len, fn, gain = 1, o = {}) {
  const pan = o.pan || 0, a = Math.max(0, Math.floor(start * SR)), b = Math.min(N, Math.floor((start + len) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4) * 1.414, gr = gain * Math.sin((pan + 1) * Math.PI / 4) * 1.414;
  const T = o.pump ? PUMP : DRY, rv = o.rev || 0;
  for (let i = a; i < b; i++) {
    const v = fn((i - a) / SR);
    T[0][i] += v * gl; T[1][i] += v * gr;
    if (rv) { SEND[0][i] += v * gl * rv; SEND[1][i] += v * gr * rv; }
  }
}

/* ---------- oscillators that don't alias (polyBLEP) ---------- */
const blep = (p, dt) => p < dt ? (p /= dt, p + p - p * p - 1) : p > 1 - dt ? (p = (p - 1) / dt, p * p + p + p + 1) : 0;
function osc(shape, detune = 0) {
  let p = rand();
  return f => {
    f *= Math.pow(2, detune / 1200);
    const dt = f / SR; p += dt; if (p >= 1) p -= 1;
    if (shape === 'saw') return 2 * p - 1 - blep(p, dt);
    if (shape === 'sq') { let q = p + .5; if (q >= 1) q -= 1; return (2 * p - 1 - blep(p, dt)) - (2 * q - 1 - blep(q, dt)); }
    if (shape === 'tri') return 1 - 4 * Math.abs(p - .5);
    return Math.sin(p * 2 * Math.PI);
  };
}
/* state-variable filter: low / high / band */
function svf(q = .8) {
  let lo = 0, bp = 0;
  return (x, cut, mode = 'lp') => {
    const f = 2 * Math.sin(Math.PI * clamp(cut, 20, SR / 6.5) / SR);
    lo += f * bp; const hi = x - lo - bp / q; bp += f * hi;
    return mode === 'lp' ? lo : mode === 'hp' ? hi : bp;
  };
}

/* ---------- drums ---------- */
const KICKS = [];
function kick(t0, g = 1) {
  KICKS.push(t0);
  const o = osc('sine'), hp = svf(.7);
  voice(t0, .5, t => {
    const body = o(48 + 130 * Math.exp(-t * 38)) * env(t, .001, .22);
    const click = hp(noise(), 2500, 'hp') * env(t, .0005, .004) * .6;
    return Math.tanh((body + click) * 1.6) * .9;
  }, .9 * g);
}
function clap(t0, g = 1) {
  const f = svf(1.2);
  voice(t0, .4, t => { const e = env(t, .0005, .01) + env(Math.max(0, t - .011), .0005, .01) * .8 + env(Math.max(0, t - .022), .0005, .09); return f(noise(), 1400, 'bp') * e; }, .5 * g, { pan: .05, rev: .35 });
}
function hat(t0, g = 1, open = false) {
  const f = svf(.7);
  voice(t0, open ? .35 : .08, t => f(noise(), 9000, 'hp') * env(t, .0005, open ? .11 : .022), .14 * g, { pan: .3, rev: open ? .1 : 0 });
}
function crash(t0, g = 1) { const f = svf(.6); voice(t0, 3, t => f(noise(), 6000, 'hp') * env(t, .002, .9), .11 * g, { pan: -.2, rev: .4 }); }
function snare(t0, g = 1) {
  const f = svf(.9), o = osc('tri');
  voice(t0, .3, t => f(noise(), 3000, 'bp') * env(t, .001, .08) + o(185) * env(t, .001, .04) * .5, .35 * g, { rev: .2 });
}

/* ---------- instruments ---------- */
/* sub bass, on the pumped bus */
function subBass(t0, len, note, g = 1) {
  const o = osc('sine'), o2 = osc('tri');
  voice(t0, len, t => (o(hz(note)) + o2(hz(note) * 2) * .12) * Math.min(1, t / .005) * Math.min(1, (len - t) / .02), .42 * g, { pump: true });
}
/* a wide supersaw chord, filtered; the cutoff can sweep over the note */
function chord(t0, len, notes, g = 1, cut = 2400, cutTo = cut) {
  notes.forEach(n => [-14, -6, 0, 6, 14].forEach((dt, v) => {
    const o = osc('saw', dt), f = svf(.9);
    voice(t0, len + .3, t => f(o(hz(n)), lerp(cut, cutTo, clamp(t / len, 0, 1))) * Math.min(1, t / .02) * (t > len ? Math.max(0, 1 - (t - len) / .3) : 1),
      .028 * g, { pan: (v - 2) * .35, pump: true, rev: .25 });
  }));
}
/* electric piano: two-operator FM */
function keys(t0, notes, g = 1, len = 1.8) {
  notes.forEach((n, j) => {
    const mo = osc('sine');
    voice(t0 + j * .012, len, t => Math.sin(2 * Math.PI * hz(n) * t + (1.4 * Math.exp(-t * 5) + .15) * mo(hz(n))) * env(t, .004, .8) * (1 + .15 * Math.sin(t * 2 * Math.PI * 4.5)),
      .07 * g, { pan: j % 2 ? .3 : -.3, rev: .45 });
  });
}
function pluck(t0, note, g = 1, pan = 0) {
  const o = osc('saw'), f = svf(.7);
  voice(t0, .9, t => f(o(hz(note)), 300 + 3500 * Math.exp(-t * 18)) * env(t, .002, .25), .09 * g, { pan, rev: .4 });
}
/* the hook: a band-limited square, filtered, with dotted-eighth echoes */
function lead(t0, len, note, g = 1) {
  const draw = (dl, gg, pan) => { const o = osc('sq'), f = svf(1); voice(t0 + dl, len + .05, t => f(o(hz(note) * (1 + Math.sin(t * 2 * Math.PI * 5.5) * .005 * Math.min(1, t * 3))), 3200) * Math.min(1, t / .006) * env(Math.max(0, t - len * .6), .001, .05), gg, { pan, rev: .3 }); };
  draw(0, .085 * g, 0); draw(.375, .035 * g, .45); draw(.75, .018 * g, -.45);
}
function arp(t0, note, g = 1) { const o = osc('sq'), f = svf(.8); voice(t0, .14, t => f(o(hz(note)), 2400) * env(t, .002, .05), .03 * g, { pan: -.35, rev: .2 }); }
function bell(t0, note, g = 1, pan = 0) {
  const mo = osc('sine');
  voice(t0, 2.4, t => Math.sin(2 * Math.PI * hz(note) * t + 2 * Math.exp(-t * 3) * mo(hz(note) * 3.5)) * env(t, .002, .7), .08 * g, { pan, rev: .5 });
}
function boom(t0, g = 1) { const o = osc('sine'); voice(t0, 1.6, t => o(34 + 60 * Math.exp(-t * 7)) * env(t, .004, .6), .6 * g); }
function riser(t0, len, g = 1) {
  const f = svf(2), o = osc('saw'), o2 = osc('saw', 9);
  voice(t0, len, t => { const k = t / len; return (f(noise(), 300 + k * k * 9000, 'bp') * 1.2 + (o(lerp(110, 880, k * k)) + o2(lerp(110, 880, k * k))) * .1) * k * k; }, .3 * g, { rev: .3 });
}
function swell(t0, len, g = 1) { const f = svf(.7); voice(t0, len, t => f(noise(), 200 + Math.pow(t / len, 2) * 6000) * Math.pow(t / len, 2.5), .35 * g, { rev: .3 }); }

/* ---------- Pixel UI launch: 128 BPM, F minor, two drops ----------
 *   bars  0-3   intro: filtered pads, a pixel arp, kick sneaking in, snare roll + riser, a gap
 *   bars  4-11  drop 1: four on the floor, claps, rolling hats, offbeat bass, supersaw stabs, the hook
 *   bars 12-13  breakdown: no kick, wide pads, the hook alone; then the build
 *   bars 14-19  drop 2: everything, plus a 16th arp and extra percussion
 *   bars 20-    outro: one big hit and a long tail */
const B = 60 / 128, Q = B / 4, BR = B * 4;
const at = (bar, beat = 0, six = 0) => bar * BR + beat * B + six * Q;
const PROG = [['F4', 'Ab4', 'C5'], ['Db4', 'F4', 'Ab4'], ['Ab3', 'C4', 'Eb4'], ['Eb4', 'G4', 'Bb4']].map(c => c.map(m));
const ROOT = ['F2', 'Db2', 'Ab1', 'Eb2'].map(m);
const HOOK = [
  [[0, 'C5'], [3, 'Eb5'], [6, 'F5'], [8, 'Eb5'], [10, 'C5'], [12, 'Ab4']],
  [[0, 'F5'], [3, 'Eb5'], [6, 'Db5'], [8, 'C5'], [10, 'Ab4'], [13, 'F4']],
  [[0, 'Eb5'], [3, 'C5'], [6, 'Ab4'], [8, 'C5'], [10, 'Eb5'], [12, 'F5']],
  [[0, 'G5'], [3, 'F5'], [6, 'Eb5'], [8, 'Bb4'], [10, 'G4'], [12, 'Bb4']]
].map(b => b.map(([s, n]) => [s, m(n)]));
const STAB = [0, 3, 6, 10, 12];

/* a punchier kick for the drops: a long sine body, a knock and a click */
function bigKick(t0, g = 1) {
  KICKS.push(t0);
  const o = osc('sine'), hp = svf(.7), k2 = osc('sine');
  voice(t0, .6, t => {
    const body = o(44 + 160 * Math.exp(-t * 34)) * env(t, .0008, .3);
    const knock = k2(190 * Math.exp(-t * 20)) * env(t, .0005, .025) * .5;
    const click = hp(noise(), 3500, 'hp') * env(t, .0004, .003) * .7;
    return Math.tanh((body + knock + click) * 2.1) * .92;
  }, g);
}
/* a layered clap+snare with a short room */
function bigClap(t0, g = 1) { clap(t0, 1.15 * g); snare(t0 + .004, .9 * g); }
/* supersaw pluck for the hook: seven saws, a fast filter envelope */
function sawPluck(t0, note, g = 1, len = .32) {
  [-22, -12, -5, 0, 5, 12, 22].forEach((dt, v) => {
    const o = osc('saw', dt), f = svf(1.1);
    voice(t0, len + .25, t => f(o(hz(note)), 700 + 6500 * Math.exp(-t * 11)) * env(t, .002, len * .55), .024 * g, { pan: (v - 3) * .25, rev: .35, pump: true });
  });
}
/* offbeat bass: a gritty saw an octave up from the sub, on the pumped bus */
function offBass(t0, note, g = 1) {
  const o = osc('saw'), o2 = osc('saw', 9), f = svf(1.4);
  voice(t0, Q * 1.8, t => Math.tanh(f(o(hz(note + 12)) + o2(hz(note + 12)), 300 + 1600 * Math.exp(-t * 16)) * 1.6) * Math.min(1, (Q * 1.8 - t) / .01), .2 * g, { pump: true });
}
/* a square-wave blip arp, the "pixel" sound */
function blip(t0, note, g = 1, pan = 0) { const o = osc('sq'), f = svf(.9); voice(t0, .12, t => f(o(hz(note)), 5000) * env(t, .001, .035), .045 * g, { pan, rev: .25 }); }
/* tom-ish fill and a reverse cymbal into the drops */
function revCym(t1, len, g = 1) { const f = svf(.6); voice(t1 - len, len, t => f(noise(), 7000, 'hp') * Math.pow(t / len, 3), .22 * g, { rev: .2 }); }
function impact(t0, g = 1) { boom(t0, 1.1 * g); crash(t0, 1.4 * g); const f = svf(.6); voice(t0, 1.2, t => f(noise(), 180, 'lp') * env(t, .002, .35), .9 * g); }

/* ---------- intro (bars 0-3) ---------- */
for (let bar = 0; bar < 4; bar++) {
  const c = PROG[bar % 4], k = bar / 4;
  chord(at(bar), BR, c, .22 + k * .35, 300 + k * 900, 450 + (bar + 1) / 4 * 1100);
  if (bar >= 2) subBass(at(bar), BR - .02, ROOT[bar % 4], .45);
  if (bar >= 1) for (let s = 0; s < 16; s++) blip(at(bar, 0, s), c[(s * 3) % 3] + 12 * (s % 4 === 2 ? 1 : 0), .25 + k * .5, s % 2 ? .4 : -.4);
  if (bar >= 2) for (let b = 0; b < 4; b++) kick(at(bar, b), .45 + (bar - 2) * .25);
  if (bar === 2) for (let s = 2; s < 16; s += 4) hat(at(bar, 0, s), .7);
}
keys(at(0), PROG[0], .55, 3.6); keys(at(2), PROG[2], .5, 3.6);
/* the build: a snare roll that speeds up, a riser, then half a beat of silence */
for (let s = 0; s < 16; s++) { const step = s < 8 ? 2 : s < 12 ? 1 : .5; if (s % (step >= 1 ? step : 1) === 0 || step < 1) snare(at(3, 0, s), .35 + s / 16 * .7); }
for (let i = 0; i < 4; i++) snare(at(3, 3, i * .5 + 2), .9);
riser(at(2), BR * 2 - B / 2, 1.1); swell(at(2, 2), BR * 1.5 - B / 2, .9); revCym(at(4), BR, 1);

/* ---------- a drop: bars a..b ---------- */
function drop(a, b, big) {
  impact(at(a), big ? 1.2 : 1);
  for (let bar = a; bar < b; bar++) {
    const i = bar % 4, c = PROG[i], r = ROOT[i], last = bar === b - 1;
    for (let bt = 0; bt < 4; bt++) {
      if (!(last && bt === 3 && !big)) bigKick(at(bar, bt));
      subBass(at(bar, bt), B - .01, r, .85);
      offBass(at(bar, bt, 2), r, 1);
      hat(at(bar, bt, 2), .95, true);
      hat(at(bar, bt, 0), .35); hat(at(bar, bt, 1), .25); hat(at(bar, bt, 3), .3);
    }
    bigClap(at(bar, 1)); bigClap(at(bar, 3));
    STAB.forEach(s => chord(at(bar, 0, s), Q * 1.6, c.map(n => n + 12), 1.3, 5200, 2600));
    HOOK[i].forEach(([s, n]) => sawPluck(at(bar, 0, s), n, 1));
    if (big) for (let s = 0; s < 16; s++) blip(at(bar, 0, s), c[s % 3] + 24, .8, s % 2 ? .5 : -.5);
    if (bar % 4 === 0 && bar !== a) crash(at(bar), .8);
    if (last) for (let s = 12; s < 16; s++) snare(at(bar, 0, s), .5 + (s - 12) * .15);
  }
}
drop(4, 12, true);

/* ---------- bar 12: the psychedelic lift: phased pads, the hook alone, kick still going ---------- */
chord(at(12), BR, PROG[0].map(n => n + 12), 1.2, 1400, 4200);
HOOK[0].forEach(([s, n]) => sawPluck(at(12, 0, s), n, .9, .55));
for (let b = 0; b < 4; b++) { kick(at(12, b), .75); hat(at(12, b, 2), .8, true); }
subBass(at(12), BR, ROOT[0], .8);
for (let s = 0; s < 16; s++) blip(at(12, 0, s), PROG[0][s % 3] + 24, .6, s % 2 ? .6 : -.6);
/* ---------- bar 13: the build: snare roll, riser, half a beat of nothing ---------- */
for (let b = 0; b < 4; b++) kick(at(13, b), .7);
for (let s = 0; s < 16; s += s < 8 ? 2 : 1) snare(at(13, 0, s), .45 + s / 16 * .7);
for (let i = 0; i < 6; i++) snare(at(13, 3, 2 + i / 3), 1);
chord(at(13), BR - B / 2, PROG[1].map(n => n + 12), 1, 1200, 6000);
riser(at(12, 2), BR * 1.5 - B / 2, 1.4); revCym(at(14), BR, 1.3);

/* ---------- bars 14-15: the last hit, the hook once more, and a long phased tail ---------- */
impact(at(14), 1.5);
for (let b = 0; b < 4; b++) { bigKick(at(14, b), b ? .8 : 1); subBass(at(14, b), B - .01, ROOT[2], .8); offBass(at(14, b, 2), ROOT[2], .8); }
bigClap(at(14, 1)); bigClap(at(14, 3));
STAB.forEach(s => chord(at(14, 0, s), Q * 1.6, PROG[2].map(n => n + 12), 1.2, 5200, 2600));
HOOK[2].forEach(([s, n]) => sawPluck(at(14, 0, s), n, 1));
chord(at(15), BR * 1.2, PROG[2].map(n => n + 12), 1.4, 4200, 600);
keys(at(15), PROG[2], 1.1, 3.5); bell(at(15), m('C6'), 1, .3); bell(at(15, 1), m('Eb6'), .8, -.3); bell(at(15, 2), m('Ab6'), .6, 0);
subBass(at(15), BR * .9, ROOT[2], .8); crash(at(15), .7);

/* ---------- mix ---------- */
/* sidechain: the pumped bus ducks under every kick */
const duck = new Float32Array(N).fill(1);
for (const k of KICKS) { const a = Math.floor(k * SR); for (let i = 0; i < SR * .35 && a + i < N; i++) { const t = i / SR, d = 1 - .72 * Math.exp(-t / .1) * Math.min(1, t / .004 + .3); duck[a + i] = Math.min(duck[a + i], d); } }
/* reverb: Freeverb-style combs and allpasses on the send */
function reverb(inp, spread) {
  const out = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(n => ({ b: new Float32Array(n + spread), i: 0, s: 0 }));
  const aps = [556, 441, 341, 225].map(n => ({ b: new Float32Array(n + spread), i: 0 }));
  for (let n = 0; n < N; n++) {
    const x = inp[n] * .015; let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.s = o * .8 + c.s * .2; c.b[c.i] = x + c.s * .86; c.i = (c.i + 1) % c.b.length; y += o; }
    for (const a of aps) { const o = a.b[a.i]; a.b[a.i] = y + o * .5; y = o - y; a.i = (a.i + 1) % a.b.length; }
    out[n] = y;
  }
  return out;
}
const RL = reverb(SEND[0], 0), RR = reverb(SEND[1], 23);
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) { L[i] = DRY[0][i] + PUMP[0][i] * duck[i] + RL[i] * 1.6; R[i] = DRY[1][i] + PUMP[1][i] * duck[i] + RR[i] * 1.6; }
/* a phaser on the master: the psychedelic swirl, deep in bar 12 and the tail */
const phaseDepth = t => t >= at(12) && t < at(13) ? .85 : t >= at(15) ? .9 : t >= at(4) && t < at(12) ? .18 : .35;
function phaser(x, lfoHz, seedPh) {
  const st = [0, 0, 0, 0].map(() => ({ x1: 0, y1: 0 })); let fb = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR, sw = .5 + .5 * Math.sin(2 * Math.PI * lfoHz * t + seedPh), fc = 300 * Math.pow(12, sw), w = Math.tan(Math.PI * fc / SR), a1 = (w - 1) / (w + 1);
    let y = x[i] + fb * .55;
    for (const s of st) { const o = a1 * y + s.x1 - a1 * s.y1; s.x1 = y; s.y1 = o; y = o; }
    fb = y; const d = phaseDepth(t); x[i] = x[i] * (1 - d * .5) + y * d * .5;
  }
}
phaser(L, .23, 0); phaser(R, .23, 1.3);
/* half a beat of silence before each drop, so the drop lands out of nothing */
const GAPS = [[at(4) - B / 2, at(4)], [at(14) - B / 2, at(14)]];
const gapGain = t => { for (const [a, b] of GAPS) { if (t >= a + .006 && t < b - .002) return 0; if (t >= a && t < a + .006) return 1 - (t - a) / .006; } return 1; };
/* master: high-pass the rumble, gentle compression, soft clip, fade, normalise */
const hpL = svf(.7), hpR = svf(.7);
let lev = 0, peak = 0;
for (let i = 0; i < N; i++) {
  const l = hpL(L[i], 28, 'hp'), r = hpR(R[i], 28, 'hp');
  const v = Math.max(Math.abs(l), Math.abs(r)); lev = v > lev ? lev + (v - lev) * .01 : lev + (v - lev) * .0002;
  const gr = lev > .5 ? Math.pow(.5 / lev, .5) : 1;
  const t = i / SR, fade = t > DUR - 1.5 ? Math.max(0, (DUR - t) / 1.5) : 1;
  const gg = gapGain(t);
  L[i] = Math.tanh(l * gr * 1.1) * fade * gg; R[i] = Math.tanh(r * gr * 1.1) * fade * gg;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = .89 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * gain * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * gain * 32767), 46 + i * 4); }
writeFileSync(join(OUT, 'pixelui30.wav'), buf);
console.log(`wrote pixelui30.wav  ${DUR}s`);
