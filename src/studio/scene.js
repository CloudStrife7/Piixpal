/* SCENE: little animated films, drawn in ASCII (or dither, halftone, pixels).   @component scene
 *
 *   <piix-scene scene="kiss"></piix-scene>
 *
 * Small looping moments with feeling, all original: a couple kissing at sunset, a heartbroken man
 * on a bench in the rain as his heart cracks, a lonely walk under a red umbrella, two people
 * stargazing, someone under their own rain cloud until a little heart finds them, a hug, a spinning
 * beating 3D heart, and a campfire. They play in colour on dark paper by default.
 *
 *   scene    kiss | heartbreak | umbrella | stargaze | alone | hug | heart | campfire   default: kiss
 *   look     ascii | dither | halftone | pixel           default: ascii
 *   cell     size of a character, dot or block, px       default: depends on the look
 *   ramp     ascii characters: classic | soft | blocks | binary | dots | hearts | code, or your own
 *   ink      draw it all in one colour (a green terminal: ink="#7dff7a")
 *   paper    the background colour                       default: #07060b
 *   speed    1 is normal                                 default: 1
 *   size     width in px (it is 16:9)                    default: fills its container */

/* ---------- drawing helpers, in a 1600 x 900 world ---------- */
const scSky = (g, stops) => { const gr = g.createLinearGradient(0, 0, 0, 900); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, 1600, 900); };
const scGlow = (g, x, y, r, c, a = 1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, c + '00'); g.save(); g.globalAlpha *= a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); };
const scHeart = (g, x, y, s) => {
  g.beginPath(); g.moveTo(x, y + s * .38);
  g.bezierCurveTo(x - s * .95, y - s * .2, x - s * .5, y - s * .95, x, y - s * .45);
  g.bezierCurveTo(x + s * .5, y - s * .95, x + s * .95, y - s * .2, x, y + s * .38);
  g.fill();
};
const scDim = (hex, k) => { const [r, g, b] = hexRGBA(hex); return `rgb(${r * k | 0},${g * k | 0},${b * k | 0})`; };
const scEase = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const scP = (T, a, b) => clamp((T - a) / (b - a), 0, 1);
/* a person in silhouette, feet at (x, y), s tall. o: pose stand | sit | knees, lean, head (tilt), hands [[x,y],[x,y]] round the hips, hair, step, flip */
function scFigure(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1);
  const c = o.color || '#000', shade = g.createLinearGradient(s * .3, -s, -s * .25, 0);
  shade.addColorStop(0, c); shade.addColorStop(.55, scDim(c, .78)); shade.addColorStop(1, scDim(c, .42));
  g.fillStyle = g.strokeStyle = shade; g.lineCap = 'round'; g.lineJoin = 'round';
  const lw = s * .1;
  let hy;
  g.lineWidth = lw;
  if (o.pose === 'sit') {
    hy = -s * .27;
    for (const dx of [-s * .03, s * .03]) { g.beginPath(); g.moveTo(dx, hy); g.lineTo(s * .21 + dx, hy); g.lineTo(s * .23 + dx, 0); g.stroke(); }
  } else if (o.pose === 'knees') {
    hy = -s * .07;
    for (const dx of [-s * .02, s * .02]) { g.beginPath(); g.moveTo(dx, hy); g.lineTo(s * .17 + dx, -s * .31); g.lineTo(s * .25 + dx, 0); g.stroke(); }
  } else {
    hy = -s * .47;
    const st = o.step || 0;
    g.beginPath(); g.moveTo(-s * .03, hy); g.lineTo(-s * .04 + Math.sin(st) * s * .13, 0); g.stroke();
    g.beginPath(); g.moveTo(s * .03, hy); g.lineTo(s * .04 - Math.sin(st) * s * .13, 0); g.stroke();
  }
  g.translate(0, hy); g.rotate(o.lean || 0);
  g.beginPath(); g.roundRect(-s * .11, -s * .34, s * .22, s * .37, s * .08); g.fill();
  g.lineWidth = lw * .8;
  const hands = o.hands || [[-s * .13, -s * .02], [s * .13, -s * .02]];
  [[-s * .08, -s * .29], [s * .08, -s * .29]].forEach(([sx, sy], i) => {
    const [hx, hy2] = hands[i];
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + hx) / 2 + (i ? s * .05 : -s * .05), (sy + hy2) / 2 + s * .04, hx, hy2); g.stroke();
  });
  g.translate(0, -s * .36); g.rotate(o.head || 0);
  g.beginPath(); g.arc(0, -s * .08, s * .095, 0, 6.283); g.fill();
  if (o.hair === 'long') { g.beginPath(); g.ellipse(-s * .035, -s * .01, s * .095, s * .16, .18, 0, 6.283); g.fill(); }
  g.restore();
}
/* a head and shoulders in profile, facing right, chin at (x, y), s is the head's height */
function scProfile(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); g.scale(s, s);
  const c = o.color || '#fff', shade = g.createRadialGradient(.45, -.25, .05, .1, 0, 1.45);
  shade.addColorStop(0, c); shade.addColorStop(.45, scDim(c, .8)); shade.addColorStop(1, scDim(c, .3));
  g.fillStyle = shade;
  if (o.hair === 'long') { g.beginPath(); g.moveTo(-.05, -.9); g.bezierCurveTo(-.82, -.88, -.92, .1, -.72, .72); g.lineTo(-.42, .7); g.bezierCurveTo(-.5, .3, -.45, -.1, -.05, -.9); g.fill(); }
  g.beginPath(); g.moveTo(-.55, .62); g.lineTo(-.5, .15);
  g.bezierCurveTo(-.78, 0, -.78, -.78, -.1, -.88); g.bezierCurveTo(.32, -.92, .5, -.62, .5, -.36);
  g.lineTo(.53, -.25); g.lineTo(.69, -.05); g.lineTo(.53, .02); g.lineTo(.57, .1); g.lineTo(.51, .14); g.lineTo(.56, .19); g.lineTo(.46, .27);
  g.bezierCurveTo(.48, .38, .3, .43, .15, .39); g.lineTo(.12, .62); g.closePath(); g.fill();
  /* shoulders */
  g.beginPath(); g.moveTo(-.7, 1.3); g.bezierCurveTo(-.7, .82, -.45, .66, -.2, .66); g.bezierCurveTo(.08, .66, .3, .8, .36, 1.3); g.fill();
  /* a closed eye and a little blush */
  g.strokeStyle = o.line || '#000'; g.lineWidth = .035; g.lineCap = 'round';
  g.beginPath(); g.arc(.27, -.3, .07, .2, Math.PI - .2); g.stroke();
  if (o.blush) { g.fillStyle = o.blush; g.beginPath(); g.ellipse(.3, -.05, .09, .05, 0, 0, 6.283); g.fill(); }
  g.restore();
}
/* rain streaks over the whole frame, brighter where a light falls */
const scRain = (g, T, n, color, x0 = 0, x1 = 1600, y0 = -60, y1 = 900, slant = .12) => {
  g.strokeStyle = color; g.lineWidth = 2.5; g.beginPath();
  for (let i = 0; i < n; i++) {
    const sp = 900 + pHash(i, 2) * 500, span = y1 - y0, y = y0 + (T * sp + pHash(i, 3) * span) % span, x = x0 + pHash(i, 1) * (x1 - x0) - (y - y0) * slant;
    g.moveTo(x, y); g.lineTo(x - 26 * slant * 3, y + 28);
  }
  g.stroke();
};
const scStars = (g, T, n, h, rot = 0) => {
  g.save(); g.translate(800, -300); g.rotate(rot); g.translate(-800, 300);
  for (let i = 0; i < n; i++) {
    const x = pHash(i, 7) * 2000 - 200, y = pHash(i, 8) * h, z = 5 + pHash(i, 9) * 9, a = .45 + .55 * Math.sin(T * (1 + pHash(i, 4) * 3) + i);
    g.fillStyle = `rgba(255,250,235,${a})`; g.fillRect(x, y, z, z);
  }
  g.restore();
};

