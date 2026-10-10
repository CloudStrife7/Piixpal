// 3D: pals as real 3D models, built on the voxel engine in src/elements/vox.js.
// Rendered by scripts/docs.mjs into components/3d.html, and into the shadcn registry.
//
// Each entry: id, tag, accent, desc, attrs [[name, what]], api, events, hab (live demo), code, tall.

const LOOKS = 'glossy | clay | toon | wire | holo | halftone | dither | ascii';
const center = (inner, bg = '') => `<div class="h3d"${bg ? ` style="background:${bg}"` : ''}>${inner}</div>`;

export const STUDIO = [
  {
    id: 'voxel', tag: 'piix-voxel', accent: 'var(--lime)', tall: true,
    desc: 'Any pal as a 3D toy you can spin. Its pixel art is puffed up into real voxels, thick in the middle and thin at the edges like a soft vinyl figure. Drag it to spin it, the light follows your pointer, a tap makes it hop, and it plays its animation in 3D. Eight looks: glossy, clay, cel-shaded toon, wireframe, hologram, and three print styles drawn live from the 3D model: halftone dots, ordered dither and ASCII.',
    attrs: [['pal', 'any pal or sprite name (default bitbug)'], ['look', LOOKS + ' (default glossy)'], ['size', 'width in px (default 200)'], ['spin', 'turns a minute when nobody holds it, 0 to stay still (default 6)'], ['depth', 'how puffy, 1–6 (default 3)'], ['clip', 'which animation to play'], ['tilt', 'how far you look down on it, in degrees (default 22)'], ['light', 'pointer or fixed (default pointer)'], ['floor', '"none" hides the shadow']],
    events: 'piix:poke',
    hab: center('<piix-voxel pal="bitbug" size="150"></piix-voxel><piix-voxel pal="frog" look="toon" size="150"></piix-voxel><piix-voxel pal="whale" look="halftone" size="150"></piix-voxel><piix-voxel pal="penguin" look="dither" size="150"></piix-voxel>'),
    code: '<piix-voxel pal="bitbug"></piix-voxel>\n<piix-voxel pal="frog" look="toon"></piix-voxel>\n<piix-voxel pal="whale" look="halftone"></piix-voxel>'
  },
  {
    id: 'card', tag: 'piix-card', accent: 'var(--coral)', tall: true,
    desc: 'A holographic trading card for any pal. It tilts toward your pointer, a rainbow foil slides across it as it turns, and the pal stands in 3D in front of the card, slowly turning. Each card has its number in the set, a type, a line about what that pal does, and a rarity. Drag the pal to spin it.',
    attrs: [['pal', 'any pal or sprite name (default bitbug)'], ['rarity', 'common, rare or holo; holo has the foil (default holo)'], ['look', 'how the pal is drawn: ' + LOOKS], ['size', 'card width in px; it is 1.4 times as tall (default 240)'], ['color', 'the card colour (default: picked from the pal)']],
    events: 'piix:poke',
    hab: center('<piix-card pal="frog" size="160"></piix-card><piix-card pal="whale" size="160" rarity="rare"></piix-card>'),
    code: '<piix-card pal="frog"></piix-card>\n<piix-card pal="whale" rarity="rare"></piix-card>'
  },
  {
    id: 'planet', tag: 'piix-planet', accent: 'var(--sky)', tall: true,
    desc: 'A tiny voxel world with pals walking round it: seas, beaches, grass, hills with snow on top and little trees, with a soft atmosphere round the edge. The pals walk over the horizon and come back round. Every seed is a different world. Drag to spin it.',
    attrs: [['pals', 'comma-separated pal names (default bitbug,frog,penguin)'], ['seed', 'a number: a different world for each (default 7)'], ['size', 'width in px (default 260)'], ['spin', 'turns a minute when idle (default 3)'], ['look', LOOKS]],
    hab: center('<piix-planet size="330"></piix-planet>', '#17121f'),
    code: '<piix-planet pals="bitbug,frog,penguin"></piix-planet>'
  },
  {
    id: 'globe', tag: 'piix-globe', accent: 'var(--violet)', tall: true,
    desc: 'A pal in a snow globe. Drag it about or tap it to shake it: the snow flies up, swirls round the 3D pal inside and settles back on the drift. Night, dusk or day sky.',
    attrs: [['pal', 'any pal or sprite name (default penguin)'], ['sky', 'night, dusk or day (default night)'], ['snow', 'how many flakes, 20–300 (default 140)'], ['size', 'width in px (default 220)'], ['look', 'how the pal is drawn']],
    api: 'el.shake()', events: 'piix:poke',
    hab: center('<piix-globe size="160"></piix-globe><piix-globe pal="frog" sky="dusk" size="160"></piix-globe>'),
    code: '<piix-globe pal="penguin"></piix-globe>'
  },
  {
    id: 'holo', tag: 'piix-holo', accent: 'var(--mint)', tall: true,
    desc: 'A pal projected as a hologram. A little puck throws a cone of light and the pal hangs in it in scanlines, turning slowly, bobbing, flickering and glitching sideways now and then. Best on a dark background.',
    attrs: [['pal', 'any pal or sprite name (default astronaut)'], ['color', 'cyan, lime, pink or amber (default cyan)'], ['size', 'width in px (default 220)'], ['look', 'how the pal is drawn (default holo)']],
    hab: center('<piix-holo size="160"></piix-holo><piix-holo pal="bitbug" color="lime" size="160"></piix-holo>', '#100c16'),
    code: '<piix-holo pal="astronaut"></piix-holo>'
  },
  {
    id: 'room', tag: 'piix-room', accent: 'var(--sun)', tall: true,
    desc: 'A little isometric voxel diorama with a pal living in it: a desk with a glowing monitor, a pond island, a bedroom at night with the lamp on. It leans toward your pointer and the light follows it. Lovely for empty states, 404 pages and about sections.',
    attrs: [['scene', 'desk, pond or night (default desk)'], ['pal', 'who lives there (default termi, frog or shibe)'], ['size', 'width in px (default 300)'], ['look', 'glossy, clay, toon, wire, halftone, dither or ascii (default clay)']],
    hab: center('<piix-room scene="desk" size="160"></piix-room><piix-room scene="pond" size="160"></piix-room><piix-room scene="night" size="160"></piix-room>'),
    code: '<piix-room scene="desk"></piix-room>\n<piix-room scene="pond"></piix-room>\n<piix-room scene="night"></piix-room>'
  }
];

