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