const SC_SCENES = {
  kiss: { label: 'Two faces in profile leaning in for a kiss, hearts floating up around them', draw(g, T) {
    g.fillStyle = '#05030a'; g.fillRect(0, 0, 1600, 900);
    scGlow(g, 800, 440, 300, '#ff5a8a', .28 + .06 * Math.sin(T * 1.3));
    const p = scEase(scP(T, 0, 2.6)), gap = lerp(170, 2, p), br = Math.sin(T * 1.6) * 6, blush = p > .9 ? 'rgba(255,90,120,.55)' : null;
    scProfile(g, 800 - .56 * 300 - gap, 470 + br, 300, { color: '#ffd9c4', line: '#3a1530', blush });
    scProfile(g, 800 + .56 * 285 + gap, 478 - br, 285, { color: '#ffe6d8', flip: true, hair: 'long', line: '#3a1530', blush });
    if (T > 2.4) for (let k = 0; k < 14; k++) {
      let age = T - 2.4 - k * .45; if (age < 0) continue; age %= 6.3; if (age > 3.6) continue;
      const side = k % 2 ? 1 : -1;
      g.fillStyle = `rgba(255,${90 + (k * 37) % 90},140,${1 - age / 3.6})`;
      scHeart(g, 800 + side * (30 + age * 70) + Math.sin(age * 3 + k) * 30, 360 - age * 95, 34 + age * 10);
    }
    for (let i = 0; i < 26; i++) { const k2 = (T * .2 + pHash(i, 1)) % 1; scGlow(g, pHash(i, 2) * 1600, 900 - k2 * 1000, 14, '#ffd0e0', 1 - k2); }
  } },
  heartbreak: { label: 'A man alone on a bench under a streetlamp in the rain as his heart cracks in two', draw(g, T) {
    scSky(g, [[0, '#03040b'], [.6, '#0c1128'], [1, '#141a36']]);
        const lx = 1330;
    g.fillStyle = 'rgba(255,214,140,.16)'; g.beginPath(); g.moveTo(lx - 34, 318); g.lineTo(lx + 34, 318); g.lineTo(lx + 300, 830); g.lineTo(lx - 330, 830); g.fill();
    scGlow(g, lx, 312, 210, '#ffd68c', .9);
    g.fillStyle = '#04050b'; g.fillRect(lx - 9, 300, 18, 530); g.fillRect(lx - 46, 296, 92, 16);
    g.fillStyle = '#fff1c4'; g.fillRect(lx - 30, 312, 60, 10);
    g.fillStyle = '#070912'; g.fillRect(0, 822, 1600, 78);
    scGlow(g, lx - 40, 852, 260, '#ffd68c', .35);
    /* the bench, and him */
    g.fillStyle = '#8a6a4a'; g.fillRect(1030, 748, 270, 16); g.fillRect(1030, 676, 270, 13); g.fillRect(1045, 748, 12, 74); g.fillRect(1275, 748, 12, 74); g.fillRect(1045, 676, 10, 80);
    const s = 250;
    scFigure(g, 1120, 822, s, { pose: 'sit', color: '#ffd68c', lean: .34, head: .5, hands: [[s * .17, -s * .01], [s * .21, -s * .03]] });
    /* his heart: beats, cracks, falls apart, and slowly comes back */
    const tc = T % 9, hx = 760, hy = 330, beat = 1 + .07 * Math.max(0, Math.sin(tc * 7.5)) ** 8;
    const zig = [[0, -130], [-36, -45], [30, 15], [-26, 75], [16, 135], [0, 165]];
    const crack = scP(tc, 2.6, 3.2), apart = scEase(scP(tc, 3.2, 6)), back = scP(tc, 7.4, 9);
    const half = (side, dx, dy, rot, a) => {
      g.save(); g.globalAlpha = a; g.translate(hx + dx, hy + dy); g.rotate(rot);
      g.beginPath(); g.moveTo(side * 400, -400); for (const [zx, zy] of zig) g.lineTo(zx, zy); g.lineTo(side * 400, 400); g.closePath(); g.clip();
      g.fillStyle = '#ff3355'; scHeart(g, 0, 0, 300 * beat);
      g.restore();
    };
    if (tc < 3.2) {
      scGlow(g, hx, hy, 420, '#ff3355', .55);
      g.fillStyle = '#ff3355'; scHeart(g, hx, hy, 300 * beat);
      if (crack > 0) { g.strokeStyle = '#03040b'; g.lineWidth = 18; g.beginPath(); const n = Math.ceil(crack * zig.length); zig.slice(0, n).forEach(([zx, zy], i) => i ? g.lineTo(hx + zx, hy + zy) : g.moveTo(hx + zx, hy + zy)); g.stroke(); }
    } else if (tc < 6.4) {
      half(-1, -apart * 160, apart * apart * 640, -apart * .7, 1 - apart * .9);
      half(1, apart * 160, apart * apart * 680, apart * .6, 1 - apart * .9);
    } else if (back > 0) {
      scGlow(g, hx, hy, 420, '#ff3355', .4 * back);
      g.save(); g.globalAlpha = back; g.fillStyle = '#ff3355'; scHeart(g, hx, hy, 300 * lerp(.55, 1, back)); g.restore();
    }
    scRain(g, T, 240, 'rgba(150,170,220,.5)');
    for (let i = 0; i < 7; i++) { const k = (T * .7 + pHash(i, 4)) % 1, x = pHash(i, 5) * 1500 + 50; g.strokeStyle = `rgba(160,180,230,${.5 * (1 - k)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, 862, 10 + k * 60, 3 + k * 10, 0, 0, 6.283); g.stroke(); }
  } },
  umbrella: { label: 'Someone walking through a rainy city at night under a red umbrella', draw(g, T) {
    scSky(g, [[0, '#070a18'], [.7, '#151b36'], [1, '#1c2444']]);
    const ground = 760;
    for (let i = 0; i < 15; i++) {
      const x = i * 118 - 40, w = 92 + pHash(i, 1) * 50, h = 200 + pHash(i, 2) * 330;
      g.fillStyle = '#0b0f22'; g.fillRect(x, ground - h, w, h);
      for (let wy = ground - h + 24; wy < ground - 30; wy += 34) for (let wx = x + 12; wx < x + w - 16; wx += 26) {
        if (pHash(wx, wy) < .62) continue;
        const a = .55 + .35 * Math.sin(T * .7 + wx * wy);
        g.fillStyle = `rgba(255,205,120,${a})`; g.fillRect(wx, wy, 12, 16);
        g.fillStyle = `rgba(255,205,120,${a * .22})`; g.fillRect(wx, ground + (ground - wy) * .55, 12, 20);
      }
    }
    g.fillStyle = 'rgba(8,10,22,.85)'; g.fillRect(0, ground, 1600, 140);
    for (const lx of [260, 820, 1380]) {
      g.fillStyle = 'rgba(255,214,140,.13)'; g.beginPath(); g.moveTo(lx - 20, 380); g.lineTo(lx + 20, 380); g.lineTo(lx + 190, ground); g.lineTo(lx - 190, ground); g.fill();
      scGlow(g, lx, 376, 150, '#ffd68c', .8); g.fillStyle = '#05060f'; g.fillRect(lx - 6, 372, 12, ground - 372);
      scGlow(g, lx, ground + 60, 160, '#ffd68c', .25);
    }
    /* the walker: crosses the frame, umbrella up, reflected in the wet street */
    const k = (T % 12) / 12, x = -160 + k * 1920, s = 330, step = T * 7.5;
    const walker = (gy, flip) => {
      g.save(); if (flip) { g.translate(0, gy * 2); g.scale(1, -1); g.globalAlpha = .28; }
      scFigure(g, x, gy, s, { color: '#c9d6ff', step, hands: [[-s * .12, -s * .02], [s * .04, -s * .58]] });
      g.strokeStyle = '#c9d6ff'; g.lineWidth = 7; g.beginPath(); g.moveTo(x + s * .04, gy - s * 1.03); g.lineTo(x + s * .02, gy - s * 1.33); g.stroke();
      g.fillStyle = '#ff2e4f'; g.beginPath(); g.moveTo(x - s * .48, gy - s * 1.25); g.quadraticCurveTo(x, gy - s * 1.72, x + s * .48, gy - s * 1.25);
      for (let i = 4; i >= 0; i--) g.quadraticCurveTo(x - s * .48 + (i + .5) * s * .192, gy - s * 1.31, x - s * .48 + i * s * .192, gy - s * 1.25);
      g.fill();
      g.restore();
    };
    walker(ground, true); walker(ground, false);
    scRain(g, T, 260, 'rgba(160,180,230,.45)', 0, 1700, -60, ground + 40);
  } },
  stargaze: { label: 'Two people sitting on a hill at night watching shooting stars', draw(g, T) {
    scSky(g, [[0, '#02030b'], [.55, '#0a1336'], [.82, '#1a3a64'], [1, '#2a6175']]);
    /* the milky way, a soft band of light */
    for (let i = 0; i < 14; i++) scGlow(g, 120 + i * 110, 120 + i * 32 + Math.sin(i) * 30, 190, '#9fb6ff', .26);
    scGlow(g, 820, 760, 760, '#3f9fc4', .7);
    scStars(g, T, 260, 640, T * .006);
    for (let i = 0; i < 160; i++) { const t2 = pHash(i, 11), x = 100 + t2 * 1500 + (pHash(i, 12) - .5) * 160, y = 110 + t2 * 460 + (pHash(i, 13) - .5) * 120; g.fillStyle = `rgba(220,230,255,${.3 + pHash(i, 14) * .5})`; g.fillRect(x, y, 6, 6); }
    /* a shooting star every few seconds */
    const st = T % 4.2;
    if (st < .9) {
      const sx = 380 + Math.floor(T / 4.2) % 3 * 260, sy = 90, k = st / .9, hx = sx + k * 700, hy = sy + k * 300;
      const gr = g.createLinearGradient(hx - 260, hy - 112, hx, hy); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, `rgba(255,255,240,${1 - k * .6})`);
      g.strokeStyle = gr; g.lineWidth = 5; g.beginPath(); g.moveTo(hx - 260, hy - 112); g.lineTo(hx, hy); g.stroke();
    }
    const hill = x => 700 + ((x - 820) / 900) ** 2 * 260;
    g.fillStyle = '#03050c'; g.beginPath(); g.moveTo(0, 900); for (let x = 0; x <= 1600; x += 40) g.lineTo(x, hill(x)); g.lineTo(1600, 900); g.fill();
    for (let i = 0; i < 40; i++) { const x = i * 41 + pHash(i, 3) * 20; g.fillStyle = '#03050c'; g.fillRect(x, hill(x) - 10 - pHash(i, 4) * 12, 4, 22); }
    const s = 290;
    scFigure(g, 760, hill(760), s * .93, { pose: 'sit', color: '#b9ccff', lean: .22 + Math.sin(T * .6) * .02, head: .38, hair: 'long', hands: [[s * .16, -s * .02], [s * .2, -s * .05]] });
    scFigure(g, 850, hill(850), s, { pose: 'sit', color: '#b9ccff', lean: -.05, head: -.28, hands: [[s * .15, -s * .02], [s * .25, -s * .5]] });
    for (let i = 0; i < 9; i++) { const x = 300 + pHash(i, 21) * 1000 + Math.sin(T * .5 + i) * 40, y = 640 + Math.cos(T * .7 + i * 2) * 30 + pHash(i, 22) * 80; scGlow(g, x, y, 22, '#d6ff7a', .55 + .45 * Math.sin(T * 2 + i * 3)); }
  } },
  alone: { label: 'Someone sitting alone under their own small rain cloud, until a little heart floats down to them', draw(g, T) {
    const tc = T % 11, hope = scEase(scP(tc, 6.2, 7.4)) * (1 - scEase(scP(tc, 9.4, 10.6)));
    scSky(g, [[0, '#06070c'], [.7, '#0d1018'], [1, '#141824']]);
    scGlow(g, 800, 600, 300, '#ffcf8a', .22 * hope);
    g.fillStyle = '#0f121a'; g.fillRect(0, 760, 1600, 140);
    g.fillStyle = 'rgba(90,110,150,.35)'; g.beginPath(); g.ellipse(810, 776, 210, 22, 0, 0, 6.283); g.fill();
    /* the cloud that follows them */
    const cy = 200 + Math.sin(T * .8) * 8, light = .25 + .5 * hope;
    g.save(); g.globalAlpha = 1 - hope * .55;
    g.fillStyle = `rgb(${120 + light * 100},${128 + light * 100},${150 + light * 90})`;
    for (const [dx, dy, r] of [[-110, 20, 70], [-40, -20, 95], [50, -10, 85], [125, 25, 62], [0, 40, 80]]) { g.beginPath(); g.arc(800 + dx, cy + dy, r, 0, 6.283); g.fill(); }
    g.restore();
    scRain(g, T, Math.round(70 * (1 - hope * .85)), 'rgba(150,170,210,.55)', 690, 930, cy + 60, 760, .04);
    const s = 380;
    scFigure(g, 740, 770, s, { pose: 'knees', color: '#c9d6ff', lean: lerp(.4, .12, hope), head: lerp(.55, -.1, hope), hands: [[s * .19, -s * .14], [s * .21, -s * .12]] });
    /* the little heart */
    const fall = scP(tc, 3, 6.4);
    if (fall > 0 && tc < 10.4) {
      const hx = 800 + Math.sin(fall * 9) * 60 * (1 - fall), hy = lerp(-60, 470, scEase(fall)), a = 1 - scP(tc, 9.6, 10.4);
      scGlow(g, hx, hy, 90 + hope * 120, '#ffb35c', a * (.5 + hope * .5));
      g.save(); g.globalAlpha = a; g.fillStyle = '#ff5a6e'; scHeart(g, hx, hy, 40 + hope * 10 + Math.sin(T * 6) * 3 * hope); g.restore();
    }
  } },
  hug: { label: 'Two people run toward each other and hug', draw(g, T) {
    const tc = T % 7.5, run = scP(tc, 0, 1.7), meet = 1.7, s = 400;
    scSky(g, [[0, '#07030c'], [.7, '#14081e'], [1, '#2a0f30']]);
    scGlow(g, 800, 600, 420, '#ff8fb1', .18 + .3 * scP(tc, meet, meet + .4));
    g.fillStyle = '#0c0410'; g.fillRect(0, 760, 1600, 140);
    const e = 1 - Math.pow(1 - run, 2.2), xl = lerp(-220, 735, e), xr = lerp(1820, 865, e), step = tc * 14;
    const held = tc > meet, sway = held ? Math.sin((tc - meet) * 1.8) * .04 : 0;
    scFigure(g, xl, 760, s, { color: '#ffe0ea', step: held ? 0 : step, lean: held ? .12 + sway : .2, head: held ? .25 : .05, hands: held ? [[s * .24, -s * .27], [s * .3, -s * .2]] : [[-s * .2, -s * .1], [s * .2, -s * .14]] });
    scFigure(g, xr, 760, s * .93, { color: '#ffd2b8', flip: true, hair: 'long', step: held ? 0 : step, lean: held ? .12 - sway : .2, head: held ? .3 : .05, hands: held ? [[s * .22, -s * .3], [s * .28, -s * .24]] : [[-s * .2, -s * .1], [s * .2, -s * .14]] });
    if (held) {
      const k = scP(tc, meet, meet + 1);
      for (let r = 0; r < 3; r++) { const kk = clamp(k * 1.4 - r * .2, 0, 1); if (kk > 0 && kk < 1) { g.strokeStyle = `rgba(255,230,240,${1 - kk})`; g.lineWidth = 10 * (1 - kk) + 2; g.beginPath(); g.arc(800, 560, kk * 700, 0, 6.283); g.stroke(); } }
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * 6.283, d = scEase(k) * (220 + pHash(i, 1) * 260), age = tc - meet;
        g.fillStyle = `rgba(255,${120 + pHash(i, 2) * 100 | 0},160,${Math.max(0, 1 - age / 2.4)})`;
        scHeart(g, 800 + Math.cos(a) * d, 520 + Math.sin(a) * d * .7 - age * 60, 22 + pHash(i, 3) * 18);
      }
    }
    if (tc > 6.6) { g.fillStyle = `rgba(36,9,61,${scP(tc, 6.6, 7.5)})`; g.fillRect(0, 0, 1600, 900); }
  } },
  campfire: { label: 'Someone sitting by a campfire at night, sparks rising into the stars', draw(g, T) {
    scSky(g, [[0, '#04030a'], [.7, '#120b1c'], [1, '#1d1222']]);
    scStars(g, T, 200, 520);
    const fx = 930, base = 760, flick = .85 + .15 * pNoise(T * 4, 0);
    scGlow(g, fx, base - 90, 520 * flick, '#ff8a2a', .5);
    g.fillStyle = '#0b0705'; g.fillRect(0, 760, 1600, 140);
    scGlow(g, fx, base + 20, 380, '#ff8a2a', .35 * flick);
    g.fillStyle = '#3a2210'; g.save(); g.translate(fx, base - 8); g.rotate(.32); g.fillRect(-120, -14, 240, 28); g.rotate(-.64); g.fillRect(-120, -14, 240, 28); g.restore();
    ['#ff3d1f', '#ff7a1f', '#ffb43a', '#ffe58a'].forEach((c, j) => {
      const h = 250 * (1 - j * .2) * (.8 + .25 * pNoise(T * 3.2, j * 5)), w = 92 * (1 - j * .2), sw = Math.sin(T * 5 + j) * 14 + (pNoise(T * 2, j) - .5) * 30;
      g.fillStyle = c; g.beginPath(); g.moveTo(fx - w, base - 10);
      g.quadraticCurveTo(fx - w * .9, base - h * .55, fx + sw, base - h);
      g.quadraticCurveTo(fx + w * .9, base - h * .55, fx + w, base - 10); g.fill();
    });
    for (let i = 0; i < 34; i++) {
      const k = (T * (.35 + pHash(i, 1) * .3) + pHash(i, 2)) % 1, x = fx + (pHash(i, 3) - .5) * 120 + Math.sin(k * 9 + i) * 40 * k, y = base - 80 - k * 560;
      g.fillStyle = `rgba(255,${200 - k * 80 | 0},110,${1 - k})`; g.fillRect(x, y, 6, 6);
    }
    /* the sitter, lit on one side by the fire */
    g.fillStyle = '#6a3a18'; g.save(); g.translate(580, 732); g.rotate(-.05); g.fillRect(-120, -18, 240, 34); g.restore();
    const s = 320, pose = { pose: 'sit', lean: .16, head: .12, hands: [[s * .28, -s * .12], [s * .31, -s * .09]] };
    scFigure(g, 540, 760, s, { ...pose, color: '#ffb46e' });
  } }
};
/* the heart is drawn per cell: a real 3D heart surface, ray-marched, turning and beating */
const scHeart3d = (src, T, grid) => {
  const { cols, rows, cw, ch } = grid, x = src.getContext('2d'), img = x.createImageData(cols, rows), d = img.data, aspect = cols * cw / (rows * ch);
  const ph = T % 1, beat = 1 + .1 * Math.exp(-(((ph - .05) * 14) ** 2)) + .06 * Math.exp(-(((ph - .3) * 14) ** 2)), a = T * .9, ca = Math.cos(a), sa = Math.sin(a);
  const f = (px, py, pz) => { const q = px * px + 2.25 * pz * pz + py * py - 1; return q * q * q - px * px * py * py * py - .1125 * pz * pz * py * py * py; };
  const at = (X, Y, Z) => f((X * ca - Z * sa) / beat, Y / beat, (X * sa + Z * ca) / beat);
  const L = [-.45, .55, .7], ll = Math.hypot(...L);
  for (let j = 0, i = 0; j < rows; j++) for (let k = 0; k < cols; k++, i += 4) {
    const X = (k / cols - .5) * aspect * 3.1, Y = -(j / rows - .5) * 3.1 + .15;
    let hit = null;
    for (let s = 0, Z = 1.6; s < 44; s++, Z -= .075) if (at(X, Y, Z) <= 0) { hit = Z; break; }
    if (hit == null) { const r = Math.hypot(X, Y + .1), gl = Math.max(0, .14 - r * .09); d[i] = 255 * gl; d[i + 1] = 60 * gl; d[i + 2] = 110 * gl; d[i + 3] = 255; continue; }
    const e = .02, nx = at(X + e, Y, hit) - at(X - e, Y, hit), ny = at(X, Y + e, hit) - at(X, Y - e, hit), nz = at(X, Y, hit + e) - at(X, Y, hit - e), nl = Math.hypot(nx, ny, nz) || 1;
    const dif = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / nl / ll), spec = Math.pow(Math.max(0, (nx * L[0] + ny * L[1] + nz * (L[2] + ll)) / nl / Math.hypot(L[0], L[1], L[2] + ll)), 20);
    const sh = .22 + .78 * dif;
    d[i] = Math.min(255, 255 * sh + 255 * spec * .8); d[i + 1] = Math.min(255, 45 * sh + 255 * spec * .8); d[i + 2] = Math.min(255, 85 * sh + 255 * spec * .8); d[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
};
SC_SCENES.heart = { label: 'A red 3D heart, turning and beating', pixels: scHeart3d, ramp: 'soft' };