// ASCII & dither: moving pictures drawn as type, dots and dither, built on src/elements/print.js.
export const BACKDROPS = ['aurora', 'sunburst', 'plasma', 'rain', 'stars', 'clouds', 'tunnel', 'synthwave', 'fire', 'waves'];
export const SCENES = [['kiss', 'a kiss, hearts rising'], ['heartbreak', 'a heart cracks in the rain'], ['umbrella', 'a walk under a red umbrella'], ['stargaze', 'shooting stars, together'], ['alone', 'a rain cloud, then a little heart'], ['hug', 'running into a hug'], ['heart', 'a 3D heart, beating'], ['campfire', 'sparks into the stars']];
const PLOOKS = 'ascii | dither | halftone | pixel';
export const PRINT = [
  {
    id: 'backdrop', tag: 'piix-backdrop', accent: 'var(--violet)', tall: true,
    desc: 'Animated pixel backgrounds for sections: an aurora, a sunburst, plasma, digital rain, a starfield warp, clouds, a tunnel, a synthwave grid, pixel fire and moonlit waves, drawn as ASCII, ordered dither, halftone dots or chunky pixels. The pointer stirs them. With fill it sits behind the rest of the element it is in, so your content stays on top.',
    attrs: [['kind', BACKDROPS.join(' | ') + ' (default aurora)'], ['look', PLOOKS + ' (default: the kind\'s own)'], ['palette', 'lime, aurora, sunset, ocean, candy, fire, gameboy, paper, mono, or your own colours dark to light: "#000,#f0f,#fff"'], ['ink', 'draw it all in one colour'], ['paper', 'the background colour'], ['cell', 'size of a character, dot or block in px'], ['ramp', 'ascii characters: classic, soft, blocks, binary, dots, hearts, code, or your own'], ['edges', '"off", or a number: how sharp a change becomes a / | \\ line'], ['speed', '1 is normal, 0 holds still'], ['height', 'px when not filling (default 320)'], ['fill', 'sit behind the content of its parent']],
    hab: '<div class="h3d" style="padding:0"><piix-backdrop kind="synthwave" fill></piix-backdrop><p class="pd-over">Your section,<br>on top.</p></div>',
    code: '<section>\n  <piix-backdrop kind="aurora" fill></piix-backdrop>\n  <h2>Your content stays on top</h2>\n</section>\n\n<piix-backdrop kind="rain" height="240"></piix-backdrop>'
  },
  {
    id: 'scene', tag: 'piix-scene', accent: 'var(--coral)', tall: true,
    desc: 'Little animated films in ASCII: a couple kissing as hearts float up, a heartbroken man on a bench in the rain as his heart cracks in two, a walk under a red umbrella, two people watching shooting stars, someone under their own rain cloud until a little heart finds them, a hug, a beating 3D heart and a campfire. Every one also plays in dither, halftone or pixels, and in one ink for a green-screen terminal look.',
    attrs: [['scene', SCENES.map(s => s[0]).join(' | ') + ' (default kiss)'], ['look', PLOOKS + ' (default ascii)'], ['ink', 'one colour for everything, like ink="#7dff7a"'], ['paper', 'the background colour (default #07060b)'], ['cell', 'size of a character, dot or block in px'], ['ramp', 'ascii characters: classic, soft, blocks, binary, dots, hearts, code, or your own'], ['edges', '"off", or a number: how sharp a change becomes a / | \\ line'], ['speed', '1 is normal'], ['size', 'width in px (it is 16:9); by default it fills its container']],
    hab: '<div class="h3d" style="padding:0"><piix-scene scene="kiss" look="dither" style="width:100%"></piix-scene></div>',
    code: '<piix-scene scene="kiss"></piix-scene>\n<piix-scene scene="heartbreak" ink="#7dff7a"></piix-scene>\n<piix-scene scene="heart" look="dither"></piix-scene>'
  }
];
